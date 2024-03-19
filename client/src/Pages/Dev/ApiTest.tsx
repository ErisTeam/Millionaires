import { Lifeline, UseLifelineRequest, UseLifelineResponse } from '@/protobufMessages/Lifelines';
import {
	ANSWER_QUESTION_ENDPOINT,
	START_RUN_ENDPOINT,
	GET_RUNS_ENDPOINT,
	END_RUN_ENDPOINT,
	USE_LIFELINE_ENDPOINT,
} from '../../constants';
import { AnswerQuestionRequest, AnswerQuestionResponse } from '../../protobufMessages/Questions';
import {
	StartRunRequest,
	StartRunResponse,
	GetRunsResponse,
	EndRunRequest,
	EndRunResponse,
} from '../../protobufMessages/Run';
import { MessagePayload, MessageType, WebsocketMessage } from '@/protobufMessages/WebSocketMessages';
import { For, Show, createSignal } from 'solid-js';
import { useAppState } from '@/AppState';

export default () => {
	const [runId, setRunId] = createSignal('');
	const [answerId, setAnswerId] = createSignal('');
	const [name, setName] = createSignal('');

	const [messages, setMessages] = createSignal<MessagePayload[]>([]);
	const [inCall, setInCall] = createSignal(false);

	async function startRunTest() {
		let a = StartRunRequest.create();
		a.name = name();
		let res = await (
			await fetch(START_RUN_ENDPOINT, {
				method: 'POST',
				body: StartRunRequest.encode(a).finish(),
			})
		).arrayBuffer();

		let response = StartRunResponse.decode(new Uint8Array(res));
		console.log(response);
		setRunId(response.runId);
	}
	async function endRunTest() {
		let request = EndRunRequest.create();
		request.runId = runId();
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
		request.runId = runId();
		request.answerId = Number(answerId());
		let res = await fetch(ANSWER_QUESTION_ENDPOINT, {
			method: 'POST',
			body: AnswerQuestionRequest.encode(request).finish(),
		});

		let resUint8 = new Uint8Array(await res.arrayBuffer());
		let resDecoded = AnswerQuestionResponse.decode(resUint8);

		console.log(resDecoded);
	}

	const [lifeline, setLifeline] = createSignal(Lifeline.fiftyFifty);
	async function useLifelineTest() {
		let a = UseLifelineRequest.create();
		a.runSnowflakeId = runId();
		a.lifeline = lifeline();
		let res = await (
			await fetch(USE_LIFELINE_ENDPOINT, {
				method: 'POST',
				body: UseLifelineRequest.encode(a).finish(),
			})
		).arrayBuffer();

		let response = UseLifelineResponse.decode(new Uint8Array(res));
		console.log(response);
	}

	const [incomingCall, setIncomingCall] = createSignal(false);
	const [callerName, setCallerName] = createSignal('');
	const [ws, setWs] = createSignal<WebSocket | null>(null);

	async function startWebsocketConnection() {
		const ws = new WebSocket('ws://localhost:9090/ws');
		setWs(ws);

		let heartbeatInterval = -1;

		ws.onmessage = async (event) => {
			console.log(event);

			const data = await event.data.arrayBuffer();
			const decodedMessage = WebsocketMessage.decode(new Uint8Array(data));
			console.log('message', decodedMessage);
			switch (decodedMessage.type) {
				case MessageType.Connected:
					heartbeatInterval = setInterval(() => {
						ws.send(
							WebsocketMessage.encode(
								WebsocketMessage.fromPartial({
									type: MessageType.Heartbeat,
								}),
							).finish(),
						);
					}, decodedMessage.connectedResponse?.heartbeatInterval);
					break;
				case MessageType.IncomingCall:
					setCallerName(decodedMessage.incomingCall?.callerName || '');
					setIncomingCall(true);
					break;
				case MessageType.EndCall:
					setIncomingCall(false);
					break;
				case MessageType.Message:
					let message = decodedMessage.message;
					console.log(message);
					if (!message) {
						break;
					}
					setMessages((prev) => {
						return [...prev, message as MessagePayload];
					});
					console.log(messages());
					break;
				case MessageType.CallResponse:
					let callResponse = decodedMessage.callResponse;

					if (callResponse?.accepted) {
						setInCall(true);
					} else {
						setInCall(false);
					}
					break;
			}
		};

		ws.onopen = () => {
			console.log('connected');

			const m = WebsocketMessage.create();
			m.type = MessageType.Identify;
			m.identify = {
				runSnowflakeId: runId(),
			};
			ws.send(WebsocketMessage.encode(m).finish());
		};

		ws.onerror = (event) => {
			console.log('error', event);
		};

		ws.onclose = (event) => {
			console.log('closed', event);
			if (heartbeatInterval !== -1) {
				clearInterval(heartbeatInterval);
			}
		};
	}

	return (
		<div style={{ color: 'black' }}>
			<article>
				<h1 style={{ color: 'white' }}>Api Test</h1>
				<input type="text" placeholder="Name" oninput={(e) => setName(e.currentTarget.value)} />
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
				<button
					onClick={(e) => {
						e.preventDefault();
						answerQuestion();
					}}
				>
					Test Answer Question
				</button>
				<button
					onClick={(e) => {
						e.preventDefault();
						useLifelineTest();
					}}
				>
					Test Use Lifeline
				</button>
				<select
					value={0}
					onChange={(e) => {
						setLifeline(Number(e.target.value));
					}}
				>
					<option value={Lifeline.fiftyFifty}>50/50</option>
					<option value={Lifeline.friendCall}>Zadzwoń ;3</option>
					<option value={Lifeline.audience}>Te tamte co siedzom</option>
				</select>
				<label>
					<p style={{ color: 'white' }}>Run ID</p>
					<input
						type="text"
						value={runId()}
						onChange={(e) => {
							setRunId(e.target.value);
						}}
					/>
				</label>
				<label>
					<p style={{ color: 'white' }}>Answer ID</p>
					<input
						type="text"
						value={answerId()}
						onChange={(e) => {
							setAnswerId(e.target.value);
						}}
					/>
				</label>
			</article>

			<article>
				<h1 style={{ color: 'white' }}>WebSocket Test</h1>
				<button onclick={startWebsocketConnection}>Connect</button>
				<button>Disconnect</button>
				<Show when={!inCall()}>
					<button
						onclick={() => {
							const m = WebsocketMessage.create();
							m.type = MessageType.StartCall;

							const appState = useAppState();
							appState.setRunID(runId());
							appState.useLifeLine(Lifeline.friendCall);
							// ws()?.send(WebsocketMessage.encode(m).finish());
						}}
					>
						Call
					</button>
				</Show>
				<Show when={incomingCall()}>
					<h1>{callerName()}</h1>
					<button
						onclick={() => {
							const m = WebsocketMessage.create();
							m.type = MessageType.CallResponse;
							m.callResponse = {
								accepted: true,
							};
							ws()?.send(WebsocketMessage.encode(m).finish());
							setIncomingCall(false);
						}}
					>
						Answer
					</button>
					<button
						onclick={() => {
							const m = WebsocketMessage.create();
							m.type = MessageType.CallResponse;
							m.callResponse = {
								accepted: false,
							};
							ws()?.send(WebsocketMessage.encode(m).finish());
							setIncomingCall(false);
						}}
					>
						Reject
					</button>
				</Show>

				<section>
					<ol style={{ color: 'white' }}>
						<For each={messages()}>
							{(e) => {
								console.log(e);
								return (
									<li>
										{e.authorName}: {e.message}
									</li>
								);
							}}
						</For>
					</ol>
					<textarea cols="30" rows="2" placeholder="Message" id="Message"></textarea>
					<button
						onclick={() => {
							const m = WebsocketMessage.create();
							m.type = MessageType.Message;
							m.message = {
								authorName: name(),
								message: (document.getElementById('Message') as HTMLTextAreaElement).value,
							};
							ws()?.send(WebsocketMessage.encode(m).finish());
						}}
					>
						Send
					</button>
				</section>
			</article>
		</div>
	);
};
