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

type ProgressTrackerProps = {
	onLifeLineUse(lifeline: '50/50' | 'PublicChoice' | 'FriendCall'): void;
};

export default function ProgressTracker(props: ProgressTrackerProps) {
	const AppState = useAppState();

	console.log(AppState.questionsStatus());
	return (
		<div class={style.progressTracker}>
			<section class={style.lifeLinesContainer}>
				<button
					class={style.lifeLine}
					onclick={() => AppState.useLifeLine('PublicChoice')}
					classList={{ [style.used]: !AppState.lifeLines()?.publicChoice }}
				>
					<IconUsersGroup />
				</button>
				<button
					class={style.lifeLine}
					onclick={() => props.onLifeLineUse('50/50')}
					classList={{ [style.used]: !AppState.lifeLines()?.fiftyFifty }}
				>
					<IconShieldHalfFilled />
				</button>
				<button
					class={style.lifeLine}
					onclick={() => props.onLifeLineUse('FriendCall')}
					classList={{ [style.used]: !AppState.lifeLines()?.friendCall }}
				>
					<IconPhoneCall />
				</button>
			</section>
			<ol class={style.questionList}>
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
