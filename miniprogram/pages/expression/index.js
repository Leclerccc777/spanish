const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data:{text:'',result:null,showModel:false},
  onLoad(options={}) {
    const state=S.load();
    const id=options.id||L.course.tasks.find(t=>t.unitId===L.currentUnit(state).id).id;
    const task=L.course.tasks.find(t=>t.id===id);
    if(!task)return this.setData({unavailable:true});
    const entry=state.expressions[id];
    this.setData({unavailable:false,showModel:false,siblings:task.bank?L.course.tasks.filter(t=>t.packId===task.packId).map(t=>({id:t.id,number:t.groupNumber})):[],task,locked:!L.expressionUnlocked(state,id),text:entry?entry.text:'',result:entry&&entry.submittedText===entry.text?L.evaluateExpression(id,entry.text):null});
  },
  input(e){this.setData({text:e.detail.value,result:null,showModel:false});},
  accent(e){if(this.data.locked)return;this.setData({text:(this.data.text+e.currentTarget.dataset.char).slice(0,6000),result:null,showModel:false});},
  save(){this.persist(false);},
  submit(){this.persist(true);},
  persist(submit){
    if(!this.data.task||this.data.locked)return;
    if(submit&&!this.data.text.trim())return wx.showToast({title:'请先写下你的表达',icon:'none'});
    if(!L.expressionUnlocked(S.load(),this.data.task.id))return wx.showToast({title:'进度已改变，请重新打开任务',icon:'none'});
    const result=S.commit(state=>L.saveExpression(state,this.data.task.id,this.data.text,submit));
    if(!result)return;
    if(submit)this.setData({result,showModel:false});
    wx.showToast({title:submit?'已保存表达与反馈':'草稿已保存',icon:'none'});
  },
  model(){if(this.data.result)this.setData({showModel:!this.data.showModel});},
  group(e){this.onLoad({id:e.currentTarget.dataset.id});},
  back(){if(this.data.task&&this.data.task.bank)return wx.redirectTo({url:'/pages/bank/index'});wx.switchTab({url:'/pages/grammar/index'});}
});
