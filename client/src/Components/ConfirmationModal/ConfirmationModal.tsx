import style from './ConfirmationModal.module.css';
import HexagonButton from '../HexagonButton/HexagonButton';

interface ConfirmationModalProps {
	onClick: (result: boolean) => void;
	texts?: {
		confirm: string;
		reject: string;
	};
}

export default (props: ConfirmationModalProps) => {
	return (
		<section class={style.ConfirmationModal}>
			<h2>Czy na pewno?</h2>
			<ol>
				<HexagonButton onClick={() => props.onClick(true)} class={style.button} hexagonClass={style.confirm}>
					{props.texts?.confirm || 'Tak'}
				</HexagonButton>
				<HexagonButton onClick={() => props.onClick(false)} class={style.button} hexagonClass={style.reject}>
					{props.texts?.reject || 'Nie'}
				</HexagonButton>
			</ol>
		</section>
	);
};
