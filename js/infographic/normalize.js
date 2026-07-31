// orrery-core 엔진의 실제 반환 객체를 인포그래픽 카드 데이터로 변환하는 모듈
// 표시 문구는 모두 언어팩(pack)에서 가져오므로 여기에는 한국어를 직접 쓰지 않는다.
import {
  ELEMENT_COLORS, ELEMENT_HANJA, ELEMENT_KEYS, STEM_ELEM, BRANCH_ELEM, YANG_STEMS,
  SIPSIN_GROUPS, SINSAL_META, SINSAL_TYPE_COLOR, SINSAL_TYPE_ORDER,
  BRANCH_GRID, SIHUA_COLORS, MAIN_STAR_KEYS,
  SIGN_SYMBOL, SIGN_COLOR, PLANET_SYMBOL, MAJOR_PLANETS, ASPECT_META,
  OHAENG_GEN, OHAENG_CTRL, BRANCH_IDX, YUKHAP, SAMHAP,
  STEM_REL_BASE, STEM_REL_SYMBOL, BRANCH_REL_COLOR, GOONGHAP_AREA_BASE, GOONGHAP_AREA_COLOR,
} from './interpret-data.js';
import { pick } from './i18n.js';

// 엔진의 pillars 배열은 [시주, 일주, 월주, 년주] 순서다. 일간은 pillars[1].
const IDX = { hour: 0, day: 1, month: 2, year: 3 };

const cut = (s, n) => {
  s = (s || '').trim();
  if (s.length <= n) return s;
  const head = s.slice(0, n);
  const dot = head.lastIndexOf('. ');
  return dot >= n / 2 ? head.slice(0, dot + 1) : head.slice(0, n - 1).trimEnd() + '…';
};

const pctOf = (v, total) => (total ? Math.round((v / total) * 100) : 0);

// ── 카드 1: 사주 원국 ──────────────────────────
function cardSaju(saju, P) {
  const el = (k) => pick(P, `element.${k}`, k);
  const labels = pick(P, 'ui.pillars', []);

  const pillars = saju.pillars.map((p, i) => ({
    label: labels[i] || '',
    gan: p.pillar.stem,
    ji: p.pillar.branch,
    ganColor: ELEMENT_COLORS[STEM_ELEM[p.pillar.stem]],
    jiColor: ELEMENT_COLORS[BRANCH_ELEM[p.pillar.branch]],
    sipsinTop: pick(P, `sipsin.${p.stemSipsin}`, p.stemSipsin),
    sipsinBot: pick(P, `sipsin.${p.branchSipsin}`, p.branchSipsin),
    unseong: pick(P, `unseong.${p.unseong}`, p.unseong),
  }));

  // 오행: 천간 4 + 지지 4 = 8점
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of saju.pillars) {
    counts[STEM_ELEM[p.pillar.stem]]++;
    counts[BRANCH_ELEM[p.pillar.branch]]++;
  }
  const values = Object.values(counts);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const elements = ELEMENT_KEYS.map((k) => {
    // markKey는 스타일 분기용(언어 무관), mark는 표시용
    const markKey = counts[k] === maxV && maxV > 0 ? 'over' : counts[k] === minV ? 'under' : '';
    const name = el(k);
    const hanja = ELEMENT_HANJA[k];
    return {
      kor: name, hanja,
      // 중국어·일본어는 오행 이름이 한자 그 자체라 "木 木"처럼 겹친다
      label: name === hanja ? hanja : `${hanja} ${name}`,
      count: counts[k], pct: pctOf(counts[k], 8),
      color: ELEMENT_COLORS[k], markKey,
      mark: markKey ? pick(P, `ui.${markKey}`) : '',
    };
  });

  // 일간과 신강/신약 (일간 = pillars[1], 엔진 기준)
  const dayStem = saju.pillars[IDX.day].pillar.stem;
  const dayElem = STEM_ELEM[dayStem];
  const GENERATED_BY = { 화: '목', 토: '화', 금: '토', 수: '금', 목: '수' };
  const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
  // 임계값은 사이트 무료운세(fortune-free.js computeYongShin)와 동일하게 맞춘다
  const support = counts[dayElem] + counts[GENERATED_BY[dayElem]];
  const isStrong = support >= 4;
  const isWeak = support <= 2;
  const yongKey = isStrong ? OHAENG_CTRL[dayElem] : GENERATED_BY[dayElem];
  const heeKey = isStrong ? GENERATES[OHAENG_CTRL[dayElem]] : dayElem;
  const giKey = isStrong ? GENERATED_BY[dayElem] : OHAENG_CTRL[dayElem];

  const tplName = isStrong ? 'strengthStrong' : isWeak ? 'strengthWeak' : 'strengthEven';
  const typeKey = isStrong ? '신강' : isWeak ? '신약' : '중화';
  const yongLabel = el(yongKey) === ELEMENT_HANJA[yongKey]
    ? ELEMENT_HANJA[yongKey] : `${ELEMENT_HANJA[yongKey]}(${el(yongKey)})`;

  const strength = {
    typeKey,
    type: pick(P, `tpl.strengthType.${typeKey}`, typeKey),
    gauge: Math.max(8, Math.min(92, (support / 8) * 100)),
    yongKey, heeKey, giKey,
    yong: el(yongKey), hee: el(heeKey), gi: el(giKey),
    desc: pick(P, `tpl.${tplName}`)(yongLabel),
  };

  const dmTitle = pick(P, `daymaster.${dayStem}.title`, '');
  const over = elements.find((e) => e.markKey === 'over');
  const lack = elements.find((e) => e.markKey === 'under');

  return {
    pillars,
    elements,
    strength,
    elementLine: over && lack
      ? pick(P, 'tpl.elementLine')(over.label, over.count, lack.label, lack.count)
      : '',
    dayMaster: {
      char: dayStem + ELEMENT_HANJA[dayElem],
      stem: dayStem,
      element: el(dayElem),
      color: ELEMENT_COLORS[dayElem],
      title: dmTitle,
      desc: cut(pick(P, `daymaster.${dayStem}.desc`, ''), 90),
    },
  };
}

