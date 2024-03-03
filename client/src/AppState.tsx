import { JSXElement, createContext, createSignal, useContext } from 'solid-js';
import { Locale } from './Translation';
import { GetQuestionResponse } from './protobufMessages/Questions';

const [locale, setLocale] = createSignal<Locale>('pl_PL');
const [runID, setRunID] = createSignal<string | undefined>(undefined);
const [currentQuestion, setCurrentQuestion] = createSignal<GetQuestionResponse | undefined>(undefined);
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
};
const AppState = createContext(ContextValue);
export function AppStateProvider(props: { children: JSXElement[] | JSXElement }) {
	return <AppState.Provider value={ContextValue}>{props.children}</AppState.Provider>;
}
export function useAppState() {
	return useContext(AppState);
}
