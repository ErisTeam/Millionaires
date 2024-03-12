import style from './FriendCall.module.css';
import line from '../LifeLine.module.css';
import { IconPhoneCall } from '@tabler/icons-solidjs';

export default () => {
	return (
		<section class={style.friendCall + ' ' + line.lifeLine}>
			<div>
				<ol></ol>
				<input type="text" placeholder="twoja wiadomosc" />
			</div>
			<IconPhoneCall />
		</section>
	);
};
