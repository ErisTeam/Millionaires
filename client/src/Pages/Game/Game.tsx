import 'solid-devtools';
import style from './Game.module.css';
import ProgressTracker from '@/Components/ProgressTracker/ProgressTracker';
import AnswerButton from '@/Components/AnswerButton/AnswerButton';
import ExampleAnswers from '@/TestData/Answer';
import Question from '@/Components/Question/Question';
import LifeLine1 from '@/Components/LifeLine1/LifeLine1';
import ConfirmationModal from '@/Components/ConfirmationModal/ConfirmationModal';
import { For, Show, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAppState } from '@/AppState';
import { Question as QuestionT } from '@/protobufMessages/Questions';
import { answerQuestion } from '@/helpers';

export default function Game() {
	const navigate = useNavigate();
	const AppState = useAppState();
	let shouldShow = true;
	//Doesnt need onMount cause it should run before the component is rendered
	//shouldShow prevents an error on ?.question
	if (AppState.runID() == undefined || AppState.username() == undefined || AppState.currentQuestion() == undefined) {
		shouldShow = false;
		navigate('/');
		alert('Nie masz prawa tu być');
	}

	return (
		<Show when={shouldShow}>
			<div class={style.container}>
				<div class={style.game}>
					{/* <div class={style.ai}>
					<div class={style.questionImg}></div>
					<div class={style.host}></div>
				</div> */}
					<div class={style.questionContainer}>
						<Question question={AppState.currentQuestion()?.question as QuestionT} />
						<ol class={style.answers}>
							<For each={AppState.currentQuestion()?.answers}>
								{(answer) => {
									return (
										<li>
											<AnswerButton
												onClick={(_) => {
													//enable animation here
													let runId = AppState.runID();
													if (runId == undefined) {
														alert('Nie masz prawa tu być');
														navigate('/');
														return;
													}
													answerQuestion(runId, answer.id).then((x) => {
														console.log(x);
														if (x.isCorrect) {
															alert('Dobrze');
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
												}}
												answer={answer}
											/>
										</li>
									);
								}}
							</For>
						</ol>
					</div>
				</div>
				<ProgressTracker class={style.progressTracker} />
				{/* <ConfirmationModal /> */}
				{/* <LifeLine1 /> */}
			</div>
		</Show>
	);
}
