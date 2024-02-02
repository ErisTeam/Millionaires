import { StartRunRequest, StartRunResponse } from './protobufMessages/Run';

export default () => {
	async function t() {
		let a = StartRunRequest.create();
		a.Name = 'test';
		let res = await (
			await fetch('http://localhost:9090/startRun', {
				method: 'POST',
				body: StartRunRequest.encode(a).finish(),
			})
		).arrayBuffer();
		console.log(res);
		let b = StartRunResponse.decode(new Uint8Array(res));
		console.log(b);
	}
	t();
	return (
		<div>
			<h1>Api Test</h1>
			<button>Test</button>
		</div>
	);
};
