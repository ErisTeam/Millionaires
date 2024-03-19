import { createResource, useContext } from 'solid-js';
import style from './GameOver.module.css';
import { useAppState } from '@/AppState';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import { useNavigate } from '@solidjs/router';

export default function GameOver() {
	const AppState = useAppState();
	const navigate = useNavigate();
	const [didComplete] = createResource(() => {
		if (AppState.questionsStatus()[11].answered) {
			return true;
		}
		return false;
	});
	return (
		<div class={style.GameOver}>
			<h3 classList={{ [style.success]: didComplete() }}>Koniec Gry</h3>
			<span>Gratulujemy {AppState.username()},</span>
			<span>Twój wynik to: {NaN}</span>
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
