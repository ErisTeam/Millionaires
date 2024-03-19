import 'solid-devtools';
import style from './Game.module.css';
import ProgressTracker from '@/Components/ProgressTracker/ProgressTracker';
import AnswerButton from '@/Components/AnswerButton/AnswerButton';
import Question from '@/Components/Question/Question';
import { For, Match, Show, Switch, createSignal, onCleanup, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { LifeLineType, useAppState } from '@/AppState';
import { Question as QuestionT } from '@/protobufMessages/Questions';
import { answerQuestion } from '@/helpers';
import ConfirmationModal from '@/Components/ConfirmationModal/ConfirmationModal';
import PublicChoice from '@/Components/LifeLines/PuBlIcChOiCe/PublicChoice';
import FriendCall from '@/Components/LifeLines/FriendCall/FriendCall';
import FriendCalling from '@/Components/LifeLines/FriendCalling/FriendCalling';
import { AudienceResponse, AudienceResponseItem, FiftyFiftyResponse, Lifeline } from '@/protobufMessages/Lifelines';
import { EndRunRequest, EndRunResponse } from '@/protobufMessages/Run';
import { END_RUN_ENDPOINT } from '@/constants';
import { createStore, produce } from 'solid-js/store';

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

	const [overlay, setOverlay] = createStore<(LifeLineType | 'FriendCalling')[]>([]);

	//Doesnt need onMount cause it should run before the component is rendered
	//shouldShow prevents an error on ?.question
	if (AppState.runID() == undefined || AppState.username() == undefined || AppState.currentQuestion() == undefined) {
		navigate('/');
		return;
	}

	const [selectedAnswerId, setSelectedAnswerId] = createSignal<number | undefined>(undefined);
	const [correctAnswerAnimation, setCorrectAnswerAnimation] = createSignal<boolean>(false);
	const [confirmed, setConfirmed] = createSignal(false);
	const [disabledAnswers, setDisabledAnswers] = createSignal<number[]>([]);
	const [audienceVotes, setAudienceVotes] = createSignal<AudienceResponseItem[]>([]);

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

			setOverlay([]);

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
					setCorrectAnswerAnimation(true);
					setTimeout(() => {
						AppState.setCurrentQuestion(result!.nextQuestion);
						setSelectedAnswerId(undefined);
						setConfirmed(false);
						setCorrectAnswerAnimation(false);
					}, AnswerAnimationTimeout / 2);
				} else {
					alert('Zle');
					navigate('/results');
					setSelectedAnswerId(undefined);
					setConfirmed(false);
					setCorrectAnswerAnimation(false);
				}
			}, AnswerAnimationTimeout / 2);
		} else {
			setSelectedAnswerId(undefined);
		}
	}

	function onCall() {}
	function onIncomingCall() {
		setOverlay(
			produce((prev) => {
				if (!prev.includes('FriendCalling')) {
					prev.push('FriendCalling');
				}
			}),
		);
	}
	function onCallEnd() {
		console.log('Call end');
		setOverlay(
			produce((prev) => {
				prev.slice(prev.indexOf('FriendCalling'), 1);
				prev.slice(prev.indexOf('FriendCall'), 1);
			}),
		);
	}

	AppState.websocket.onCall.subscribe(onCall);
	AppState.websocket.onIncomingCall.subscribe(onIncomingCall);
	AppState.websocket.onEndCall.subscribe(onCallEnd);
	AppState.websocket.onCallResponse.subscribe((data) => {
		setOverlay(
			produce((prev) => {
				prev.slice(prev.indexOf('FriendCalling'), 1);

				if (!prev.includes('FriendCall') && data) {
					prev.push('FriendCall');
				}
			}),
		);
	});

	return (
		<div class={style.container}>
			<main class={style.game}>
				<div class={style.ai}>
					<div class={style.host}>
						{/* <iframe
							style={{
								'pointer-events': 'none',
							}}
							width="100%"
							height="100%"
							src="https://www.youtube.com/embed/eRXE8Aebp7s?autoplay=1&controls=0&loop=1"
							title="10 hour loop playing Subway Surfers"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						></iframe> */}
					</div>
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
											correct={correctAnswerAnimation()}
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
							[style.publicsChoice]: overlay.includes('PublicChoice'),
							[style.friendCall]: overlay.includes('FriendCall'),
							[style.friendCalling]: overlay.includes('FriendCalling'),
							[style.hide]: overlay.length == 0,
						}}
					>
						<Show when={overlay.includes('FriendCall')}>
							<FriendCall />
						</Show>
						<Show when={overlay.includes('PublicChoice')}>
							<PublicChoice finalPercentages={audienceVotes()} />
						</Show>
						<Show when={overlay.includes('FriendCalling')}>
							<FriendCalling
								name={AppState.websocket.currentCall.callerName}
								onClick={() => {
									setOverlay(
										produce((prev) => {
											prev.splice(prev.indexOf('FriendCalling'), 1);
											if (!prev.includes('FriendCall')) {
												prev.push('FriendCall');
											}
										}),
									);
								}}
							/>
						</Show>
					</div>
				</div>
			</main>
			<ProgressTracker
				onLifeLineUse={(lifeline, res) => {
					let l: LifeLineType | null = null;
					switch (lifeline) {
						case Lifeline.audience:
							console.log('lifeline', lifeline, res);
							l = 'PublicChoice';
							setAudienceVotes(res.audience!.answers);
							break;
						case Lifeline.fiftyFifty:
							console.log('lifeline', lifeline, res);
							res.fiftyFifty!.answers.forEach((v) => {
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
					setOverlay(
						produce((prev) => {
							if (prev.includes(l as LifeLineType)) {
								return;
							}
							prev.push(l as LifeLineType);
						}),
					);
				}}
			/>
			{/* <select
				// value={overlay. || 'none'}
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
			</select> */}
		</div>
	);
}
