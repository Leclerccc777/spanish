/* global window */
(() => {
  'use strict';
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // label / attrs 由调用方组成；动态正文先用 escape，图标可保留可信 HTML。
  const button = (label, action, attrs = '', className = '') => `<button class="btn ${className}" data-action="${action}" ${attrs}>${label}</button>`;

  function controls({ question, session, prefix, limit, label = '西语答案', submitLabel = '检查答案', note = '', accents = 'áéíóúüñ' }) {
    const feedback = session.feedback;
    const disabled = feedback ? 'disabled' : '';
    if (question.options) {
      const answers = question.answers || [question.answer];
      return question.options.map(option => {
        const status = feedback && answers.includes(option) ? 'correct' : feedback && option === session.input ? 'wrong' : '';
        return `<button class="choice ${status}" data-action="${prefix}-answer" data-answer="${escape(option)}" ${disabled}>${escape(option)}</button>`;
      }).join('');
    }
    return `<label for="${prefix}-answer">${escape(label)}</label>
      <input id="${prefix}-answer" class="search-input spelling-input" value="${escape(session.input)}" maxlength="${limit}" autocomplete="off" autocapitalize="off" spellcheck="false" ${disabled}/>
      <div class="accent-buttons">${Array.from(accents, c => `<button data-action="${prefix}-accent" data-char="${c}" aria-label="添加 ${c}" ${disabled}>${c}</button>`).join('')}</div>
      ${note ? `<p class="tiny">${escape(note)}</p>` : ''}
      ${feedback ? '' : button(escape(submitLabel), `${prefix}-submit`)}`;
  }

  function hint(question, session, prefix) {
    if (!question.hint || session.feedback) return '';
    return `${button(session.showHint ? '收起思路提示' : '需要一点提示', `${prefix}-hint`, `aria-expanded="${!!session.showHint}"`, 'secondary small')}
      ${session.showHint ? `<div class="notice" role="note">${escape(question.hint)}</div>` : ''}`;
  }

  function feedback(result, { action, label, wrongLabel = '再看一下，这句话可以这样说', correctLabel = '✓ 答对了' }) {
    if (!result) return '';
    return `<div class="feedback" role="status"><strong>${escape(result.correct ? correctLabel : wrongLabel)}</strong>
      <p lang="es">参考答案：${escape(result.answer)}</p>${result.attention ? `<p>${escape(result.attention)}</p>` : ''}<p>${escape(result.explanation)}</p></div>
      ${button(escape(label), action)}`;
  }

  window.HolaExerciseUI = { escape, button, controls, hint, feedback };
})();
