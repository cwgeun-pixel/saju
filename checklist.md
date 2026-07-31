# 작업 체크리스트

- [x] 기존 HonCheon 웹 산출물과 계산 번들 위치 확인
- [x] HonCheon 웹 산출물을 현재 작업 폴더로 복사
- [x] 깨진 한글 메타데이터 복구
- [x] 로컬 정적 서버로 실행 확인
- [x] 계산 화면 기본 진입 확인
- [x] 자미두수 결과에 한자, 사화, 대한, 유년 자료 확장
- [x] 점성술 결과에 행성 표, 앵글, 하우스, 주요 각 자료 확장
- [x] 확장된 결과 화면 로컬 검증
- [x] 자미두수 결과의 한글 표기를 한자로 통일
- [x] 자미두수 한자 결과 색상 표시 검증
- [ ] 자미두수와 점성술 상세 계산값의 출처 검증
- [ ] 원본 HonCheon 패키지에 정확한 상세 계산식 존재 여부 확인
- [ ] 부정확한 추정 계산 항목 정리

## 2026-05-12 검증 추가.

- [x] 자미두수와 점성술 상세 계산값의 출처 검증.
- [x] 원본 HonCheon Windows 패키지 안의 정확한 상세 계산 모듈 존재 여부 확인.
- [x] 부정확한 추정 계산 항목 정리.
- [ ] 화면 계산을 @orrery/core의 createChart, calculateLiunian, getDaxianList, calculateNatal로 교체.


## 2026-05-12 원본 계산 연결.

- [x] @orrery/core dist 파일을 정적 assets로 추출.
- [x] 자미두수 계산을 createChart, calculateLiunian, getDaxianList로 교체.
- [x] 점성술 계산을 calculateNatal, Placidus 하우스 시스템으로 교체.
- [x] 자미두수 명반, 사화, 대限, 流年 색상 표시 확인.
- [x] 점성술 Planets, Angles, Houses, Major Aspects 표시 확인.
- [x] 브라우저 콘솔 오류 없음 확인.


## 2026-05-12 자미두수 대한 표시 보정.

- [x] 대한 표를 첨부 이미지처럼 오른쪽 어린 운, 왼쪽 노년 운의 역방향 시각 배치로 변경.
- [x] 대한 현재 구간을 명궁이 아니라 현재 유년의 daxianAgeStart, daxianAgeEnd 기준으로 강조.
- [x] 대한 천간과 지지를 분리한 색상 박스로 표시.
- [x] 유년 월운에 본명 궁의 주요 별을 함께 표시.
- [x] 브라우저에서 자미두수 대限, 流年四化, 流月 표시와 콘솔 오류 없음 확인.


## 2026-05-12 다국어 UI.

- [ ] 브라우저 언어 자동 감지 추가.
- [ ] 한국어, 영어, 일본어, 중국어, 스페인어 UI 번역 레이어 추가.
- [ ] 사용자가 직접 언어를 바꿀 수 있는 선택기 추가.
- [ ] 브라우저에서 5개 언어 전환 검증.


- [x] 브라우저 언어 자동 감지 추가.
- [x] 한국어, 영어, 일본어, 중국어, 스페인어 UI 번역 레이어 추가.
- [x] 사용자가 직접 언어를 바꿀 수 있는 선택기 추가.
- [x] 브라우저에서 5개 언어 전환 검증.
- [x] 결과 화면의 주요 탭과 섹션 제목 번역 검증.


## 2026-05-12 AI 해석 기능.

- [x] /api/interpret 서버 엔드포인트 추가.
- [x] OPENAI_API_KEY를 서버에서만 사용하도록 구현.
- [x] 계산 결과 화면에 섹션별 AI 해석 패널 추가.
- [x] 기본 성향, 사주, 자미두수, 점성술, 연애, 직업/재물, 올해 운세, 종합 섹션 추가.
- [x] 해석 언어와 깊이 선택 기능 추가.
- [x] API 키 미설정 안내와 브라우저 패널 렌더링 검증.

