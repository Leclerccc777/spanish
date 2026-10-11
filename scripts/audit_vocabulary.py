"""读取课程每个官方词条链接，记录访问证据；人工内容判断单独保存。

不打包词典正文。仅为审阅在 /tmp 中保存本次抽取文本；不关闭 TLS 验证。
"""
import concurrent.futures
import argparse
import datetime
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path('/tmp/hola-vocabulary-review')
WORDS = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./miniprogram/data/course').words))"], cwd=ROOT, text=True))

class Extract(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = []
        self.title_open = False
        self.title_done = False
        self.article = False
        self.parts = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag == 'title' and not self.title_done: self.title_open = True
        if tag in ('article', 'entry'): self.article = True
        if tag in ('script', 'style'): self.skip += 1
    def handle_endtag(self, tag):
        if tag == 'title' and self.title_open:
            self.title_open = False
            self.title_done = True
        if tag in ('article', 'entry'): self.article = False
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
    def handle_data(self, text):
        if self.title_open: self.title.append(text.strip())
        if self.article and not self.skip and text.strip(): self.parts.append(text.strip())

def fetch(url):
    result = {'url': url, 'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat()}
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'Hola learning reference checker/0.1'})
        with urllib.request.urlopen(request, timeout=25) as response:
            body = response.read(2_000_000)
            parser = Extract()
            parser.feed(body.decode(response.headers.get_content_charset() or 'utf-8', errors='replace'))
            title = ' '.join(parser.title)
            content = ' '.join(parser.parts)
            valid = bool(content) and any(marker in title for marker in ['Diccionario de la lengua', 'Diccionario panhispánico']) and not any(marker in title.lower() for marker in ['no encontrada', 'captcha', 'just a moment', 'access denied'])
            result.update(status='entry_found' if valid else 'unexpected_page', http_status=response.status, final_url=response.url, title=title, sha256=hashlib.sha256(body).hexdigest())
            CACHE.joinpath(hashlib.sha256(url.encode()).hexdigest() + '.txt').write_text(content, encoding='utf-8')
    except Exception as error:
        result.update(status='blocked', error=str(error))
    return result

def main():
    arguments = argparse.ArgumentParser()
    arguments.add_argument('--word-id', help='仅重试指定课程词条；保留其他已核验记录')
    arguments.add_argument('--pending-only', action='store_true', help='仅抓取尚无访问证据的词条')
    args = arguments.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    output = ROOT / 'docs/vocabulary-verification.json'
    old = {}
    if output.exists(): old = {row['word_id']: row for row in json.loads(output.read_text())}
    selected = WORDS if not args.word_id else [w for w in WORDS if w['id'] == args.word_id]
    if args.pending_only: selected = [w for w in selected if old.get(w['id'], {}).get('status') != 'entry_found']
    if not selected:
        if args.pending_only:
            print('All course entries already have successful access evidence; content review is separate.')
            return 0
        raise ValueError('Unknown word ID')
    urls = list(dict.fromkeys(w['dictionaryUrl'] for w in selected))
    fetched = {row['url']: {k: v for k, v in row.items() if k not in ('word_id', 'spanish', 'teaching_meaning', 'content_review', 'review_notes', 'reviewed_at')} for row in old.values()}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        fetched.update(zip(urls, executor.map(fetch, urls)))
    records = []
    for word in WORDS:
        record = {'word_id': word['id'], 'spanish': word['spanish'], 'teaching_meaning': word['meaning'], **fetched.get(word['dictionaryUrl'], {'url': word['dictionaryUrl'], 'status': 'unrun'}), 'content_review': 'pending'}
        previous = old.get(word['id'], {})
        if previous.get('sha256') == record.get('sha256') and record['status'] == 'entry_found':
            for field in ('content_review', 'review_notes', 'reviewed_at'):
                if field in previous: record[field] = previous[field]
        records.append(record)
    output.write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    counts = {status: sum(row['status'] == status for row in records) for status in {r['status'] for r in records}}
    print(f'{len(records)} teaching entries; fetched {len(urls)} official URLs: {counts}')
    for row in records:
        if row['status'] != 'entry_found': print(row['word_id'], row['spanish'], row['status'], row.get('error', row.get('title')))
    print('Evidence saved; successful responses still require editorial review.')
    return 0 if all(row['status'] == 'entry_found' for row in records) else 1

if __name__ == '__main__': raise SystemExit(main())
