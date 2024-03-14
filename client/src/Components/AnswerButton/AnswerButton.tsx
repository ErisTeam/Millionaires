import { Answer } from '@/protobufMessages/Answers';
import style from './AnswerButton.module.css';
import Hexagon from '../Hexagon/Hexagon';
import HexagonButton from '../HexagonButton/HexagonButton';
import { createSignal } from 'solid-js';

type AnswerButtonProps = {
	onClick: (answer: Answer) => void;
	answer: Answer;
	selected?: boolean;
	disabled?: boolean;
	zIndex?: number;
};
export default (props: AnswerButtonProps) => {
	return (
		<HexagonButton
			zIndex={props.zIndex}
			disabled={props.disabled}
			class={style.answerButton}
			hexagonClass={style.hexagon + ' ' + (props.selected && style.selected)}
			onClick={() => {
				props.onClick(props.answer);
			}}
		>
			<span>{props.answer.answer}</span>
		</HexagonButton>
	);
};
