import { createResource, createSignal } from 'solid-js';
import style from './GameOver.module.css';
import { useAppState } from '@/AppState';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import { useNavigate } from '@solidjs/router';
import Popup from '../Popup/Popup';
import { IconDoorExit, IconSend } from '@tabler/icons-solidjs';

export default function GameOver() {
	const AppState = useAppState();
	const navigate = useNavigate();
	const [didComplete] = createResource(() => {
		if (AppState.questionsStatus()[11].answered) {
			return true;
		}
		return false;
	});

	const [showFeedbackPopup, setShowFeedbackPopup] = createSignal(false);
	return (
		<div class={style.GameOver}>
			<h3 classList={{ [style.success]: didComplete() }}>Koniec Gry</h3>
			<span>Gratulujemy {AppState.username()},</span>
			<span>Twój wynik to: {NaN}</span>
			<HexagonButton
				onClick={() => {
					setShowFeedbackPopup(true);
				}}
			>
				<span>Podziel się opinią</span>
			</HexagonButton>
			<HexagonButton
				class={style.menuButton}
				hexagonClass={style.hexagon}
				onClick={() => {
					navigate('../');
				}}
			>
				<span>Strona Główna</span>
			</HexagonButton>
			<Popup show={showFeedbackPopup()}>
				<div class={style.feedback}>
					<textarea class={style.popupInput} cols="30" rows="10" placeholder="tekst"></textarea>
					<div class={style.controls}>
						<button onclick={() => {}}>
							<IconSend />
						</button>
						<button onclick={() => setShowFeedbackPopup(false)}>
							<IconDoorExit />
						</button>
					</div>
				</div>
			</Popup>
		</div>
	);
}
