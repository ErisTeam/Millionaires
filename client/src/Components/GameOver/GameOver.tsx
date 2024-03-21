import { createResource, createSignal } from 'solid-js';
import style from './GameOver.module.css';
import { useAppState } from '@/AppState';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import { useNavigate } from '@solidjs/router';
import Popup from '../Popup/Popup';
import { IconDoorExit, IconSend } from '@tabler/icons-solidjs';
import { GET_RUN_SCORE_ENDPOINT, SEND_FEEDBACK_ENDPOINT } from '@/constants';
import { SendFeedback } from '@/protobufMessages/Run';
import { getRunScoreRequest, getRunScoreResponse } from '@/protobufMessages/Statistics';
import { MillionairesError } from '@/protobufMessages/Error';

export default function GameOver() {
	const AppState = useAppState();
	const navigate = useNavigate();
	const [didComplete] = createResource(() => {
		if (AppState.questionsStatus()[11].answered) {
			return true;
		}
		return false;
	});

    async function getScore(): Promise<Number> {
		let request = getRunScoreRequest.create();
        let runId = AppState.runID();
        if (runId == undefined) {
            console.error("Error while fetching score. No run ID.")
            return 0;
        }
		request.runSnowflakeId = runId;
		let res = await fetch(GET_RUN_SCORE_ENDPOINT, {
			method: 'POST',
			body: getRunScoreRequest.encode(request).finish(),
		});

        let resArrayBuf = new Uint8Array(await res.arrayBuffer());

        // Error
        if (res.status >= 400) {
            let response = MillionairesError.decode(resArrayBuf);
            console.log(response);
            return 0;
        }

		let resDecoded = getRunScoreResponse.decode(resArrayBuf);
		console.log("Run points: ", resDecoded);
        return resDecoded.points;
    }

	const [showFeedbackPopup, setShowFeedbackPopup] = createSignal(false);
	const [feedbackMessage, setFeedbackMessage] = createSignal('');
	const [feedbackSent, setFeedbackSent] = createSignal(false);
    const [score] = createResource(getScore)

	return (
		<div class={style.GameOver}>
			<h3 classList={{ [style.success]: didComplete() }}>Koniec Gry</h3>
			<span>Gratulujemy {AppState.username()},</span>
			<span>Twój wynik to: {(score() ?? 0).toString()}</span>
			<HexagonButton
				disabled={feedbackSent()}
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
					<textarea
						oninput={(e) => {
							setFeedbackMessage(e.currentTarget.value);
						}}
						class={style.popupInput}
						cols="30"
						rows="10"
						placeholder="tekst"
					></textarea>
					<div class={style.controls}>
						<button
							onclick={() => {
								if (feedbackMessage().trim().length === 0) {
									alert('Wpisz wiadomość');
									return;
								}
								const reqBody = SendFeedback.create();
								reqBody.message = feedbackMessage().trim();
								reqBody.runId = AppState.runID() as string;

								fetch(SEND_FEEDBACK_ENDPOINT, {
									method: 'POST',
									body: SendFeedback.encode(reqBody).finish(),
								}).then(() => {
									setShowFeedbackPopup(false);
									setFeedbackMessage('');
									setFeedbackSent(true);
								});
							}}
						>
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
