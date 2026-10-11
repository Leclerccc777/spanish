"""Rebuild the redistributable vocabulary bank from pinned, hash-checked sources.

Standard library only. Chinese hints are editorial or POS-matched English→Chinese
pivot translations, NOT verified direct Spanish→Chinese dictionary definitions.
"""
import argparse
import csv
import hashlib
import html
import json
import re
import subprocess
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'docs/lexicon-sources.json'
STAGES = {'A1': 800, 'A2': 1500, 'B1': 2000, 'B2': 2200}
PARTS = {'noun':'名词','verb':'动词','adj':'形容词','adv':'副词','pron':'代词','prep':'介词','conj':'连词','intj':'感叹词','det':'限定词','article':'冠词','num':'数词','particle':'语法小词'}
EN_PARTS = {'noun':['n.'],'verb':['vt.','vi.','v.'],'adj':['adj.','a.'],'adv':['adv.','ad.'],'pron':['pron.'],'prep':['prep.'],'conj':['conj.'],'intj':['interj.','int.'],'det':['a.','adj.','pron.'],'article':['art.'],'num':['num.'],'particle':['adv.','ad.','pron.']}
# These high-frequency structural words require context-aware Chinese hints.
# Original wording, drawn from the inspected upstream entry and PCIC structures.
HINTS = {
 'en':('prep','在；在……里/上（依语境）'), 'por':('prep','通过；因为；由（依语境）'),
 'para':('prep','为了；给；朝向（依语境）'), 'hasta':('prep','直到；到……为止'),
 'cuando':('conj','当……时'), 'ahí':('adv','在那里'), 'ni':('conj','也不；既不……也不……'),
 'vez':('noun','次；回；场合'), 'claro':('adj','清楚的；明亮的；明确的'),
 'estado':('noun','状态；国家；州（依语境）'), 'ya':('adv','已经；现在（依语境）'),
 'a':('prep','向；到；在（时间等用法）'), 'de':('prep','……的；来自；由……组成'),
 'el':('article','定冠词：通常用于阳性单数名词'), 'un':('article','不定冠词：一个（阳性单数）'),
 'mi':('det','我的（置于名词前）'), 'tu':('det','你的（置于名词前）'),
 'su':('det','他/她/您/他们的（置于名词前）'),
 'que':('conj','引导从句；也可连接比较'),
 'se':('pron','第三人称反身代词；也用于无人称或被动结构'),
 'me':('pron','我（直接/间接宾语或反身代词）'),
 'te':('pron','你（直接/间接宾语或反身代词）'),
 'le':('pron','给他/她/您（间接宾语代词）'),
 'lo':('pron','它/他（阳性单数宾语）；也有中性用法'),
 'ser':('verb','是（身份、类别、特征等）'),
 'estar':('verb','在；处于某种状态'),
 'haber':('verb','完成时助动词；无人称用法表示存在'),
 'poder':('verb','能；可以'), 'deber':('verb','应当；欠'),
 'como':('conj','如同；按照……的方式；因为（依语境）'),
 'más':('adv','更多；更（构成比较）'), 'menos':('adv','更少；不如（构成比较）'),
 'mío':('adj','我的（可随被修饰词改变性数）'),
 'tuyo':('adj','你的（可随被修饰词改变性数）'),
 'suyo':('adj','他/她/您/他们的（依语境）'),
 'nosotros':('pron','我们'), 'vosotros':('pron','你们（西班牙常用，非正式）'),
 'otro':('det','另一个；其他的'), 'todo':('det','全部的；每一个'),
}
FAMILY_FORMS = {'he','era','son','sus','mira','pasa','vale','re','po','limite','cuántas','cuántos','mía','mías','míos','tuya','tuyas','tuyos','suya','suyas','suyos','nuestra','nuestras','nuestros','vuestra','vuestras','vuestros','mi','tu','su','la','los','las','una','unos','unas','ellas','ellos','ello','ella','nosotras','vosotras','éste','ése','ésta','ésa','éstos','ésos','éstas','ésas','aquél','aquélla','aquéllos','aquéllas','esta','estos','estas','esa','esos','esas','aquella','aquellos','aquellas'}
FORMS = re.compile(r'\b(?:form|plural|singular|participle|spelling|inflection|diminutive|augmentative|apocopic|pronunciation)\s+(?:form\s+)?of\b|\bfeminine\b|\bmasculine\b|\b(?:female|male) equivalent\b|\b(?:comparative|superlative) of\b', re.I)
EXCLUDED_USAGE = re.compile(r'\b(?:obsolete|archaic|rare|dated|nonstandard|misspelling|historical|neologism)\b', re.I)


