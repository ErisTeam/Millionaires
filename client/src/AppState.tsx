import { JSXElement, createContext, createSignal, useContext } from 'solid-js';
import { Locale } from './Translation';
import { GetQuestionResponse } from './protobufMessages/Questions';
import { connect } from './websocket';
import { Lifeline } from './protobufMessages/Lifelines';
import { useLifeLineRequest } from './helpers';

const [ws, setWs] = createSignal<WebSocket | undefined>(undefined);
const [incomingCall, setIncomingCall] = createSignal<
	| {
			callerName: string;
	  }
	| undefined
>(undefined);

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
		return;
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
		incomingCall,
		setIncomingCall,
		onCall: () => {},
	},

	resetState: () => {
		if (ws()) {
			ws()?.close(200, 'no');
		}
		setRunID(undefined);
	},
};
const AppState = createContext(ContextValue);
export function AppStateProvider(props: { children: JSXElement[] | JSXElement }) {
	return <AppState.Provider value={ContextValue}>{props.children}</AppState.Provider>;
}
export function useAppState() {
	return useContext(AppState);
}
