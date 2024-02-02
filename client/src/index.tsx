/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';
import { Route, Router } from '@solidjs/router';

import './index.css';

import { AppStateProvider, useAppState } from './AppState';

import Main from './Pages/main';
import ApiTest from './ApiTest';
import StartPage from './Pages/start';
const root = document.getElementById('root');
function App() {
	const AppState = useAppState();

	return (
		<AppStateProvider>
			<Router>
				<Route path="/" component={Main} />
				<Route path="/apiTest" component={ApiTest} />
				<Route path={'/start'} component={StartPage}></Route>
			</Router>
		</AppStateProvider>
	);
}

render(() => <App />, root!);