// ── 카드 2: 십신·신살 ──────────────────────────
function cardSipsin(saju, P) {
  const tally = {};
  for (const p of saju.pillars) {
    tally[p.stemSipsin] = (tally[p.stemSipsin] || 0) + 1;
    tally[p.branchSipsin] = (tally[p.branchSipsin] || 0) + 1;
  }
  const groups = SIPSIN_GROUPS.map((g) => ({
    ...g,
    label: pick(P, `sipsinGroup.${g.key}.label`, g.key),
    desc: pick(P, `sipsinGroup.${g.key}.desc`, ''),
    count: g.members.reduce((a, m) => a + (tally[m] || 0), 0),
  }));
  const totalG = groups.reduce((a, g) => a + g.count, 0) || 1;
  const maxG = Math.max(...groups.map((g) => g.count));
  const bars = groups.map((g) => ({
    label: g.label, hanja: g.hanja, color: g.color, count: g.count,
    pct: pctOf(g.count, totalG), strongest: g.count === maxG,
  }));
  const top = groups.find((g) => g.count === maxG);

  // 신살: specialSals는 인덱스 배열 또는 불리언
  const labels = pick(P, 'ui.pillars', []);
  const sals = [];
  for (const [key, meta] of Object.entries(SINSAL_META)) {
    const v = saju.specialSals?.[key];
    const has = Array.isArray(v) ? v.length > 0 : Boolean(v);
    if (!has) continue;
    sals.push({
      name: pick(P, `sinsal.${key}.name`, key),
      desc: pick(P, `sinsal.${key}.desc`, ''),
      type: pick(P, `sinsalType.${meta.type}`, meta.type),
      typeKey: meta.type,
      hanja: meta.hanja,
      where: Array.isArray(v) ? v.map((i) => labels[i] || '').filter(Boolean).join('·') : '',
      color: SINSAL_TYPE_COLOR[meta.type],
    });
  }
  sals.sort((a, b) => SINSAL_TYPE_ORDER.indexOf(a.typeKey) - SINSAL_TYPE_ORDER.indexOf(b.typeKey));

  const unseong = saju.pillars.map((p, i) => ({
    label: labels[i] || '',
    ko: pick(P, `unseong.${p.unseong}`, p.unseong),
    hanja: p.unseong,
  }));

  return {
    bars,
    topLine: top ? pick(P, 'tpl.sipsinTop')(top.label, top.count, top.desc) : '',
    sals,
    unseong,
    gongmang: saju.gongmang?.branches || [],
  };
}

