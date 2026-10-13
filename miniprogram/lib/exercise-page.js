const E = require('./exercise');

// 页面只提供内容、开放条件和保存动作；交互由这一个控制器维护。
module.exports = function exercisePage({ storage, platform, itemKey, maxLength, evaluate, grade, canPractice = () => true, afterSave }) {
  return {
    showExercise() {
      const s = this.exercise;
      this.setData({ phase: s.result ? 'result' : 'quiz', question: this[itemKey].questions[s.index], position: s.index + 1,
        input: s.input, feedback: s.feedback, result: s.result, showHint: s.showHint });
    },
    begin() {
      const item = this[itemKey];
      if (!item || !canPractice(item.id)) return;
      this.exercise = E.createExerciseSession(item.id, item.questions);
      this.showExercise();
    },
    input(e) {
      if (this.data.phase !== 'quiz' || this.data.feedback) return;
      this.exercise.input = e.detail.value;
      this.setData({ input: e.detail.value });
    },
    accent(e) {
      if (this.data.phase !== 'quiz' || this.data.feedback || this.data.input.length >= maxLength) return;
      this.exercise.input = this.data.input + e.currentTarget.dataset.char;
      this.setData({ input: this.exercise.input });
    },
    hint() {
      if (this.data.phase !== 'quiz' || this.data.feedback) return;
      this.exercise.showHint = !this.exercise.showHint;
      this.setData({ showHint: this.exercise.showHint });
    },
    choose(e) { this.answer(e.currentTarget.dataset.answer); },
    submit() { this.answer(this.data.input); },
    answer(answer) {
      if (this.data.phase !== 'quiz' || this.data.feedback || !canPractice(this[itemKey].id)) return;
      if (typeof answer !== 'string' || !answer.trim()) return platform.showToast({ title: '请先填写答案', icon: 'none' });
      if (E.answerExercise(this.exercise, answer, evaluate)) this.showExercise();
    },
    next() {
      if (this.data.phase !== 'quiz' || !this.data.feedback || !canPractice(this[itemKey].id)) return;
      if (!E.advanceExercise(this.exercise, (id, answers) => storage.commit(s => grade(s, id, answers)))) return;
      this.showExercise();
      if (this.exercise.result) {
        if (afterSave) afterSave.call(this);
        this.refresh();
      }
    }
  };
};
