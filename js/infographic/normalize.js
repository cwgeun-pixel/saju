// orrery-core 엔진의 실제 반환 객체를 인포그래픽 카드 6종의 데이터로 변환하는 모듈
import {
  ELEMENT_COLORS, ELEMENT_HANJA, STEM_ELEM, BRANCH_ELEM,
  DAYMASTER, SIPSIN_GROUPS, SINSAL_INFO, SINSAL_TYPE_COLOR,
  UNSEONG_KO, SIPSIN_KO, PALACE_KO, BRANCH_GRID, SIHUA_COLORS, MAIN_STARS,
  SIGN_KO, SIGN_SYMBOL, SIGN_COLOR, SIGN_TRAIT, PLANET_INFO, ASPECT_INFO, HOUSE_KEY,
} from './interpret-data.js';

// 엔진의 pillars 배열은 [시주, 일주, 월주, 년주] 순서다. 일간은 pillars[1].
const PILLAR_LABELS = ['시주', '일주', '월주', '년주'];
const IDX = { hour: 0, day: 1, month: 2, year: 3 };

const cut = (s, n) => {
  s = (s || '').trim();
  if (s.length <= n) return s;
  const head = s.slice(0, n);
  const dot = head.lastIndexOf('다.');
  return dot >= n / 2 ? head.slice(0, dot + 2) : head.slice(0, n - 1).trimEnd() + '…';
};

const pct = (v, total) => (total ? Math.round((v / total) * 100) : 0);

// ── 카드 1: 사주 원국 ──────────────────────────
function cardSaju(saju) {
  const pillars = saju.pillars.map((p, i) => ({
    label: PILLAR_LABELS[i],
    gan: p.pillar.stem,
    ji: p.pillar.branch,
    ganColor: ELEMENT_COLORS[STEM_ELEM[p.pillar.stem]],
    jiColor: ELEMENT_COLORS[BRANCH_ELEM[p.pillar.branch]],
    sipsinTop: SIPSIN_KO[p.stemSipsin] || p.stemSipsin,
    sipsinBot: SIPSIN_KO[p.branchSipsin] || p.branchSipsin,
    unseong: UNSEONG_KO[p.unseong] || p.unseong,
  }));

  // 오행: 천간 4 + 지지 4 = 8점
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const p of saju.pillars) {
    counts[STEM_ELEM[p.pillar.stem]]++;
    counts[BRANCH_ELEM[p.pillar.branch]]++;
  }
  const total = 8;
  const values = Object.values(counts);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const elements = ['목', '화', '토', '금', '수'].map((k) => ({
    kor: k, hanja: ELEMENT_HANJA[k], count: counts[k], pct: pct(counts[k], total),
    color: ELEMENT_COLORS[k],
    mark: counts[k] === maxV && maxV > 0 ? '과다' : counts[k] === minV ? '부족' : '',
  }));

  // 일간과 신강/신약 (일간 = pillars[1], 엔진 기준)
  const dayStem = saju.pillars[IDX.day].pillar.stem;
  const dayElem = STEM_ELEM[dayStem];
  const GENERATED_BY = { 화: '목', 토: '화', 금: '토', 수: '금', 목: '수' };
  const CONTROLS = { 목: '토', 화: '금', 토: '수', 금: '목', 수: '화' };
  const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
  const support = counts[dayElem] + counts[GENERATED_BY[dayElem]];
  const isStrong = support >= 5;
  const isWeak = support <= 2;
  const strength = {
    type: isStrong ? '신강' : isWeak ? '신약' : '중화',
    gauge: Math.max(8, Math.min(92, (support / total) * 100)),
    yong: isStrong ? CONTROLS[dayElem] : GENERATED_BY[dayElem],
    hee: isStrong ? GENERATES[CONTROLS[dayElem]] : dayElem,
    gi: isStrong ? GENERATED_BY[dayElem] : CONTROLS[dayElem],
  };
  strength.desc = isStrong
    ? `일간의 기운이 강합니다. ${ELEMENT_HANJA[strength.yong]}(${strength.yong})로 덜어내야 균형이 잡힙니다.`
    : isWeak
      ? `일간의 기운이 약합니다. ${ELEMENT_HANJA[strength.yong]}(${strength.yong})가 받쳐줘야 힘을 냅니다.`
      : `기운이 고르게 배분된 중화 명조입니다. ${ELEMENT_HANJA[strength.yong]}(${strength.yong})가 흐름을 잡아줍니다.`;

  const dm = DAYMASTER[dayStem] || { title: '', desc: '' };
  const over = elements.find((e) => e.mark === '과다');
  const lack = elements.find((e) => e.mark === '부족');

  return {
    pillars,
    elements,
    strength,
    elementLine: `${over ? `${over.hanja}${over.kor}이 ${over.count}개로 가장 두텁고` : ''}${lack ? `, ${lack.hanja}${lack.kor}이 ${lack.count}개로 가장 옅습니다.` : '.'}`,
    dayMaster: {
      char: dayStem + ELEMENT_HANJA[dayElem],
      stem: dayStem,
      element: dayElem,
      color: ELEMENT_COLORS[dayElem],
      title: dm.title,
      desc: cut(dm.desc, 70),
    },
  };
}

