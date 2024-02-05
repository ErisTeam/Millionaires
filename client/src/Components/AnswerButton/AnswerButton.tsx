import { Answer } from '@/protobufMessages/Answers';
import style from './AnswerButton.module.css';
import Hexagon from '../Hexagon/Hexagon';

type AnswerButtonProps = {
	onClick: (answer: Answer) => void;
	answer: Answer;
};
export default (props: AnswerButtonProps) => {
	return (
		<button class={style.answerButton} onclick={() => props.onClick(props.answer)}>
			<Hexagon class={style.hexagon} />
			<span>{props.answer.answer}</span>
		</button>
	);
};
