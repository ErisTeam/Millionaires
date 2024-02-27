import style from './Podium.module.css';
import { IconFiretruck, IconFirstAidKit, IconForklift } from '@tabler/icons-solidjs';
export default function Podium() {
	return (
		<>
			<aside class={style.podium}>
				<div class={style.second}>
					<span>username</span>
					<p class={style.place}>
						<IconFiretruck />
					</p>
				</div>
				<div class={style.first}>
					<span>username</span>
					<p class={style.place}>
						<IconFirstAidKit />
					</p>
				</div>
				<div class={style.third}>
					<span>username</span>
					<p class={style.place}>
						<IconForklift />
					</p>
				</div>
			</aside>
		</>
	);
}
