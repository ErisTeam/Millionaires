import style from './FriendCall.module.css';
import line from '../LifeLine.module.css';
import { IconPhoneOff } from '@tabler/icons-solidjs';
import Hexagon from '@/Components/Hexagon/Hexagon';
import { For, Show, createSignal, onCleanup } from 'solid-js';
import { useAppState } from '@/AppState';

export default () => {
	const appState = useAppState();
	const [showTimeLeft, setShowTimeLeft] = createSignal(false);
	const [timeLeft, setTimeLeft] = createSignal(45);
	let a = () => {
		setShowTimeLeft(true);
		if (timeLeft() <= 5) {
			clearInterval(showInterval);
			return;
		}

		console.log('showTimeLeft', showTimeLeft());
		setTimeout(() => {
			setShowTimeLeft(false);
		}, 1000);

		showInterval = setTimeout(a, timeLeft() / 2);
	};
	let showInterval: number | undefined = undefined;

	let interval: number | undefined = undefined;

	appState.websocket.onCallResponse.subscribe((event) => {
		if (event) {
			showInterval = setTimeout(a, 5000);
			interval = setInterval(() => {
				setTimeLeft(timeLeft() - 1);
				if (timeLeft() <= 0) {
					clearInterval(interval);
				}
			}, 1000);
		}
	});

	onCleanup(() => {
		if (interval) clearInterval(interval);
		if (interval) clearInterval(showInterval);
	});

	function format(seconds: number) {
		let minutes = Math.floor(seconds / 60);
		let sec = seconds % 60;
		return `${minutes < 10 ? '0' + minutes : minutes}:${sec < 10 ? '0' + sec : sec}`;
	}

	return (
		<section class={style.container + ' ' + line.lifeLine}>
			<div
				class={style.friendCall}
				classList={{
					[style.disabled]: !appState.websocket.currentCall.acceped,
				}}
			>
				<ol class={style.messageContainer}>
					<Show when={!appState.websocket.currentCall.acceped}>
						<li class={style.loading + ' ' + style.message}>Łączenie</li>
					</Show>

					<For each={appState.websocket.currentCall.messages}>
						{(message) => {
							return (
								<li class={style.message}>
									<p>
										<span>{message.authorName}: </span>
										{message.message}
									</p>
								</li>
							);
						}}
					</For>
				</ol>
				<div class={style.messageInput}>
					<input
						disabled={!appState.websocket.currentCall.acceped}
						onkeydown={(e) => {
							console.log(e.key);
							if (e.key == 'Enter') {
								appState.websocket.sendMessage(e.currentTarget.value);
								e.currentTarget.value = '';
							}
						}}
						type="text"
						placeholder="twoja wiadomosc"
					/>
					<Hexagon />
				</div>
			</div>
			<button
				class={line.icon + ' ' + style.icon}
				onclick={() => {
					console.log('end Call');
					appState.websocket.endCall();
				}}
				onmouseenter={() => {}}
				onmouseleave={() => {}}
			>
				<Show when={showTimeLeft()} fallback={<IconPhoneOff />}>
					{format(timeLeft())}
				</Show>
			</button>
		</section>
	);
};