// ── 카드 2: 십신·신살 ──────────────────────────
function cardSipsin(saju) {
  // 십신 카운트: 천간 4 + 지지 4 (일간 본원은 비겁으로)
  const tally = {};
  for (const p of saju.pillars) {
    tally[p.stemSipsin] = (tally[p.stemSipsin] || 0) + 1;
    tally[p.branchSipsin] = (tally[p.branchSipsin] || 0) + 1;
  }
  const groups = SIPSIN_GROUPS.map((g) => ({
    ...g,
    count: g.members.reduce((a, m) => a + (tally[m] || 0), 0),
  }));
  const totalG = groups.reduce((a, g) => a + g.count, 0) || 1;
  const maxG = Math.max(...groups.map((g) => g.count));
  const bars = groups.map((g) => ({
    label: g.label, hanja: g.hanja, color: g.color, count: g.count,
    pct: pct(g.count, totalG), strongest: g.count === maxG,
  }));
  const top = groups.find((g) => g.count === maxG);

  // 신살: specialSals는 인덱스 배열 또는 불리언
  const sals = [];
  for (const [key, info] of Object.entries(SINSAL_INFO)) {
    const v = saju.specialSals?.[key];
    const has = Array.isArray(v) ? v.length > 0 : Boolean(v);
    if (!has) continue;
    const where = Array.isArray(v) ? v.map((i) => PILLAR_LABELS[i]).join('·') : '';
    sals.push({ ...info, where, color: SINSAL_TYPE_COLOR[info.type] });
  }
  sals.sort((a, b) => ['길신', '중성', '흉신'].indexOf(a.type) - ['길신', '중성', '흉신'].indexOf(b.type));

  const unseong = saju.pillars.map((p, i) => ({
    label: PILLAR_LABELS[i],
    ko: UNSEONG_KO[p.unseong] || p.unseong,
    hanja: p.unseong,
  }));

  return {
    bars,
    topLine: top ? `${top.label}(${top.hanja})이 ${top.count}개로 가장 두텁습니다. ${top.desc}` : '',
    sals,
    unseong,
    gongmang: saju.gongmang?.branches || [],
  };
}

