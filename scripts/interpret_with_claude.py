# Trinity of Destiny - Claude AI 사주/자미두수/점성술 해석 생성기
# 사용법: python interpret_with_claude.py --input data.json --output interpreted.json --key sk-ant-...

import os, sys, json, argparse
import anthropic
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── 해석 요청 프롬프트 빌더 ─────────────────────────────────

def build_saju_prompt(data: dict) -> str:
    saju = data.get('saju', {})
    pillars = saju.get('pillars', [])
    p_labels = ['시주', '일주', '월주', '년주']

    pillar_str = '\n'.join([
        f"  {p_labels[i]}: 천간={p.get('stem','?')} 지지={p.get('branch','?')} "
        f"십성상={p.get('sipsin_top','?')} 십성하={p.get('sipsin_bot','?')} 12운성={p.get('unseong','?')}"
        for i, p in enumerate(pillars)
    ])

    elem = saju.get('elements', {})
    ys   = saju.get('yongsin', {})

    return f"""당신은 한국의 전통 사주명리학 전문가입니다.
다음 사주 원국 데이터를 바탕으로 각 분야별 심층 해석을 한국어로 작성해주세요.

## 기본 정보
- 이름: {data.get('name', '의뢰인')}
- 생년월일: {data.get('birth_date', '-')}
- 출생시각: {data.get('birth_time', '-')}
- 성별: {data.get('gender', '-')}

## 사주 원국
{pillar_str}

## 오행 분포
목: {elem.get('목', 0)}% / 화: {elem.get('화', 0)}% / 토: {elem.get('토', 0)}% / 금: {elem.get('금', 0)}% / 수: {elem.get('수', 0)}%

## 용신/희신/기신
- 용신: {ys.get('yong', '-')}
- 희신: {ys.get('hee', '-')}
- 기신: {ys.get('gi', '-')}

---

다음 JSON 형식으로 각 분야 해석을 작성해주세요.
각 항목은 3~6문장으로 구체적이고 개인화된 내용을 작성하세요.
일반적인 내용이 아닌, 위 사주 데이터에서 직접 도출된 근거를 포함해야 합니다.

```json
{{
  "pillar_quote": "이 사주의 핵심을 한 문장으로 요약 (한자 포함, 2~3줄)",
  "daymaster_desc": "일간 {pillars[1].get('stem','') if len(pillars)>1 else ''}의 성질과 특성 상세 설명",
  "yongsin_desc": "용신/희신/기신의 의미와 활용법",
  "element_desc": "오행 균형 분석 및 개운 방향",
  "interpret": {{
    "성격": "성격과 기질 심층 해석 (일간·십성 기반)",
    "성격_detail": "성격의 강점과 보완점 추가 설명",
    "직업": "직업·커리어 방향 심층 해석",
    "직업_detail": "구체적 직업군·사업 전략 추가",
    "재물": "재물운·투자 성향 심층 해석",
    "재물_detail": "재물 축적 전략·주의사항 추가",
    "연애": "연애·결혼 인연 심층 해석",
    "연애_detail": "배우자 성향·인연 시기 추가",
    "건강": "건강·체질 심층 해석",
    "건강_detail": "취약 부위·관리법 추가"
  }},
  "daewoon_current_desc": "현재 대운 심층 분석 (3~5문장)",
  "unseong_desc": "12운성 종합 해석"
}}
```

JSON만 반환하세요. 다른 설명 없이 순수 JSON만 출력하세요."""


