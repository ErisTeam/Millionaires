import { useAppState } from '@/AppState';
import { useNavigate } from '@solidjs/router';
import { JSX } from 'solid-js';

export default (props: { children: JSX.Element | JSX.Element[] }) => {
	const navigate = useNavigate();
	const AppState = useAppState();
	if (AppState.runID() === null) {
		navigate('/');
		return null;
	}
	return <>{props.children}</>;
};
