import { Answer } from '@/protobufMessages/Answers';
import style from './AnswerButton.module.css';
import Hexagon from '../Hexagon/Hexagon';
import HexagonButton from '../HexagonButton/HexagonButton';
import { createSignal } from 'solid-js';

type AnswerButtonProps = {
	onClick: (answer: Answer) => void;
	answer: Answer;
	selected?: boolean;
};
export default (props: AnswerButtonProps) => {
	const [answering, setAnswering] = createSignal(false);
	return (
		<HexagonButton
			class={style.answerButton}
			hexagonClass={style.hexagon + ' ' + (answering() && style.answering) + ' ' + (props.selected && style.selected)}
			onClick={() => {
				props.onClick(props.answer);
				setAnswering(!answering());
			}}
		>
			<span>{props.answer.answer}</span>
		</HexagonButton>
	);
};
