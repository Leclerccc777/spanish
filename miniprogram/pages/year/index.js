const L=require('../../lib/learning');
const S=require('../../lib/storage');
Page({
 data:{selectedWeek:0},
 onShow(){this.refresh();},
 refresh(){const state=S.load(),summary=L.yearSummary(state,L.dateKey());const n=this.data.selectedWeek||summary.weekNumber,week=L.yearPlan.weeks[n-1],entry=state.journey.weekChecks[n]||{skills:[]};this.setData({summary,selectedWeek:n,week,stages:L.yearPlan.stages,rhythm:L.yearPlan.rhythm,guideDays:L.weekGuide(n),skills:L.yearPlan.skills.map(s=>({...s,checked:entry.skills.includes(s.id)})),canCheck:summary.started&&summary.day>0&&n<=summary.weekNumber,canStudy:L.isUnlocked(state,week.unitId),foundationPassed:summary.foundationPassed,finalDay:L.yearPlan.finalDay});},
 start(){if(S.commit(s=>L.startJourney(s,L.dateKey()))){this.refresh();wx.showToast({title:'从今天开始，慢慢学',icon:'none'});}},
 move(e){this.setData({selectedWeek:Math.max(1,Math.min(52,this.data.selectedWeek+Number(e.currentTarget.dataset.step)))});this.refresh();},
 current(){this.setData({selectedWeek:0});this.refresh();},
 check(e){if(!this.data.canCheck)return;const item=this.data.skills.find(s=>s.id===e.currentTarget.dataset.id);if(item&&S.commit(s=>L.setWeekSkill(s,this.data.selectedWeek,item.id,!item.checked,L.dateKey())))this.refresh();},
 foundation(){wx.navigateTo({url:'/pages/foundations/index'});},
 month(){wx.navigateTo({url:'/pages/firstmonth/index'});},
 guide(e){const t=e.currentTarget.dataset,kind=t.kind,id=t.id;if(kind==='session')return wx.navigateTo({url:'/pages/session/index'});if(kind==='review')return wx.navigateTo({url:'/pages/drillreview/index'});if(kind==='lesson'&&!L.isUnlocked(S.load(),L.course.lessons.find(l=>l.id===id).unitId))return wx.showToast({title:'先完成课程的词汇与语法前置',icon:'none'});const page={lesson:'lesson',drill:'drills',expression:'expression'}[kind];if(page)wx.navigateTo({url:`/pages/${page}/index?id=${id}`});},
 lesson(){if(!this.data.canStudy)return wx.showToast({title:'先按实际进度完成前面的单元',icon:'none'});wx.navigateTo({url:`/pages/lesson/index?id=${this.data.week.lessonId}`});},
 expression(){wx.navigateTo({url:`/pages/expression/index?id=${this.data.week.taskId}`});},
 library(){wx.switchTab({url:'/pages/library/index'});},
 home(){wx.switchTab({url:'/pages/today/index'});}
});
