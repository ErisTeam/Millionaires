import 'solid-devtools';
import style from './main.module.css';
import { IconDiamondFilled, IconDiamondsFilled, IconUsersGroup, IconRobot, IconPhoneCall } from '@tabler/icons-solidjs';

export default function App() {
	return (
		<div class={style.container}>
			<div class={style.game}>
				<div class={style.ai}>
					<div class={style.questionImg}></div>
					<div class={style.host}></div>
				</div>
				<div class={style.question}>
					<h3 class={style.hexagon}>
						Bardzo długie pytanie retoryczne na temat, którym jest furrasowość Gamiego. Czy Gami to Furras?
					</h3>
					<ol class={style.buttons}>
						<li>
							<button class={style.hexagon}>
								<span />
								odpowiedź 1
							</button>
							<button class={style.hexagon}>
								<IconDiamondsFilled />
								odpowiedź 2
							</button>
						</li>
						<li>
							<button class={style.hexagon}>
								<IconDiamondsFilled /> odpowiedź 3
							</button>
							<button class={style.hexagon}>
								<IconDiamondsFilled />
								odpowiedź 4
							</button>
						</li>
					</ol>
				</div>
			</div>
			<div class={style.ladder}>
				<ol>
					<li>
						<IconDiamondFilled /> 1 X
					</li>
					<li>
						<IconDiamondFilled /> 2 X
					</li>
					<li>
						<IconDiamondFilled /> 3 X
					</li>
					<li>
						<IconDiamondFilled /> 4 X
					</li>
					<li>
						<IconDiamondFilled /> 5 X
					</li>
					<li>
						<IconDiamondFilled /> 6 X
					</li>
					<li>
						<IconDiamondFilled /> 7 X
					</li>
					<li>
						<IconDiamondFilled /> 8 X
					</li>
					<li>
						<IconDiamondFilled /> 9 X
					</li>
					<li>
						<IconDiamondFilled /> 10 X
					</li>
					<li>
						<IconDiamondFilled /> 11 X
					</li>
					<li>
						<IconDiamondFilled /> 12 X
					</li>
				</ol>
				<div class={style.gameInfo}>
					<IconPhoneCall />
					<IconRobot />
					<IconUsersGroup />
				</div>
			</div>
		</div>
	);
}
