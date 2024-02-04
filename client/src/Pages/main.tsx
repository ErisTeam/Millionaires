import 'solid-devtools';
import style from './main.module.css';
import { IconDiamondFilled, IconDiamondsFilled, IconUsersGroup, IconRobot, IconPhoneCall } from '@tabler/icons-solidjs';
import ProgressTracker from '@/Components/ProgressTracker/ProgressTracker';
import AnswerButton from '@/Components/AnswerButton/AnswerButton';
import ExampleAnswers from '@/TestData/Answer';
import Question from '@/Components/Question/Question';

export default function App() {
	return (
		<div class={style.container}>
			<div class={style.game}>
				<div class={style.ai}>
					<div class={style.questionImg}></div>
					<div class={style.host}></div>
				</div>
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
							<AnswerButton onClick={(a) => {}} answer={ExampleAnswers.fullAnswer1} />
							<AnswerButton onClick={(a) => {}} answer={ExampleAnswers.fullAnswer2} />
						</li>
						<li>
							<AnswerButton onClick={(a) => {}} answer={ExampleAnswers.fullAnswer2} />
							<AnswerButton onClick={(a) => {}} answer={ExampleAnswers.fullAnswer2} />
						</li>
					</ol>
				</div>
			</div>
			<ProgressTracker />
		</div>
	);
}