## 2026-05-13 .env.local API 설정.

- [x] .env.local 파일 생성.
- [x] OPENAI_API_KEY는 채팅에 노출하지 않고 PowerShell에서 입력하기로 결정.
- [ ] 사용자가 실제 OPENAI_API_KEY를 .env.local에 입력.
- [ ] 서버 재시작 후 OPENAI_API_KEY loaded 로그 확인.
## 2026-05-13 AI 해석 로딩 멈춤 수정.

- [x] 짧은 /api/interpret 요청이 200으로 응답하는지 확인.
- [ ] 실제 요청이 오래 걸리지 않도록 서버 입력 길이와 추론 강도 조정.
- [ ] 요청 시작/완료 로그 추가.
- [ ] 서버 재시작 후 API 응답 확인.
- [x] 실제 요청이 오래 걸리지 않도록 서버 입력 길이와 추론 강도 조정.
- [x] 요청 시작/완료 로그 추가.
- [x] 서버 재시작 후 API 응답 확인.

## 2026-07-31 사주 인포그래픽 파이프라인 1단계.

- [x] scripts/infographic/normalize.py — complete_sample.json → 고정 스키마 infographic.json 변환 + 길이 검증.
- [x] scripts/infographic/template.html — 1080×1920 세로형, 오행 팔레트, 7블록 레이아웃.
- [x] scripts/infographic/render.js — puppeteer-core + 로컬 Chrome 스크린샷.
- [x] 홍길동 샘플 PNG 1장 산출 및 육안 검증.

## 2026-07-31 인포그래픽 자미두수·점성술 확장.

- [x] normalize.py 3영역 확장 — infographic_saju/ziwei/natal.json 산출.
- [x] template_ziwei.html — 12궁 명반 4×4 격자(지지 고정 위치) + 사화 + 대한 타임라인.
- [x] template_natal.html — 빅3(태양·달·상승) + 행성 배치 + 어스펙트 + 영역 카드.
- [x] render.js 템플릿 인자화. 3종 PNG 산출 및 육안 검증.

## 2026-07-31 인포그래픽 실제 데이터 연동 + 카드 6종.

- [x] 실제 계산 엔진(orrery-core) 런타임 반환 구조 확인 (진단 페이지로 덤프).
- [x] js/infographic/interpret-data.js — 고정 해석 카피 테이블 (LLM 미사용).
- [x] js/infographic/normalize.js — 엔진 실제 필드 기준 카드 6종 데이터 변환.
- [x] js/infographic/cards.js + cards.css — 1080x1920 고정 레이아웃 + scale 축소 모바일 대응.
- [x] card.html — sessionStorage/해시 파라미터로 입력 받아 엔진 호출 후 카드 렌더.
- [x] fortune/index.html 네비게이션에 "카드로 보기" 진입점 추가.
- [x] render.js — card.html을 열어 카드별 PNG 배치 산출.
- [x] 모바일 390px 및 PNG 1080x1920 양쪽 검증.
- [x] fortune-free.js 일간 인덱스 버그 수정 — pillars[2]를 일간으로 읽는 4곳.

## 2026-07-31 버그 수정 + 카드 저장/공유 + 궁합 카드.

- [x] fortune-free.js 일간 인덱스 버그 수정 (서빙 사본 2곳).
- [x] goonghap.html / goonghap-ai.html 일주 기준값(REF_IDX) 오류 수정.
- [x] js/infographic/share.js — 외부 라이브러리 없이 카드 PNG 저장·공유.
- [x] 궁합 카드 추가 (일주 오행 관계 + 영역별 점수 + 일지 합충).
- [x] goonghap.html에 "카드로 보기" 진입점 추가.
- [x] 사이트 결과와 카드 결과 값 일치 검증 (일간·용신·궁합 전 항목).
