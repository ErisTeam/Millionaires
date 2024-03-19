import { createSignal, createContext, useContext, JSX } from 'solid-js';

const [users, setUsers] = createSignal([
	{ name: 'furras', score: 3333 },
	{ name: 'marcin', score: 2222 },
	{ name: 'to', score: 2221 },
	{
		name: 'a',
		score: 1,
	},
]);

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
