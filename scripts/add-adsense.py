# 애드센스 스니펫을 모든 페이지의 <head>에 넣거나 빼는 스크립트
# 사용: python scripts/add-adsense.py        (삽입)
#       python scripts/add-adsense.py remove (제거)
import pathlib
import sys

PUB_ID = 'ca-pub-6708143899799474'
MARKER = '<!-- Google AdSense -->'
SNIPPET = (
    f'    {MARKER}\n'
    f'    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={PUB_ID}"\n'
    f'         crossorigin="anonymous"></script>\n'
)

ROOT = pathlib.Path(__file__).resolve().parent.parent
# 방문자에게 보이는 페이지만. 인증 콜백은 즉시 이동하는 중간 페이지라 제외한다.
PAGES = [
    'index.html', 'landing.html',
    'saju-about.html', 'ziwei-about.html', 'astro-about.html',
    'goonghap.html', 'goonghap-ai.html',
    'privacy.html', 'terms.html', 'contact.html', 'pricing.html',
    'calculator.html', 'calculator-app.html', 'card.html',
    'auth.html', 'dashboard.html', 'premium.html',
    'app/index.html', 'fortune/index.html', 'sajusite/index.html',
]


def main():
    remove = len(sys.argv) > 1 and sys.argv[1] == 'remove'
    done, skipped = [], []

    for rel in PAGES:
        p = ROOT / rel
        if not p.exists():
            skipped.append((rel, '파일 없음'))
            continue
        s = p.read_text(encoding='utf-8', errors='replace')

        if remove:
            if MARKER not in s:
                skipped.append((rel, '삽입 안 돼 있음')); continue
            lines = s.split('\n')
            out, drop = [], 0
            for ln in lines:
                if MARKER in ln:
                    drop = 2  # 마커 다음 두 줄이 script 태그
                    continue
                if drop:
                    drop -= 1
                    continue
                out.append(ln)
            p.write_text('\n'.join(out), encoding='utf-8')
            done.append(rel)
            continue

        if MARKER in s:
            skipped.append((rel, '이미 있음')); continue
        if '</head>' not in s:
            skipped.append((rel, '</head> 없음')); continue
        # </head> 바로 앞에 넣는다
        p.write_text(s.replace('</head>', SNIPPET + '</head>', 1), encoding='utf-8')
        done.append(rel)

    verb = '제거' if remove else '삽입'
    for f in done:
        print(f'  {f} — {verb}')
    for f, why in skipped:
        print(f'  {f} — 건너뜀 ({why})')
    print(f'\n{verb} {len(done)}개 / 건너뜀 {len(skipped)}개')
    return 0


if __name__ == '__main__':
    sys.exit(main())
