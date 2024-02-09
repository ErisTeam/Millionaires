import style from './Podium.module.css';
import { IconFiretruck, IconFirstAidKit, IconForklift } from '@tabler/icons-solidjs';
export default function Podium() {
	return (
		<>
			<div class={style.podium}>
				<div class={style.second}>
					<h2>2nd</h2>
					<div class={style.user}>
						<p>Second</p>
						<IconFiretruck />
					</div>
				</div>
				<div class={style.first}>
					<h2>1st</h2>
					<div class={style.user}>
						<p>First</p>
						<IconFirstAidKit />
					</div>
				</div>
				<div class={style.third}>
					<h2>3rd</h2>
					<div class={style.user}>
						<p>Third</p>
						<IconForklift />
					</div>
				</div>
			</div>
		</>
	);
}
