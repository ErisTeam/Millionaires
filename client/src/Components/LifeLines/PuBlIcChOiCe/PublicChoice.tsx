import { IconUsersGroup } from '@tabler/icons-solidjs';
import style from './PublicChoice.module.css';
import line from '../LifeLine.module.css';
import ExampleAnswers from '@/TestData/Answer';
import { Answer } from '@/protobufMessages/Answers';
import { For, Index, createSignal } from 'solid-js';

function weightedRandom(weights: number[]) {
	let cumulativeWeights: number[] = [];
	for (let i = 0; i < weights.length; i++) {
		cumulativeWeights.push(weights[i] + (cumulativeWeights[i - 1] || 0));
	}
	const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
	for (let i = 0; i < weights.length; i++) {
		if (cumulativeWeights[i] >= random) {
			return i;
		}
	}
	return -1;
}

export default () => {
	const [percentages, setPercentages] = createSignal<{ percentage: number; answer: Answer; winner?: boolean }[]>([
		{
			percentage: 71,
			answer: ExampleAnswers.fullAnswer1,
		},
		{
			percentage: 84,
			answer: ExampleAnswers.fullAnswer2,
			winner: true,
		},
		{
			percentage: 70,
			answer: ExampleAnswers.fullAnswer2,
		},
		{
			percentage: 33,
			answer: ExampleAnswers.fullAnswer2,
		},
	]);

	return (
		<section class={style.publicChoice + ' ' + line.lifeLine}>
			<ol>
				<Index each={percentages()}>
					{(v, index) => (
						<li
							class={style.c}
							classList={{ [style.winner]: v().winner }}
							style={{ '--percentage': `${v().percentage}%` }}
						>
							<span class={style.p}>
								<span class={style.title}>{v().percentage}%</span>
							</span>
							<span class={style.title}>{String.fromCharCode('A'.charCodeAt(0) + index)}</span>
						</li>
					)}
				</Index>
			</ol>
			{/* <button
				onclick={() => {
					const votes = new Array(percentages().length).fill(0);
					votes[Math.floor(Math.random() * votes.length)] = Math.floor(Math.random() * 100);
					let i = 0;
					const weights = [[1, 0.5, 1, 0.5]];
					const a = () => {
						// weights.push(new Array(4).fill(0).map(() => Math.random() * 10));
						// for (let i = 0; i < 5000; i++) {
						console.log(weightedRandom([1, 9]));
						const vote = weightedRandom(
							weights[
								Math.floor(weightedRandom([1, ...new Array(weights.length - 1).fill(0).map((_) => Math.random() * 10)]))
							],
						);
						votes[vote] += Math.floor(Math.random() * Math.random() * 1000);
						// }
						if (i++ > 100) clearInterval(id);

						const votesSum = votes.reduce((a, b) => a + b, 0);
						const calculatedPercentages = votes.map((v) => Math.round((v / (votesSum || 1)) * 100));
						console.log(votes, votesSum, calculatedPercentages);
						setPercentages((prev) =>
							prev.map((v, i) => ({ ...v, percentage: Math.min(calculatedPercentages[i], 100) })),
						);
					};
					let id = setInterval(a, 100);
				}}
			>
				Randomize Percentages
			</button> */}
			<IconUsersGroup />
		</section>
	);
};
