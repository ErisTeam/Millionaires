/* @refresh reload */
import { render } from 'solid-js/web';
import 'solid-devtools';
import { Route, Router } from '@solidjs/router';

import './index.css';

import { AppStateProvider } from './AppState';

import GamePage from './Pages/Game/Game';
import ApiTest from './Pages/Dev/ApiTest';
import HomePage from './Pages/Home/Home';
import Test from './Pages/Test/Test';
const root = document.getElementById('root');
function App() {
	return (
		<AppStateProvider>
			<Router>
				<Route path="/game" component={GamePage} />
				<Route path="/apiTest" component={ApiTest} />
				<Route path="/" component={HomePage} />
				<Route path="/test" component={Test} />
			</Router>
		</AppStateProvider>
	);
}

render(() => <App />, root!);
