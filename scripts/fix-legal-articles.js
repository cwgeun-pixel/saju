// 약관 조문 번호를 문서 순서대로 1..N으로 다시 매기는 스크립트 (몇 번을 돌려도 결과가 같다)
// 한국어 원문에서 환불 조항을 지우며 5조가 비었던 것을 바로잡기 위해 만들었다.
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '..', 'js', 'legal');

const CN = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十', 11: '十一' };
const STYLES = {
  en: { re: /Article\s+(\d+)/g, make: (n) => 'Article ' + n },
  es: { re: /Artículo\s+(\d+)/g, make: (n) => 'Artículo ' + n },
  ja: { re: /第(\d+)条/g, make: (n) => '第' + n + '条' },
  zh: { re: /第([一二三四五六七八九十]+)條/g, make: (n) => '第' + CN[n] + '條' },
};

// 본문 안 상호참조가 가리켜야 할 조문 (약관 변경 조항)
const CROSS_REF_TARGET = 9;

function renumber(src, style) {
  let headingCount = 0;
  const re = new RegExp(style.re.source, 'g');
  return src.replace(re, (match, _num, offset) => {
    // 이 표기가 <h2> 안에 있는지 (직전 구간에 <h2>가 </h2>보다 뒤에 있으면 제목)
    const before = src.slice(Math.max(0, offset - 60), offset);
    const isHeading = before.lastIndexOf('<h2') > before.lastIndexOf('</h2>');
    if (isHeading) {
      headingCount += 1;
      return style.make(headingCount);
    }
    return style.make(CROSS_REF_TARGET);
  });
}

for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.js')) continue;
  const lang = f.replace('.js', '');
  const style = STYLES[lang];
  if (!style) { console.log(f, '— 표기 규칙 없음, 건너뜀'); continue; }

  const p = path.join(DIR, f);
  const src = fs.readFileSync(p, 'utf-8');
  const out = renumber(src, style);
  if (out !== src) fs.writeFileSync(p, out, 'utf-8');

  const nums = [];
  let m;
  const check = new RegExp(style.re.source, 'g');
  while ((m = check.exec(out)) !== null) nums.push(m[1]);
  console.log(`${f}: ${out === src ? '변경 없음' : '재번호'} → ${nums.join(' ')}`);
}
