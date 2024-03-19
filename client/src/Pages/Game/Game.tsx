import 'solid-devtools';
import style from './Game.module.css';
import ProgressTracker from '@/Components/ProgressTracker/ProgressTracker';
import AnswerButton from '@/Components/AnswerButton/AnswerButton';
import Question from '@/Components/Question/Question';
import { For, Match, Show, Switch, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { LifeLineType, useAppState } from '@/AppState';
import { Question as QuestionT } from '@/protobufMessages/Questions';
import { answerQuestion } from '@/helpers';
import ConfirmationModal from '@/Components/ConfirmationModal/ConfirmationModal';
import PublicChoice from '@/Components/LifeLines/PuBlIcChOiCe/PublicChoice';
import FriendCall from '@/Components/LifeLines/FriendCall/FriendCall';
import FriendCalling from '@/Components/LifeLines/FriendCalling/FriendCalling';
import { AudienceResponse, FiftyFiftyResponse, Lifeline } from '@/protobufMessages/Lifelines';
import { EndRunRequest, EndRunResponse } from '@/protobufMessages/Run';
import { END_RUN_ENDPOINT } from '@/constants';

const AnswerAnimationTimeout = 2000;
async function finishRun(runId: string) {
	let request = EndRunRequest.create();
	request.runId = runId;
	let res = await (
		await fetch(END_RUN_ENDPOINT, {
			method: 'POST',
			body: EndRunRequest.encode(request).finish(),
		})
	).arrayBuffer();

	let response = EndRunResponse.decode(new Uint8Array(res));
	console.log(response);
}
export default function Game() {
	const navigate = useNavigate();
	const AppState = useAppState();

	const [overlay, setOverlay] = createSignal<null | LifeLineType | 'FriendCalling'>(null);
	const [LifeLineData, setLifeLineData] = createSignal<FiftyFiftyResponse | AudienceResponse | null>(null);

	//Doesnt need onMount cause it should run before the component is rendered
	//shouldShow prevents an error on ?.question
	if (AppState.runID() == undefined || AppState.username() == undefined || AppState.currentQuestion() == undefined) {
		navigate('/');
		return;
	}

	const [selectedAnswerId, setSelectedAnswerId] = createSignal<number | undefined>(undefined);
	const [confirmed, setConfirmed] = createSignal(false);
	const [disabledAnswers, setDisabledAnswers] = createSignal<number[]>([]);

	async function answer(answerId: number) {
		let runId = AppState.runID();
		if (runId == undefined) {
			navigate('/');
			return;
		}
		return answerQuestion(runId, answerId);
	}

	function handleConfirmation(result: boolean) {
		if (result) {
			setConfirmed(true);
			console.log(selectedAnswerId());

			let promise = answer(selectedAnswerId() as number);
			if (promise == undefined) return;

			setTimeout(async () => {
				let result = await promise;
				console.log(result);
				if (result!.isCorrect) {
					AppState.setQuestionsStatus((prev) => {
						let f = prev.findIndex((v) => v.answered == false);
						if (f != undefined) {
							let newState = [...prev];
							newState[f].answered = true;

							return newState;
						}

						return prev;
					});
					console.log(AppState.questionsStatus());
					if (result!.nextQuestion == undefined) {
						navigate('/results');
						return;
					}
					AppState.setCurrentQuestion(result!.nextQuestion);
				} else {
					alert('Zle');
					navigate('/results');
				}

				setSelectedAnswerId(undefined);
				setConfirmed(false);
			}, AnswerAnimationTimeout);
		} else {
			setSelectedAnswerId(undefined);
		}
	}

	function onCall() {}

	AppState.websocket.onCall = onCall;

	return (
		<div class={style.container}>
			<main class={style.game}>
				<div class={style.ai}>
					<div class={style.host}></div>
				</div>
				<div class={style.questionContainer}>
					<Question question={AppState.currentQuestion()?.question as QuestionT} />
					<ol class={style.answers}>
						<For each={AppState.currentQuestion()?.answers}>
							{(answer) => {
								return (
									<li>
										<AnswerButton
											zIndex={2}
											disabled={confirmed() == true || disabledAnswers().includes(answer.id)}
											selected={selectedAnswerId() == answer.id && confirmed() == true}
											onClick={(_) => {
												setSelectedAnswerId(answer.id);
											}}
											answer={answer}
										/>
									</li>
								);
							}}
						</For>
					</ol>
					<Show when={selectedAnswerId() != undefined && confirmed() == false}>
						<ConfirmationModal onClick={handleConfirmation} />
					</Show>
					<div
						class={style.lifeLineContainer}
						classList={{
							[style.publicsChoice]: overlay() == 'PublicChoice',
							[style.friendCall]: overlay() == 'FriendCall' || overlay() == 'FriendCalling',
							[style.hide]: overlay() == null,
						}}
					>
						<Switch>
							<Match when={overlay() == 'FriendCall'}>
								<FriendCall />
							</Match>
							<Match when={overlay() == 'PublicChoice'}>
								<PublicChoice />
							</Match>
							<Match when={overlay() == 'FriendCalling'}>
								<FriendCalling name={AppState.websocket.incomingCall()?.callerName} onClick={(res) => {}} />
							</Match>
						</Switch>
					</div>
				</div>
			</main>
			<ProgressTracker
				onLifeLineUse={(lifeline, res) => {
					let l: LifeLineType | null = null;
					switch (lifeline) {
						case Lifeline.audience:
							l = 'PublicChoice';
							break;
						case Lifeline.fiftyFifty:
							console.log('lifeline', lifeline, res);
							res.FiftyFifty!.Answers.forEach((v) => {
								setDisabledAnswers((prev) => [...prev, v.id]);
							});
							console.log('disabledAnswers', disabledAnswers());
							break;
						case Lifeline.friendCall:
							l = 'FriendCall';
							break;
					}
					if (!l) {
						return;
					}
					setOverlay(l);
				}}
			/>
			<select
				value={overlay() || 'none'}
				onchange={(e) => {
					if (e.currentTarget.value == 'null') {
						setOverlay(null);
						return;
					}
					setOverlay(e.currentTarget.value as LifeLineType);
				}}
			>
				<option value="null">none</option>
				<option value="PublicChoice">PublicChoice</option>
				<option value="FriendCall">FriendCall</option>
				<option value="FriendCalling">FriendCalling</option>
				<option value="50/50">50/50</option>
			</select>
		</div>
	);
}
