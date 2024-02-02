export const API_URL = 'http://localhost:9090';
export const START_RUN_ENDPOINT = (name: string) => `${API_URL}/startRun?name=${name}`;
export const GET_RUNS_ENDPOINT = `${API_URL}/getRuns`;
export const END_RUN_ENDPOINT = `${API_URL}/endRun`;
export const GET_QUESTIONS_ENDPOINT = (difficulty: string) => `${API_URL}/question?difficulty=${difficulty}`;
export const ANSWER_QUESTION_ENDPOINT = `${API_URL}/answerQuestion`;
