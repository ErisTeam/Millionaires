import { Answer } from '@/protobufMessages/Answers';

const ExampleAnswers: { [key: string]: Answer } = {
	fullAnswer1: {
		id: 1,
		answer: 'Tak gami to furras',
		questionId: 0,
		isCorrect: true,
		chosen: 999999,
		difficulty: 0,
	},
	fullAnswer2: {
		id: 2,
		answer: 'nie, gami nie jest furrasem ale mam dowody',
		questionId: 0,
		isCorrect: false,
		chosen: 1,
		difficulty: 0,
	},
	partialAnswer1: {
		id: 3,
		answer: 'Tak gami to furras',
	},
	partialAnswer2: {
		id: 4,
		answer: 'nie, gami nie jest furrasem ale mam dowody',
	},
};
export default ExampleAnswers;
