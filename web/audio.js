(function(){
 let player=null,generation=0;
 function status(message){const node=document.getElementById('audio-status');if(node)node.textContent=message;const stop=document.querySelector('[data-action="audio-stop"]');if(stop)stop.hidden=!message;}
 function stop(){generation++;if(player){player.pause();player.removeAttribute('src');player.load();player=null;}if('speechSynthesis' in window)window.speechSynthesis.cancel();status('');}
 function play(text,rate=1){
  stop();const token=generation,src=(window.HolaAudioClips||{})[text];
  if(src){
   const audio=player=new Audio(src);audio.playbackRate=rate;audio.preservesPitch=true;
   audio.onended=()=>{if(token===generation)stop();};
   audio.onerror=()=>{if(token===generation){stop();status('音频未能播放，请再点一次试听。');}};
   status('正在播放内置西语合成音');
   audio.play().catch(()=>{if(token===generation){stop();status('播放未开始，请再点一次试听。');}});return;
  }
  if(!('speechSynthesis' in window)){status('此词尚未收录内置音频，设备也不支持朗读。');return;}
  // Voices may arrive after initial page load; retry once without changing saved records.
  const speak=()=>{
   if(token!==generation)return;
   const voice=window.speechSynthesis.getVoices().find(v=>/^es[-_]/i.test(v.lang));
   if(!voice){status('此词尚未收录内置音频，设备暂无西语音色。');return;}
   const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=rate*.85;
   utterance.onend=()=>{if(token===generation)status('');};utterance.onerror=()=>{if(token===generation)status('设备朗读失败，请重试。');};status('正在使用设备西语音色');window.speechSynthesis.speak(utterance);
  };
  if(window.speechSynthesis.getVoices().length)speak();else{status('正在检查设备西语音色…');setTimeout(speak,400);}
 }
 window.HolaAudio={play,stop};window.addEventListener('hashchange',stop);window.addEventListener('pagehide',stop);
 document.addEventListener('click',e=>{if(e.target.closest('[data-action="audio-stop"]'))stop();});
})();
