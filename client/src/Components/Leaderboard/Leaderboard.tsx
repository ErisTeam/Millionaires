import style from './Leaderboard.module.css';

export default function Leaderboard() {
	return (
		<div class={style.leaderBoard}>
			<h1>Leaderboard</h1>

			<div class={style.list}>
				<div class={style.user}>
					<img src="https://via.placeholder.com/150" alt="user" />
					<p>Username</p>
				</div>
				<div class={style.user}>
					<img src="https://via.placeholder.com/150" alt="user" />
					<p>Username</p>
				</div>
				<div class={style.user}>
					<img src="https://via.placeholder.com/150" alt="user" />
					<p>Username</p>
				</div>
			</div>
		</div>
	);
}
