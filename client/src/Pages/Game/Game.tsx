import 'solid-devtools';
import style from './Game.module.css';
import ProgressTracker from '@/Components/ProgressTracker/ProgressTracker';
import AnswerButton from '@/Components/AnswerButton/AnswerButton';
import Question from '@/Components/Question/Question';
import { For, Match, Show, Switch, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAppState } from '@/AppState';
import { Question as QuestionT } from '@/protobufMessages/Questions';
import { answerQuestion } from '@/helpers';
import { Portal } from 'solid-js/web';
import ConfirmationModal from '@/Components/ConfirmationModal/ConfirmationModal';
import LifeLine1 from '@/Components/LifeLines/PuBlIcChOiCe/PublicChoice';
import FriendCall from '@/Components/LifeLines/FriendCall/FriendCall';

export default function Game() {
	const navigate = useNavigate();
	const AppState = useAppState();

	const [overlay, setOverlay] = createSignal<null | 'FriendCall' | '50/50' | 'PublicChoice' | 'Explanation'>(null);

	let shouldShow = true;
	//Doesnt need onMount cause it should run before the component is rendered
	//shouldShow prevents an error on ?.question
	if (AppState.runID() == undefined || AppState.username() == undefined || AppState.currentQuestion() == undefined) {
		shouldShow = false;
		navigate('/');
		// alert('Nie masz prawa tu być');
	}

	const [selectedAnswerId, setSelectedAnswerId] = createSignal<number | undefined>(undefined);
	const [confirmed, setConfirmed] = createSignal(false);

	function handleAnswerClick(answerId: number) {
		let runId = AppState.runID();
		if (runId == undefined) {
			// alert('Nie masz prawa tu być');
			navigate('/');
			return;
		}
		answerQuestion(runId, answerId).then((x) => {
			console.log(x);
			if (x.isCorrect) {
				// alert('Dobrze');
				if (x.nextQuestion == undefined) {
					alert('Koniec');
					navigate('/results');
					return;
				}
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
				AppState.setCurrentQuestion(x.nextQuestion);
			} else {
				alert('Zle');
				navigate('/results');
			}
		});
	}

	function handleConfirmation(result: boolean) {
		if (result) {
			setConfirmed(true);
			console.log(selectedAnswerId());
			setTimeout(() => {
				handleAnswerClick(selectedAnswerId() as number);
				setSelectedAnswerId(undefined);
				setConfirmed(false);
			}, 2000);
		} else {
			setSelectedAnswerId(undefined);
		}
	}

	return (
		<Show when={shouldShow}>
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
												disabled={confirmed() == true}
												selected={selectedAnswerId() == answer.id && confirmed() == true}
												onClick={(_) => {
													//enable animation here
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
								[style.friendCall]: overlay() == 'FriendCall',
								[style.hide]: overlay() == null,
							}}
						>
							<Switch>
								<Match when={overlay() == 'FriendCall'}>
									<FriendCall />
								</Match>
								<Match when={overlay() == 'PublicChoice'}>
									<LifeLine1 />
								</Match>
							</Switch>
						</div>
					</div>
				</main>
				<ProgressTracker onLifeLineUse={(lifeline) => {}} />
			</div>
		</Show>
	);
}
