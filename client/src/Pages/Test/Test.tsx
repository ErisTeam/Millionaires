import { createAutoAnimate } from '@formkit/auto-animate/solid';
import Leaderboard from 'Components/Leaderboard/Leaderboard';
const Test = function () {
	const [parent, setEnabled] = createAutoAnimate(/* optional config */);

	return (
		<div>
			<Leaderboard />
		</div>
	);
};

export default Test;
