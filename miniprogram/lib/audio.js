// Native audio is packaged locally; no external URL or learner text is uploaded.
const manifest=require('../data/audio-manifest');
function audioPage(platform) {
 return {
  playAudio(e) {
   const text=String(e.currentTarget.dataset.text||'').split(' → ')[0],src=manifest[text],rate=Number(e.currentTarget.dataset.rate)||1;
   this.stopAudio();
   if(!src)return platform.showToast({title:'这段内容还没有内置音频',icon:'none'});
   const token=this.audioToken;
   const play=()=>{
    if(this.audioToken!==token)return;
    try{
     const player=this.audioPlayer=platform.createInnerAudioContext();
     player.src='/'+src;player.playbackRate=rate;
     player.onError(()=>{if(this.audioPlayer===player){this.stopAudio();platform.showToast({title:'音频未能播放，请重试',icon:'none'});}});
     player.onEnded(()=>{if(this.audioPlayer===player)this.stopAudio();});
     player.play();
    }catch{this.stopAudio();platform.showToast({title:'当前环境无法播放音频',icon:'none'});}
   };
   platform.loadSubpackage({name:src.split('/')[0],success:play,fail:()=>{if(this.audioToken===token)platform.showToast({title:'语音包加载失败，请重试',icon:'none'});}});
  },
  stopAudio(){this.audioToken=(this.audioToken||0)+1;if(this.audioPlayer){const player=this.audioPlayer;this.audioPlayer=null;player.destroy();}},
  onHide(){this.stopAudio();},onUnload(){this.stopAudio();}
 };
}
module.exports={manifest,audioPage};
