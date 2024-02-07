import 'solid-devtools';
import style from './Game.module.css';
import ProgressTracker from '@/Components/ProgressTracker/ProgressTracker';
import AnswerButton from '@/Components/AnswerButton/AnswerButton';
import ExampleAnswers from '@/TestData/Answer';
import Question from '@/Components/Question/Question';
import LifeLine1 from '@/Components/LifeLine1/LifeLine1';
import ConfirmationModal from '@/Components/ConfirmationModal/ConfirmationModal';

export default function App() {
	return (
		<div class={style.container}>
			<div class={style.game}>
				{/* <div class={style.ai}>
					<div class={style.questionImg}></div>
					<div class={style.host}></div>
				</div> */}
				<div class={style.questionContainer}>
					<Question
						question={{
							id: 1,
							question:
								'Bardzo długie pytanie retoryczne na temat, którym jest furrasowość Gamiego. Czy Gami to Furras?',
							difficulty: 1,
							impressions: 1,
						}}
					/>
					<ol class={style.answers}>
						<li>
							<AnswerButton onClick={(_) => {}} answer={ExampleAnswers.fullAnswer1} />
							<AnswerButton onClick={(_) => {}} answer={ExampleAnswers.fullAnswer2} />
						</li>
						<li>
							<AnswerButton onClick={(_) => {}} answer={ExampleAnswers.fullAnswer2} />
							<AnswerButton onClick={(_) => {}} answer={ExampleAnswers.fullAnswer2} />
						</li>
					</ol>
				</div>
			</div>
			<ProgressTracker class={style.progressTracker} />
			{/* <ConfirmationModal /> */}
			<LifeLine1 />
		</div>
	);
}
