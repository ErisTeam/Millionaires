/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';
import { Route, Router } from '@solidjs/router';

import './index.css';

import { AppStateProvider, useAppState } from './AppState';

import Main from './Pages/main';
const root = document.getElementById('root');
function App() {
	const AppState = useAppState();

	return (
		<AppStateProvider>
			<Router>
				<Route component={Main} />
			</Router>
		</AppStateProvider>
	);
}

render(() => <App />, root!);
