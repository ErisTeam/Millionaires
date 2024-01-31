/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';
import { Route, Router } from '@solidjs/router';

import './index.css';

import { AppStateProvider, useAppState } from './AppState';

import { onMount } from 'solid-js';
import { API_URL } from './constants';

const root = document.getElementById('root');
function App() {
	const AppState = useAppState();

	return (
		<AppStateProvider>
			<Router></Router>
		</AppStateProvider>
	);
}

render(() => <App />, root!);
