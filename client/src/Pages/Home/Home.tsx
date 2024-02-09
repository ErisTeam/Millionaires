import style from './Home.module.css';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import Leaderboard from '@/Components/Leaderboard/Leaderboard';
import Podium from '@/Components/Podium/Podium';

export default function StartPage() {
	return (
		<div class={style.container}>
			<Leaderboard />

			<ol>
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
						<span>Leaderboard</span>
					</HexagonButton>{' '}
				</li>
			</ol>
			<Podium />
		</div>
	);
}
