import { Question } from '@/protobufMessages/Questions';
import Hexagon from '../Hexagon/Hexagon';
import style from './Question.module.css';
type QuestionProps = {
	question: Question;
};
export default (props: QuestionProps) => {
	return (
		<h3 class={style.question}>
			<Hexagon class={style.hexagon} />
			<p>{props.question.question}</p>
		</h3>
	);
};
