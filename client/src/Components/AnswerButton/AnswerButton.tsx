import { Answer } from '@/protobufMessages/Answers';
import style from './AnswerButton.module.css';
import HexagonButton from '../HexagonButton/HexagonButton';

type AnswerButtonProps = {
	onClick: (answer: Answer) => void;
	answer: Answer;
	selected?: boolean;
	status?: 'wrong' | 'correct';
	disabled?: boolean;
	zIndex?: number;
	letter?: string;
};
export default (props: AnswerButtonProps) => {
	return (
		<HexagonButton
			zIndex={props.zIndex}
			disabled={props.disabled}
			class={style.answerButton}
			hexagonClass={
				style.hexagon +
				' ' +
				(props.selected && style.selected) +
				' ' +
				(props.status == 'correct' ? style.correct : props.status == 'wrong' ? style.wrong : '')
			}
			onClick={() => {
				props.onClick(props.answer);
			}}
		>
			<span>
				{props.letter} {props.answer.answer}
			</span>
		</HexagonButton>
	);
};