// ── 카드 3: 대운·세운 ──────────────────────────
function cardLuck(saju, currentAge, seyunGanzi, thisYear, strength) {
  const daewoon = saju.daewoon.map((d) => ({
    age: d.age,
    gz: d.ganzi,
    sipsin: SIPSIN_KO[d.stemSipsin] || d.stemSipsin,
    unseong: UNSEONG_KO[d.unseong] || d.unseong,
    current: currentAge >= d.age && currentAge < d.age + 10,
  }));
  const cur = daewoon.find((d) => d.current);

  // 세운 천간의 오행을 용신/희신/기신과 대조해 올해의 결을 판정한다
  const seyunElem = STEM_ELEM[seyunGanzi[0]];
  const tone = seyunElem === strength.yong
    ? '용신에 해당해 흐름이 순조롭고, 벌여둔 일이 결실로 이어집니다.'
    : seyunElem === strength.hee
      ? '희신에 해당해 큰 무리 없이 무난하게 풀립니다.'
      : seyunElem === strength.gi
        ? '기신에 해당해 확장보다 지키는 쪽이 유리합니다.'
        : '기운이 크게 치우치지 않는 평이한 흐름입니다.';

  return {
    daewoon,
    current: cur || null,
    seyunDesc: `${ELEMENT_HANJA[seyunElem]}(${seyunElem})의 기운이 도는 해입니다. ${tone}`,
    currentDesc: cur
      ? `${cur.age}세부터 ${cur.gz} 대운입니다. ${cur.sipsin}의 기운이 10년의 큰 흐름을 이끌며, 십이운성은 ${cur.unseong}입니다.`
      : '',
    seyun: { year: thisYear, gz: seyunGanzi },
  };
}

// ── 카드 4: 자미두수 명반 ──────────────────────
function cardZiwei(ziwei, daxian, currentAge) {
  const curDx = daxian.find((d) => currentAge >= d.ageStart && currentAge <= d.ageEnd);

  const palaces = Object.entries(ziwei.palaces).map(([key, p]) => {
    const grid = BRANCH_GRID[p.zhi] || [0, 0];
    return {
      key,
      ko: PALACE_KO[key] || key,
      ganzhi: p.ganZhi,
      stars: p.stars.map((s) => ({
        name: s.name,
        brightness: s.brightness || '',
        sihua: s.siHua || '',
        sihuaColor: SIHUA_COLORS[s.siHua] || '',
        isMain: Boolean(MAIN_STARS[s.name]),
      })),
      row: grid[0], col: grid[1],
      isMing: key === '命宮',
      isShen: Boolean(p.isShenGong),
      isDaxian: Boolean(curDx) && curDx.palaceName === key,
    };
  });

  const ming = ziwei.palaces['命宮'];
  const mainStar = ming.stars.find((s) => MAIN_STARS[s.name]);

  return {
    palaces,
    center: {
      stars: ming.stars.map((s) => s.name + (s.brightness ? `(${s.brightness})` : '')).join(' '),
      mainStar: mainStar ? mainStar.name : '',
      ju: ziwei.wuXingJu?.name || '',
      desc: mainStar ? MAIN_STARS[mainStar.name] : '',
    },
    daxian: daxian.map((d) => ({
      age: `${d.ageStart}~${d.ageEnd}`,
      gz: d.ganZhi,
      ko: PALACE_KO[d.palaceName] || d.palaceName,
      stars: (d.mainStars || []).join(' '),
      current: Boolean(curDx) && d.ageStart === curDx.ageStart,
    })),
    currentDesc: curDx
      ? `현재 ${curDx.ageStart}~${curDx.ageEnd}세는 ${PALACE_KO[curDx.palaceName] || curDx.palaceName}이 활성화된 ${curDx.ganZhi} 대한입니다.`
      : '',
  };
}

// ── 카드 5: 점성술 네이탈 ──────────────────────
const MAJOR = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

