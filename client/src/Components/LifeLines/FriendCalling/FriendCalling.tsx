import style from './FriendCalling.module.css';
import line from '../LifeLine.module.css';
import HexagonButton from '@/Components/HexagonButton/HexagonButton';

interface FriendCallingProps {
	name?: string;
	onClick: (result: boolean) => void;
}
export default (props: FriendCallingProps) => {
	return (
		<article class={line.lifeLine + ' ' + style.FriendCalling}>
			<h2>{'Lorem, ipsum dolor.'} dzwoni</h2>
			<ol class={style.buttons}>
				<HexagonButton class={style.button}>Akceptuj</HexagonButton>
				<HexagonButton class={style.button}>Odrzuć</HexagonButton>
			</ol>
		</article>
	);
};
