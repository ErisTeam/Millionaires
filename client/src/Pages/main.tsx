import 'solid-devtools';
import style from './main.module.css';
import { IconDiamondFilled, IconDiamondsFilled } from '@tabler/icons-solidjs';

export default function App() {
	return (
		<div class={style.container}>
			<div class={style.questionInfo}>
				<div class={style.kola}>
					<h5>koło 1</h5>
					<h5>koło 2</h5>
					<h5>koło 3</h5>
				</div>
			</div>

			<div class={style.game}>
				<div class={style.ai}></div>
				<div class={style.question}>
					<h3 class={style.hexagon}>Czy Gami to Furras?</h3>
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
					<li>1 X</li>
					<li>2 X</li>
					<li>3 X</li>
					<li>4 X</li>
					<li>5 X</li>
					<li>6 X</li>
					<li>7 X</li>
					<li>8 X</li>
					<li>9 X</li>
					<li>10 X</li>
					<li>11 X</li>
					<li>12 X</li>
				</ol>
			</div>
		</div>
	);
}