function cardNatal(natal, unknownTime) {
  const sign = (s) => ({
    en: s, ko: SIGN_KO[s] || s, sym: SIGN_SYMBOL[s] || '★',
    color: SIGN_COLOR[s] || '#C9CDD2', trait: SIGN_TRAIT[s] || '',
  });
  const byId = Object.fromEntries(natal.planets.map((p) => [p.id, p]));

  const big3 = [
    { label: '태양', sub: '핵심 자아', ...sign(byId.Sun?.sign), house: byId.Sun?.house },
    { label: '달', sub: '내면 감정', ...sign(byId.Moon?.sign), house: byId.Moon?.house },
  ];
  if (!unknownTime && natal.angles?.asc) {
    big3.push({ label: '상승', sub: '드러나는 인상', ...sign(natal.angles.asc.sign), house: null });
  }

  const planets = natal.planets
    .filter((p) => MAJOR.includes(p.id))
    .map((p) => {
      const info = PLANET_INFO[p.id] || { ko: p.id, sym: '·', key: '' };
      const s = sign(p.sign);
      return {
        ko: info.ko, sym: info.sym, keyword: info.key,
        signKo: s.ko, signSym: s.sym, color: s.color,
        degree: `${Math.floor(p.degreeInSign)}°${String(Math.round((p.degreeInSign % 1) * 60)).padStart(2, '0')}`,
        house: p.house ? `${p.house}하우스` : '',
        retro: Boolean(p.isRetrograde),
      };
    });

  // 어스펙트는 29개까지 나오므로 주요 행성끼리 + 오브 좁은 순 6개만
  const aspects = natal.aspects
    .filter((a) => MAJOR.includes(a.planet1) && MAJOR.includes(a.planet2))
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 6)
    .map((a) => {
      const info = ASPECT_INFO[a.type] || { ko: a.type, sym: '·', color: '#C9CDD2', tone: '' };
      return {
        p1: PLANET_INFO[a.planet1]?.ko || a.planet1,
        s1: PLANET_INFO[a.planet1]?.sym || '·',
        p2: PLANET_INFO[a.planet2]?.ko || a.planet2,
        s2: PLANET_INFO[a.planet2]?.sym || '·',
        ko: info.ko, sym: info.sym, color: info.color, tone: info.tone,
        orb: a.orb.toFixed(1),
      };
    });

  const sunSign = sign(byId.Sun?.sign);
  const moonSign = sign(byId.Moon?.sign);
  const overview = `${sunSign.ko} 태양은 ${sunSign.trait}, ${moonSign.ko} 달은 ${moonSign.trait}의 결을 가집니다.`;

  return { big3, planets, aspects, overview, unknownTime: Boolean(unknownTime) };
}

// ── 카드 6: 2026 올해 흐름 ─────────────────────
function cardYear(liunian, seyunGanzi, thisYear) {
  const sihua = Object.entries(liunian.siHua || {}).map(([star, type]) => ({
    star, type, color: SIHUA_COLORS[type] || '#C9CDD2',
    palace: PALACE_KO[liunian.siHuaPalaces?.[type]] || liunian.siHuaPalaces?.[type] || '',
  }));
  // 화록(길) 궁과 화기(주의) 궁을 월별 톤 판정에 사용
  const goodPalace = liunian.siHuaPalaces?.['化祿'];
  const badPalace = liunian.siHuaPalaces?.['化忌'];

  const months = (liunian.liuyue || []).map((m) => ({
    month: m.month,
    ko: PALACE_KO[m.natalPalaceName] || m.natalPalaceName,
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
    summary: [
      lu ? `${lu.star} 화록이 ${lu.palace}에 들어 ${lu.palace} 영역이 열립니다.` : '',
      gi ? `${gi.star} 화기는 ${gi.palace}에 있어 이 부분은 속도를 늦추는 편이 좋습니다.` : '',
    ].filter(Boolean).join(' '),
  };
}

/**
 * 엔진 결과 전체를 카드 6종 데이터로 변환한다.
 * @param {{saju,ziwei,natalChart,daxian,liunian,input,seyunGanzi,name,thisYear}} raw
 */
export function normalize(raw) {
  const { saju, ziwei, natalChart, daxian, liunian, input, seyunGanzi, name, thisYear } = raw;
  const currentAge = thisYear - input.year + 1; // 한국식 세는 나이 (엔진 대운 age와 동일 기준)

  const meta = {
    name: name || '',
    birth: `${input.year}. ${String(input.month).padStart(2, '0')}. ${String(input.day).padStart(2, '0')}.`
      + (input.unknownTime ? ' 시간모름' : ` ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`),
    gender: input.gender === 'F' ? '여성' : '남성',
    age: currentAge,
  };

  const sajuCard = cardSaju(saju);

  return {
    meta,
    saju: sajuCard,
    sipsin: cardSipsin(saju),
    luck: cardLuck(saju, currentAge, seyunGanzi, thisYear, sajuCard.strength),
    ziwei: cardZiwei(ziwei, daxian, currentAge),
    natal: cardNatal(natalChart, input.unknownTime),
    year: cardYear(liunian, seyunGanzi, thisYear),
  };
}
