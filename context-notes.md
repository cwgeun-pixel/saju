# 컨텍스트 노트

## 2026-05-12

- 사용자는 `C:\Users\cwgeu\Downloads\HonCheon-Website`와 `C:\Users\cwgeu\Downloads\HonCheon-Windows-x64` 안의 기존 계산식을 활용해 사주, 자미두수, 점성술 자료가 나오는 사이트를 만들고 싶어 한다.
- 현재 `C:\Users\cwgeu\OneDrive\Desktop\sajusite` 폴더는 비어 있는 상태로 확인했다.
- `HonCheon-Website`에는 Vite/Tailwind 기반 정적 빌드 산출물이 있으며, `assets\index-B0lRK9V6.js` 안에 사주 계산 함수, 자미두수 계산 함수, 점성술 천궁도 계산 함수가 포함되어 있다.
- 첫 구현 단계에서는 계산식을 다시 작성하지 않고 기존 번들을 보존해서 현재 작업 폴더로 가져오는 방식이 가장 안전하다.
- `index.html`의 한글 title과 description은 인코딩이 깨져 있어 사이트 배포 전 복구가 필요하다.
- `HonCheon-Website`의 정적 파일을 현재 작업 폴더로 복사했고, 계산식이 들어 있는 `assets\index-B0lRK9V6.js` 파일명은 그대로 유지했다.
- `index.html`의 한글 title, description, OG 메타데이터만 복구했다.
- Python이 설치되어 있지 않아 검증용 정적 서버는 Node.js 기반 `scripts\static-server.js`로 추가했다.
- `http://127.0.0.1:4173`에서 HTML이 200 OK로 응답했고, 계산식 번들 JS와 CSS도 각각 200 OK로 응답했다.
- Codex 인앱 브라우저 연결은 로컬 AppData 접근 권한 문제로 실패했지만, HTTP 레벨의 정적 파일 응답은 확인했다.
- 새 요청은 기존 계산값을 풀이 자료로 쓰기 위해 자미두수와 점성술 결과 화면의 정보량을 첨부 이미지처럼 늘리는 것이다.
- 번들 안의 기존 `Tx` 자미두수 컴포넌트는 14주성 위주의 간략 명반으로 표시되어 있고, `Mx` 점성술 컴포넌트는 원형 차트와 간단 행성 목록만 표시한다.
- 이번 변경은 계산식을 교체하지 않고 표시 레이어를 확장하는 방식으로 진행한다.
- `scripts\enhanced-results-block.txt`와 `scripts\patch-enhanced-results.js`를 추가해 번들 안의 `Tx`, `Mx` 표시 컴포넌트 블록을 교체했다.
- 자미두수 화면은 14주성 한자 병기, 명궁/신궁 표시, 四化, 大限, 流年, 유월 기준 자료, Copy for AI Reading 버튼을 표시한다.
- 점성술 화면은 기존 원형 차트에 더해 Planets, Angles, Houses, Major Aspects 표와 Copy for AI Reading 버튼을 표시한다.
- 현재 점성술 계산 결과에는 기존 `OA` 함수가 제공하는 10행성, ASC, MC, 12하우스를 사용한다. Chiron, North Node, South Node, Fortuna까지 정확히 넣으려면 계산 레이어 확장이 별도 작업으로 필요하다.
- `node --check assets\index-B0lRK9V6.js`가 통과했고, 인앱 브라우저에서 자미두수 탭의 `紫微斗數 命盤`, `四化`, `大限`, `流年`과 점성술 탭의 `Planets`, `Angles`, `Houses`, `Major Aspects` 노출을 확인했다.
- 사용자는 자미두수 자료 안의 한글 표기를 없애고 한자만 나오길 원한다. 점성술 탭은 이번 수정 범위에서 제외하고 자미두수 탭만 바꾼다.
- 자미두수 표시에서 궁명, 별명, 사화, 명궁/신궁, 공궁, 음력, 유년/유월/대한 텍스트를 한자로 통일했다.
- 주요 별은 금색/적색/녹색/청색 계열로, 化祿/化權/化科는 녹색 계열로, 化忌는 적색으로, 命宮/身宮은 청색 계열로 표시한다.
- 인앱 브라우저에서 자미두수 탭 패널 기준으로 기존 한글 궁명과 `명궁`, `신궁`, `공궁`, `음력`, `유년`, `본명`, `참조`, `세`가 남지 않는 것을 확인했다.
- 사용자가 원본 계산 결과와 비교했을 때 자미두수의 사화/대한 등과 점성술의 각도, houses, major aspect가 틀리다고 보고했다.
- 현재 추가 상세 항목 중 일부는 기존 번들이 제공하지 않는 값을 화면 확장 과정에서 추정 계산한 것이다. 이 항목들은 원본 계산식 검증 전까지 신뢰하면 안 된다.

## 2026-05-12 계산 오류 원인 확인.

