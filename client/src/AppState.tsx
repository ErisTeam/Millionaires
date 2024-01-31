import { JSXElement, createContext, createSignal, useContext } from 'solid-js';
import { Locale } from './Translation';

const [locale, setLocale] = createSignal<Locale>('pl_PL');


const localeJsFromat = () => {
	const locale = useAppState().locale();
	return locale.replace('_', '-');
};

const ContextValue = {

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
