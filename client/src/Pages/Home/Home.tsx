import style from './Home.module.css';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import Leaderboard from '@/Components/Leaderboard/Leaderboard';
import Rules from '@/Components/Rules/Rules';
import { LeaderboardStateProvider } from '@/Components/Leaderboard/LeaderboardContext';
import Podium from '@/Components/Podium/Podium';
import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useAppState } from '@/AppState';
import { startRun } from '@/helpers';

export default function StartPage() {
	const navigate = useNavigate();
	const AppState = useAppState();
	const [showRules, setShowRules] = createSignal(false);
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
									//TODO: add pretty pop up
									alert('Podaj imie i nazwisko!');
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
										navigate('/game');
									})
									.catch((e) => {
										console.error(e);
										alert('Nie mozna polaczyc z serwerem');
									});
							}}
						>
							<span>Zacznij gre!</span>
						</HexagonButton>{' '}
					</li>
					{/* <li>
						<HexagonButton class={style.startButton} hexagonClass={style.hexagon}>
							<span>Training mode</span>
						</HexagonButton>{' '}
					</li> */}
					{/* <li>
						<HexagonButton
							class={style.startButton}
							hexagonClass={style.hexagon}
							onClick={() => {
								setShowRules(!showRules());
							}}
						>
							<span>Rules</span>
						</HexagonButton>{' '}
					</li> */}
					{/* <li>
						<HexagonButton class={style.startButton} hexagonClass={style.hexagon}>
							<span>Leaderboard</span>
						</HexagonButton>{' '}
					</li> */}
				</ol>
			</LeaderboardStateProvider>
		</div>
	);
}
