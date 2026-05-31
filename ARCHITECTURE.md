# 사주사이트 구조 문서 (2026-05-31 기준)

## 복원 방법
이 상태로 돌아오려면:
```bash
git checkout working-2026-05-31
git push origin HEAD:main --force
```

---

## 핵심 파일 맵 (어떤 파일이 실제 서빙되는가)

| URL | 실제 파일 |
|-----|----------|
| `saju0523.pages.dev/` | `./index.html` |
| `saju0523.pages.dev/app/` | `./app/index.html` |
| `saju0523.pages.dev/fortune/` | `./fortune/index.html` |
| 계산기 JS | `./app/assets/index-B0lRK9V6.js` |
| 무료운세 JS | `./app/sajusite/assets/fortune-free.js` |
| 번역 (i18n) | `./app/assets/i18n.js` |

**주의:** `app/sajusite/assets/`, `sajusite/assets/`, `saju-main/` 3군데에 중복 파일이 있지만,
`fortune/index.html`은 `<base href="/app/">` 때문에 항상 `app/sajusite/assets/fortune-free.js`를 로드한다.

---

## 무료운세 흐름 (fortune-free.js)

```
/app/ (계산기 폼)
  ↓ Calculate 클릭
  fortune-free.js click listener (capture phase)
    → captureMainFormInput() 실행
    → sessionStorage.setItem('honcheon_last_input', {...})
    → window.location.href = '/fortune/'
  ↓
/fortune/ 페이지 로드
  → tryAutoRun() 실행
  → sessionStorage.getItem('honcheon_last_input') 읽어서
  → runFortune(input) 실행
  → 결과 렌더링
```

### captureMainFormInput() 핵심 로직
Radix Select combobox 버튼을 **위치(인덱스) 기준**으로 읽는다.
```js
vals[yearIdx]     = year  (4자리 숫자로 찾음)
vals[yearIdx+1]   = month
vals[yearIdx+2]   = day
vals[yearIdx+3]   = hour  (unknownTime=false일 때)
vals[yearIdx+4]   = minute
```
**❌ 과거 버그:** regex else-if 체인으로 읽다가 "15"가 월 regex에 걸려 day를 못 읽음 → 항상 null 리턴

---

## 번역 시스템 (fortune-free.js 내부)

### 구조
```js
// fortune-free.js 안에 두 개의 별도 번역 블록이 있다

// 1. 127~1502줄: PALACE_INFO 등 자미두수 궁 이름용 별도 블록 (t()가 읽지 않음!)
const PALACE_LABELS = { ko: {...}, en: {...}, ... }

// 2. 1503줄~: TX 객체 — t() 함수가 실제로 읽는 곳
const TX = {
  ko: { ... },  // 1504줄~
  en: { ... },  // 1799줄~  ← 번역 추가는 여기!
  ja: { ... },  // 2158줄~  ← 번역 추가는 여기!
  zh: { ... },  // 2452줄~  ← 번역 추가는 여기!
  es: { ... },  // 2748줄~  ← 번역 추가는 여기!
}

// t() 함수 (3065줄)
function t(key) {
  const l = gLang();
  const table = TX[l] || {};
  return table[key] ?? TX.ko?.[key] ?? key;
}
```

### ❌ 반복된 실수
번역 키를 **127줄의 잘못된 블록**에 추가했다. `t()`는 이 블록을 읽지 않아서 번역이 적용 안 됨.
**반드시 1799줄 이후 TX.en 블록에 추가해야 한다.**

---

## ASTRO_PREMIUM_ITEMS
```js
// ❌ 과거 버그: const로 선언하면 모듈 로드 시점에 t()가 실행됨
// → 언어 설정 전이라 번역이 안 됨
const ASTRO_PREMIUM_ITEMS = [ {title: t('네이탈 차트 완전 해석'), ...} ]  // 버그

// ✅ 현재: 함수로 선언해서 렌더 시점에 t() 실행
function getAstroPremiumItems() { return [ {title: t('네이탈 차트 완전 해석'), ...} ] }
```

---

## 계산기 폼 (app/assets/index-B0lRK9V6.js)

### 도시 목록
- 나라별 헤더 (`h:true`)와 실제 도시 혼합
- `h:true` 항목은 선택 불가한 div로 렌더링
- 기본 선택값: Seoul (index 42)
- 도시 선택 시 `Tu[m]?.lat`, `Tu[m]?.lon` null 안전 처리 적용

### 드롭다운 라벨
- YEAR / MONTH / DAY / HOUR / MINUTE 라벨 추가됨
- 년/월/일/시/분 단위 제거 (숫자만 표시)

---

## Cloudflare 배포
- git push → 자동 배포 (1~2분 소요)
- 캐시 강제 갱신: `fortune/index.html`과 `app/index.html`의 `?v=YYYYMMDD` 버전 올리기
- 현재 버전: `?v=20260531b`

---

## 주요 버그 수정 이력

| 날짜 | 버그 | 수정 |
|------|------|------|
| 2026-05-31 | 무료운세 항상 폴백 폼 표시 | captureMainFormInput을 regex→position 기반으로 재작성 |
| 2026-05-31 | 번역 안 됨 | TX 객체(1503줄~)가 아닌 127줄 블록에 번역 추가하는 실수 수정 |
| 2026-05-31 | EN 번역 문자열 오류 | `star's` apostrophe가 single quote 깨뜨림 → 제거 |
| 2026-05-31 | ASTRO_PREMIUM_ITEMS 번역 안 됨 | const→function으로 변경 (지연 평가) |
| 2026-05-31 | fortune-free.js 올바른 파일 수정 | `app/sajusite/assets/`가 실제 서빙되는 파일 |
