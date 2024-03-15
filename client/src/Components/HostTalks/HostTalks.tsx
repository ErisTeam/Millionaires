import style from './HostTalks.module.css';
import { For, Index } from 'solid-js';

export default function HostTalks() {
	let text = 'dsadsadjoe ufhuesihf ihebzkvb ekawbfbabf ';
	let output = text.split('');
	return (
		<div>
			{/* for each letter add letter */}
			<For each={output}>{(x) => <span>{x}</span>}</For>
		</div>
	);
}
