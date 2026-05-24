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
