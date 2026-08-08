# 사이트 내부의 .html 링크를 확장자 없는 최종 주소로 맞추는 스크립트
#
# Cloudflare Pages는 /foo.html 요청을 /foo 로 308 리디렉트한다.
# sitemap과 canonical이 .html을 가리키면 구글이 "Page with redirect"로 색인을 보류한다.
# 실제로 200을 주는 주소(확장자 없음)로 통일해야 한다.
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# 확장자를 떼야 하는 페이지 (루트에 있는 공개 페이지)
PAGES = [
    'saju-about', 'ziwei-about', 'astro-about', 'goonghap', 'goonghap-ai',
    'privacy', 'terms', 'contact', 'pricing', 'card',
    'calculator', 'calculator-app', 'auth', 'auth-callback', 'dashboard', 'premium', 'landing',
]

EXTS = {'.html', '.js', '.xml', '.txt'}
SKIP_PARTS = {'node_modules', 'output', '__pycache__', '.git', 'scripts'}


def skip(rel: pathlib.Path) -> bool:
    return bool(set(rel.parts) & SKIP_PARTS) or rel.name.startswith('_')


def main():
    # href="/foo.html" / href="./foo.html" / <loc>...foo.html</loc> 를 확장자 없이
    patterns = []
    for name in PAGES:
        patterns.append((re.compile(r'(href=["\'])(\.?/?)' + name + r'\.html(["\'#?])'), r'\1\g<2>' + name + r'\3'))
        patterns.append((re.compile(r'(<loc>[^<]*?/)' + name + r'\.html(</loc>)'), r'\1' + name + r'\2'))
        patterns.append((re.compile(r'(canonical["\'][^>]*?/)' + name + r'\.html'), r'\1' + name))

    changed = []
    for p in ROOT.rglob('*'):
        if not p.is_file() or p.suffix not in EXTS or skip(p.relative_to(ROOT)):
            continue
        try:
            s = p.read_text(encoding='utf-8')
        except (UnicodeDecodeError, OSError):
            continue
        out = s
        for rx, rep in patterns:
            out = rx.sub(rep, out)
        if out != s:
            p.write_text(out, encoding='utf-8')
            changed.append(p.relative_to(ROOT).as_posix())

    for f in sorted(changed):
        print(' ', f)
    print(f'\n{len(changed)}개 파일 정리')
    return 0


if __name__ == '__main__':
    sys.exit(main())
