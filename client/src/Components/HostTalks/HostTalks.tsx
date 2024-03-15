import { For } from 'solid-js';
import style from './HostTalks.module.css';

export default function HostTalks() {
	let text = '';
	let output = text.split('');
	return (
		<div class={style.talky}>
			<button
				onClick={() => {
					text = 'To jest przykładowe zdanie.';
					output = text.split('');
				}}
			>
				Reset
			</button>
			<For each={output}>
				{(char, index) => (
					<span key={index()} class={style.letter} style={{ animationDelay: `${index() * 1}s` } as any}>
						{char}
					</span>
				)}
			</For>
		</div>
	);
}