def normalize(word):
    return unicodedata.normalize('NFC', word).strip().lower()


def verify_sources(cache, download):
    manifest = json.loads(MANIFEST.read_text())
    for source, record in manifest.items():
        suffix = '.csv' if source == 'chinese' else '.tsv' if source == 'dictionary' else '.txt'
        path = cache / (source + suffix)
        if download or not path.exists():
            cache.mkdir(parents=True, exist_ok=True)
            request = urllib.request.Request(record['url'], headers={'User-Agent':'Hola curriculum builder/0.2'})
            with urllib.request.urlopen(request, timeout=60) as response, path.open('wb') as output:
                received = 0
                while True:
                    chunk = response.read(1024 * 1024)
                    if not chunk: break
                    received += len(chunk)
                    if received > 100 * 1024 * 1024: raise ValueError('Source exceeds download limit')
                    output.write(chunk)
        if path.stat().st_size != record['bytes'] or hashlib.sha256(path.read_bytes()).hexdigest() != record['sha256']:
            raise ValueError(f'Incomplete or changed source: {source}')
    return manifest


def chinese_hint(text, pos, gloss=''):
    lines = text.replace('\\n','\n').replace('\\r','').splitlines()
    prefixes = EN_PARTS[pos][:]
    if pos=='verb' and gloss.startswith('(intransitive)'): prefixes=['vi.','v.','vt.']
    for prefix in prefixes:
        matches = [line for line in lines if line.strip().startswith(prefix)]
        for line in matches:
            value = line.strip()[len(prefix):].strip()
            if '[' in value: value = value.split('[',1)[0].strip()
            if not re.search('[\u4e00-\u9fff]',value): continue
            # Preserve alternatives, but keep a small hint rather than the full ECDICT entry.
            alternatives = re.split('[,，;；]',value)
            result = '；'.join(item.strip() for item in alternatives[:4] if item.strip())
            if result and len(result) <= 90: return result
    # Phrase entries may have no POS label; use only plain Chinese lines.
    for line in lines:
        value = line.strip()
        if re.search('[\u4e00-\u9fff]',value) and not re.match(r'[a-z]+\.',value) and not re.search('[a-zA-Z]',value) and not value.startswith('[') and len(value)<=90: return value
    return None


def parse_definitions(body, word):
    sections = re.findall(r'<i>([^<]+)</i><br><ol>(.*?)</ol>',body)
    preferred = HINTS.get(word, (None,None))[0]
    if not preferred and word.endswith(('ar','er','ir','ír')) and any(pos=='verb' for pos,_ in sections): preferred = 'verb'
    sections.sort(key=lambda item:item[0] != preferred)
    for pos, contents in sections:
        if pos not in PARTS: continue
        if pos=='verb' and not word.endswith(('ar','er','ir','ír')): continue
        for item in re.findall(r'<li>(.*?)</li>',contents):
            gloss = html.unescape(re.sub('<[^>]+>','',item)).strip()
            # Editorial structural-word hints can use an apocopated form; exclude other forms.
            if (word not in HINTS and FORMS.search(gloss)) or EXCLUDED_USAGE.search(gloss): continue
            if len(gloss) > 250 or re.search(r'\b(?:letter|letters)\b',gloss,re.I): continue
            yield pos, gloss


def english_keys(gloss):
    clean = re.sub(r'^\([^)]*\)\s*','',gloss)
    clean = re.sub(r'^to\s+','',clean)
    first = clean.split(';',1)[0].split(',',1)[0].strip()
    without_comment = re.sub(r'\s*\([^)]*\).*','',first).strip()
    return list(dict.fromkeys(normalize(value).rstrip('.') for value in [first,without_comment,re.sub(r'^(?:a|an|the)\s+','',without_comment)]))


