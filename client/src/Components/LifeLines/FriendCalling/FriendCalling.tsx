import style from './FriendCalling.module.css';
import line from '../LifeLine.module.css';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';
import { useAppState } from '@/AppState';

interface FriendCallingProps {
	name?: string;
	onClick: () => void;
}
export default (props: FriendCallingProps) => {
	const appState = useAppState();
	return (
		<article class={line.lifeLine + ' ' + style.FriendCalling}>
			<h2>{props.name} dzwoni</h2>
			<ol class={style.buttons}>
				<HexagonButton
					class={style.button}
					onClick={() => {
						appState.websocket.acceptCall();
						props.onClick();
					}}
				>
					Akceptuj
				</HexagonButton>
				<HexagonButton
					class={style.button}
					onClick={() => {
						appState.websocket.rejectCall();
						props.onClick();
					}}
				>
					Odrzuć
				</HexagonButton>
			</ol>
		</article>
	);
};
