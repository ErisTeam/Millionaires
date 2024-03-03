import { ANSWER_QUESTION_ENDPOINT, START_RUN_ENDPOINT } from './constants';
import { AnswerQuestionRequest, AnswerQuestionResponse } from './protobufMessages/Questions';
import { StartRunRequest, StartRunResponse } from './protobufMessages/Run';

export async function startRun(name: string): Promise<StartRunResponse> {
	let a = StartRunRequest.create();
	a.name = name;
	let res = await (
		await fetch(START_RUN_ENDPOINT, {
			method: 'POST',
			body: StartRunRequest.encode(a).finish(),
		})
	).arrayBuffer();

	let response = StartRunResponse.decode(new Uint8Array(res));
	console.log(response);
	return response;
}

export async function answerQuestion(runId: string, answerId: number) {
	let request = AnswerQuestionRequest.create();
	request.runId = runId;
	request.answerId = answerId;
	let res = await fetch(ANSWER_QUESTION_ENDPOINT, {
		method: 'POST',
		body: AnswerQuestionRequest.encode(request).finish(),
	});

	let resUint8 = new Uint8Array(await res.arrayBuffer());
	let resDecoded = AnswerQuestionResponse.decode(resUint8);

	return resDecoded;
}
