let questions = ``;
let questionsArray = questions
  .split(/^#/gm)
  .filter((e) => e.length > 0)
  .map((v) => v.split("\n"));

let usedAnswersIds = [];
let usedQuestionIds = [];
let resultQuestion =
  "INSERT INTO questions (id, question, difficulty, impressions) VALUES ";
let resultAnswers =
  "INSERT INTO answers (id, question_id, answer, is_correct,chosen) VALUES ";

function generateId(used) {
  let id = Math.floor(Math.random() * 1000 + 16);
  while (used.includes(id)) {
    id = Math.floor(Math.random() * 1000 + 16);
  }
  used.push(id);
  return id;
}

for (let i = 0; i < questionsArray.length; i++) {
  let currentCategory = questionsArray[i];
  let difficulty = currentCategory.shift();
  currentCategory = currentCategory.filter((e) => e.length > 0);
  for (let j = 0; j < currentCategory.length; j += 5) {
    if (currentCategory.length < j + 4) {
      break;
    }
    let questionId = generateId(usedQuestionIds);
    resultQuestion += `(${questionId}, "${currentCategory[j].replace(
      /[\""]/g,
      '""'
    )}", ${difficulty}, 0),\n`;
    currentCategory.slice(j + 1, j + 5).forEach((curr, i) => {
      let answerId = generateId(usedAnswersIds);
      resultAnswers += `(${answerId}, ${questionId}, "${curr.replace(
        /[\""]/g,
        '""'
      )}", ${i === 0},0),\n`;
    });
  }
}
resultQuestion = resultQuestion.slice(0, -2);
resultAnswers = resultAnswers.slice(0, -2);
resultQuestion += ";";
resultAnswers += ";";

console.log(`${resultAnswers}\n${resultQuestion}`);
