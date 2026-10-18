const L = require('../../lib/learning');
const S = require('../../lib/storage');
const SIZE = 30;
Page({
  ...require('../../lib/audio').audioPage(wx),
  data:{level:'A1',query:'',page:0,packPage:0,expanded:''},
  onShow(){this.refresh();},
  refresh(){
    const state=S.load(),query=this.data.query.normalize('NFC').trim().toLowerCase();
    const all=L.course.lexicon.catalogue.filter(w=>(!this.data.level||w.level===this.data.level)&&`${w.spanish} ${w.meaning} ${w.definition||''}`.toLowerCase().includes(query));
    const pages=Math.max(1,Math.ceil(all.length/SIZE)),page=Math.min(this.data.page,pages-1);
    const packs=L.course.lexicon.packs.filter(p=>!this.data.level||p.level===this.data.level),packPages=Math.max(1,Math.ceil(packs.length/6)),packPage=Math.min(this.data.packPage,packPages-1);
    this.setData({levels:L.bankProgress(state),track:state.track,total:L.course.lexicon.catalogue.length,count:all.length,page,pages,words:all.slice(page*SIZE,(page+1)*SIZE).map(w=>({...w,locked:!L.isWordUnlocked(state,w.id),learned:!!state.reviews[w.id]})),packPage,packPages,packs:packs.slice(packPage*6,(packPage+1)*6).map(p=>({...p,total:p.wordIds.length,preview:p.wordIds.slice(0,4).map(id=>L.findWord(id).spanish).join(' · '),locked:!L.expressionUnlocked(state,p.id)}))});
  },
  select(e){this.stopAudio();this.setData({level:e.currentTarget.dataset.level,page:0,packPage:0,expanded:''});this.refresh();},
  search(e){this.stopAudio();this.setData({query:e.detail.value,page:0,expanded:''});this.refresh();},
  paginate(e){this.stopAudio();this.setData({page:Math.max(0,Math.min(this.data.pages-1,this.data.page+Number(e.currentTarget.dataset.step))),expanded:''});this.refresh();},
  paginatePacks(e){this.setData({packPage:Math.max(0,Math.min(this.data.packPages-1,this.data.packPage+Number(e.currentTarget.dataset.step)))});this.refresh();},
  expand(e){this.stopAudio();this.setData({expanded:this.data.expanded===e.currentTarget.dataset.id?'':e.currentTarget.dataset.id});},
  copy(e){wx.setClipboardData({data:e.currentTarget.dataset.url});},
  activate(){if(S.commit(s=>L.setTrack(s,'bank'))){this.refresh();wx.showToast({title:'每日词汇已切换到扩展词库',icon:'none'});}},
  course(){if(S.commit(s=>L.setTrack(s,'course'))){this.refresh();wx.showToast({title:'每日词汇已切换到课内词汇',icon:'none'});}},
  study(e){const id=e.currentTarget.dataset.id;if(e.currentTarget.dataset.locked)return wx.showToast({title:'先达成前一阶段词汇与课程目标',icon:'none'});wx.navigateTo({url:`/pages/session/index?pack=${id}`});},
  quiz(e){const id=e.currentTarget.dataset.id;if(e.currentTarget.dataset.locked)return wx.showToast({title:'先达成前一阶段词汇与课程目标',icon:'none'});wx.navigateTo({url:`/pages/wordquiz/index?pack=${id}`});},
  expression(e){wx.navigateTo({url:`/pages/expression/index?id=${e.currentTarget.dataset.id}`});},
  back(){wx.switchTab({url:'/pages/vocabulary/index'});}
});
