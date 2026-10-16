const rows = {
 fs1:['hotel 开头的 h 通常怎样处理？',['发英语 h 音','不发音，从元音开始','发 j 的音'],1,'hotel 的 h 不发音。'],
 fs2:['niño 中 ñ 表示什么音？',['普通 n /n/','/ɲ/','英语 ng /ŋ/'],1,'ñ 是表示 /ɲ/ 的独立字母，不能写成 n。'],
 fs3:['模仿 beber 与 vivir 时，对 b / v 的理解正确的是：',['都不能发音','必须读两个完全不同的英语音','通常属于同一个音位，具体读法随位置变化'],2,'西语 b 与 v 通常表示同一音位，不套用英语 v。'],
 fs4:['练习 mesa 中的元音，先怎样做？',['把 e、a 都读成英语字母名','保持 /e/、/a/ 清楚，再模仿整词','只读辅音 m、s'],1,'西语基础元音保持清楚，再放入整词练习。'],
 ft1:['mesa 的重音位置是？',['me-SA','ME-sa','m-E-sa'],1,'mesa 以元音结尾，没有书写重音，通常重读倒数第二节。'],
 ft2:['papel 的重音位置是？',['PA-pel','pa-PEL','p-A-pel'],1,'papel 以常见辅音 l 结尾，通常重读末音节。'],
 ft3:['在 teléfono 中，é 提示哪一节突出？',['no','te','lé'],2,'书写重音明确标在 lé。'],
 ft4:['关于 mesa 与 café，哪种说法正确？',['只有 café 有口头重音','两个词都有口头重音，但只有 café 写重音符号','两个词都必须写重音符号'],1,'口头重音并不都需要书写符号。'],
 fg1:['mesa 应怎样连冠词记？',['el mesa','la mesa','lo mesa'],1,'mesa 是阴性名词，记作 la mesa。'],
 fg2:['哪组正确处理常见性别例外？',['la problema / el mano','el problema / la mano','la problema / la mano'],1,'problema 是阳性，mano 是阴性，不能只看末尾 a。'],
 fg3:['为什么 el agua 可以接 fría？',['agua 是阴性，el 是这里的特殊冠词形式','fría 可以随便修饰任何词','agua 是阳性，fría 也是阳性'],0,'el 不改变 agua 的语法性别，形容词仍用阴性。'],
 fg4:['初学 ciudad，哪个记录方式更有帮助？',['只记 city，不记西语词形','看到 d 就随便选冠词','记 la ciudad，并放进一句短句'],2,'连冠词与例句记名词，能更可靠地掌握配合。'],
 fa1:['把 la mesa pequeña 变为复数：',['las mesas pequeña','las mesas pequeñas','los mesas pequeños'],1,'冠词、名词和形容词都配合阴性复数。'],
 fa2:['选择正确的阳性复数：',['los teléfonos pequeños','las teléfonos pequeñas','los teléfono pequeño'],0,'teléfonos 为阳性复数，配 los 和 pequeños。'],
 fa3:['luz 的常见复数是？',['luzes','luzs','luces'],2,'词尾 z 在加 -es 时变为 c：luces。'],
 fa4:['描述多个大书本，哪项正确？',['unos libros grandos','unos libros grande','unos libros grandes'],2,'grande 不按性别变为 grando，但复数要加 -s。']
};
module.exports=Object.fromEntries(Object.entries(rows).map(([id,[prompt,options,answer,explanation]])=>[id,{prompt,options,answer,explanation}]));
