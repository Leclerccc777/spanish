const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data:{level:'A1'},
  bank(){wx.navigateTo({url:'/pages/bank/index'});},
  onShow(){this.refresh();},
  refresh(){
    const state=S.load();
    this.setData({levels:L.levelProgress(state),units:L.course.units.filter(u=>u.levelCode===this.data.level).map(u=>({...u,...L.unitProgress(state,u.id),locked:!L.isUnlocked(state,u.id),lessonId:L.course.lessons.find(l=>l.unitId===u.id).id,taskId:L.course.tasks.find(t=>t.unitId===u.id).id})),finalUnlocked:L.expressionUnlocked(state,'final')});
  },
  select(e){this.setData({level:e.currentTarget.dataset.level});this.refresh();},
  open(e){if(e.currentTarget.dataset.locked)return wx.showToast({title:'先学前面单元至少6词并通过语法',icon:'none'});wx.navigateTo({url:`/pages/lesson/index?id=${e.currentTarget.dataset.id}`});},
  expression(e){wx.navigateTo({url:`/pages/expression/index?id=${e.currentTarget.dataset.id}`});}
});
