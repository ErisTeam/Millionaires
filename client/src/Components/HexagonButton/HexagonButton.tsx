import { JSX } from 'solid-js';
import Hexagon from '../Hexagon/Hexagon';
import style from './HexagonButton.module.css';

type HexagonButtonProps = {
	onClick?: (e: MouseEvent) => void;
	children?: JSX.Element;
	class?: string;
	hexagonClass?: string;
	disabled?: boolean;
	zIndex?: number;
};
export default (props: HexagonButtonProps) => {
	return (
		<button
			disabled={props.disabled}
			class={style.hexagonButton + ' ' + props.class}
			onClick={props.onClick}
			style={{ 'z-index': props.zIndex }}
		>
			<Hexagon class={style.hexagon + ' ' + props.hexagonClass} />
			{props.children}
		</button>
	);
};
