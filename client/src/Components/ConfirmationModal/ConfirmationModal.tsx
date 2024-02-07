import { Portal } from 'solid-js/web';
import style from './ConfirmationModal.module.css';
import Hexagon from '../Hexagon/Hexagon';
import AnswerButton from '../AnswerButton/AnswerButton';
import HexagonButton from '../HexagonButton/HexagonButton';

export default () => {
	return (
		<section class={style.ConfirmationModal}>
			<ol>
				<HexagonButton class={style.button}>Tak</HexagonButton>
				<HexagonButton class={style.button}>Nie</HexagonButton>
			</ol>
		</section>
	);
};
