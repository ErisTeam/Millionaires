import {
	IconDiamonds,
	IconDiamondsFilled,
	IconPhoneCall,
	IconShieldHalfFilled,
	IconUsersGroup,
} from '@tabler/icons-solidjs';
import style from './ProgressTracker.module.css';
import { For, Show } from 'solid-js';
import Hexagon from '../Hexagon/Hexagon';
import { useAppState } from '@/AppState';
import { createAutoAnimate } from '@formkit/auto-animate/solid';
import { Lifeline, UseLifelineResponse } from '@/protobufMessages/Lifelines';

type ProgressTrackerProps = {
	onLifeLineUse(lifeline: Lifeline, response: UseLifelineResponse): void;
	disabled?: boolean;
};

export default function ProgressTracker(props: ProgressTrackerProps) {
	const AppState = useAppState();

	console.log(AppState.questionsStatus());
	const [parent] = createAutoAnimate({
		duration: 250,
		easing: 'ease-in-out',
	});
	return (
		<div
			class={style.progressTracker}
			classList={{
				[style.disabled]: props.disabled,
			}}
		>
			<section class={style.lifeLinesContainer}>
				<button
					disabled={props.disabled}
					class={style.lifeLine}
					onclick={() => {
						AppState.useLifeLine(Lifeline.audience).then((res) => {
							if (!res) {
								alert('Error');
								return;
							}
							props.onLifeLineUse(Lifeline.audience, res);
						});
					}}
					classList={{ [style.used]: !AppState.lifeLines()?.publicChoice }}
				>
					<IconUsersGroup />
				</button>
				<button
					class={style.lifeLine}
					onclick={() => {
						AppState.useLifeLine(Lifeline.fiftyFifty).then((res) => {
							if (!res) {
								alert('Error');
								return;
							}
							props.onLifeLineUse(Lifeline.fiftyFifty, res);
						});
					}}
					classList={{ [style.used]: !AppState.lifeLines()?.fiftyFifty }}
				>
					<IconShieldHalfFilled />
				</button>
				<button
					disabled={props.disabled}
					class={style.lifeLine}
					onclick={() => {
						AppState.useLifeLine(Lifeline.friendCall).then((res) => {
							if (!res) {
								alert('Error');
								return;
							}
							props.onLifeLineUse(Lifeline.friendCall, res);
						});
					}}
					classList={{ [style.used]: !AppState.lifeLines()?.friendCall }}
				>
					<IconPhoneCall />
				</button>
			</section>
			<ol class={style.questionList} ref={parent}>
				<For each={AppState.questionsStatus()}>
					{(v, index) => (
						<Show
							when={
								(index() == 0 && !AppState.questionsStatus()[0].answered) ||
								(AppState.questionsStatus()[index() - 1]?.answered && !v.answered)
							}
							fallback={
								<li
									class={style.question}
									classList={{
										[style.answered]: v.answered,
									}}
								>
									<Hexagon class={style.hexagon} />
									{index() + 1}
									<IconDiamondsFilled class={style.diamond + ' ' + style.diamondFilled} />

									<span>{v.value}</span>
								</li>
							}
						>
							<li
								class={style.question}
								classList={{
									[style.answered]: v.answered,
									[style.currentQuestion]: true,
								}}
							>
								<Hexagon class={style.hexagon} />
								{index() + 1}

								<IconDiamonds class={style.diamond} />

								<span>{v.value}</span>
							</li>
						</Show>
					)}
				</For>
			</ol>
		</div>
	);
}
