import { JSX } from 'solid-js';
import Hexagon from '../Hexagon/Hexagon';
import style from './HexagonButton.module.css';
import { createSignal } from 'solid-js';

type HexagonButtonProps = {
	onClick?: (e: MouseEvent) => void;
	children?: JSX.Element;
	class?: string;
	hexagonClass?: string;
};
export default (props: HexagonButtonProps) => {
	const [answering, setAnswering] = createSignal(false);

	return (
		<button
			class={style.hexagonButton + ' ' + props.class}
			onClick={(_) => {
				props.onClick;
				setAnswering(!answering());
				console.log(answering());
			}}
		>
			<Hexagon class={style.hexagon + ' ' + props.hexagonClass + ' ' + (answering() ? style.answering : '')} />
			{props.children}
		</button>
	);
};
