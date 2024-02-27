import style from './Podium.module.css';
import { IconAward } from '@tabler/icons-solidjs';
export default function Podium() {
	return (
		<>
			<aside class={style.podium}>
				<div class={style.second}>
					<span>username</span>
					<p class={style.place}>
						<IconAward></IconAward>
						<span>II</span>
					</p>
				</div>
				<div class={style.first}>
					<span>username</span>
					<p class={style.place}>
						<IconAward></IconAward>
						<span>I</span>
					</p>
				</div>
				<div class={style.third}>
					<span>usernamedsdaasd</span>
					<p class={style.place}>
						<IconAward></IconAward>
						<span>III</span>
					</p>
				</div>
			</aside>
		</>
	);
}
