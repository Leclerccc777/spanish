const lessonVariants = require('../data/lesson-variants');
function validForm(form) { if (form !== 0 && form !== 1) throw new Error('未知练习题组，请重新开始'); return form; }
function practiceForm(attempts = 0) { return Number.isSafeInteger(attempts) && attempts > 0 ? attempts % 2 : 0; }
function parallelQuestions(questions, form = 0, variants = lessonVariants) {
  validForm(form);
  return questions.map(q => form ? { ...q, ...variants[q.id], form } : { ...q, form });
}
module.exports = { validForm, practiceForm, parallelQuestions };
