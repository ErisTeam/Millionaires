/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';
import { Route, Router } from '@solidjs/router';

import './index.css';

import { AppStateProvider, useAppState } from './AppState';

import Main from './Pages/main';
import ApiTest from './ApiTest';
const root = document.getElementById('root');
function App() {
	const AppState = useAppState();

	return (
		<AppStateProvider>
			<Router>
				<Route path="/" component={Main} />
				<Route path="/apiTest" component={ApiTest} />
			</Router>
		</AppStateProvider>
	);
}

render(() => <App />, root!);
