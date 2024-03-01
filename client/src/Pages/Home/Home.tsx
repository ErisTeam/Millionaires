import style from './Home.module.css';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import Leaderboard from '@/Components/Leaderboard/Leaderboard';
import Rules from '@/Components/Rules/Rules';
import { LeaderboardStateProvider } from '@/Components/Leaderboard/LeaderboardContext';
import Podium from '@/Components/Podium/Podium';
import { createSignal } from 'solid-js';

export default function StartPage() {
	const [showRules, setShowRules] = createSignal(false);
	return (
		<div class={style.container}>
			<LeaderboardStateProvider>
				<Leaderboard />
				<ol class={style.startMenu}>
					<div class={style.logo}></div>
					<li>
						<input type="text" placeholder="Imie i Nazwisko" />
					</li>
					<li>
						<HexagonButton class={style.startButton} hexagonClass={style.hexagon}>
							<span>Start Game</span>
						</HexagonButton>{' '}
					</li>
					<li>
						<HexagonButton class={style.startButton} hexagonClass={style.hexagon}>
							<span>Training mode</span>
						</HexagonButton>{' '}
					</li>
					<li>
						<HexagonButton
							class={style.startButton}
							hexagonClass={style.hexagon}
							onClick={() => {
								setShowRules(!showRules());
							}}
						>
							<span>Rules</span>
						</HexagonButton>{' '}
					</li>
					<li>
						<HexagonButton class={style.startButton} hexagonClass={style.hexagon}>
							<span>Leaderboard</span>
						</HexagonButton>{' '}
					</li>
				</ol>
			</LeaderboardStateProvider>
		</div>
	);
}