// ── 카드 3: 대운·세운 ──────────────────────────
function cardLuck(saju, currentAge, seyunGanzi, thisYear, strength, P) {
  const daewoon = saju.daewoon.map((d) => ({
    age: d.age,
    gz: d.ganzi,
    sipsin: pick(P, `sipsin.${d.stemSipsin}`, d.stemSipsin),
    unseong: pick(P, `unseong.${d.unseong}`, d.unseong),
    current: currentAge >= d.age && currentAge < d.age + 10,
  }));
  const cur = daewoon.find((d) => d.current);

  // 세운 천간의 오행을 용신/희신/기신과 대조해 올해의 결을 판정한다
  const seyunElem = STEM_ELEM[seyunGanzi[0]];
  const toneKey = seyunElem === strength.yongKey ? 'toneYong'
    : seyunElem === strength.heeKey ? 'toneHee'
      : seyunElem === strength.giKey ? 'toneGi' : 'toneFlat';

  return {
    daewoon,
    current: cur || null,
    seyunDesc: pick(P, 'tpl.seyunDesc')(
      pick(P, `element.${seyunElem}`, seyunElem) === ELEMENT_HANJA[seyunElem]
        ? ELEMENT_HANJA[seyunElem]
        : `${ELEMENT_HANJA[seyunElem]}(${pick(P, `element.${seyunElem}`, seyunElem)})`,
      pick(P, `tpl.${toneKey}`),
    ),
    currentDesc: cur ? pick(P, 'tpl.daewoonNow')(cur.age, cur.gz, cur.sipsin, cur.unseong) : '',
    seyun: { year: thisYear, gz: seyunGanzi },
  };
}

// ── 카드 4: 자미두수 명반 ──────────────────────
function cardZiwei(ziwei, daxian, currentAge, P) {
  const curDx = daxian.find((d) => currentAge >= d.ageStart && currentAge <= d.ageEnd);
  const pal = (k) => pick(P, `palace.${k}`, k);

  const palaces = Object.entries(ziwei.palaces).map(([key, p]) => {
    const grid = BRANCH_GRID[p.zhi] || [0, 0];
    return {
      key,
      ko: pal(key),
      ganzhi: p.ganZhi,
      stars: p.stars.map((s) => ({
        name: s.name,
        brightness: s.brightness || '',
        sihua: s.siHua || '',
        sihuaColor: SIHUA_COLORS[s.siHua] || '',
        isMain: MAIN_STAR_KEYS.includes(s.name),
      })),
      row: grid[0], col: grid[1],
      isMing: key === '命宮',
      isShen: Boolean(p.isShenGong),
      isDaxian: Boolean(curDx) && curDx.palaceName === key,
    };
  });

  const ming = ziwei.palaces['命宮'];
  const mainStar = ming.stars.find((s) => MAIN_STAR_KEYS.includes(s.name));

  return {
    palaces,
    center: {
      stars: ming.stars.map((s) => s.name + (s.brightness ? `(${s.brightness})` : '')).join(' '),
      mainStar: mainStar ? mainStar.name : '',
      ju: ziwei.wuXingJu?.name || '',
      desc: mainStar ? pick(P, `star.${mainStar.name}`, '') : '',
    },
    daxian: daxian.map((d) => ({
      age: pick(P, 'ui.ageRange')(d.ageStart, d.ageEnd),
      gz: d.ganZhi,
      ko: pal(d.palaceName),
      stars: (d.mainStars || []).join(' '),
      current: Boolean(curDx) && d.ageStart === curDx.ageStart,
    })),
    currentDesc: curDx
      ? pick(P, 'tpl.daxianNow')(curDx.ageStart, curDx.ageEnd, pal(curDx.palaceName), curDx.ganZhi)
      : '',
  };
}

