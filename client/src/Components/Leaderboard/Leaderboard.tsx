import { For } from 'solid-js';
import style from './Leaderboard.module.css';
import { createAutoAnimate } from '@formkit/auto-animate/solid';
import { useLeaderboardState } from './LeaderboardContext';
import { IconAward } from '@tabler/icons-solidjs';
export default function Leaderboard() {
	const state = useLeaderboardState();
	const [parent, setEnabled] = createAutoAnimate({
		// Animation duration in milliseconds (default: 250)
		duration: 250,
		// Easing for motion (default: 'ease-in-out')
		easing: 'ease-in-out',
		// When true, this will enable animations even if the user has indicated
		// they don’t want them via prefers-reduced-motion.
	});
	return (
		<aside class={style.leaderBoard}>
			<h1>Najlepsze wyniki:</h1>
			<ol class={style.list} ref={parent}>
				<For each={state.users()}>
					{(user, index) => (
						<li
							class={style.user}
							classList={{
								[style.topThree]: index() < 3,
							}}
						>
							<span class={style.marker}>
								{index() <= 2 ? <IconAward class={style.marker}></IconAward> : index() + 1}
							</span>{' '}
							<span>{user.name}</span>
							<span>{user.score}</span>
						</li>
					)}
				</For>
			</ol>

			{/* <button
				onclick={() => {
					state.setUsers((prev) => {
						return [...prev, { name: 'newuser', score: Math.floor(Math.random() * 9000) }].sort(
							(a, b) => b.score - a.score,
						);
					});
				}}
				style={'color: black'}
			>
				Add User
			</button> */}
		</aside>
	);
}
