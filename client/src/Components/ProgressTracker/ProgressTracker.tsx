import {
	IconDiamondFilled,
	IconDiamonds,
	IconDiamondsFilled,
	IconPhoneCall,
	IconRobot,
	IconShieldHalfFilled,
	IconUsersGroup,
} from '@tabler/icons-solidjs';
import style from './ProgressTracker.module.css';
import { For, createSignal } from 'solid-js';
import Hexagon from '../Hexagon/Hexagon';
import { useAppState } from '@/AppState';
//TODO: make this update on question change
export default function ProgressTracker() {
	const AppState = useAppState();

	console.log(AppState.questionsStatus());
	return (
		<div class={style.ladder}>
			<span class={style.lifeLinesContainer}>
				<IconUsersGroup class={style.lifeLine} />
				<button></button>
				<IconShieldHalfFilled
					class={style.lifeLine}
					classList={{
						[style.used]: true,
					}}
				/>
				<IconPhoneCall class={style.lifeLine} />
			</span>
			<ol>
				<For each={AppState.questionsStatus()}>
					{(v, index) => {
						const currentQuestion =
							(index() == 0 && !v.answered) || (AppState.questionsStatus()[index() - 1]?.answered && !v.answered);
						return (
							<li
								class={style.question}
								classList={{
									[style.answered]: v.answered,
									[style.currentQuestion]: currentQuestion,
								}}
							>
								<Hexagon class={style.hexagon} />
								{index() + 1}
								{currentQuestion ? (
									<IconDiamonds class={style.diamond} />
								) : (
									<IconDiamondsFilled class={style.diamond + ' ' + style.diamondFilled} />
								)}
								<span>{v.value}</span>
							</li>
						);
					}}
				</For>
			</ol>
		</div>
	);
}