// ── 카드 5: 점성술 네이탈 ──────────────────────
function cardNatal(natal, unknownTime, P) {
  const sign = (s) => ({
    en: s,
    ko: pick(P, `sign.${s}.name`, s),
    trait: pick(P, `sign.${s}.trait`, ''),
    sym: SIGN_SYMBOL[s] || '★',
    color: SIGN_COLOR[s] || '#C9CDD2',
  });
  const byId = Object.fromEntries(natal.planets.map((p) => [p.id, p]));

  const big3 = [
    { ...pick(P, 'big3.sun'), ...sign(byId.Sun?.sign), house: byId.Sun?.house },
    { ...pick(P, 'big3.moon'), ...sign(byId.Moon?.sign), house: byId.Moon?.house },
  ];
  if (!unknownTime && natal.angles?.asc) {
    big3.push({ ...pick(P, 'big3.asc'), ...sign(natal.angles.asc.sign), house: null });
  }

  const planets = natal.planets
    .filter((p) => MAJOR_PLANETS.includes(p.id))
    .map((p) => {
      const s = sign(p.sign);
      return {
        ko: pick(P, `planet.${p.id}.name`, p.id),
        sym: PLANET_SYMBOL[p.id] || '·',
        keyword: pick(P, `planet.${p.id}.key`, ''),
        signKo: s.ko, signSym: s.sym, color: s.color,
        degree: `${Math.floor(p.degreeInSign)}°${String(Math.round((p.degreeInSign % 1) * 60)).padStart(2, '0')}`,
        house: p.house ? pick(P, 'ui.house')(p.house) : '',
        retro: Boolean(p.isRetrograde),
      };
    });

  // 어스펙트는 29개까지 나오므로 주요 행성끼리 + 오브 좁은 순 6개만
  const aspects = natal.aspects
    .filter((a) => MAJOR_PLANETS.includes(a.planet1) && MAJOR_PLANETS.includes(a.planet2))
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 6)
    .map((a) => {
      const meta = ASPECT_META[a.type] || { sym: '·', color: '#C9CDD2' };
      return {
        p1: pick(P, `planet.${a.planet1}.name`, a.planet1),
        s1: PLANET_SYMBOL[a.planet1] || '·',
        p2: pick(P, `planet.${a.planet2}.name`, a.planet2),
        s2: PLANET_SYMBOL[a.planet2] || '·',
        ko: pick(P, `aspect.${a.type}.name`, a.type),
        tone: pick(P, `aspect.${a.type}.tone`, ''),
        sym: meta.sym, color: meta.color,
        orb: a.orb.toFixed(1),
      };
    });

  const sunSign = sign(byId.Sun?.sign);
  const moonSign = sign(byId.Moon?.sign);

  return {
    big3, planets, aspects,
    overview: pick(P, 'tpl.natalOverview')(sunSign.ko, sunSign.trait, moonSign.ko, moonSign.trait),
    unknownTime: Boolean(unknownTime),
    unknownNote: pick(P, 'ui.unknownTimeNote'),
  };
}

// ── 카드 6: 올해 흐름 ─────────────────────────
function cardYear(liunian, seyunGanzi, thisYear, P) {
  const pal = (k) => pick(P, `palace.${k}`, k);
  const sihua = Object.entries(liunian.siHua || {}).map(([star, type]) => ({
    star, type, color: SIHUA_COLORS[type] || '#C9CDD2',
    palace: pal(liunian.siHuaPalaces?.[type] || ''),
  }));
  const goodPalace = liunian.siHuaPalaces?.['化祿'];
  const badPalace = liunian.siHuaPalaces?.['化忌'];

  const months = (liunian.liuyue || []).map((m) => ({
    month: m.month,
    label: pick(P, 'ui.month')(m.month),
    ko: pal(m.natalPalaceName),
    tone: m.natalPalaceName === goodPalace ? 'good' : m.natalPalaceName === badPalace ? 'watch' : 'flat',
  }));

  const lu = sihua.find((s) => s.type === '化祿');
  const gi = sihua.find((s) => s.type === '化忌');

  return {
    year: thisYear,
    seyun: seyunGanzi,
    ganzhi: `${liunian.gan}${liunian.zhi}`,
    sihua,
    months,
    legend: { good: pick(P, 'ui.good'), flat: pick(P, 'ui.flat'), watch: pick(P, 'ui.watch') },
    summary: [
      lu ? pick(P, 'tpl.yearLu')(lu.star, lu.palace) : '',
      gi ? pick(P, 'tpl.yearGi')(gi.star, gi.palace) : '',
    ].filter(Boolean).join(' '),
  };
}

// ── 카드 7: 궁합 ──────────────────────────────
function stemRel(a, b) {
  if (a === b) return 'SAME';
  if (OHAENG_GEN[a] === b) return 'A_GEN_B';
  if (OHAENG_GEN[b] === a) return 'B_GEN_A';
  if (OHAENG_CTRL[a] === b) return 'A_CTRL_B';
  return 'B_CTRL_A';
}

function branchRel(ai, bi) {
  if (ai === bi) return 'NEUTRAL';
  if (YUKHAP.some(([x, y]) => (x === ai && y === bi) || (y === ai && x === bi))) return 'HEX';
  if (Math.abs(ai - bi) === 6) return 'CLASH';
  if (SAMHAP.some((t) => t.includes(ai) && t.includes(bi))) return 'TRIO';
  return 'NEUTRAL';
}

