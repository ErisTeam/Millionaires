import { Answer } from '@/protobufMessages/Answers';
import style from './AnswerButton.module.css';
import Hexagon from '../Hexagon/Hexagon';
import HexagonButton from '../HexagonButton/HexagonButton';

type AnswerButtonProps = {
	onClick: (answer: Answer) => void;
	answer: Answer;
};
export default (props: AnswerButtonProps) => {
	return (
		<HexagonButton class={style.answerButton} hexagonClass={style.hexagon} onClick={() => props.onClick(props.answer)}>
			<span>{props.answer.answer}</span>
		</HexagonButton>
	);
};
