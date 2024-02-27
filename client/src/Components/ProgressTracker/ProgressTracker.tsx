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

type QuestionInfo = {
	answered: boolean;
	value: number;
};

export default (props: { class?: string }) => {
	const [questionsStatus, setQuestionsStatus] = createSignal<QuestionInfo[]>(
		new Array(12).fill(0).map((_, index) => ({
			answered: index < 4,
			value: 2 ** (index + 9),
		})),
	);
	console.log(questionsStatus());
	return (
		<div class={style.ladder}>
			<div class={style.lifeLinesContainer}>
				<IconUsersGroup class={style.lifeLine} />
				<IconShieldHalfFilled
					class={style.lifeLine}
					classList={{
						[style.used]: true,
					}}
				/>
				<IconPhoneCall class={style.lifeLine} />
			</div>
			<ol>
				<For each={questionsStatus()}>
					{(v, index) => {
						const currentQuestion =
							(index() == 0 && !v.answered) || (questionsStatus()[index() - 1]?.answered && !v.answered);
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
};
