/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';
import { Route, Router } from '@solidjs/router';

import './index.css';

import { AppStateProvider, useAppState } from './AppState';

import Home from './cOmPoNeNtS/Home';

const root = document.getElementById('root');
function App() {
	const AppState = useAppState();

	return (
		<AppStateProvider>
			<Router>
				<Route component={Home} />
			</Router>
		</AppStateProvider>
	);
}

render(() => <App />, root!);
