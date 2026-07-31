// 카드 DOM을 외부 라이브러리 없이 PNG로 굽고 저장·공유하는 모듈 (SVG foreignObject + canvas)

// 웹폰트를 data URI로 인라인해야 SVG 안에서 한글·한자가 시스템 폰트로 떨어지지 않는다
let fontCssPromise = null;

async function inlineOneFace(cssText) {
  const url = cssText.match(/url\(["']?([^"')]+)["']?\)/);
  if (!url) return null;
  try {
    const buf = await (await fetch(url[1])).arrayBuffer();
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return cssText.replace(url[0], `url(data:font/woff2;base64,${btoa(bin)})`);
  } catch {
    return null; // 개별 폰트 실패는 무시하고 나머지로 진행
  }
}

async function inlinedFontCss() {
  if (fontCssPromise) return fontCssPromise;
  fontCssPromise = (async () => {
    const faceTexts = [];
    for (const sheet of document.styleSheets) {
      let rules = null;
      try { rules = sheet.cssRules; } catch { rules = null; }
      if (rules) {
        for (const rule of rules) {
          if (rule.constructor.name === 'CSSFontFaceRule') faceTexts.push(rule.cssText);
        }
        continue;
      }
      // 교차 출처라 cssRules를 못 읽는 경우(구글 폰트 등)는 직접 받아서 파싱한다
      if (!sheet.href) continue;
      try {
        const text = await (await fetch(sheet.href)).text();
        faceTexts.push(...(text.match(/@font-face\s*{[^}]*}/g) || []));
      } catch { /* 접근 불가한 시트는 건너뛴다 */ }
    }
    const inlined = await Promise.all(faceTexts.map(inlineOneFace));
    return inlined.filter(Boolean).join('\n');
  })();
  return fontCssPromise;
}

// 카드를 그리는 데 필요한 CSS 규칙을 모은다.
// shadow root 안의 카드는 문서 스타일시트에 규칙이 없으므로 호출부가 css를 직접 넘긴다.
function collectCss(root) {
  const sheets = root && root.styleSheets && root.styleSheets.length
    ? root.styleSheets
    : document.styleSheets;
  const out = [];
  for (const sheet of sheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    if (!rules) continue;
    for (const rule of rules) {
      if (rule.constructor.name === 'CSSFontFaceRule') continue; // 폰트는 별도로 인라인
      out.push(rule.cssText);
    }
  }
  return out.join('\n');
}

/**
 * 카드 요소를 1080×1920 PNG Blob으로 굽는다.
 * @param {Element} cardEl
 * @param {{css?: string, root?: Document|ShadowRoot}} [opts] css를 주면 그대로 쓰고, 없으면 root에서 모은다.
 */
export async function cardToBlob(cardEl, opts = {}) {
  const W = 1080, H = 1920;
  const scale = 1;
  const fontCss = await inlinedFontCss();
  const css = opts.css != null ? opts.css : collectCss(opts.root || cardEl.getRootNode());

  const clone = cardEl.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.position = 'static';
  clone.style.margin = '0';

  // cards.css의 초기화(box-sizing 등)가 .hc-deck 하위로 한정돼 있으므로
  // 복제본도 반드시 .hc-deck 안에 넣어야 원본과 같은 폭으로 그려진다.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<foreignObject width="100%" height="100%">
<div xmlns="http://www.w3.org/1999/xhtml">
<style>${fontCss}\n${css}</style>
<div class="hc-deck" style="--k:1;display:block">
${new XMLSerializer().serializeToString(clone)}
</div>
</div>
</foreignObject></svg>`;

  const img = new Image();
  img.decoding = 'sync';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('카드 이미지를 만들지 못했습니다.'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });

  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#14171f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return new Promise((res) => canvas.toBlob(res, 'image/png'));
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * 카드에 저장/공유 버튼을 붙인다.
 * 공유 API를 지원하는 기기(대부분의 모바일)면 공유 시트를, 아니면 저장만 노출한다.
 */
export function attachShareButtons(root, { name = '운세', css = null } = {}) {
  const canShare = typeof navigator.canShare === 'function'
    && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] });

  for (const slot of root.querySelectorAll('.card-slot')) {
    const card = slot.querySelector('.card');
    const label = card.dataset.card;
    const bar = document.createElement('div');
    bar.className = 'card-actions';
    bar.innerHTML = `
      <button type="button" data-act="save">이미지 저장</button>
      ${canShare ? '<button type="button" data-act="share">공유</button>' : ''}`;
    slot.after(bar);

    bar.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn || btn.disabled) return;
      const act = btn.dataset.act;
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = '만드는 중…';
      try {
        const blob = await cardToBlob(card, { css });
        if (!blob) throw new Error('이미지 변환에 실패했습니다.');
        const filename = `${name}_${label}.png`;
        if (act === 'share') {
          const file = new File([blob], filename, { type: 'image/png' });
          await navigator.share({ files: [file], title: `${name}의 운세 카드` });
        } else {
          download(blob, filename);
        }
        btn.textContent = '완료';
      } catch (err) {
        if (err && err.name === 'AbortError') {
          btn.textContent = original; // 사용자가 공유 시트를 닫은 경우
          btn.disabled = false;
          return;
        }
        console.error(err);
        btn.textContent = '실패';
      }
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1600);
    });
  }
}
