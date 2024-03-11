import style from './ConfirmationModal.module.css';
import HexagonButton from '../HexagonButton/HexagonButton';

interface ConfirmationModalProps {
	onClick: (result: boolean) => void;
}

export default (props: ConfirmationModalProps) => {
	return (
		<section class={style.ConfirmationModal}>
			<h2>Czy na pewno?</h2>
			<ol>
				<HexagonButton onClick={() => props.onClick(true)} class={style.button}>
					Tak
				</HexagonButton>
				<HexagonButton onClick={() => props.onClick(false)} class={style.button}>
					Nie
				</HexagonButton>
			</ol>
		</section>
	);
};
