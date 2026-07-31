// 카드에 쓰이는 언어 무관 상수 모음 (색·기호·격자 위치 등). 표시 문구는 i18n/ 언어팩이 담당한다.

// ── 오행 ─────────────────────────────────────
export const ELEMENT_COLORS = {
  목: '#2E9E6B', 화: '#D64545', 토: '#D9A441', 금: '#C9CDD2', 수: '#1F3A5F',
};
export const ELEMENT_HANJA = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };
export const ELEMENT_KEYS = ['목', '화', '토', '금', '수'];
export const STEM_ELEM = {
  甲: '목', 乙: '목', 丙: '화', 丁: '화', 戊: '토',
  己: '토', 庚: '금', 辛: '금', 壬: '수', 癸: '수',
};
export const BRANCH_ELEM = {
  子: '수', 丑: '토', 寅: '목', 卯: '목', 辰: '토', 巳: '화',
  午: '화', 未: '토', 申: '금', 酉: '금', 戌: '토', 亥: '수',
};
export const YANG_STEMS = '甲丙戊庚壬';

// ── 십신 5분류 (구성만; 라벨·설명은 언어팩) ────
export const SIPSIN_GROUPS = [
  { key: '비겁', hanja: '比劫', members: ['比肩', '劫財', '本元'], color: '#2E9E6B' },
  { key: '식상', hanja: '食傷', members: ['食神', '傷官'], color: '#D64545' },
  { key: '재성', hanja: '財星', members: ['偏財', '正財'], color: '#D9A441' },
  { key: '관성', hanja: '官星', members: ['偏官', '正官'], color: '#8B7BC7' },
  { key: '인성', hanja: '印星', members: ['偏印', '正印'], color: '#4A90D9' },
];

// ── 신살 (엔진 specialSals 키 → 한자·분류) ─────
export const SINSAL_META = {
  cheonul: { hanja: '天乙貴人', type: '길신' },
  munchang: { hanja: '文昌貴人', type: '길신' },
  cheonduk: { hanja: '天德貴人', type: '길신' },
  wolduk: { hanja: '月德貴人', type: '길신' },
  geumyeo: { hanja: '金輿祿', type: '길신' },
  yangin: { hanja: '羊刃殺', type: '중성' },
  goegang: { hanja: '魁罡殺', type: '중성' },
  dohwa: { hanja: '桃花殺', type: '중성' },
  hongyeom: { hanja: '紅艶殺', type: '중성' },
  baekho: { hanja: '白虎殺', type: '흉신' },
};
export const SINSAL_TYPE_COLOR = { 길신: '#2E9E6B', 중성: '#D9A441', 흉신: '#D64545' };
export const SINSAL_TYPE_ORDER = ['길신', '중성', '흉신'];

// ── 자미두수 ──────────────────────────────────
// 명반 4×4 격자에서 지지별 고정 위치 (row, col)
export const BRANCH_GRID = {
  巳: [0, 0], 午: [0, 1], 未: [0, 2], 申: [0, 3],
  辰: [1, 0], 酉: [1, 3],
  卯: [2, 0], 戌: [2, 3],
  寅: [3, 0], 丑: [3, 1], 子: [3, 2], 亥: [3, 3],
};
export const SIHUA_COLORS = { 化祿: '#2E9E6B', 化權: '#D9A441', 化科: '#4A90D9', 化忌: '#D64545' };
export const MAIN_STAR_KEYS = [
  '紫微', '天機', '太陽', '武曲', '天同', '廉貞', '天府',
  '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍',
];

// ── 점성술 ────────────────────────────────────
export const SIGN_KEYS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
export const SIGN_SYMBOL = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};
// 4원소 색
export const SIGN_COLOR = {
  Aries: '#D64545', Leo: '#D64545', Sagittarius: '#D64545',
  Taurus: '#D9A441', Virgo: '#D9A441', Capricorn: '#D9A441',
  Gemini: '#C9CDD2', Libra: '#C9CDD2', Aquarius: '#C9CDD2',
  Cancer: '#4A90D9', Scorpio: '#4A90D9', Pisces: '#4A90D9',
};
export const PLANET_SYMBOL = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄',
  Uranus: '♅', Neptune: '♆', Pluto: '♇', Chiron: '⚷', NorthNode: '☊', SouthNode: '☋', Fortuna: '⊗',
};
// 카드에 싣는 주요 행성 (교점·소행성은 제외)
export const MAJOR_PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
];
export const ASPECT_META = {
  conjunction: { sym: '☌', color: '#D9A441' },
  trine: { sym: '△', color: '#2E9E6B' },
  sextile: { sym: '✶', color: '#2E9E6B' },
  square: { sym: '□', color: '#D64545' },
  opposition: { sym: '☍', color: '#D64545' },
};

// ── 궁합 (goonghap.html의 판정 규칙과 동일하게 유지) ──
export const OHAENG_GEN = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
export const OHAENG_CTRL = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };
export const BRANCH_IDX = { 子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5, 午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11 };
export const YUKHAP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
export const SAMHAP = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];
export const STEM_REL_BASE = { SAME: 3, A_GEN_B: 4, B_GEN_A: 4, A_CTRL_B: 2, B_CTRL_A: 2 };
export const STEM_REL_SYMBOL = { SAME: '≡', A_GEN_B: '→', B_GEN_A: '←', A_CTRL_B: '⊃', B_CTRL_A: '⊂' };
export const BRANCH_REL_COLOR = { HEX: '#2E9E6B', TRIO: '#2E9E6B', CLASH: '#D64545', NEUTRAL: '#C9CDD2' };
// 영역별 기본 점수 [감정, 소통, 안정]
export const GOONGHAP_AREA_BASE = {
  SAME: [3, 4, 4], A_GEN_B: [4, 3, 3], B_GEN_A: [4, 3, 4],
  A_CTRL_B: [2, 2, 2], B_CTRL_A: [2, 2, 2],
};
export const GOONGHAP_AREA_COLOR = { emotion: '#D64545', comm: '#4A90D9', stability: '#2E9E6B' };
