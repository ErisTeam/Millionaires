import { For, createSignal, onMount, Show } from 'solid-js';
import style from './Leaderboard.module.css';
import { createAutoAnimate } from '@formkit/auto-animate/solid';

export default function Leaderboard() {
	const [users, setUsers] = createSignal([
		{ rank: 1, name: 'marcin', score: 2222 },
		{ rank: 2, name: 'to', score: 2221 },
		{ rank: 3, name: 'furras', score: 3333 },
	]);
	const [parent, setEnabled] = createAutoAnimate();
	return (
		<aside class={style.leaderBoard}>
			<h1>Leaderboard</h1>
			<ol class={style.list} ref={parent}>
				<For each={users()}>
					{(user) => (
						<li class={style.user}>
							<span>{user.rank}</span> <span>{user.name}</span> <span>{user.score}</span>
						</li>
					)}
				</For>
			</ol>

			<button
				onclick={() => {
					setUsers((prev) => {
						return [...prev, { rank: 4, name: 'newuser', score: 321 }];
					});
				}}
				style={'color: black'}
			>
				Add User
			</button>
		</aside>
	);
}
