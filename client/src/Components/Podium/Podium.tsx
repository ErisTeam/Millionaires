import { useLeaderboardState } from '../Leaderboard/LeaderboardContext';
import style from './Podium.module.css';
import { IconAward } from '@tabler/icons-solidjs';
import { For } from 'solid-js';
export default function Podium() {
	const state = useLeaderboardState();
	return (
		<ol class={style.podium}>
			<For each={['second', 'first', 'third']}>
				{(x, index) => (
					<li class={style[x]}>
						<span>{state.users()[index() == 0 ? 1 : index() == 1 ? 0 : 2].name}</span>
						<p class={style.place}>
							<IconAward></IconAward>
							<span>{(index() == 0 ? 1 : index() == 1 ? 0 : 2) + 1}</span>
						</p>
					</li>
				)}
			</For>
		</ol>
	);
}