def build_ziwei_prompt(data: dict) -> str:
    ziwei = data.get('ziwei', {})
    palaces = ziwei.get('palaces', {})

    palace_str = '\n'.join([
        f"  {name}: 주성={p.get('stars','空宮')} 간지={p.get('ganzhi','')}"
        for name, p in palaces.items()
    ])

    sihua = ziwei.get('sihua', [])
    sihua_str = ', '.join([f"{s.get('type','')} {s.get('star','')}→{s.get('palace','')}" for s in sihua])

    return f"""당신은 대만 전통 자미두수(紫微斗數) 전문가입니다.
다음 명반 데이터를 바탕으로 각 궁(宮)별 상세 해석을 한국어로 작성해주세요.

## 명반 정보
- 이름: {data.get('name', '의뢰인')}
- 생년월일: {data.get('birth_date', '-')}
- 성별: {data.get('gender', '-')}
- 명반 유형: {ziwei.get('chart_type', '-')}

## 12궁 배치
{palace_str}

## 사화(四化)
{sihua_str}

---

다음 JSON 형식으로 해석을 작성해주세요.

```json
{{
  "summary": "명반 전체 총평 (3~4문장, 주요 특징과 인생 핵심 정리)",
  "palaces": {{
    "命宮": {{"desc": "명궁 해석 (2~3문장)", "detail": "추가 심층 해석"}},
    "財帛宮": {{"desc": "재백궁 해석", "detail": "재물 운용 전략"}},
    "官祿宮": {{"desc": "관록궁 해석", "detail": "커리어 발전 전략"}},
    "夫妻宮": {{"desc": "부처궁 해석", "detail": "배우자 인연 및 결혼 시기"}},
    "疾厄宮": {{"desc": "질액궁 해석", "detail": "건강 관리 포인트"}},
    "遷移宮": {{"desc": "천이궁 해석", "detail": "해외·이동 운세"}},
    "交友宮": {{"desc": "교우궁 해석", "detail": "인맥·귀인 활용"}},
    "福德宮": {{"desc": "복덕궁 해석", "detail": "정신적 복덕"}},
    "田宅宮": {{"desc": "전택궁 해석", "detail": "부동산 전략"}},
    "兄弟宮": {{"desc": "형제궁 해석", "detail": ""}},
    "子女宮": {{"desc": "자녀궁 해석", "detail": ""}},
    "父母宮": {{"desc": "부모궁 해석", "detail": ""}}
  }},
  "sihua_desc": {{
    "化祿": "화록 상세 해석",
    "化權": "화권 상세 해석",
    "化科": "화과 상세 해석",
    "化忌": "화기 상세 해석"
  }},
  "dahahn_current": "현재 대한 심층 분석 (3~4문장)",
  "liuyear": "2026년 유년 운세 종합 (3~4문장)"
}}
```

JSON만 반환하세요."""


def build_natal_prompt(data: dict) -> str:
    natal = data.get('natal', {})
    planets = natal.get('planets', [])

    planet_str = '\n'.join([
        f"  {p.get('name','')}: {p.get('sign','')} {p.get('degree','')} {p.get('house','')}하우스"
        for p in planets
    ])

    return f"""당신은 서양 점성술 전문가입니다.
다음 네이탈 차트 데이터를 바탕으로 각 분야별 심층 해석을 한국어로 작성해주세요.

## 기본 정보
- 이름: {data.get('name', '의뢰인')}
- 태양 별자리: {natal.get('sun_sign', '-')}
- 달 별자리: {natal.get('moon_sign', '-')}
- 상승궁: {natal.get('asc_sign', '-')}

## 행성 배치
{planet_str}

---

다음 JSON 형식으로 해석을 작성해주세요.

```json
{{
  "chart_overview": "네이탈 차트 전체 총평 (4~5문장)",
  "signs_desc": {{
    "sun": "태양 별자리 심층 해석 (3~4문장, 하우스 위치 포함)",
    "moon": "달 별자리 심층 해석 (3~4문장, 하우스 위치 포함)",
    "asc": "상승궁 심층 해석 (3~4문장)"
  }},
  "extended": {{
    "psych": "심리 점성학 - 내면 심리, 방어 기제, 성장 방향 (4~5문장)",
    "career": "직업 점성술 - 적합 직종, 커리어 전략, 성공 시기 (4~5문장)",
    "wealth": "재물 점성술 - 재물 성향, 투자 전략, 주의사항 (4~5문장)",
    "love": "연애 점성술 - 연애 스타일, 이상형, 결혼 인연 (4~5문장)",
    "transit": "2026년 트랜짓 핵심 운세 - 주요 행성 영향과 타이밍 (4~5문장)",
    "solar": "2026년 솔라 리턴 분석 - 올해의 핵심 테마 (3~4문장)",
    "progression": "프로그레션 현재 분석 - 심리적 성장 단계 (3~4문장)",
    "karma": "카르마·노드 해석 - 전생 패턴과 이번 생의 과제 (3~4문장)",
    "retrograde": "역행 행성 해석 - 내면화된 에너지와 특수 재능 (3~4문장)",
    "health_astro": "건강 점성학 - 취약 부위, 체질, 관리법 (3~4문장)",
    "all_houses": "12하우스 전체 키워드 요약 (각 하우스 1~2문장)",
    "aspects": "주요 각도(Aspect) 심층 해석 - 상위 5개 (각 2문장)",
    "astrocarto": "아스트로카토그래피 - 인생에 유리한 지역과 이유 (3~4문장)"
  }}
}}
```

JSON만 반환하세요."""


