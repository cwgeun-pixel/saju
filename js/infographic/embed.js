// 무료운세 결과 페이지의 각 섹션 끝에 인포그래픽 카드를 shadow DOM으로 끼워 넣는 모듈
import { normalize } from './normalize.js';
import { loadPack, getLang, pick } from './i18n.js';
import { renderAll } from './cards.js';
import { attachShareButtons } from './share.js';

const CSS_URL = '/js/infographic/cards.css?v=20260731e';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700'
  + '&family=Noto+Serif+TC:wght@600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap';

let cssPromise = null;
function loadCss() {
  // 결과 페이지 스타일을 오염시키지 않으려면 카드 CSS를 shadow root 안에만 넣어야 한다
  if (!cssPromise) cssPromise = fetch(CSS_URL).then((r) => r.text()).catch(() => '');
  return cssPromise;
}

// @font-face는 shadow root 안에서 무시될 수 있어 문서 head에 넣는다.
// 페이지마다 링크를 추가하지 않아도 되도록 여기서 한 번만 보장한다.
function ensureFonts() {
  if (document.getElementById('hc-card-fonts')) return;
  const link = document.createElement('link');
  link.id = 'hc-card-fonts';
  link.rel = 'stylesheet';
  link.href = FONT_URL;
  document.head.appendChild(link);
}

// 카드 폭을 컨테이너에 맞춰 축소한다 (카드는 항상 1080px로 그린다)
function fitScale(host, shadow) {
  const w = host.clientWidth || host.getBoundingClientRect().width;
  if (!w) return;
  shadow.querySelector('.hc-deck')?.style.setProperty('--k', Math.min(1, w / 1080));
}

/**
 * @param {Element} host 카드를 담을 빈 요소
 * @param {object} data normalize() 결과
 * @param {string[]} ids 표시할 카드 id 목록
 * @param {string} title 카드 묶음 위에 붙일 라벨
 */
async function mount(host, data, ids, title) {
  const css = await loadCss();
  const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
  const cards = renderAll(data, ids)
    .replace(/<article class="card"/g, '<div class="card-slot"><article class="card"')
    .replace(/<\/article>/g, '</article></div>');

  shadow.innerHTML = `<style>${css}</style>
    <div class="hc-deck">
      ${title ? `<div class="hc-embed-title">${title}</div>` : ''}
      ${cards}
    </div>`;

  attachShareButtons(shadow, {
    name: data.meta.name, css,
    labels: {
      save: pick(data.pack, 'ui.save'), share: pick(data.pack, 'ui.share'),
      making: pick(data.pack, 'ui.making'), done: pick(data.pack, 'ui.done'), failed: pick(data.pack, 'ui.failed'),
    },
  });
  fitScale(host, shadow);
  return shadow;
}

/**
 * 결과 페이지에 심어둔 자리표시자를 찾아 카드를 채운다.
 * 자리표시자는 data-cards="saju,sipsin,luck" 형태로 표시할 카드를 지정한다.
 * @param {object} raw {saju, ziwei, natalChart, daxian, liunian, input, seyunGanzi, thisYear}
 */
export async function mountSectionCards(raw) {
  const hosts = document.querySelectorAll('[data-cards]:not([data-mounted])');
  if (!hosts.length) return;

  ensureFonts();
  const data = normalize(raw, await loadPack(getLang()));
  const mounted = [];
  for (const host of hosts) {
    host.setAttribute('data-mounted', '1');
    const ids = host.dataset.cards.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      const shadow = await mount(host, data, ids, host.dataset.cardsTitle || '');
      mounted.push([host, shadow]);
    } catch (e) {
      console.error('카드 임베드 실패', e);
      host.removeAttribute('data-mounted');
    }
  }

  // 화면 폭이 바뀌면 축소 배율을 다시 맞춘다
  if (mounted.length && !window.__hcCardResizeBound) {
    window.__hcCardResizeBound = true;
    let timer = null;
    addEventListener('resize', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        for (const el of document.querySelectorAll('[data-cards][data-mounted]')) {
          if (el.shadowRoot) fitScale(el, el.shadowRoot);
        }
      }, 150);
    });
  }
}