- 사주 결과가 맞았던 이유는 기존 번들 계산값을 그대로 사용했기 때문이다.
- 자미두수 화면의 四化, 大限, 流年은 기존 웹 번들이 반환하지 않는 값을 화면 보강 과정에서 추정한 것이다.
- 점성술 화면의 Houses와 Major Aspects도 기존 웹 번들이 반환한 단순 값과 화면 보강 계산을 섞은 것이다.
- Windows 패키지의 app.asar 안에서 @orrery/core 0.4.2를 확인했다.
- 정확한 자미두수 API는 createChart, calculateLiunian, getDaxianList이다.
- 정확한 점성술 API는 calculateNatal이며 Placidus 등 하우스 시스템, Node, Fortuna, aspect 계산을 포함한다.
- 다음 수정은 현재 추정 계산을 제거하고 @orrery/core 결과를 화면에 연결하는 것이다.


## 2026-05-12 원본 계산식 재연결 완료.

- app.asar에서 @orrery/core/dist 파일들을 assets/orrery-core로 추출했다.
- 결과 산출 핸들러는 이제 브라우저에서 ./orrery-core/index.js를 동적 import한다.
- 자미두수는 createChart로 명반을 만들고 calculateLiunian, getDaxianList 결과를 chart 객체에 붙여 화면에서 사용한다.
- 점성술은 calculateNatal(input, 'P')를 사용해 Placidus 하우스, angles, houses, aspects, North Node, South Node, Fortuna를 받는다.
- 기존 화면 보강용 추정 계산 zxFour, zxDecades, axHouse, axAspectList는 원본 결과 기반 렌더링으로 대체했다.
- 브라우저에서 기본 입력값 계산 후 자미두수와 천궁도 탭을 열어 필수 섹션과 콘솔 오류 없음을 확인했다.


## 2026-05-12 자미두수 대한 표 재점검.

- 사용자가 첨부한 대한 표는 오른쪽에 6-15세, 왼쪽에 116-125세가 놓이는 역방향 표시다.
- @orrery/core의 2002-10-14 11:39 남자 계산은 6-15 命宮 甲辰, 16-25 父母 乙巳, 26-35 福德 丙午 순으로 첨부 예시와 일치한다.
- 화면 표시를 flex-row-reverse로 바꾸고, 현재 대한 강조 기준을 명궁이 아닌 유년 계산의 daxianAgeStart/daxianAgeEnd로 변경했다.
- 대한 칸은 천간과 지지를 분리한 색상 박스로 표시하고, 아래에 주요 별을 줄바꿈으로 표시한다.
- 유년 월운은 월, 지지, 본명 궁, 해당 궁 주요 별을 함께 보여준다.


## 2026-05-12 다국어 UI 추가.

- 정적 번들 구조를 크게 바꾸지 않기 위해 assets/i18n.js 런타임 번역 레이어를 추가했다.
- navigator.languages를 기준으로 ko, en, ja, zh, es를 자동 감지하고 지원 외 언어는 en으로 처리한다.
- localStorage honcheon.lang 값이 있으면 사용자가 직접 선택한 언어를 우선한다.
- 하단 우측에 작은 언어 선택기를 추가해 한국어, 영어, 일본어, 중국어, 스페인어를 전환할 수 있게 했다.
- 계산 원자료의 한자와 행성 기호는 보존하고, 화면 조작 문구, 안내문, 탭, 주요 섹션 제목을 번역한다.
- index.html의 깨진 title, description, og 메타를 정상 UTF-8 문구로 복구하고 i18n 스크립트를 연결했다.
- 브라우저에서 5개 언어 전환, title 변경, 결과 화면 탭과 주요 섹션 제목 번역, 콘솔 오류 없음까지 확인했다.


## 2026-05-12 AI 해석 기능 구현.

- scripts/static-server.js에 POST /api/interpret 엔드포인트를 추가했다.
- API 키는 OPENAI_API_KEY 환경변수에서만 읽고, 브라우저 코드에는 노출하지 않는다.
- 기본 모델은 OPENAI_MODEL 환경변수가 없으면 gpt-5.5를 사용한다.
- assets/ai-interpretation.js를 추가해 계산 결과 아래에 AI 해석 패널을 주입한다.
- 사용자는 섹션, 언어, 해석 깊이를 선택해 필요한 항목만 해석 요청할 수 있다.
- 현재 구현은 화면에 표시된 계산 결과 텍스트를 수집해 서버에 보내며, 서버는 Responses API로 해석을 생성한다.
- OPENAI_API_KEY가 없으면 501과 안내 메시지를 반환하는 것을 확인했다.
- 브라우저에서 계산 후 AI Interpretation 패널과 섹션 버튼이 렌더링되고 콘솔 오류가 없음을 확인했다.

## 2026-05-13 .env.local API 설정.

