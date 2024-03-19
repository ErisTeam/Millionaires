import { JSXElement, createContext, createSignal, useContext } from 'solid-js';
import { Locale } from './Translation';
import { GetQuestionResponse } from './protobufMessages/Questions';
import { connect, createEvent, sendMessage } from './websocket';
import { Lifeline } from './protobufMessages/Lifelines';
import { useLifeLineRequest } from './helpers';
import { MessagePayload, MessageType, WebsocketMessage } from './protobufMessages/WebSocketMessages';
import { createStore } from 'solid-js/store';

const [ws, setWs] = createSignal<WebSocket | undefined>(undefined);
const [currentCall, setCurrentCall] = createStore<{
	callerName: string;
	messages: MessagePayload[];
	acceped: boolean;
}>({ callerName: '', messages: [], acceped: false });

const [locale, setLocale] = createSignal<Locale>('pl_PL');
const [runID, setRunID] = createSignal<string | undefined>(undefined);
const [currentQuestion, setCurrentQuestion] = createSignal<GetQuestionResponse | undefined>(undefined);

const [lifeLines, setLifeLines] = createSignal<
	{ fiftyFifty: boolean; publicChoice: boolean; friendCall: boolean } | undefined
>(undefined);

const [username, setUsername] = createSignal<string | undefined>(undefined);
type QuestionInfo = {
	answered: boolean;
	value: number;
};
const [questionsStatus, setQuestionsStatus] = createSignal<QuestionInfo[]>(
	new Array(12).fill(0).map((_, index) => ({
		answered: false,
		value: 2 ** (index + 9),
	})),
);
const localeJsFromat = () => {
	const locale = useAppState().locale();
	return locale.replace('_', '-');
};

export type LifeLineType = '50/50' | 'PublicChoice' | 'FriendCall';
async function useLifeLine(lifeLine: Lifeline) {
	console.log(ContextValue, 'aaa');
	console.log(runID(), 'runID');
	if (runID() == undefined) {
		throw 'run id is not set';
	}
	const response = await useLifeLineRequest(runID() as string, lifeLine);
	setLifeLines((prev) => {
		console.log(prev, 'prev');
		let newState = { ...prev };
		switch (lifeLine) {
			case Lifeline.audience:
				newState.publicChoice = false;
				break;
			case Lifeline.fiftyFifty:
				newState.fiftyFifty = false;
				break;
			case Lifeline.friendCall:
				newState.friendCall = false;
				break;
		}
		return newState as typeof prev;
	});
	return response;
}

const ContextValue = {
	runID,
	setRunID,
	currentQuestion,
	setCurrentQuestion,
	username,
	setUsername,
	questionsStatus,
	setQuestionsStatus,
	locale,
	setLocale,
	localeJsFromat,
	setLifeLines,
	lifeLines,
	useLifeLine,
	websocket: {
		ws,
		setWs,
		currentCall,
		setCurrentCall,
		onIncomingCall: createEvent<void>(),
		onCall: createEvent<void>(),
		onEndCall: createEvent<void>(),
		onCallResponse: createEvent<boolean>(),

		//TODO: move to websocket.tsx
		acceptCall: () => {
			if (!ws()) {
				throw 'ws is undefined';
			}
			if (!currentCall.callerName) {
				throw 'not in call';
			}
			const m = WebsocketMessage.create();
			m.type = MessageType.CallResponse;
			m.callResponse = {
				accepted: true,
			};
			ws()?.send(WebsocketMessage.encode(m).finish());
		},
		//TODO: move to websocket.tsx
		rejectCall: () => {
			if (!ws()) {
				throw 'ws is undefined';
			}
			if (!currentCall.callerName) {
				throw 'not in call';
			}
			const m = WebsocketMessage.create();
			m.type = MessageType.CallResponse;
			m.callResponse = {
				accepted: false,
			};
			ws()?.send(WebsocketMessage.encode(m).finish());
		},
		sendMessage: sendMessage,
	},

	resetState: () => {
		if (ws()) {
			ws()?.close(200, 'no');
		}
		setRunID(undefined);
		setUsername(undefined);
	},
};
const AppState = createContext(ContextValue);
export function AppStateProvider(props: { children: JSXElement[] | JSXElement }) {
	return <AppState.Provider value={ContextValue}>{props.children}</AppState.Provider>;
}
export function useAppState() {
	return useContext(AppState);
}
