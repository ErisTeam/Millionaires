import style from './Rules.module.css';
export default function Rules() {
	return (
		<ol class={style.rules}>
			<h1>Rules</h1>
			<li>Gra skłąda się z 12 pytań z proporcjonalnym poziomem trudności.</li>
			<li>Jedna błędna odpowiedź zakończy grę.</li>
			<li>Im szybciej odpowiesz na pytanie tym więcej punktów za nie dostaniesz.</li>
			<li>Jeżeli wyjdziesz z okna przeglądarki gra zostanie zatrzymana.</li>
			<li>Używanie telefonów jest zabronione.</li>
			<li>Podpisz się pełnym imieniem i nazwiskiem w celu wzięca udziału w konkurencji.</li>
		</ol>
	);
}
