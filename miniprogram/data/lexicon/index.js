const rows = require('./entries');
const POS = {noun:'名词',verb:'动词',adj:'形容词',adv:'副词',pron:'代词',prep:'介词',conj:'连词',intj:'感叹词',det:'限定词',article:'冠词',num:'数词',particle:'语法小词'};
const QUOTAS = {A1:800,A2:1500,B1:2000,B2:2200};
const canonicalKey = value => value.split(' / ')[0].normalize('NFC').trim().toLowerCase().replace(/\s+/g,' ');
module.exports = curriculum => {
  const unique = new Map();
  curriculum.forEach(word=>{const key=canonicalKey(word.spanish);if(!unique.has(key))unique.set(key,word);word.canonicalId=unique.get(key).id;});
  const counters={A1:0,A2:0,B1:0,B2:0};
  const packs=[];
  const imported=rows.map(([id,spanish,meaning,pos,level,definition,pivot,frequency,line,forms,hintKind])=>{
    const index=counters[level]++,number=Math.floor(index/20)+1,packId=`lex-${level}-${String(number).padStart(3,'0')}`;
    const word={id,canonicalId:id,spanish,meaning,pos:POS[pos],level,unitId:null,bank:true,packId,example:'',translation:'',definition,pivot,frequency,surfaceForms:forms,note:'中文为辅助释义，需结合英文原义及具体语境核对；词频编排不等于官方 CEFR 定级。',dictionaryUrl:`https://dle.rae.es/${encodeURIComponent(spanish)}`,sourceUrl:`https://en.wiktionary.org/wiki/${encodeURIComponent(spanish)}#Spanish`,sourceIds:['wiktionary-mirror','ecdict','frequency-words'],verification:{status:'imported',scope:'来源文件与抽取规则已校验；西中词义待人工复核',reference:hintKind==='editorial'?'中文辅助释义为原创补充':'中文辅助释义由英语对应词中转',sourceLine:line},editorial:'开源词典派生数据；CC BY-SA 4.0'};
    unique.set(canonicalKey(spanish),word);
    let pack=packs.find(p=>p.id===packId);
    if(!pack){pack={id:packId,level,number,wordIds:[]};packs.push(pack);}
    pack.wordIds.push(id);
    return word;
  });
  return {imported,catalogue:[...unique.values()],packs,quotas:QUOTAS,canonicalKey};
};
