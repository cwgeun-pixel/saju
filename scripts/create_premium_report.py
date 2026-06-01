# Trinity of Destiny — 프리미엄 리포트 원스톱 생성기
# 사용법: python create_premium_report.py --data member_data.json --key sk-ant-... --pdf output.pdf
#
# member_data.json 형식 (계산기에서 내보낸 원본 데이터):
# {
#   "name": "홍길동",
#   "birth_date": "1990년 3월 15일",
#   "birth_time": "오시 (11:00~13:00)",
#   "birth_place": "서울특별시",
#   "gender": "남성",
#   "saju": { "pillars": [...], "elements": {...}, ... },
#   "ziwei": { "palaces": {...}, "sihua": [...], ... },
#   "natal": { "sun_sign": "...", "planets": [...], ... }
# }

import os, sys, json, argparse
from datetime import datetime

PYTHON = sys.executable
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def main():
    parser = argparse.ArgumentParser(
        description='Trinity of Destiny — 프리미엄 리포트 생성기',
        formatter_class=argparse.RawTextHelpFormatter,
        epilog="""
사용 예시:
  python create_premium_report.py \\
    --data member_홍길동.json \\
    --key sk-ant-xxxxxxxx \\
    --pdf 홍길동_프리미엄리포트.pdf

환경변수 사용:
  set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
  python create_premium_report.py --data member_홍길동.json --pdf 홍길동.pdf
        """
    )
    parser.add_argument('--data', '-d', required=True,
                        help='회원 사주 데이터 JSON 파일')
    parser.add_argument('--key', '-k', default='',
                        help='Anthropic API 키 (없으면 ANTHROPIC_API_KEY 환경변수)')
    parser.add_argument('--pdf', '-p', default='',
                        help='PDF 출력 경로 (기본: {이름}_premium_report.pdf)')
    parser.add_argument('--no-ai', action='store_true',
                        help='AI 해석 없이 기존 데이터로만 PDF 생성 (테스트용)')
    args = parser.parse_args()

    # API 키 확인
    api_key = args.key or os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key and not args.no_ai:
        print('\n❌ Anthropic API 키가 필요합니다.')
        print('   방법 1: --key sk-ant-xxxxxxxx')
        print('   방법 2: set ANTHROPIC_API_KEY=sk-ant-xxxxxxxx\n')
        sys.exit(1)

    # 데이터 로드
    print(f'\n📂 데이터 로드: {args.data}')
    with open(args.data, encoding='utf-8') as f:
        data = json.load(f)

    name = data.get('name', '회원')

    # PDF 경로
    pdf_path = args.pdf or os.path.join(
        os.path.dirname(args.data),
        f"{name}_프리미엄리포트_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    )

    # 중간 파일 경로
    interpreted_path = pdf_path.replace('.pdf', '_interpreted.json')

    sys.path.insert(0, SCRIPT_DIR)

    if args.no_ai:
        # AI 없이 바로 PDF
        print('\n⚡ AI 해석 없이 PDF 생성 (테스트 모드)')
        interpreted = data
    else:
        # AI 해석 생성
        from interpret_with_claude import generate_interpretations
        interpreted = generate_interpretations(data, api_key)

        # 해석 결과 저장 (재사용 가능)
        with open(interpreted_path, 'w', encoding='utf-8') as f:
            json.dump(interpreted, f, ensure_ascii=False, indent=2)
        print(f'\n💾 AI 해석 저장: {interpreted_path}')

    # PDF 생성
    print(f'\n📄 PDF 생성 중...')
    from generate_report import generate_report
    generate_report(interpreted, pdf_path)

    print(f'\n{"="*50}')
    print(f'✅ 완료!')
    print(f'   이름: {name}')
    print(f'   PDF: {pdf_path}')
    print(f'{"="*50}\n')

    # 자동으로 PDF 열기 (Windows)
    try:
        os.startfile(pdf_path)
    except:
        pass


if __name__ == '__main__':
    main()