def build_summary_prompt(data: dict, saju_interp: dict, ziwei_interp: dict, natal_interp: dict) -> str:
    return f"""당신은 사주명리, 자미두수, 서양 점성술을 통합 해석하는 전문가입니다.
세 시스템의 해석 결과를 종합하여 {data.get('name', '의뢰인')}님의 최종 종합 운세를 작성해주세요.

## 사주 핵심
{saju_interp.get('pillar_quote', '')}

## 자미두수 핵심
{ziwei_interp.get('summary', '')}

## 점성술 핵심
{natal_interp.get('chart_overview', '')}

---

다음 JSON 형식으로 종합 해석을 작성해주세요.

```json
{{
  "lifetime": "세 시스템 통합 인생 흐름 해석 (5~6문장, 공통 테마와 특이점 포함)",
  "year_saju": "2026년 사주 연운 핵심 (2~3문장)",
  "year_ziwei": "2026년 자미두수 연운 핵심 (2~3문장)",
  "year_natal": "2026년 점성술 연운 핵심 (2~3문장)",
  "monthly_2026": {{
    "1": "1월 운세 핵심 가이드 (2문장)", "1_theme": "1월 키워드",
    "2": "2월 운세", "2_theme": "2월 키워드",
    "3": "3월 운세", "3_theme": "3월 키워드",
    "4": "4월 운세", "4_theme": "4월 키워드",
    "5": "5월 운세", "5_theme": "5월 키워드",
    "6": "6월 운세", "6_theme": "6월 키워드",
    "7": "7월 운세", "7_theme": "7월 키워드",
    "8": "8월 운세", "8_theme": "8월 키워드",
    "9": "9월 운세", "9_theme": "9월 키워드",
    "10": "10월 운세", "10_theme": "10월 키워드",
    "11": "11월 운세", "11_theme": "11월 키워드",
    "12": "12월 운세", "12_theme": "12월 키워드"
  }},
  "advice": {{
    "summary": "인생 전체 조언 (3~4문장, 강점 활용 + 약점 보완)",
    "direction": "길방 및 방위 활용법",
    "color": "행운의 색상 및 활용법",
    "stone": "수호석 추천 및 이유",
    "lucky_day": "행운의 날과 시간",
    "action": "구체적 개운 행동 (3가지 이상)"
  }}
}}
```

JSON만 반환하세요."""


# ── Claude API 호출 함수 ───────────────────────────────────────

def call_claude(client: anthropic.Anthropic, prompt: str, section: str) -> dict:
    """Claude API 호출 및 JSON 파싱"""
    print(f'  [{section}] Claude 호출 중...')
    try:
        msg = client.messages.create(
            model='claude-opus-4-5',
            max_tokens=8192,
            messages=[{'role': 'user', 'content': prompt}]
        )
        raw = msg.content[0].text.strip()

        # JSON 블록 추출
        if '```json' in raw:
            raw = raw.split('```json')[1].split('```')[0].strip()
        elif '```' in raw:
            raw = raw.split('```')[1].split('```')[0].strip()

        result = json.loads(raw)
        print(f'  [{section}] 완료')
        return result

    except json.JSONDecodeError as e:
        print(f'  [{section}] JSON 파싱 실패: {e}')
        return {}
    except Exception as e:
        print(f'  [{section}] API 오류: {e}')
        return {}


# ── 메인 해석 생성 함수 ────────────────────────────────────────

