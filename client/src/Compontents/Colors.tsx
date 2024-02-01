import style from './Colors.module.css';

export default function Colors() {
	return (
		<div class={style.colorsContainer}>
			<div style={'background-color: var(--bg0)'}>Bg0</div>
			<div style={'background-color: var(--bg1)'}>Bg1</div>
			<div style={'background-color: var(--bg2)'}>Bg2</div>
		</div>
	);
}
