import { GET_RUNS_ENDPOINT } from '@/constants';
import { MillionairesError } from '@/protobufMessages/Error';
import { GetRunsResponse } from '@/protobufMessages/Run';
import { createSignal, createContext, useContext, JSX } from 'solid-js';

interface LeaderboardRecord {
    name: string;
    score: number;
}

const [users, setUsers] = createSignal<LeaderboardRecord[]>([
	{ name: 'furras', score: 3333 },
	{ name: 'marcin', score: 2222 },
	{ name: 'to', score: 2221 },
	{
		name: 'a',
		score: 1,
	},
]);

export async function getLeaderboardScores(): Promise<LeaderboardRecord[]> {
    let res = await fetch(GET_RUNS_ENDPOINT);
    let resArrayBuf = new Uint8Array(await res.arrayBuffer());
    let leaderboard: LeaderboardRecord[] = [];

    // Error
    if (res.status >= 400) {
        let response = MillionairesError.decode(resArrayBuf);
        console.error("Couldn't fetch the leaderboard: ", response);
        return leaderboard;
    }

    let resDecoded = GetRunsResponse.decode(resArrayBuf);
    console.log("Leaderboard: ", resDecoded);

    resDecoded.runs.forEach((run) => {
        leaderboard.push({ name: run.name, score: run.score })
    })

    leaderboard.sort((run1, run2) => {
        if (run1.score > run2.score) {
            return -1;
        } else if (run1.score > run2.score) {
            return 0;
        }
        return 1;
    });
    return leaderboard;
}

const ContextValue = {
	users,
	setUsers,
};
const LeaderboardState = createContext(ContextValue);

export function LeaderboardStateProvider(props: { children: JSX.Element[] | JSX.Element }) {
	return (
		<LeaderboardState.Provider
			value={
				{
					...ContextValue,
				} as any
			}
		>
			{props.children}
		</LeaderboardState.Provider>
	);
}

export function useLeaderboardState() {
	return useContext(LeaderboardState) as typeof ContextValue;
}
