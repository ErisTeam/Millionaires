import style from './Home.module.css';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import Leaderboard from '@/Components/Leaderboard/Leaderboard';
import Rules from '@/Components/Rules/Rules';
import { LeaderboardStateProvider } from '@/Components/Leaderboard/LeaderboardContext';
import Podium from '@/Components/Podium/Podium';
import { Show, createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAppState } from '@/AppState';
import { startRun } from '@/helpers';
import Popup from '@/Components/Popup/Popup';
import { connect, identify } from '@/websocket';

export default function StartPage() {
	const navigate = useNavigate();
	const AppState = useAppState();
	const [showRules, setShowRules] = createSignal(false);

	const [showPopup, setShowPopup] = createSignal(false);

	onMount(() => {
		AppState.resetState();
		connect();
	});

	return (
		<div class={style.container}>
			<LeaderboardStateProvider>
				<Leaderboard />
				<ol class={style.startMenu}>
					<div class={style.logo}></div>
					<li>
						<input
							type="text"
							placeholder="Imie i Nazwisko"
							oninput={(e) => {
								AppState.setUsername(e.currentTarget.value);
							}}
						/>
					</li>
					<li>
						<HexagonButton
							class={style.startButton}
							hexagonClass={style.hexagon}
							onClick={(e) => {
								e.preventDefault();
								//We arent using the appstate directly because you cant narrow a type from a signal because each function call can possibly return a different value
								const username = AppState.username();
								if (username == undefined) {
									setShowPopup(true);
									return;
								}
								startRun(username)
									.then((run) => {
										AppState.setRunID(run.runId);
										AppState.setCurrentQuestion(run.question);
										AppState.setQuestionsStatus((prev) => {
											let newState = [...prev];
											for (let i = 0; i < newState.length; i++) {
												newState[i].answered = false;
											}
											return newState;
										});
										AppState.setLifeLines({ fiftyFifty: true, friendCall: true, publicChoice: true });

										identify();

										navigate('/game');
									})
									.catch((e) => {
										console.error(e);
										alert('Nie mozna polaczyc z serwerem');
									});
							}}
						>
							<span>Zacznij gre!</span>
						</HexagonButton>
					</li>
				</ol>
			</LeaderboardStateProvider>

			<Popup hide={!showPopup()}>
				<h2>Podaj imie i nazwisko!</h2>
				<HexagonButton
					class={style.popupButton}
					hexagonClass={style.hexagon}
					onClick={() => {
						setShowPopup(false);
					}}
				>
					Ok
				</HexagonButton>
			</Popup>
		</div>
	);
}
