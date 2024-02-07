import { Question } from '@/protobufMessages/Questions';
import Hexagon from '../Hexagon/Hexagon';
import style from './Question.module.css';
type QuestionProps = {
	question: Question;
};
export default (props: QuestionProps) => {
	return (
		<h3 class={style.question}>
			<Hexagon class={style.hexagon} />
			<p>Bardzo długie pytanie retoryczne na temat, którym jest furrasowość Gamiego. Czy Gami to Furras?</p>
		</h3>
	);
};
