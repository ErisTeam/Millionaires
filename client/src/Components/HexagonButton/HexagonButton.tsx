import { JSX } from 'solid-js';
import Hexagon from '../Hexagon/Hexagon';
import style from './HexagonButton.module.css';

type HexagonButtonProps = {
	onClick?: (e: MouseEvent) => void;
	children?: JSX.Element;
	class?: string;
	hexagonClass?: string;
};
export default (props: HexagonButtonProps) => {
	return (
		<button class={style.hexagonButton + ' ' + props.class} onClick={props.onClick}>
			<Hexagon class={style.hexagon + ' ' + props.hexagonClass} />
			{props.children}
		</button>
	);
};
