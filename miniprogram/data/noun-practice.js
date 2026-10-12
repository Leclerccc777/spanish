// 仅复用原有 80 词中已核对基础词义与词性的条目，不修改词元或审核状态。
// 词形、搭配和练习为人工编写，参考已有 PCIC / DPD 规则，待专业教师审稿。
const rows = [
  ['w21', 'libro', '书', '阳性', 'el libro', 'los libros', 'un libro pequeño', '一本小书', 'pequeños', 'Los libros son ___.', 'Los libros son pequeños.', '这些书很小。', '元音结尾加 -s；libros 为阳性复数，pequeño 变成 pequeños。'],
  ['w22', 'mesa', '桌子', '阴性', 'la mesa', 'las mesas', 'una mesa pequeña', '一张小桌子', 'pequeñas', 'Las mesas son ___.', 'Las mesas son pequeñas.', '这些桌子很小。', 'mesa 为阴性；复数 mesas 搭配 pequeñas。'],
  ['w23', 'casa', '房屋；家', '阴性', 'la casa', 'las casas', 'una casa pequeña', '一座小房子', 'pequeñas', 'Las casas son ___.', 'Las casas son pequeñas.', '这些房子很小。', 'casa 为阴性；冠词 las、名词 casas、形容词 pequeñas 都是复数。'],
  ['w24', 'agua', '水', '阴性', 'el agua', 'las aguas', 'el agua fría', '冷水', 'fría', 'El agua está ___.', 'El agua está fría.', '水是冷的。', 'agua 仍是阴性，形容词用 fría；紧接重读 /a/ 开头的单数名词时用 el。'],
  ['w25', 'café', '咖啡；一杯咖啡', '阳性', 'el café', 'los cafés', 'un café pequeño', '一小杯咖啡', 'pequeños', 'Los cafés son ___.', 'Los cafés son pequeños.', '这几杯咖啡都是小杯的。', '这里 café 指一杯咖啡；复数 cafés 保留重音，形容词用 pequeños。'],
  ['w26', 'teléfono', '电话', '阳性', 'el teléfono', 'los teléfonos', 'un teléfono pequeño', '一部小电话', 'pequeños', 'Los teléfonos son ___.', 'Los teléfonos son pequeños.', '这些电话很小。', 'teléfono 的重音保留；阳性复数 teléfonos 搭配 pequeños。'],
  ['w18', 'país', '国家', '阳性', 'el país', 'los países', 'un país pequeño', '一个小国', 'pequeños', 'Los países son ___.', 'Los países son pequeños.', '这些国家很小。', 'país 加 -es 成为 países，保留 í；阳性复数搭配 pequeños。'],
  ['w19', 'ciudad', '城市', '阴性', 'la ciudad', 'las ciudades', 'una ciudad pequeña', '一座小城', 'pequeñas', 'Las ciudades son ___.', 'Las ciudades son pequeñas.', '这些城市很小。', 'ciudad 虽不以 -a 结尾，仍是阴性；辅音结尾加 -es，搭配 pequeñas。']
];
const references = [
  { sourceId: 'pcic-grammar', section: '1. 名词的性与数；2. 形容词的性与数；3.1. 定冠词（A1–A2）' },
  { sourceId: 'dpd-el', section: '2.1：紧接重读 /a/ 开头的阴性单数名词；形容词仍按阴性配合' }
];
module.exports = rows.map(([id, noun, meaning, gender, singular, plural, phrase, phraseTranslation, adjective, frame, sentence, translation, rule]) => ({
  id, noun, meaning, gender, singular, plural, phrase, phraseTranslation, sentence, translation, rule, references,
  note: id === 'w24' ? 'agua 常作不可数名词；las aguas 常指不同水域或不同来源的水，不能直接理解成几杯水。这里句子练单数。' : '本组只练所列常见义项与词形。',
  reviewScope: '基础词义与词性沿用既有核对记录；新增词形、搭配与练习待教师审稿。',
  questions: [
    { id: `${id}-article`, kind: 'article', title: '1 · 选冠词', prompt: `紧接名词前，补定冠词：___ ${noun}（单数）`, options: ['el', 'la', 'los', 'las'], answer: singular.split(' ')[0], explanation: `${singular}：${gender}名词。${id === 'w24' ? '这里的 el 不改变 agua 的阴性。' : '单数定冠词与名词的语法性配合。'}` },
    { id: `${id}-adjective`, kind: 'text', title: '2 · 改形容词', prompt: `${frame} 把 ${id === 'w24' ? 'frío' : 'pequeño'} 改成配合主语的词形，只填空格。`, answer: adjective, explanation: rule },
    { id: `${id}-sentence`, kind: 'text', title: '3 · 补完整句', prompt: `写出整句：${frame}（${translation}）`, answer: sentence, explanation: `完整句：${sentence} ${rule}` }
  ]
}));