/** 두 사람의 일주(일간 오행 + 일지 관계)로 궁합 카드를 만든다. goonghap.html과 동일한 규칙. */
export function cardGoonghap(sajuA, sajuB, nameA, nameB, P) {
  const el = (k) => pick(P, `element.${k}`, k);
  const person = (saju, name, fallbackKey) => {
    const p = saju.pillars[IDX.day];
    const e = STEM_ELEM[p.pillar.stem];
    return {
      name: name || pick(P, `goonghap.${fallbackKey}`),
      gan: p.pillar.stem, ji: p.pillar.branch,
      elemKey: e, elem: el(e), hanja: ELEMENT_HANJA[e], color: ELEMENT_COLORS[e],
      title: pick(P, `daymaster.${p.pillar.stem}.title`, ''),
      ganLabel: pick(P, 'goonghap.dayGan')(el(e) === ELEMENT_HANJA[e] ? ELEMENT_HANJA[e] : `${ELEMENT_HANJA[e]} ${el(e)}`),
    };
  };
  const A = person(sajuA, nameA, 'self');
  const B = person(sajuB, nameB, 'partner');

  const sKey = stemRel(A.elemKey, B.elemKey);
  const bKey = branchRel(BRANCH_IDX[A.ji], BRANCH_IDX[B.ji]);

  // 일지 합/충으로 총점을 1점 보정한다
  let score = STEM_REL_BASE[sKey];
  if (bKey === 'HEX' || bKey === 'TRIO') score = Math.min(5, score + 1);
  if (bKey === 'CLASH') score = Math.max(1, score - 1);

  const yangA = YANG_STEMS.includes(A.gan);
  const yangB = YANG_STEMS.includes(B.gan);
  const complementary = yangA !== yangB;
  const clamp = (v) => Math.max(1, Math.min(5, v));
  const bonus = (bKey === 'HEX' || bKey === 'TRIO') ? 1 : bKey === 'CLASH' ? -1 : 0;
  const base = GOONGHAP_AREA_BASE[sKey];

  const areas = [
    { label: pick(P, 'goonghap.areas.emotion'), score: clamp(base[0] + bonus), color: GOONGHAP_AREA_COLOR.emotion },
    { label: pick(P, 'goonghap.areas.comm'), score: clamp(base[1] + (complementary ? 1 : 0)), color: GOONGHAP_AREA_COLOR.comm },
    { label: pick(P, 'goonghap.areas.stability'), score: clamp(base[2] + bonus), color: GOONGHAP_AREA_COLOR.stability },
  ];

  return {
    a: A, b: B,
    symbol: STEM_REL_SYMBOL[sKey],
    relLabel: pick(P, `goonghap.stemRel.${sKey}.label`, ''),
    title: pick(P, `goonghap.stemRel.${sKey}.title`, ''),
    desc: pick(P, `goonghap.stemRel.${sKey}.desc`, ''),
    flow: `${A.elem === A.hanja ? A.hanja : A.hanja + A.elem} ${STEM_REL_SYMBOL[sKey]} ${B.elem === B.hanja ? B.hanja : B.hanja + B.elem}`,
    score,
    stars: '★'.repeat(score) + '☆'.repeat(5 - score),
    scoreLabel: pick(P, `goonghap.score.${score}`, ''),
    branch: {
      tag: `${A.ji}${B.ji} ${pick(P, `goonghap.branchRel.${bKey}.tag`, '')}`,
      color: BRANCH_REL_COLOR[bKey],
      desc: pick(P, `goonghap.branchRel.${bKey}.desc`, ''),
    },
    yinyang: pick(P, complementary ? 'goonghap.yinyangDiff' : 'goonghap.yinyangSame'),
    areas,
  };
}

/**
 * 엔진 결과 전체를 카드 데이터로 변환한다.
 * @param {{saju,ziwei,natalChart,daxian,liunian,input,seyunGanzi,name,thisYear}} raw
 * @param {object} P 언어팩
 */
export function normalize(raw, P) {
  const { saju, ziwei, natalChart, daxian, liunian, input, seyunGanzi, name, thisYear } = raw;
  const currentAge = thisYear - input.year + 1; // 한국식 세는 나이 (엔진 대운 age와 동일 기준)

  const time = input.unknownTime
    ? pick(P, 'ui.unknownTime')
    : `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`;

  const meta = {
    name: name || pick(P, 'ui.noName'),
    birth: `${input.year}. ${String(input.month).padStart(2, '0')}. ${String(input.day).padStart(2, '0')}. ${time}`,
    gender: pick(P, input.gender === 'F' ? 'ui.female' : 'ui.male'),
    age: pick(P, 'ui.age')(currentAge),
  };

  const sajuCard = cardSaju(saju, P);

  return {
    meta,
    pack: P,
    saju: sajuCard,
    sipsin: cardSipsin(saju, P),
    luck: cardLuck(saju, currentAge, seyunGanzi, thisYear, sajuCard.strength, P),
    ziwei: cardZiwei(ziwei, daxian, currentAge, P),
    natal: cardNatal(natalChart, input.unknownTime, P),
    year: cardYear(liunian, seyunGanzi, thisYear, P),
  };
}
