import { ANSWER_QUESTION_ENDPOINT, GET_QUESTIONS_ENDPOINT, START_RUN_ENDPOINT, GET_RUNS_ENDPOINT } from './constants';
import { AnswerQuestionRequest, AnswerQuestionResponse, GetQuestionResponse } from './protobufMessages/Questions';
import { StartRunRequest, StartRunResponse, GetRunsResponse, EndRunRequest } from './protobufMessages/Run';

export default () => {
	async function startRunTest() {
		let a = StartRunRequest.create();
		a.Name = 'test';
		let res = await (
			await fetch(START_RUN_ENDPOINT('Daniel'), {
				method: 'POST',
				body: StartRunRequest.encode(a).finish(),
			})
		).arrayBuffer();
		console.log(res);
		let b = StartRunResponse.decode(new Uint8Array(res));
		console.log(b);
	}
	async function endRunTest() {
		let a = EndRunRequest.create();
		a.SnowflakeId = '1';
		let res = await (
			await fetch(START_RUN_ENDPOINT('Daniel'), {
				method: 'POST',
				body: EndRunRequest.encode(a).finish(),
			})
		).arrayBuffer();
		console.log(res);
	}
	async function getRunsTest() {
		let res = await fetch(GET_RUNS_ENDPOINT);
		let resUint8 = new Uint8Array(await res.arrayBuffer());
		let resDecoded = GetRunsResponse.decode(resUint8);

		console.log(resDecoded);
	}
	async function getQuestionsTest() {
		let res = await fetch(GET_QUESTIONS_ENDPOINT('1'));
		let resUint8 = new Uint8Array(await res.arrayBuffer());
		let resDecoded = GetQuestionResponse.decode(resUint8);

		console.log(resDecoded);
	}
	async function answerQuestionFail() {
		let reqBody = AnswerQuestionRequest.create();
		reqBody.id = 1;
		let res = await fetch(ANSWER_QUESTION_ENDPOINT, {
			method: 'POST',
			body: AnswerQuestionRequest.encode(reqBody).finish(),
		});
		let resUint8 = new Uint8Array(await res.arrayBuffer());
		let resDecoded = AnswerQuestionResponse.decode(resUint8);

		console.log(resDecoded);
	}
	async function answerQuestionGood() {
		let reqBody = AnswerQuestionRequest.create();
		reqBody.id = 0;
		let res = await fetch(ANSWER_QUESTION_ENDPOINT, {
			method: 'POST',
			body: AnswerQuestionRequest.encode(reqBody).finish(),
		});
		let resUint8 = new Uint8Array(await res.arrayBuffer());
		let resDecoded = AnswerQuestionResponse.decode(resUint8);

		console.log(resDecoded);
	}
	return (
		<div>
			<h1>Api Test</h1>
			<button
				style={{ color: 'black' }}
				onClick={(e) => {
					e.preventDefault();
					startRunTest();
				}}
			>
				Test Start Run
			</button>
			<button
				style={{ color: 'black' }}
				onClick={(e) => {
					e.preventDefault();
					getRunsTest();
				}}
			>
				Test Get Runs
			</button>
			<button
				style={{ color: 'black' }}
				onClick={(e) => {
					e.preventDefault();
					getQuestionsTest();
				}}
			>
				Test Get Questions
			</button>
			<button
				style={{ color: 'black' }}
				onClick={(e) => {
					e.preventDefault();
					answerQuestionFail();
				}}
			>
				Test Answer Question Fail
			</button>
			<button
				style={{ color: 'black' }}
				onClick={(e) => {
					e.preventDefault();
					answerQuestionGood();
				}}
			>
				Test Answer Question Good
			</button>
		</div>
	);
};
