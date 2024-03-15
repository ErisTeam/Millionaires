import { useAppState } from './AppState';
import { WebsocketMessage, MessageType } from './protobufMessages/WebSocketMessages';

let ws: WebSocket;

export function connect() {
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
				break;
			case MessageType.Identify:
				console.log('Identifyed successfully!');
				break;
			case MessageType.IncomingCall:
				appState.websocket.setIncomingCall({ callerName: decodedMessage.incomingCall?.callerName || '' });
				break;
			case MessageType.EndCall:
				appState.websocket.setIncomingCall(undefined);
				break;
			case MessageType.Message:
				let message = decodedMessage.message;
				console.log(message);
				if (!message) {
					break;
				}
				// setMessages((prev) => {
				// 	return [...prev, message as MessagePayload];
				// });
				// console.log(messages());
				break;
			case MessageType.CallResponse:
				let callResponse = decodedMessage.callResponse;

				if (callResponse?.accepted) {
					// setInCall(true);
				} else {
					// setInCall(false);
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
