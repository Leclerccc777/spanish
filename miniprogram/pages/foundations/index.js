const L=require('../../lib/learning');
const S=require('../../lib/storage');
Page({
 data:{phase:'menu',selected:null},
 onLoad(options={}){this.refresh();if(options.id)this.open({currentTarget:{dataset:{id:options.id}}});},
 onShow(){this.refresh();},
 refresh(){this.setData({lessons:L.foundationProgress(S.load())});},
 open(e){const lesson=L.foundations.find(f=>f.id===e.currentTarget.dataset.id);if(!lesson)return wx.showToast({title:'没有找到基础课',icon:'none'});this.lesson=lesson;this.setData({phase:'read',lesson,references:lesson.references.map(r=>({...r,...L.course.sources.find(s=>s.id===r.sourceId)})),result:null,selected:null});},
 begin(){if(!this.lesson)return;this.answers=[];this.index=0;this.setData({phase:'quiz',question:this.lesson.questions[0],position:1,selected:null,result:null});},
 choose(e){if(this.data.selected!==null)return;const selected=Number(e.currentTarget.dataset.index);if(!Number.isInteger(selected)||selected<0||selected>=this.data.question.options.length)return;this.answers[this.index]=selected;this.setData({selected,correct:selected===this.data.question.answer});},
 next(){if(this.data.selected===null)return;if(this.index+1===this.lesson.questions.length){const result=S.commit(s=>L.gradeFoundation(s,this.lesson.id,this.answers));if(result){this.setData({phase:'result',result});this.refresh();}return;}this.index++;this.setData({question:this.lesson.questions[this.index],position:this.index+1,selected:null});},
 menu(){this.setData({phase:'menu'});this.refresh();},
 copy(e){wx.setClipboardData({data:e.currentTarget.dataset.url});},
 study(){wx.navigateTo({url:'/pages/session/index'});},
 year(){wx.navigateTo({url:'/pages/year/index'});},
 home(){wx.switchTab({url:'/pages/today/index'});}
});