- 이전 대화가 사라져서 현재 파일 상태를 기준으로 이어갔다.
- scripts/static-server.js는 이미 .env.local과 .env를 읽고, OPENAI_API_KEY가 있으면 Responses API를 호출한다.
- .env.local은 실제 키를 채팅에 노출하지 않도록 주석 템플릿과 OPENAI_MODEL만 넣어 만들었다.
- 실제 OPENAI_API_KEY는 사용자가 PowerShell의 Read-Host로 직접 입력하는 방식이 안전하다.
## 2026-05-13 AI 해석 로딩 멈춤 수정.

- .env.local 키 로딩은 정상이며, 짧은 /api/interpret 테스트는 200으로 응답했다.
- 화면에서 멈춘 현상은 전체 계산 텍스트와 높은 추론 강도 때문에 응답이 오래 걸리는 경우로 판단했다.
- 서버에서 입력 길이를 줄이고 기본 추론 강도를 낮춰 체감 대기 시간을 줄인다.
- scripts/static-server.js에서 AI_SOURCE_CHARS 기본값을 24000자로 제한했다.
- premium은 medium, 그 외는 low reasoning으로 낮춰 응답 지연을 줄였다.
- server.log에 section, depth, sourceChars, 완료 시간을 남기도록 했다.
- 38자 테스트는 약 10초, 4만 자 입력 테스트는 약 19초 안팎으로 200 응답을 확인했다.


## 2026-07-31 사주 인포그래픽 파이프라인 1단계

- 위치: `scripts/infographic/` (normalize.py, template.html, render.js).
- 파이프라인: `complete_sample.json` → normalize.py → `infographic.json` → render.js(템플릿에 JSON 주입) → 1080×1920 PNG.
- 데이터가 이미 구조화(유형 A)라서 LLM 파싱 불필요. 순수 매핑 + 길이 절단(cut 함수, 문장 경계 우선)만 수행.
- Puppeteer 대신 **puppeteer-core + 로컬 Chrome** 사용 — Chromium 다운로드(120MB) 회피. Chrome 없으면 Edge 폴백.
- 주입 방식: 템플릿 스크립트의 `__DATA_JSON__` 플레이스홀더를 render.js가 문자열 치환. ⚠️ 주의 두 가지 — (1) 템플릿 주석에 플레이스홀더 문구를 쓰면 replace가 주석을 먼저 치환해버림(실제로 발생했던 버그), (2) JSON에 `$` 패턴이 있으면 깨지므로 함수 치환 `replace(k, () => data)` 사용.
- 현재 대운 판정: daewoon에는 isCurrent가 없어서 seyun의 isCurrent 나이로 역산.
- 일간 타이틀 10종은 normalize.py의 DAYMASTER_TITLES 고정 카피 (LLM 미사용).
- 오행 팔레트: 목 #2E9E6B / 화 #D64545 / 토 #D9A441 / 금 #C9CDD2 / 수 #1F3A5F. 금 배경은 밝아서 글자색을 어둡게(metal-fix 클래스).
- 폰트: Noto Serif KR + Noto Serif TC 폴백(한자 두부 방지), Google Fonts 웹폰트라 렌더링 시 네트워크 필요.
- 다음 단계 후보: 디자인 조정 → 사이트 결과 페이지에 html-to-image로 공유 카드 기능.

## 2026-07-31 인포그래픽 자미두수·점성술 확장

