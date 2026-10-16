const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
 ...require('../../lib/audio').audioPage(wx),
  data: { revealed: false, done: false },
  onLoad(options = {}) { this.packId=options.pack; this.restart(); },
  restart() { const state=S.load(); this.items = this.packId ? L.packQueue(state,this.packId) : L.queue(state); this.position = 0; this.retryIds = new Set(); this.day = L.dateKey(); this.setData({ done: false, unavailable:false, original: this.items.length }); this.showCard(); if(!this.items.length)this.setData({unavailable:true,summary:L.summary(state)}); },
  showCard() { this.stopAudio(); this.setData({ audioAvailable: !!require('../../lib/audio').manifest[this.items[this.position]?.spanish], word: this.items[this.position] || null, noun: L.nounLessons.find(n => this.items[this.position] && n.id === this.items[this.position].id) || null, position: this.position + 1, total: this.items.length, revealed: false, done: this.position >= this.items.length }); },
  reveal() { this.setData({ revealed: true }); },
  rate(e) {
    if (!this.data.revealed || this.data.done) return;
    if (this.day !== L.dateKey()) { wx.showToast({ title: '新的一天到了，已刷新学习计划', icon: 'none' }); return this.restart(); }
    const rating = e.currentTarget.dataset.rating; const word = this.data.word;
    if (!S.commit(state => L.review(state, word.id, rating, this.day))) return;
    if (rating === 'again' && !this.retryIds.has(word.id)) { this.items.push(word); this.retryIds.add(word.id); }
    this.position++; this.showCard();
    if (this.data.done) this.setData({ summary: L.summary(S.load()) });
  },
  grammar() { const unit = L.currentUnit(S.load()); wx.redirectTo({ url: `/pages/lesson/index?id=${L.course.lessons.find(l => l.unitId === unit.id).id}` }); },
  home() { wx.switchTab({ url: '/pages/today/index' }); }
});
