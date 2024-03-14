import { Portal } from 'solid-js/web';

import style from './Popup.module.css';
import { JSX, Show, createEffect, createSignal, onMount } from 'solid-js';

interface PopupProps {
	containerClass?: string;
	popupClass?: string;
	children: JSX.Element | JSX.Element[];
	hide?: boolean;
}
export default (props: PopupProps) => {
	const [firstRender, setFirstRender] = createSignal(false);
	setTimeout(() => {
		setFirstRender(true);
	}, 500);
	return (
		<Portal>
			<main
				class={style.container}
				style={{ visibility: firstRender() ? 'visible' : 'hidden' }}
				classList={{
					[style.hide]: props.hide,
					[style.show]: !props.hide,
				}}
			>
				<article class={style.popup}>{props.children}</article>
			</main>
		</Portal>
	);
};