- normalize.py가 3개 JSON을 한 번에 산출. render.js는 `node render.js <data.json> <out.png> [template.html]` 형태로 템플릿 인자화 (기본 template_saju.html).
- 자미두수 명반: 궁 위치를 ganzhi의 지지로 계산 (BRANCH_GRID — 巳午未申 상단, 시계방향 고정). 중앙 2×2는 명궁 주성 + 국(木三局) + 요약. 명궁 금테, 현재 대한 궁에 大限 배지.
- 사화 색: 化祿 녹 / 化權 금 / 化科 청(#4A90D9) / 化忌 적.
- 점성술: 별자리 기호(♎ 등)가 Chrome에서 이모지로 렌더링됨 → **U+FE0E(variation selector)를 기호 뒤에 붙여 텍스트 글리프 강제**. 템플릿 JS는 `︎` 이스케이프, normalize의 footer_line은 파이썬 `︎` 이스케이프.
- 별자리 색 = 4원소 (불 적 / 흙 금 / 공기 회백 / 물 청). 어스펙트 색 = 조화(트라인·섹스타일) 녹 / 긴장(스퀘어·어포지션) 적 / 컨정션 금.
- 레이아웃 1920px 초과 시 하단 푸터가 잘림(overflow hidden) — 새 블록 추가 시 반드시 PNG로 하단 확인.

## 2026-07-31 인포그래픽 실제 데이터 연동

### 가장 중요한 발견
- `scripts/complete_sample.json`과 `make_sample.py`는 **손으로 쓴 가짜 데이터**다. 실제 엔진 출력과 필드명·값이 모두 다르다. (예: 가짜는 태양 천칭자리, 실제는 처녀자리)
- 실제 계산은 브라우저에서 `app/sajusite/assets/orrery-core/`(@orrery/core esbuild 추출본)가 수행한다. `fortune-free.js`가 이걸 import한다.
- 런타임 결과는 `window.__adminCalcData = { saju, ziwei, natalChart, transitChart, input }`에 원본 객체 그대로 들어있다. sessionStorage에는 **입력값만** 들어있다(`honcheon_last_input`).

### 실제 엔진 필드 (가짜 샘플과 다른 부분)
- `saju.pillars`는 **[시주, 일주, 월주, 년주]** 순서. 일간은 `pillars[1].pillar.stem`. 엔진이 `i===1`일 때 stemSipsin을 '本元'으로 박는 것으로 확인.
- pillar 구조: `{pillar:{ganzi,stem,branch}, stemSipsin, branchSipsin, unseong, sinsal, jigang}` — 십신/운성 모두 **한자**.
- `saju.specialSals`는 배열이 아니라 `{yangin:[인덱스], baekho:bool, ...}` 형태.
- 자미두수 궁 이름은 `命宮`만 宮이 붙고 나머지는 `兄弟, 夫妻, 財帛...`처럼 접미사 없음.
- 궁 별 구조: `{name, zhi, gan, ganZhi, stars:[{name,brightness,siHua}], isShenGong}` — **siHua는 대문자 H**.
- `getDaxianList`, `calculateLiunian`은 ziwei.js에 export돼 있지만 fortune-free.js가 import하지 않아 사이트에서는 미사용.
- natal `sign`은 **영어**(Virgo, Taurus). planets 14개(Chiron/NorthNode/SouthNode/Fortuna 포함), aspects는 29개까지 나와 필터링 필요. `degreeInSign`/`isRetrograde`가 정확한 필드명.

### 구조 결정
- 파이썬 normalize.py를 버리고 **JS 모듈로 이전**했다. 이유: 브라우저(모바일 조회)와 puppeteer(PNG 배치)가 **동일한 코드 경로**를 쓰게 하려고. 정규화 로직이 두 벌로 갈라지는 것을 막는 게 핵심.
- 카드는 항상 1080x1920으로 그리고 `transform: scale(var(--k))`로 축소만 한다. 반응형 리플로우를 쓰지 않으므로 모바일과 PNG가 픽셀 단위로 동일하다.
- 해석 문구는 LLM 없이 `interpret-data.js`의 고정 테이블 + 규칙으로 생성. 결정적이라 레이아웃이 절대 깨지지 않고 API 비용도 없다.
- `.c-body { justify-content: center }` — 카드마다 내용 길이가 달라 남는 세로 여백을 위아래로 나눈다. space-between은 제목과 본문을 갈라놓아 부적합.

### 함정
- `npx serve`가 `/card.html?a=b`를 `/card`로 clean-URL 리다이렉트하며 **쿼리스트링을 버린다**. 그래서 card.html은 쿼리와 **해시 파라미터를 모두** 받는다. puppeteer도 해시를 쓴다.
- 별자리·행성 기호(♎☉)는 Chrome에서 이모지로 렌더링된다. 뒤에 U+FE0E를 붙여 텍스트 글리프를 강제한다 (cards.js의 `vs()` 헬퍼).

### 미해결 (사이트 본체 버그, 이번 작업 범위 밖)
`fortune-free.js`가 일간을 `pillars[2]`(월주)에서 읽는 곳이 4군데 있다 — 3203(computeYongShin), 3406, 3688, 3757(renderDaewoon). 3907은 pillars[1]로 올바르게 읽는다. 무료운세의 용신·신강신약·대운 십신이 월간 기준으로 계산되고 있을 가능성이 높다. 인포그래픽 쪽 normalize.js는 pillars[1]로 올바르게 구현했으므로 **사이트 결과와 카드 결과가 다를 수 있다**.

## 2026-07-31 계산 버그 2건 수정

### 1. 일간을 월주에서 읽던 버그 (fortune-free.js)
엔진 `calculateSaju`는 pillars를 **[시,일,월,년]** 순으로 반환한다(`i===1`일 때 stemSipsin을 '本元'으로 박는 것이 근거). 그런데 4곳이 `pillars[2]`(월주)를 일간으로 읽고 있었다.
- computeYongShin / renderBasicFortune / renderSijunseong → `pillars[1]`로 수정
- renderDaewoon의 순행·역행은 일간이 아니라 **년간** 기준이다. 엔진 `getDaewoon`이 `yearStem`으로 판정하므로 `pillars[3]`으로 맞추고 변수명도 yearStem으로 바꿨다.
- 서빙되는 사본 2곳(`app/sajusite/assets/`, `sajusite/assets/`)에 모두 적용. `saju-main/` 사본은 어떤 HTML도 참조하지 않아 건드리지 않았다.
- 검증: 1971-09-22 20:00 남성 → 일간 庚, 신강, 용신 木, 희신 火. 카드와 사이트가 동일.

### 2. 궁합 일주 기준값 오류 (goonghap.html, goonghap-ai.html)
`REF_IDX = 43`(2000-01-01을 丁未로 가정)이 틀렸다. **실제는 戊午 = index 54**로, 60갑자에서 11칸 어긋나 있었다. 두 사람의 오행이 전부 틀리므로 궁합 결과 전체가 잘못 나오던 상태.
- 근거 3중 확인: (1) 엔진이 戊午로 계산, (2) 하루 1칸씩 정확히 증가, (3) 독립 앵커 1900-01-01 甲戌(index 10) + 36524일 = 54.
- 수정 후 궁합 페이지와 엔진의 일주가 모든 표본 날짜에서 일치.

## 2026-07-31 카드 저장/공유 + 궁합 카드

- `js/infographic/share.js` — **외부 CDN 없이** SVG foreignObject에 DOM을 넣고 canvas로 굽는다. html2canvas 같은 라이브러리를 안 쓰는 이유는 Cloudflare Pages 정적 배포에 의존성을 늘리지 않기 위해서.
  - @font-face의 woff2를 fetch해 **base64 data URI로 인라인**해야 SVG 안에서 한글·한자가 렌더된다. 이걸 빼면 전부 기본 폰트로 떨어진다.
  - 교차 출처 스타일시트는 `sheet.cssRules` 접근 시 예외가 나므로 try/catch로 건너뛴다.
  - 공유 버튼은 `navigator.canShare({files})`가 true일 때만 노출(대부분 모바일). 데스크톱은 저장만.
- 궁합 카드는 `card.html`에 상대 정보(`y2,m2,d2...` 또는 sessionStorage `honcheon_goonghap_partner`)가 있을 때만 붙는다. `CARD_DEFS`의 `needs` 필드로 제어.
- 궁합 판정 규칙은 goonghap.html과 동일하게 맞췄다(상생/상극/비화 기본점 + 일지 합충 ±1 + 음양 보정). 단 **일주는 간이 계산이 아니라 엔진 `calculateSaju`로 뽑는다**.

## 2026-07-31 용신 분석 모바일 레이아웃

### 문제
`renderYongsin`의 용신/희신/기신 카드가 `grid-template-columns:repeat(3,1fr)` **고정 3열**이라 390px 화면에서 열 폭이 약 100px로 줄고, 설명 문단이 **한 줄에 2~4글자씩** 끊겨 사실상 읽을 수 없었다. 카드가 세로로 길게 늘어나 보이는 것도 이 때문.

### 해결
fortune-free.js는 스타일시트 없이 인라인 스타일만 쓰던 파일이라, 미디어 쿼리를 쓸 방법이 없었다. 그래서 **레이아웃 속성만 클래스로 분리**하고 섹션 HTML 안에 `<style>`(상수 `YONG_CSS`)을 함께 반환하도록 했다. 색상처럼 값이 동적인 속성은 인라인에 그대로 둔다.
- 640px 이하: `.hc-yong-grid` 1열, `.hc-yong-top`을 flex 가로 배치로 전환해 아이콘·배지·오행·역할이 한 줄에 오고 설명은 전체 폭을 쓴다. 본문 12px -> 14px.
- 같은 섹션의 `일간 강약 | 오행 분포` 2열(`.hc-yong-duo`)도 모바일에서 1열로 내렸다. 오행 라벨과 수치에 `white-space:nowrap`을 줘 "火
화", "2개 ·
25%" 같은 줄바꿈을 막았다.
- `bodyEl.innerHTML`이 매 렌더마다 통째로 교체되므로 `<style>`을 섹션에 포함해도 중복 누적되지 않는다. 전역 주입 코드가 필요 없어 이 방식이 가장 덜 침습적이다.

### 주의
`sajusite/assets/fortune-free.js` 사본은 `yongCard(label, elem, role, desc)`로 **시그니처가 다르고** `getElemName` 대신 `ELEM_KO`를 쓴다. 같은 패치를 그대로 적용할 수 없어 별도로 맞췄다. 두 사본은 이 외에도 계속 갈라지고 있으므로, 언젠가 한쪽으로 정리하는 편이 좋다.
데스크톱(1280px) 렌더는 변경 전후 픽셀 동일함을 확인했다.

## 2026-07-31 결과 화면 가로 넘침 진단

브라우저에서 `scrollWidth > clientWidth`인 요소를 훑어 원인을 특정했다. 375px 뷰포트에서 `#fortune-root`의 scrollWidth가 466px — **페이지 전체가 가로로 넘쳐** 모든 섹션이 잘려 보이던 상태.

| 요소 | 표시 폭 | 실제 폭 | 원인 |
|---|---|---|---|
| 대운 차트 | 293 | **425** | `grid-template-columns:repeat(10,1fr)` 고정 10열 |
| 12운성 | 66/칸 | 108 | 고정 4열 |
| 띠 블록 | 255 | 277 | flex 자식의 기본 `min-width:auto` + 년생 문자열이 안 쪼개짐 |
| 일진 셀 | 35 | 40 | 이모지 폭 |

**대운 차트 하나가 페이지 전체 오버플로의 주범**이다. 이걸 고치기 전까지는 다른 섹션을 아무리 손봐도 화면이 계속 잘린다.

### 이번에 고친 것
- `YONG_CSS` -> `HC_CSS`로 승격해 `bodyEl.innerHTML` 최상단에 1회만 주입한다. 섹션마다 style을 넣던 방식보다 관리가 쉽고, innerHTML 통째 교체라 중복도 없다.
- 띠 블록: flex 자식에 `min-width:0`을 줘야 축소가 시작된다(기본 `min-width:auto`가 min-content로 버팀). 년생 문자열은 `·`로만 이어져 있어 `overflow-wrap:anywhere`가 필요했다.
- `sectionHeader`에 `flex-wrap:wrap` + 모바일에서 부제 `flex-basis:100%;order:3`. '오늘의 운세'는 sectionHeader를 안 쓰고 같은 마크업을 하드코딩해 둔 별도 헤더였어서 따로 맞췄다.

## 2026-07-31 12운성·대운 모바일 레이아웃

- **12운성**: 4열 고정 -> 640px 이하 1열. 카드를 가로로 눕혀 [원형 아이콘][운성명·등급][주·나이대][설명] 순으로 읽히게 했다. 설명이 전체 폭을 쓴다.
- **대운**: 10열 고정 -> 760px 이하에서 칸 폭을 86px로 고정하고 `.hc-dw-scroll`로 가로 스크롤. `scroll-snap-type:x proximity`로 칸에 맞춰 멈춘다. 페이지 전체 가로 넘침(466px)이 이걸로 해소돼 375/375가 됐다.
- 열었을 때 현재 대운이 보이도록 `centerCurrentDaewoon()`이 스크롤 위치를 맞춘다.

### centerCurrentDaewoon에서 겪은 함정 3가지 (같은 실수 반복 금지)
1. **호출 위치**: 처음에 `bodyEl.innerHTML` 대입보다 *앞*에 삽입돼 아무것도 못 찾았다. 대입이 끝나는 `</div>\`;` 뒤에 놓아야 한다.
2. **stale 노드**: `centerCurrentDaewoon(bodyEl)`처럼 노드를 넘기면, 재렌더로 `#gf-body`가 교체됐을 때 분리된 옛 노드를 계속 조회한다. 인자를 없애고 매번 `document`에서 찾도록 했다.
3. **requestAnimationFrame**: rAF는 페이지가 합성되지 않는 상태(배경 탭, 미표시 패널)에서 발화하지 않는다. 디버깅 중 브라우저 패널이 안 보여 콜백이 아예 안 돌았다. `setTimeout(place, 0)`으로 시작하고, 폭이 확정될 때까지 100ms 간격으로 최대 20회 재시도한다(주입 style 반영 + 웹폰트 로드로 폭이 두 번 바뀐다).

### 덤으로 고친 것
`남 + 양년 = 역행` 문구의 '양년'이 **하드코딩**돼 있어 음간 해에도 '양년'으로 표시됐다. `isYang`에 따라 양년/음년을 고르도록 바꾸고 5개 언어 테이블에 '음년'을 추가했다.

## 2026-07-31 자미두수 12궁 · 언어 선택기

### 자미두수 나머지 9궁
2열 고정이라 390px에서 칸이 145px로 줄고, 헤더가 [이모지][이름/설명][간지 배지] flex라 이름 칸이 약 45px밖에 못 받았다. 그 결과 `형/제/궁/(兄/弟/宮)`처럼 **한 글자씩 세로로** 쪼개졌다. 별 이름 `天機天梁`도 마찬가지.
- `.hc-zw-grid`를 640px 이하에서 1열로 내렸다. 칸이 300px가 되어 이름·간지·주성이 모두 한 줄에 들어온다.
- 간지 배지와 주성에 `white-space:nowrap`을 줘 재발을 막았다.
- 이 섹션은 `scrollWidth`가 넘치지 않아 **오버플로 탐지에 걸리지 않는다**. 텍스트가 넘치는 대신 줄바꿈되기 때문. 좁은 칸 문제는 넘침 수치가 아니라 눈으로 확인해야 한다.

### 언어 선택기 (i18n.js) — 별도로 발견한 버그
우하단 고정 언어 선택기가 **흰 배경에 흰 글자**라 통째로 보이지 않았다.
- 원인: `wrap.style.background = "hsl(var(--card, 0 0% 100%))"`. `--card`는 일부 페이지에만 정의돼 있어 /fortune/ 등에서는 폴백값인 흰색이 적용된다. select의 color는 페이지에서 상속된 흰색.
- 어두운 색을 직접 지정하는 방식으로 바꿨다(`rgba(13,16,32,0.92)` 배경 + `#e8dfc8` 글자). CSS 변수 폴백에 기대지 않는다.
- i18n.js는 사본이 5벌인데 HTML이 참조하는 4벌(app/assets, app/sajusite/assets, assets, sajusite/assets)에 적용했다. `saju-main/`은 참조되지 않아 제외.

## 2026-07-31 결과 페이지 카드 임베드

무료운세 결과의 각 섹션 끝에 인포그래픽 카드를 저장 버튼과 함께 끼워 넣었다.
- 사주(신살 뒤): saju, sipsin, luck 3장
- 자미두수 뒤: ziwei, year 2장
- 점성술 뒤: natal 1장
궁합 카드는 상대 정보가 필요하므로 제외. card.html에서는 그대로 7장 모두 나온다.

### shadow DOM을 쓴 이유
cards.css에는 `* { margin:0 }`, `body { ... }` 같은 전역 초기화가 있어 그대로 결과 페이지에 넣으면 본문 레이아웃이 통째로 깨진다. `<iframe>`도 후보였지만 높이 동기화가 필요하고 엔진을 다시 돌려야 해서, **shadow root에 CSS를 통째로 주입하는 방식**을 택했다. 결과 페이지의 body 배경·폰트가 그대로인지 매번 확인할 것.

### 그 과정에서 정리한 것
- `:root` -> `:root, :host` 로 바꿔 문서와 shadow 양쪽에서 변수가 잡히게 했다.
- 전역 초기화를 `.hc-deck, .hc-deck *` 로 한정하고, `body`/`#deck`/`#bar`/`#msg` 같은 페이지 골격 규칙은 card.html 안으로 옮겼다.
- **함정**: 전역 `*` 초기화를 `.hc-deck` 하위로 한정한 뒤 share.js의 PNG가 오른쪽으로 잘렸다. SVG 안에 복제한 카드가 `.hc-deck` 밖에 있어 `box-sizing:border-box`를 못 받았기 때문. 복제본을 `.hc-deck`으로 감싸 해결했다.
- @font-face는 shadow root 안에서 무시될 수 있어 `ensureFonts()`가 문서 head에 구글 폰트 링크를 한 번만 넣는다. 페이지별 HTML 수정이 필요 없다.
- share.js의 `inlinedFontCss()`는 교차출처 시트에서 `cssRules`가 막히므로, 실패하면 `sheet.href`를 fetch해 `@font-face` 블록을 정규식으로 뽑아내는 폴백을 추가했다.
- `cardToBlob(el, {css})` — shadow root 안 카드는 document.styleSheets에 규칙이 없어 호출부가 CSS를 직접 넘긴다.

## 2026-07-31 무료운세 블러 해제

최소 기능을 무료로 제공하기로 해서 결과 화면의 가림 처리를 모두 걷어냈다. 가린 곳은 총 4군데였고 **뒤에 있던 값은 전부 실제 계산 결과**였다(가짜 미리보기가 아님).
- 사주 원국 미니차트: 일주만 선명, 나머지 `blur(5px)`
- 자미두수 미니 명반: 명궁만 선명, 나머지 `blur(5px)`
- 자미두수 나머지 9궁 카드: `opacity:0.55 + blur(0.3px)`
- 점성술 원형 차트: 태양 별자리 외 SVG `filter="url(#blur)"`

블러를 걷으면 "🔒 ○○ 공개 · 나머지는 멤버십에서 확인" 문구가 사실과 달라지므로 3곳 모두 삭제했다. 심층 해석 관련 🔐 배너는 여전히 유효해 그대로 뒀다.

점성술 차트는 블러를 전제로 비태양 요소 색이 `rgba(255,255,255,0.2)` 수준이라 선명하게만 만들면 거의 안 보인다. 별자리 색을 살리되 태양 별자리만 진하게 남기도록 대비를 다시 잡았다. 별자리 기호는 이모지로 렌더링돼 보라색 사각형으로 보여서, 카드에서 쓴 것과 같은 U+FE0E를 붙여 텍스트 글리프로 강제했다.

### 블러에 가려 있던 버그
사주 미니차트의 `displayOrder = [0, 2, 1, 3]`과 `isDay = (idx === 2)`가 틀려 **일주와 월주 열이 서로 바뀌어** 표시되고 있었다. 코드 주석이 `0=시주 1=월주 2=일주`라고 잘못 적혀 있던 게 원인으로, 앞서 고친 `pillars[2]` 일간 버그와 같은 뿌리다. 엔진 순서는 [시,일,월,년]이므로 `[0,1,2,3]` + `idx===1`로 바로잡았다. 블러 때문에 그동안 아무도 확인할 수 없었다.

## 2026-07-31 카드 다국어화

사이트는 `localStorage['honcheon.lang']`로 언어를 관리하고(최초 방문 시 `navigator.languages`로 자동 감지), 선택기를 바꾸면 `honcheon:langchange` 이벤트가 나간다. fortune-free.js가 이걸 받아 `runFortune`을 다시 돌리므로 **카드도 자동으로 다시 그려진다** — 별도 처리 불필요.

### 구조
- `js/infographic/i18n/{ko,en,ja,zh,es}.js` — 언어팩. 필요한 언어만 동적 import.
- `js/infographic/i18n.js` — `getLang()`, `loadPack()`, `pick(pack, path, fallback)`. 값이 없으면 ko로 폴백해 화면이 비지 않는다.
- `interpret-data.js`에는 **언어 무관 상수만** 남겼다(색·기호·격자·판정 계수). 문구는 전부 언어팩.
- `normalize(raw, pack)` / 카드 렌더러는 `data.pack`에서 라벨을 꺼낸다.

### 조회 키는 번역하지 않는다
`SINSAL_META.type`(길신/중성/흉신), `SIPSIN_GROUPS[].key`(비겁/식상…), `typeKey`(신강/신약/중화)는 **코드 상수로 조회하는 키**라 언어팩에서도 한국어 키를 유지해야 한다. 값만 번역한다. 번역 에이전트 3곳이 모두 이 지점을 짚어냈다.

### 한자권 중복 표기
카드가 "이름 + 한자"를 병기하는데 ja/zh는 이름이 곧 한자라 `木 木`, `比劫 比劫`처럼 겹쳤다. 언어팩에 `ui.showHanja` 플래그를 두고 ja/zh만 false로 했다. 오행/용신/궁합 흐름 표기도 이름과 한자가 같으면 하나만 쓰도록 normalize에서 처리한다.

### card.html에는 사이트 i18n.js를 싣지 않는다
`i18n.js`는 `document.body`에 MutationObserver를 걸어 추가되는 텍스트 노드를 자체 사전으로 번역한다. 결과 페이지의 카드는 **shadow DOM 안이라 옵저버가 닿지 않아 안전**하지만, card.html은 카드가 light DOM이라 사전이 카드 문구를 건드릴 수 있다. 그래서 card.html에는 자체 `<select>`를 붙이고 변경 시 다시 그린다.

## 2026-07-31 애드센스 심사 대응

### 가장 큰 문제였던 것
소개 페이지 3종의 본문이 **JS 템플릿 문자열 안에만** 있어서 크롤러가 받는 HTML에는 50자 남짓만 있었다. 3,000자가 넘는 좋은 콘텐츠가 검색과 심사에서 통째로 누락되던 상태.
- `scripts/prerender-about.js`가 한국어 본문을 헤드리스로 렌더링해 `<div id="page-content">`에 정적으로 심는다. `<!--prerendered-->` 표식으로 감싸서 재실행 시 갈아끼운다.
- 원본 JS(`setLang`)가 로드 시 항상 다시 그리므로 다국어 전환은 그대로 동작한다. 정적 삽입분과 JS 렌더 결과가 같아 중복 표시도 없다.
- **소개 페이지 문구를 고치면 이 스크립트를 다시 돌려야 한다.** 안 돌리면 정적 HTML이 옛 내용으로 남는다.

### 약관·개인정보는 이미 있었다
auth.html 모달 안에 5개 언어로 작성돼 있었지만 독립 URL이 없어 크롤러도 심사자도 접근 불가였다. 내용을 정적 페이지로 옮기고 다음을 보강했다.
- 쿠키 및 제3자 광고(Google AdSense) 고지 — 애드센스 승인 요건
- 처리 위탁 업체에 Cloudflare/Google 추가
- 법정 보존 기간(전자상거래법) 명시
- 연락처 이메일 `gamil.com` -> `gmail.com` (gamil.com은 실제 존재하는 타이포스쿼팅 도메인이라 방치하면 문의 메일이 새어나간다)

### robots.txt 설계
로그인·결제 화면은 비로그인 시 빈 화면이라 품질 평가에 불리해 색인에서 뺐다. `/fortune/`와 `/card.html`은 입력값마다 결과가 달라 색인 의미가 없어 제외. 단 **Mediapartners-Google / AdsBot-Google은 반드시 허용**해야 한다 — 막으면 애드센스 심사 자체가 진행되지 않는다.

### 남은 약점
메인(`/`)과 계산기(`/app/`)는 여전히 정적 텍스트가 200자 미만이다. 번들된 JS 앱이라 사전 렌더링이 쉽지 않다. 소개 페이지 3종이 콘텐츠 축을 담당하는 구조로 간다.
