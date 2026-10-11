"""Offline integrity/count/provenance and WeChat main-package source-size check."""
import hashlib
import json
import re
import subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
report=json.loads((ROOT/'docs/lexicon-build.json').read_text())
manifest=json.loads((ROOT/'docs/lexicon-sources.json').read_text())
content=(ROOT/'miniprogram/data/lexicon/entries.js').read_bytes()
assert len(content)==report['generatedBytes']
assert hashlib.sha256(content).hexdigest()==report['sha256']
assert report['sources']==manifest
for source in manifest.values():
    assert re.fullmatch('[a-f0-9]{40}',source['commit'])
    assert re.fullmatch('[a-f0-9]{64}',source['sha256'])
    assert source['bytes']>0
summary=json.loads(subprocess.check_output(['node','-e',"const c=require('./miniprogram/data/course');const l=c.lexicon;process.stdout.write(JSON.stringify({entries:l.catalogue.length,unique:new Set(l.catalogue.map(w=>l.canonicalKey(w.spanish))).size,single:l.catalogue.filter(w=>/^[a-záéíóúüñ]+$/.test(l.canonicalKey(w.spanish))).length,packs:l.packs.length,covered:new Set(c.tasks.filter(t=>t.bank).flatMap(t=>t.targets.map(w=>w.wordId))).size}));"],cwd=ROOT,text=True))
assert summary['entries']==summary['unique']==report['uniqueEntries']==6500
assert summary['single']==report['singleWordEntries']>=6000
assert summary['covered']==report['imported']==6183
size=sum(p.stat().st_size for p in (ROOT/'miniprogram').rglob('*') if p.is_file())
assert size<2*1024*1024, f'Main package source exceeds 2 MiB: {size}'
print(json.dumps({**summary,'miniProgramSourceBytes':size,'limitBytes':2*1024*1024},ensure_ascii=False))
print('Source bytes are a preflight estimate; official WeChat compiler output is not measured here.')
