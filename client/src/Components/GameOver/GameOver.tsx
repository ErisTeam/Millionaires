import { useContext } from 'solid-js';
import style from './GameOver.module.css';
import { useAppState } from '@/AppState';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import { useNavigate } from '@solidjs/router';

export default function GameOver() {
	const AppState = useAppState();
	const navigate = useNavigate();

	return (
		<div class={style.GameOver}>
			<h3>Game Over</h3>
			<span>Gratulujemy {AppState.username()},</span>
			<span> osiągnąłeś wynik:</span>
			<HexagonButton
				class={style.menuButton}
				hexagonClass={style.hexagon}
				onClick={() => {
					navigate('../');
				}}
			>
				<span>Strona Główna</span>
			</HexagonButton>
		</div>
	);
}
