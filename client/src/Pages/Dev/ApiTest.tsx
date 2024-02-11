import {
	ANSWER_QUESTION_ENDPOINT,
	START_RUN_ENDPOINT,
	GET_RUNS_ENDPOINT,
	END_RUN_ENDPOINT,
} from '../../constants';
import { AnswerQuestionRequest, AnswerQuestionResponse } from '../../protobufMessages/Questions';
import {
	StartRunRequest,
	StartRunResponse,
	GetRunsResponse,
	EndRunRequest,
	EndRunResponse,
} from '../../protobufMessages/Run';
import { MessageType, WebsocketMessage } from '@/protobufMessages/WebSocketMessages';
import { Show, createSignal } from 'solid-js';

export default () => {
	const [runId, setRunId] = createSignal('');
    const [answerId, setAnswerId] = createSignal('');
	async function startRunTest() {
		let request = StartRunRequest.create();
		request.Name = 'Karol';
		let res = await (
			await fetch(START_RUN_ENDPOINT, {
				method: 'POST',
				body: StartRunRequest.encode(request).finish(),
			})
		).arrayBuffer();

		let response = StartRunResponse.decode(new Uint8Array(res));
		console.log(response);
		setRunId(response.RunId);
	}
	async function endRunTest() {
		let request = EndRunRequest.create();
		request.RunId = runId();
		let res = await (
			await fetch(END_RUN_ENDPOINT, {
				method: 'POST',
				body: EndRunRequest.encode(request).finish(),
			})
		).arrayBuffer();

		let response = EndRunResponse.decode(new Uint8Array(res));
		console.log(response);
	}
	async function getRunsTest() {
		let res = await fetch(GET_RUNS_ENDPOINT);
		let resUint8 = new Uint8Array(await res.arrayBuffer());
		let resDecoded = GetRunsResponse.decode(resUint8);

		console.log(resDecoded);
	}

	async function answerQuestion() {
		let request = AnswerQuestionRequest.create();
		request.RunId = runId();
        request.AnswerId = Number(answerId());
		let res = await fetch(ANSWER_QUESTION_ENDPOINT, {
			method: 'POST',
			body: AnswerQuestionRequest.encode(request).finish(),
		});

		let resUint8 = new Uint8Array(await res.arrayBuffer());
		let resDecoded = AnswerQuestionResponse.decode(resUint8);

		console.log(resDecoded);
	}

	const [incomingCall, setIncomingCall] = createSignal(false);
	async function startWebsocketConnection() {
		const ws = new WebSocket('ws://localhost:9090/ws');

		ws.onmessage = async (event) => {
			console.log(event);

			const data = await event.data.arrayBuffer();
			const decodedMessage = WebsocketMessage.decode(new Uint8Array(data));
			console.log('message', decodedMessage);
			switch (decodedMessage.type) {
				case MessageType.Identify:
					setInterval(() => {
						ws.send(
							WebsocketMessage.encode(
								WebsocketMessage.fromPartial({
									type: MessageType.Heartbeat,
								}),
							).finish(),
						);
					}, decodedMessage.identifyResponse?.heartbeatInterval);
					break;
			}
		};

		ws.onopen = () => {
			console.log('connected');

			const m = WebsocketMessage.create();
			m.type = MessageType.Identify;
			m.identify = {
				RunSnowflakeId: runId(),
			};
			ws.send(WebsocketMessage.encode(m).finish());
		};

		ws.onerror = (event) => {
			console.log('error', event);
		};

		ws.onclose = (event) => {
			console.log('closed', event);
		};
	}

	return (
		<div style={{ color: 'black' }}>
			<article>
				<h1 style={{ color: 'white' }}>Api Test</h1>
				<button
					onClick={(e) => {
						e.preventDefault();
						startRunTest();
					}}
				>
					Test Start Run
				</button>
				<button
					onClick={(e) => {
						e.preventDefault();
						endRunTest();
					}}
				>
					Test End Run
				</button>
				<button
					onClick={(e) => {
						e.preventDefault();
						getRunsTest();
					}}
				>
					Test Get Runs
				</button>
				<button onClick={(e) => { e.preventDefault(); answerQuestion(); }} >
					Test Answer Question
				</button>
                <label>
                    <p style={{ color: "white" }}>Run ID</p>
                    <input type="text" value={runId()} onChange={(e) => { setRunId(e.target.value); }}/>
                </label>
                <label>
                    <p style={{ color: "white" }}>Answer ID</p>
                    <input type="text" value={answerId()} onChange={(e) => { setAnswerId(e.target.value); }}/>
                </label>
			</article>

			<article>
				<h1 style={{ color: 'white' }}>WebSocket Test</h1>
				<button onclick={startWebsocketConnection}>Connect</button>
				<button>Disconnect</button>
				<button>Call</button>
				<Show when={incomingCall()}>
					<button>Answer</button>
					<button>Reject</button>
				</Show>

				<section>
					<textarea cols="30" rows="2" placeholder="Message"></textarea>
					<button>Send</button>
				</section>
			</article>
		</div>
	);
};
