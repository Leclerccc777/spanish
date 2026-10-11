"""仅核验官方入口的响应；成功访问并不等于已完成课程内容复核。"""
import datetime
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SOURCES = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./miniprogram/data/sources')));"], cwd=ROOT, text=True))

class Title(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inside = False
        self.done = False
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag == 'title' and not self.done: self.inside = True
    def handle_endtag(self, tag):
        if tag == 'title' and self.inside:
            self.inside = False
            self.done = True
    def handle_data(self, data):
        if self.inside: self.parts.append(data.strip())

def main():
    results = []
    for source in SOURCES:
        if source.get('status') == 'dataset': continue
        source_id, url = source['id'], source['url']
        entry = {'id': source_id, 'url': url, 'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'review_scope': source['verification'], 'editorial_review_date': source['verifiedAt']}
        try:
            request = urllib.request.Request(url, headers={'User-Agent': 'Hola learning reference checker/0.1'})
            with urllib.request.urlopen(request, timeout=20) as response:
                body = response.read(2_000_000)
                parser = Title()
                charset = response.headers.get_content_charset()
                if not charset:
                    match = re.search(br'charset=["\x27]?([A-Za-z0-9_-]+)', body[:10000], re.I)
                    charset = match.group(1).decode('ascii') if match else 'utf-8'
                parser.feed(body.decode(charset, errors='replace'))
                title = ' '.join(parser.parts)
                matched = source['expectedTitle'].casefold() in title.casefold() and not any(marker in title.casefold() for marker in ['no encontrada', 'access denied', 'just a moment', 'captcha'])
                entry.update(status='reachable' if matched else 'unexpected_page', http_status=response.status, final_url=response.url, title=title, sha256_of_download=hashlib.sha256(body).hexdigest())
        except Exception as error:
            entry.update(status='blocked', error=str(error))
        results.append(entry)
        print(f"{source_id}: {entry['status']}")
    output = ROOT / 'docs' / 'source-verification.json'
    output.write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {output.relative_to(ROOT)}. Editorial review is still required.')
    return 0 if all(r['status'] == 'reachable' for r in results) else 1

if __name__ == '__main__':
    raise SystemExit(main())
