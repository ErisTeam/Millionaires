/* @refresh reload */
import 'solid-devtools';
import style from './main.module.css';

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
					<h3>Czy Gami to Furras?</h3>
					<div class={style.buttons}>
						<button>odpowiedź 1</button>
						<button>odpowiedź 2</button>
						<button>odpowiedź 3</button>
						<button>odpowiedź 4</button>
					</div>
				</div>
			</div>
			<div class={style.ladder}>
				<ul>
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
				</ul>
			</div>
		</div>
	);
}
