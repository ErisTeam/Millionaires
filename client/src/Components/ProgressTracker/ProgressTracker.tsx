import {
	IconDiamondFilled,
	IconDiamonds,
	IconDiamondsFilled,
	IconPhoneCall,
	IconRobot,
	IconUsersGroup,
} from '@tabler/icons-solidjs';
import style from './ProgressTracker.module.css';
import { For, createSignal } from 'solid-js';
import Hexagon from '../Hexagon/Hexagon';

export default () => {
	const [questionsStatus, setQuestionsStatus] = createSignal([1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	console.log(questionsStatus());
	return (
		<div class={style.ladder}>
			<div class={style.lifeLinesContainer}>
				<IconUsersGroup class={style.lifeLine} />
				<IconRobot
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
						const currentQuestion = (index() == 0 && v == 0) || (questionsStatus()[index() - 1] == 1 && v == 0);
						return (
							<li
								class={style.question}
								classList={{
									[style.answered]: v == 1,
									[style.currentQuestion]: currentQuestion,
								}}
							>
								<Hexagon class={style.hexagon} />
								{index() + 1}
								{currentQuestion ? <IconDiamonds /> : <IconDiamondsFilled class={style.diamond} />}

								{Math.floor(0.5 * (index() + 1) * 10000 * (index() + 1 * 0.2))}
							</li>
						);
					}}
				</For>
			</ol>
		</div>
	);
};
