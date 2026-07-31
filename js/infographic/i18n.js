// 카드 문구의 언어팩을 골라 불러오는 로더 (사이트의 honcheon.lang 설정을 그대로 따른다)
import ko from './i18n/ko.js';

const SUPPORTED = ['ko', 'en', 'ja', 'zh', 'es'];
const packs = { ko };

export function getLang() {
  try {
    const l = localStorage.getItem('honcheon.lang') || 'ko';
    return SUPPORTED.includes(l) ? l : 'ko';
  } catch {
    return 'ko';
  }
}

/** 현재 언어팩을 불러온다. 실패하면 한국어로 떨어진다. */
export async function loadPack(lang = getLang()) {
  if (packs[lang]) return packs[lang];
  try {
    const mod = await import(`./i18n/${lang}.js`);
    packs[lang] = mod.default;
  } catch {
    packs[lang] = ko; // 언어팩이 없거나 깨졌으면 한국어로
  }
  return packs[lang];
}

/**
 * 언어팩에서 값을 꺼낸다. 없으면 한국어 값, 그것도 없으면 fallback.
 * @param {object} pack loadPack()의 결과
 * @param {string} path 'daymaster.甲.title' 형태의 경로
 */
export function pick(pack, path, fallback = '') {
  const walk = (obj) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const v = walk(pack);
  if (v != null) return v;
  const k = walk(ko);
  return k != null ? k : fallback;
}
