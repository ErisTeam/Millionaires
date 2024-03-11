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
export default function ProgressTracker() {
	const AppState = useAppState();

	console.log(AppState.questionsStatus());
	return (
		<div class={style.progressTracker}>
			<section class={style.lifeLinesContainer}>
				<button class={style.lifeLine}>
					<IconUsersGroup />
				</button>
				<button class={style.lifeLine}>
					<IconShieldHalfFilled />
				</button>
				<button class={style.lifeLine}>
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
