# 사이트 전역의 도메인 표기를 한 번에 바꾸는 스크립트 (도메인 이전 시 사용)
import pathlib
import sys

OLD_HOST = 'saju0523.pages.dev'
NEW_HOST = 'www.trinityofdestiny.com'

ROOT = pathlib.Path(__file__).resolve().parent.parent
# 검사할 확장자
EXTS = {'.html', '.js', '.css', '.xml', '.txt', '.json'}
# 제외 경로 (빌드 산출물·의존성·임시 렌더 결과)
SKIP_PARTS = {'node_modules', 'output', '__pycache__', '.git'}


def skip(path: pathlib.Path) -> bool:
    parts = set(path.parts)
    if parts & SKIP_PARTS:
        return True
    return path.name.startswith('rendered_') or path.name.startswith('_')


def main():
    changed = []
    for p in ROOT.rglob('*'):
        if not p.is_file() or p.suffix not in EXTS or skip(p.relative_to(ROOT)):
            continue
        try:
            s = p.read_text(encoding='utf-8')
        except (UnicodeDecodeError, OSError):
            continue
        if OLD_HOST not in s:
            continue
        n = s.count(OLD_HOST)
        p.write_text(s.replace(OLD_HOST, NEW_HOST), encoding='utf-8')
        changed.append((p.relative_to(ROOT).as_posix(), n))

    for f, n in sorted(changed):
        print(f'{f:<38} {n}곳')
    print(f'\n총 {len(changed)}개 파일 / {sum(n for _, n in changed)}곳 변경')
    if not changed:
        print('바꿀 대상이 없습니다 (이미 적용됐거나 도메인 표기가 다릅니다)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
