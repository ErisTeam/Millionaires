import { produce } from 'solid-js/store';
import { useAppState } from './AppState';
import { WebsocketMessage, MessageType, MessagePayload } from './protobufMessages/WebSocketMessages';
import { getOwner, onCleanup } from 'solid-js';

let ws: WebSocket;

type Listener<D> = (event: D) => void;

const tryOnCleanup: typeof onCleanup = (fn) => (getOwner() ? onCleanup(fn) : fn);

export function createEvent<Args>() {
	const listeners: Listener<Args>[] = [];

	const subscribe = (listener: (event: Args) => void) => {
		listeners.push(listener);
		return tryOnCleanup(() => {
			unsubscribe(listener);
		});
	};
	const unsubscribe = (listener: Listener<Args>) => {
		const index = listeners.indexOf(listener);
		if (index !== -1) {
			listeners.splice(index, 1);
		}
	};

	return {
		subscribe,
		unsubscribe,
		emit: (event: Args) => {
			listeners.forEach((listener) => listener(event));
		},
	};
}

export async function connect(indentify?: boolean) {
	const appState = useAppState();
	ws = new WebSocket('ws://localhost:9090/ws');
	let heartbeatInterval = -1;

	appState.websocket.setWs(ws);

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
				if (indentify) {
					identify();
				}
				break;
			case MessageType.Identify:
				console.log('Identifyed successfully!');
				break;
			case MessageType.IncomingCall:
				console.log(`incoming call from ${decodedMessage.incomingCall?.callerName}`);
				appState.websocket.setCurrentCall({
					callerName: decodedMessage.incomingCall?.callerName || '',
					messages: [],
					acceped: false,
				});
				appState.websocket.onIncomingCall.emit();
				break;
			case MessageType.EndCall:
				appState.websocket.onEndCall.emit();
				break;
			case MessageType.Message:
				let message = decodedMessage.message;
				console.log(message);
				if (!message) {
					break;
				}
				appState.websocket.setCurrentCall(
					produce((prev) => {
						prev.messages.push(message as MessagePayload);
					}),
				);
				// setMessages((prev) => {
				// 	return [...prev, message as MessagePayload];
				// });
				// console.log(messages());
				break;
			case MessageType.CallResponse:
				let callResponse = decodedMessage.callResponse;
				console.log(callResponse);

				if (callResponse?.accepted) {
					// setInCall(true);
					appState.websocket.setCurrentCall(produce((prev) => (prev.acceped = true)));

					appState.websocket.onCallResponse.emit(true);
					appState.websocket.setCurrentCall(produce((prev)=>{
						prev.acceped = true;
					}))
				} else {
					// setInCall(false);
					appState.websocket.onCallResponse.emit(false);
					
				}
				break;
		}
	};

	ws.onopen = () => {
		console.log('connected');
	};

	ws.onerror = (event) => {
		console.log('error', event);
	};

	ws.onclose = (event) => {
		console.log('closed', event);
		if (heartbeatInterval !== -1) {
			clearInterval(heartbeatInterval);
		}
		appState.websocket.setWs(undefined);
		connect();
	};
}

export function identify() {
	const appState = useAppState();
	const m = WebsocketMessage.create();
	m.type = MessageType.Identify;
	m.identify = {
		runSnowflakeId: appState.runID() as string,
	};
	ws.send(WebsocketMessage.encode(m).finish());
}

export function sendMessage(message: string) {
	const m = WebsocketMessage.create();
	m.type = MessageType.Message;
	m.message = {
		message,
		authorName: '??',
	};
	ws.send(WebsocketMessage.encode(m).finish());
}
export function acceptCall() {
	const appState = useAppState();

	if (!ws) {
		throw 'ws is undefined';
	}
	if (!appState.websocket.currentCall.callerName) {
		throw 'not in call';
	}
	const m = WebsocketMessage.create();
	m.type = MessageType.CallResponse;
	m.callResponse = {
		accepted: true,
	};
	ws.send(WebsocketMessage.encode(m).finish());

	appState.websocket.onCall.
}