def generate_interpretations(data: dict, api_key: str) -> dict:
    """
    사주 데이터를 받아 Claude AI로 전체 해석을 생성합니다.

    Args:
        data: 사주/자미두수/점성술 원본 계산 데이터
        api_key: Anthropic API 키

    Returns:
        해석이 채워진 완성된 데이터 딕셔너리
    """
    client = anthropic.Anthropic(api_key=api_key)
    result = json.loads(json.dumps(data))  # 깊은 복사

    print('\n? Trinity of Destiny - AI 해석 생성 시작')
    print('=' * 50)

    # 1. 사주 해석
    print('\n? PART I · 사주명리 해석...')
    saju_prompt = build_saju_prompt(data)
    saju_interp = call_claude(client, saju_prompt, '사주')

    if saju_interp:
        saju = result.setdefault('saju', {})
        saju['pillar_quote']       = saju_interp.get('pillar_quote', saju.get('pillar_quote', ''))
        saju['daymaster_desc']     = saju_interp.get('daymaster_desc', '')
        saju['element_desc']       = saju_interp.get('element_desc', '')
        saju['daewoon_current_desc']= saju_interp.get('daewoon_current_desc', '')
        saju['unseong_desc']       = saju_interp.get('unseong_desc', '')
        if 'yongsin_desc' in saju_interp:
            saju.setdefault('yongsin', {})['desc'] = saju_interp['yongsin_desc']
        if 'interpret' in saju_interp:
            saju['interpret'] = saju_interp['interpret']

    # 2. 자미두수 해석
    print('\n⭐ PART II · 자미두수 해석...')
    ziwei_prompt = build_ziwei_prompt(data)
    ziwei_interp = call_claude(client, ziwei_prompt, '자미두수')

    if ziwei_interp:
        ziwei = result.setdefault('ziwei', {})
        ziwei['summary']        = ziwei_interp.get('summary', '')
        ziwei['dahahn_current'] = ziwei_interp.get('dahahn_current', '')
        ziwei['liuyear']        = ziwei_interp.get('liuyear', '')
        # 12궁 해석 병합
        if 'palaces' in ziwei_interp:
            for pname, pdata in ziwei_interp['palaces'].items():
                if pname in ziwei.get('palaces', {}):
                    ziwei['palaces'][pname].update(pdata)
        # 사화 해석
        if 'sihua_desc' in ziwei_interp:
            for sh in ziwei.get('sihua', []):
                t = sh.get('type', '')
                if t in ziwei_interp['sihua_desc']:
                    sh['desc'] = ziwei_interp['sihua_desc'][t]

    # 3. 점성술 해석
    print('\n✧ PART III · 서양 점성술 해석...')
    natal_prompt = build_natal_prompt(data)
    natal_interp = call_claude(client, natal_prompt, '점성술')

    if natal_interp:
        natal = result.setdefault('natal', {})
        natal['chart_overview'] = natal_interp.get('chart_overview', '')
        if 'signs_desc' in natal_interp:
            natal['signs_desc'] = natal_interp['signs_desc']
        if 'extended' in natal_interp:
            natal['extended'] = natal_interp['extended']

    # 4. 종합 해석
    print('\n? PART IV · 종합 해석...')
    summary_prompt = build_summary_prompt(data, saju_interp, ziwei_interp, natal_interp)
    summary_interp = call_claude(client, summary_prompt, '종합')

    if summary_interp:
        result['summary'] = {
            'lifetime':    summary_interp.get('lifetime', ''),
            'year_saju':   summary_interp.get('year_saju', ''),
            'year_ziwei':  summary_interp.get('year_ziwei', ''),
            'year_natal':  summary_interp.get('year_natal', ''),
        }
        if 'monthly_2026' in summary_interp:
            result['monthly_2026'] = summary_interp['monthly_2026']
        if 'advice' in summary_interp:
            result['advice'] = summary_interp['advice']

    print('\n' + '=' * 50)
    print('✅ AI 해석 생성 완료')
    return result


# ── CLI 진입점 ─────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Trinity of Destiny - AI 해석 생성기')
    parser.add_argument('--input',  '-i', required=True,  help='입력 JSON 파일 경로')
    parser.add_argument('--output', '-o', required=True,  help='출력 JSON 파일 경로')
    parser.add_argument('--key',    '-k', default='',     help='Anthropic API 키 (없으면 환경변수 ANTHROPIC_API_KEY 사용)')
    parser.add_argument('--pdf',    '-p', default='',     help='PDF 출력 경로 (지정 시 해석 완료 후 자동 PDF 생성)')
    args = parser.parse_args()

    # API 키
    api_key = args.key or os.environ.get('ANTHROPIC_API_KEY', '')
    if not api_key:
        print('❌ Anthropic API 키가 필요합니다.')
        print('   --key sk-ant-... 또는 환경변수 ANTHROPIC_API_KEY 를 설정하세요.')
        sys.exit(1)

    # 입력 데이터 로드
    with open(args.input, encoding='utf-8') as f:
        data = json.load(f)

    # AI 해석 생성
    interpreted = generate_interpretations(data, api_key)

    # 결과 저장
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(interpreted, f, ensure_ascii=False, indent=2)
    print(f'\n? 해석 결과 저장: {args.output}')

    # PDF 생성 (선택)
    if args.pdf:
        print(f'\n? PDF 생성 중...')
        script_dir = os.path.dirname(os.path.abspath(__file__))
        sys.path.insert(0, script_dir)
        from generate_report import generate_report
        generate_report(interpreted, args.pdf)
        print(f'? PDF 저장: {args.pdf}')


if __name__ == '__main__':
    main()