def build(cache):
    manifest = verify_sources(cache, False)
    curriculum = json.loads(subprocess.check_output(['node','-e',"const c=require('./miniprogram/data/course');process.stdout.write(JSON.stringify(c.curriculumWords||c.words));"],cwd=ROOT,text=True))
    canonical = {}
    excluded = set()
    for word in curriculum:
        base = normalize(word['spanish'].split(' / ')[0])
        canonical.setdefault(base, word)
        excluded.update(normalize(form) for form in word['spanish'].split(' / '))
    translations = {}
    for row in csv.DictReader((cache/'chinese.csv').open(encoding='utf-8')):
        if re.search('[\u4e00-\u9fff]',row['translation']): translations[normalize(row['word'])] = row['translation']
    frequencies = {}
    for line in (cache/'frequency.txt').read_text().splitlines():
        token, count = line.rsplit(' ',1)
        frequencies[normalize(token)] = int(count)
    candidates = {}
    for line_number, line in enumerate((cache/'dictionary.tsv').open(encoding='utf-8'),1):
        if '\t' not in line: continue
        keys, body = line.rstrip('\n').split('\t',1)
        aliases = list(dict.fromkeys(normalize(value) for value in keys.split('|')))
        original = keys.split('|')[0].strip()
        word = normalize(original)
        if original != word or word in excluded or word in FAMILY_FORMS or word in candidates: continue
        if not re.fullmatch('[a-záéíóúüñ]+',word) or len(word)>35: continue
        if len(word)==1 and word not in {'a','y','o','e','u'}: continue
        # Only words occurring under their actual headword enter this teaching bank.
        if frequencies.get(word,0)==0: continue
        for pos, gloss in parse_definitions(body,word):
            pivot, hint = None, None
            if word in HINTS and HINTS[word][0]==pos: hint = HINTS[word][1]
            else:
                for key in english_keys(gloss):
                    if key in translations:
                        hint = chinese_hint(translations[key],pos,gloss)
                        if hint: pivot=key;break
            if not hint: continue
            forms = [word] + sorted((value for value in aliases if value!=word and re.fullmatch('[a-záéíóúüñ]+',value) and frequencies.get(value,0)>0),key=lambda value:(-frequencies[value],value))[:7]
            candidates[word] = {'word':word,'pos':pos,'definition':gloss,'pivot':pivot or '', 'hint':hint,'frequency':frequencies[word],'sourceLine':line_number,'forms':forms,'hintKind':'editorial' if not pivot else 'english-pivot'}
            break
    selected = sorted(candidates.values(),key=lambda row:(-row['frequency'],row['word']))[:sum(STAGES.values())-len(canonical)]
    if len(selected)+len(canonical)!=sum(STAGES.values()): raise ValueError('Insufficient distinct headwords with Chinese hints')
    levels = []
    for level, quota in STAGES.items():
        own = sum(word['level']==level for word in canonical.values())
        levels += [level] * (quota-own)
    rows = []
    for row, level in zip(selected,levels):
        stable = 'v-'+hashlib.sha256(row['word'].encode()).hexdigest()[:12]
        rows.append([stable,row['word'],row['hint'],row['pos'],level,row['definition'],row['pivot'],row['frequency'],row['sourceLine'],row['forms'],row['hintKind']])
    target = ROOT/'miniprogram/data/lexicon/entries.js'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text('// Generated by scripts/build_lexicon.py. See THIRD_PARTY_NOTICES.md.\n// Dictionary-derived data: CC BY-SA 4.0; Chinese hints include MIT ECDICT derivatives.\nmodule.exports = [\n'+',\n'.join(json.dumps(row,ensure_ascii=False,separators=(',',':')) for row in rows)+'\n];\n')
    report = {'generatedAt':'2026-10-11','uniqueEntries':len(canonical)+len(rows),'singleWordEntries':sum(bool(re.fullmatch('[a-záéíóúüñ]+',word)) for word in canonical)+len(rows),'curriculumCards':len(curriculum),'curriculumUnique':len(canonical),'imported':len(rows),'stageQuotas':STAGES,'candidateCount':len(candidates),'packSize':20,'levelBasis':'Editorial allocation by subtitle headword frequency; NOT official CEFR word classification','translationStatus':'POS-aligned English→Chinese hints or original editorial hints; manual Spanish sense review pending','definitionStatus':'Selected Wiktionary definition, community-edited, not RAE-verified','datasetLicense':'CC-BY-SA-4.0','sources':manifest,'generatedBytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
    (ROOT/'docs/lexicon-build.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    if report['singleWordEntries']<6000:raise ValueError('Fewer than 6000 distinct single-word entries')
    print(json.dumps({key:report[key] for key in ['uniqueEntries','singleWordEntries','imported','candidateCount','generatedBytes']},ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache',type=Path,default=Path('/tmp/hola-lexicon-sources'))
    parser.add_argument('--download',action='store_true',help='Download the exact source revisions from docs/lexicon-sources.json')
    args = parser.parse_args()
    if args.download:verify_sources(args.cache,True)
    build(args.cache)

if __name__=='__main__': main()
