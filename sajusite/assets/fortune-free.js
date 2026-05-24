// 무료 운세 패널 — 사주 · 자미두수 · 점성학 세 시스템 통합 (다크 테마)
import { calculateSaju } from './orrery-core/saju.js';
import { getFourPillars, analyzePillarRelations } from './orrery-core/pillars.js';
import { createChart } from './orrery-core/ziwei.js';
import { calculateNatal, ZODIAC_KO, PLANET_KO } from './orrery-core/natal.js';

// ─── 사주 상수 ────────────────────────────────────────────────

const ZODIAC_ANIMAL = {
  '子':{ animal:'쥐',  emoji:'🐭', years:'1960·1972·1984·1996·2008·2020', trait:'영리하고 재치 넘치며 사교성이 풍부합니다.' },
  '丑':{ animal:'소',  emoji:'🐂', years:'1961·1973·1985·1997·2009·2021', trait:'성실하고 인내심이 강하며 묵묵히 목표를 향해 나아갑니다.' },
  '寅':{ animal:'호랑이', emoji:'🐯', years:'1962·1974·1986·1998·2010·2022', trait:'용감하고 리더십이 강하며 열정적입니다.' },
  '卯':{ animal:'토끼', emoji:'🐰', years:'1963·1975·1987·1999·2011·2023', trait:'온화하고 섬세하며 예술적 감각이 뛰어납니다.' },
  '辰':{ animal:'용',  emoji:'🐉', years:'1964·1976·1988·2000·2012·2024', trait:'카리스마 넘치고 야망이 크며 창의적입니다.' },
  '巳':{ animal:'뱀',  emoji:'🐍', years:'1965·1977·1989·2001·2013·2025', trait:'직관이 예리하고 지혜로우며 끈기가 있습니다.' },
  '午':{ animal:'말',  emoji:'🐎', years:'1966·1978·1990·2002·2014·2026', trait:'활동적이고 에너지 넘치며 낙관적입니다.' },
  '未':{ animal:'양',  emoji:'🐑', years:'1967·1979·1991·2003·2015·2027', trait:'온순하고 예술적이며 평화를 사랑합니다.' },
  '申':{ animal:'원숭이', emoji:'🐒', years:'1968·1980·1992·2004·2016·2028', trait:'영리하고 적응력이 탁월하며 재주가 많습니다.' },
  '酉':{ animal:'닭',  emoji:'🐓', years:'1969·1981·1993·2005·2017·2029', trait:'꼼꼼하고 완벽을 추구하며 부지런합니다.' },
  '戌':{ animal:'개',  emoji:'🐕', years:'1970·1982·1994·2006·2018·2030', trait:'충직하고 정직하며 강한 책임감을 지닙니다.' },
  '亥':{ animal:'돼지', emoji:'🐷', years:'1971·1983·1995·2007·2019·2031', trait:'넉넉하고 복이 많으며 진실하고 너그럽습니다.' },
};

const ELEMENT_LUCKY = {
  '목':{ color:'초록', hex:'#22c55e', direction:'동쪽', numbers:[3,8] },
  '화':{ color:'빨강', hex:'#ef4444', direction:'남쪽', numbers:[2,7] },
  '토':{ color:'황토', hex:'#d97706', direction:'중앙', numbers:[5,0] },
  '금':{ color:'흰색', hex:'#94a3b8', direction:'서쪽', numbers:[4,9] },
  '수':{ color:'검정', hex:'#334155', direction:'북쪽', numbers:[1,6] },
};
const STEM_ELEM  = {'甲':'목','乙':'목','丙':'화','丁':'화','戊':'토','己':'토','庚':'금','辛':'금','壬':'수','癸':'수'};
const STEM_KR    = {'甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계'};
const BRANCH_KR  = {'子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'};
const BRANCH_ELEM = {'子':'수','丑':'토','寅':'목','卯':'목','辰':'토','巳':'화','午':'화','未':'토','申':'금','酉':'금','戌':'토','亥':'수'};
const DAY_KR     = ['일','월','화','수','목','금','토'];
const WEALTH_SIP = new Set(['偏財','正財']);
const LOVE_SIP_F = new Set(['偏官','正官']);
const R_SCORE    = {'合':2,'沖':-2,'破':-1,'害':-1,'刑':-1.5,'怨嗔':-3,'鬼門':0};
const LEVELS = [
  { min:85, label:'대길(大吉)', color:'#f59e0b', bg:'#fef3c7', emoji:'⭐' },
  { min:70, label:'길(吉)',     color:'#22c55e', bg:'#dcfce7', emoji:'✨' },
  { min:48, label:'평(平)',     color:'#60a5fa', bg:'#dbeafe', emoji:'🌀' },
  { min:30, label:'소흉(小凶)', color:'#a78bfa', bg:'#f3e8ff', emoji:'⚡' },
  { min: 0, label:'흉(凶)',     color:'#f87171', bg:'#fee2e2', emoji:'⚠️' },
];

// ─── 자미두수 상수 ────────────────────────────────────────────

const MAIN_STARS = new Set(['紫微','天機','太陽','武曲','天同','廉貞','天府','太陰','貪狼','巨門','天相','天梁','七殺','破軍']);
const STAR_DESC = {
  '紫微':{ fate:'리더십과 권위를 지닌 고귀한 운명',  wealth:'귀인의 도움으로 재물이 모임',     love:'존중받는 파트너십, 고귀한 인연' },
  '天機':{ fate:'영리하고 변화 많은 두뇌형 운명',    wealth:'지략과 정보로 재물을 창출',        love:'변화 많은 인연, 지적 매력으로 끌림' },
  '太陽':{ fate:'밝고 넓게 빛나는 사회적 운명',      wealth:'사회활동·명성으로 재물이 따름',    love:'공개적이고 활발한 사랑' },
  '武曲':{ fate:'강직하고 재물복이 강한 운명',       wealth:'강력한 재물복, 금융·사업 유리',     love:'의리와 신뢰를 중시하는 사랑' },
  '天同':{ fate:'복덕 있고 편안한 삶의 운명',        wealth:'풍요롭고 안정적인 재물 흐름',      love:'평화롭고 복 있는 인연' },
  '廉貞':{ fate:'열정과 감정 기복이 있는 운명',      wealth:'기복 있으나 강한 회복력',          love:'열정적이나 감정 기복 있는 연애' },
  '天府':{ fate:'안정적이고 풍요로운 저장의 운명',   wealth:'안정적이고 풍요로운 재물 축적',    love:'든든하고 안정적인 인연' },
  '太陰':{ fate:'감성적이고 섬세한 달의 운명',       wealth:'섬세한 재물 감각, 부동산 유리',    love:'섬세하고 감성적인 사랑' },
  '貪狼':{ fate:'욕망과 매력이 넘치는 다재다능한 운명', wealth:'다양한 경로로 재물이 들어옴',  love:'매력 넘치는 로맨틱한 연애' },
  '巨門':{ fate:'말과 비밀, 정보에 강한 운명',       wealth:'소통·정보로 재물을 만드는 유형',   love:'솔직한 대화가 관계의 핵심' },
  '天相':{ fate:'조화롭고 지원받는 따뜻한 운명',     wealth:'귀인 도움으로 재물이 들어옴',      love:'조화롭고 지원받는 인연' },
  '天梁':{ fate:'지혜롭고 수호의 기운이 있는 운명',  wealth:'어려움 속에서도 귀인 도움 있음',   love:'연상 또는 성숙한 파트너 인연' },
  '七殺':{ fate:'강력하고 돌파력 있는 독립적 운명',  wealth:'도전적 방식으로 재물 획득',        love:'강렬하고 독립적인 연애 스타일' },
  '破軍':{ fate:'개척하고 변화를 만드는 선구자적 운명', wealth:'파괴와 재창조로 새 기회 창출', love:'기존을 깨고 새로운 인연 형성' },
};
const SIHAU_LABEL = { '化祿':'화록(번영)', '化權':'화권(권력)', '化科':'화과(명예)', '化忌':'화기(주의)' };

// ─── 점성학 상수 ──────────────────────────────────────────────

const SIGN_KO = ['양자리','황소자리','쌍둥이자리','게자리','사자자리','처녀자리','천칭자리','전갈자리','사수자리','염소자리','물병자리','물고기자리'];
const SIGN_EMOJI = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toSignIdx = s => typeof s === 'number' ? s : SIGN_NAMES.indexOf(s);

const SUN_DESC = [
  '개척과 도전을 즐기는 불꽃 같은 에너지','안정과 감각적 풍요를 추구하는 현실적 성향',
  '지적 호기심과 유연한 사고의 소통 능력','깊은 감성과 가족을 소중히 여기는 마음',
  '창의적이고 당당한 표현력과 리더십','세심한 분석력과 완벽을 향한 성실함',
  '균형과 조화, 아름다움을 추구하는 사교성','강렬한 의지와 깊이 있는 탐구 정신',
  '자유를 사랑하는 낙관적 철학자 기질','목표를 향한 끈기와 실용적 판단력',
  '독창적이고 미래지향적인 혁신가 기질','예민한 감성과 깊은 공감·영적 직관',
];
const MOON_DESC = [
  '즉각적으로 반응하는 열정적 감성','안정과 편안함에서 감정적 충족감',
  '다양한 자극과 대화로 감정을 해소','깊고 섬세한 감정 흐름과 탁월한 공감 능력',
  '인정받고 빛날 때 감정이 충족됨','실용적 도움과 질서 속에서 안정감',
  '균형과 관계의 조화 속에서 감정 안정','강렬하고 깊은 감정, 집중과 집착 경향',
  '자유와 모험 속에서 감정적 활력','성취와 사회적 인정에서 안정감',
  '독립성과 자유 속에서 감정 충전','감정이 물처럼 흐르는 공감과 희생 성향',
];
const JUPITER_DESC = [
  '자아 개발과 새로운 도전에서 성장 기회','재물과 물질적 안정이 풍요로워지는 시기',
  '소통·학습·네트워크가 확장되는 시기','가정·부동산·내면 성장이 풍요로워지는 시기',
  '창의성·연애·자기표현이 활성화되는 시기','건강·직장·실용적 능력이 향상되는 시기',
  '인간관계·파트너십·협력이 확장되는 시기','변화·공동재산·심층 성장이 이루어지는 시기',
  '철학·해외·교육에서 큰 기회가 오는 시기','커리어·사회적 위상이 높아지는 시기',
  '인맥·미래 비전·사회적 활동이 확장되는 시기','영성·내면 지혜·자기 치유가 깊어지는 시기',
];
const VENUS_DESC = [
  '적극적이고 직접적인 사랑 에너지 상승','감각적이고 안정적인 재물·연애 에너지',
  '대화와 지적 유대가 연애 포인트인 시기','따뜻하고 가정적인 사랑 에너지 충만',
  '화려하고 로맨틱한 사랑·표현 에너지','세심한 배려와 일상 속 사랑 표현이 빛나는 시기',
  '조화와 우아함이 넘치는 사랑·인간관계','깊고 강렬한 인연의 기운이 흐르는 시기',
  '자유롭고 낙관적인 연애·확장 에너지','현실적이고 진지한 관계 발전에 유리',
  '독특하고 친구 같은 관계가 발전하는 시기','로맨틱하고 영적인 사랑 에너지의 계절',
];

// ─── 12운성 ───────────────────────────────────────────────────

const SIJUNSEONG_TABLE = {
  '甲':['亥','子','丑','寅','卯','辰','巳','午','未','申','酉','戌'],
  '乙':['午','巳','辰','卯','寅','丑','子','亥','戌','酉','申','未'],
  '丙':['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'],
  '丁':['酉','申','未','午','巳','辰','卯','寅','丑','子','亥','戌'],
  '戊':['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'],
  '己':['酉','申','未','午','巳','辰','卯','寅','丑','子','亥','戌'],
  '庚':['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'],
  '辛':['子','亥','戌','酉','申','未','午','巳','辰','卯','寅','丑'],
  '壬':['申','酉','戌','亥','子','丑','寅','卯','辰','巳','午','未'],
  '癸':['卯','寅','丑','子','亥','戌','酉','申','未','午','巳','辰'],
};
const SJS_NAMES = ['장생','목욕','관대','임관','제왕','쇠','병','사','묘','절','태','양'];
const SJS_EMOJI = ['🌱','🛁','🎓','👔','👑','📉','🤒','💀','⚰️','❄️','🥚','🌿'];
const SJS_DESC  = [
  '생명력이 솟구치는 시작의 기운',  '감수성이 예민하고 배움이 깊은 단계',
  '성장과 도약을 준비하는 단계',    '실력을 발휘하며 활약하는 단계',
  '최고의 전성기, 강한 에너지',     '활동이 서서히 줄어드는 단계',
  '주의가 필요하며 조심해야 할 시기','완전한 끝맺음, 전환점의 단계',
  '저장과 안식, 내면 정리의 단계',  '에너지 소멸, 새 출발을 준비하는 단계',
  '새 생명의 씨앗, 잉태의 단계',    '보호와 양육을 받으며 성장하는 단계',
];

function getSijunseong(stem, branch) {
  const table = SIJUNSEONG_TABLE[stem];
  if (!table) return null;
  const idx = table.indexOf(branch);
  if (idx < 0) return null;
  return { name:SJS_NAMES[idx], emoji:SJS_EMOJI[idx], desc:SJS_DESC[idx] };
}

// ─── 공통 유틸 ────────────────────────────────────────────────

function relScore(rels) { return rels.reduce((s,r) => s+(R_SCORE[r.type]||0), 0); }
function compareToNatal(natalPillars, ganzi) {
  return natalPillars.reduce((sum,p) => {
    const r = analyzePillarRelations(p.pillar.ganzi, ganzi);
    return sum + relScore(r.stem) + relScore(r.branch);
  }, 0);
}
function toPct(raw, scale=4) { return Math.max(5, Math.min(97, 50+raw*scale)); }
function getLevel(pct) { return LEVELS.find(l=>pct>=l.min)||LEVELS[LEVELS.length-1]; }
function getLucky(ganzi) {
  const elem = STEM_ELEM[ganzi[0]]||'토';
  const info = ELEMENT_LUCKY[elem];
  return { ...info, number: info.numbers[ganzi[1].charCodeAt(0)%2], elem };
}
function ganziStr(g) { return `${STEM_KR[g[0]]||g[0]}${BRANCH_KR[g[1]]||g[1]}`; }
function getMainStars(palace) {
  return (palace?.stars||[]).filter(s => MAIN_STARS.has(s.name));
}
function computeElements(saju) {
  const c = {'목':0,'화':0,'토':0,'금':0,'수':0};
  for (const p of saju.pillars) {
    if (STEM_ELEM[p.pillar.stem]) c[STEM_ELEM[p.pillar.stem]]++;
    if (BRANCH_ELEM[p.pillar.branch]) c[BRANCH_ELEM[p.pillar.branch]]++;
  }
  return c;
}

// ─── 용신 분석 ───────────────────────────────────────────────

function computeYongShin(saju) {
  const dayMaster = saju.pillars[2]?.pillar?.stem;
  const dayElem   = STEM_ELEM[dayMaster] || '토';
  const elems     = computeElements(saju);

  const GENERATES   = {'목':'화','화':'토','토':'금','금':'수','수':'목'};
  const GENERATED_BY = {'화':'목','토':'화','금':'토','수':'금','목':'수'};
  const CONTROLS    = {'목':'토','화':'금','토':'수','금':'목','수':'화'};

  const support = (elems[dayElem]||0) + (elems[GENERATED_BY[dayElem]]||0);
  const total   = Object.values(elems).reduce((a,b)=>a+b,0) || 8;
  const isStrong = support >= 4;
  const isWeak   = support <= 2;

  const yong = isStrong ? CONTROLS[dayElem]    : GENERATED_BY[dayElem];
  const hee  = isStrong ? GENERATES[CONTROLS[dayElem]] : dayElem;
  const gi   = isStrong ? GENERATED_BY[dayElem] : CONTROLS[dayElem];

  return {
    type:    isStrong ? '신강(身强)' : isWeak ? '신약(身弱)' : '중화(中和)',
    gauge:   Math.max(10, Math.min(90, (support / total) * 100 * 1.2)),
    dayElem, yong, hee, gi, elems, total, isStrong, isWeak,
  };
}

// ─── 기본 운세 점수 계산 ─────────────────────────────────────

function computeBasicScores(saju, mp, dp, gender) {
  function calcW(g) {
    let s = compareToNatal(saju.pillars, g);
    saju.pillars.forEach(p => {
      if (WEALTH_SIP.has(p.stemSipsin)||WEALTH_SIP.has(p.branchSipsin)) {
        const r = analyzePillarRelations(p.pillar.ganzi, g);
        if ([...r.stem,...r.branch].some(x=>x.type==='合')) s += 3;
      }
    });
    return s;
  }
  function calcL(g) {
    const tgt = gender==='F' ? LOVE_SIP_F : WEALTH_SIP;
    let s = compareToNatal(saju.pillars, g);
    saju.pillars.forEach(p => {
      if (tgt.has(p.stemSipsin)||tgt.has(p.branchSipsin)) {
        const r = analyzePillarRelations(p.pillar.ganzi, g);
        if ([...r.stem,...r.branch].some(x=>x.type==='合')) s += 3;
      }
      if (analyzePillarRelations(p.pillar.ganzi, g).branch.some(x=>x.type==='合')) s += 1;
    });
    return s;
  }
  const CAREER_SIP = new Set(gender==='F' ? ['偏財','正財'] : ['偏官','正官','食神','傷官']);
  function calcC(g) {
    let s = compareToNatal(saju.pillars, g);
    saju.pillars.forEach(p => {
      if (CAREER_SIP.has(p.stemSipsin)||CAREER_SIP.has(p.branchSipsin)) {
        const r = analyzePillarRelations(p.pillar.ganzi, g);
        if ([...r.stem,...r.branch].some(x=>x.type==='合')) s += 2.5;
      }
    });
    return s;
  }

  const elems  = computeElements(saju);
  const vals   = Object.values(elems);
  const mean   = vals.reduce((a,b)=>a+b,0)/5;
  const balance = 1 - vals.reduce((s,v)=>s+Math.abs(v-mean),0) / (mean*5||1);
  const dayRaw = compareToNatal(saju.pillars, dp);

  return {
    성향:   Math.max(30, Math.min(95, toPct(balance*2.5, 12))),
    애정운: toPct(calcL(mp), 3.5),
    직업운: toPct(calcC(mp), 3.2),
    재물운: toPct(calcW(mp), 3.5),
    건강운: toPct(dayRaw * balance, 3),
  };
}

// ─── 메인 폼 데이터 자동 추출 ────────────────────────────────

function captureMainFormInput() {
  const triggers = [...document.querySelectorAll('button[role="combobox"]')];
  let year=null, month=null, day=null, hour=12, minute=0, gender='M', unknownTime=false;

  for (const btn of triggers) {
    const txt = btn.textContent.trim(); let m;
    if      ((m=txt.match(/^(\d{4})년$/)))   year  = +m[1];
    else if ((m=txt.match(/^(\d{1,2})월$/))) month = +m[1];
    else if ((m=txt.match(/^(\d{1,2})일$/))) day   = +m[1];
    else if ((m=txt.match(/^(\d{1,2})시$/))) {
      if (btn.disabled||btn.hasAttribute('data-disabled')) unknownTime=true;
      else hour = +m[1];
    }
    else if ((m=txt.match(/^(\d{2})분$/)))   minute = +m[1];
  }

  const sw = document.querySelector('button[role="switch"]');
  if (sw && sw.getAttribute('data-state')==='checked') { unknownTime=true; hour=12; }

  const radioItems = [...document.querySelectorAll('button[role="radio"]')];
  for (const btn of radioItems) {
    if (btn.getAttribute('data-state')==='on') {
      const txt = btn.textContent.trim();
      if (txt==='여'||txt.includes('여성')||txt==='女') gender='F';
      break;
    }
  }
  if (document.querySelector('input[type="radio"][value="F"]:checked')) gender='F';

  if (!year||!month||!day) return null;
  if (year<1900||year>2100||month<1||month>12||day<1||day>31) return null;
  return { year, month, day, hour:unknownTime?12:hour, minute, gender, unknownTime };
}

// ─── 다크 테마 렌더 헬퍼 ─────────────────────────────────────

const D = {
  wrap:   'background:#12151f;border-radius:14px;padding:20px;',
  card:   'background:#1a1d2e;border:1px solid #252840;border-radius:12px;padding:16px;',
  hdr:    'color:#e2e8f0;font-weight:700;font-size:15px;',
  sub:    'color:#7a82a8;font-size:12px;',
  txt:    'color:#c8cee8;font-size:13px;line-height:1.7;',
  muted:  'color:#565d80;font-size:11px;',
};

function dGauge(pct, color) {
  return `<div style="height:5px;background:#1f2340;border-radius:3px;overflow:hidden;margin-top:5px">
    <div style="height:100%;width:${pct}%;background:${color};border-radius:3px"></div>
  </div>`;
}

function scoreColor(pct) {
  return pct >= 70 ? '#34d399' : pct >= 45 ? '#fbbf24' : '#f87171';
}

function scoreBadge(pct) {
  const c = scoreColor(pct);
  return `<span style="background:${c}1a;color:${c};font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;border:1px solid ${c}40">${Math.round(pct)}점</span>`;
}

function sectionHeader(letter, title, subtitle) {
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
    <span style="background:#7c6af71a;color:#9d8ff5;font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;border:1px solid #7c6af730">${letter}</span>
    <span style="${D.hdr}">${title}</span>
    <span style="${D.sub}">${subtitle}</span>
  </div>`;
}

// ─── A. 기본 운세 ─────────────────────────────────────────────

function renderBasicFortune(saju, yp, mp, dp, gender) {
  const scores = computeBasicScores(saju, mp, dp, gender);
  const b = saju.pillars[3].pillar.branch;
  const z = ZODIAC_ANIMAL[b];
  const dayMaster = saju.pillars[2]?.pillar?.stem || '';

  const CATEGORIES = [
    { key:'성향',   emoji:'🌟', color:'#9d8ff5', desc:'타고난 기질과 성격의 흐름' },
    { key:'애정운', emoji:'💗', color:'#f472b6', desc:'감정과 인연의 에너지' },
    { key:'직업운', emoji:'💼', color:'#60a5fa', desc:'사회적 활동과 성취 흐름' },
    { key:'재물운', emoji:'💰', color:'#fbbf24', desc:'재물과 기회의 흐름' },
    { key:'건강운', emoji:'🌿', color:'#34d399', desc:'몸과 마음의 균형 에너지' },
  ];

  const cards = CATEGORIES.map(cat => {
    const pct = scores[cat.key];
    const lv  = getLevel(pct);
    return `<div style="${D.card}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:7px">
          <span style="font-size:18px">${cat.emoji}</span>
          <span style="color:#dde1f2;font-weight:600;font-size:13px">${cat.key}</span>
        </div>
        ${scoreBadge(pct)}
      </div>
      ${dGauge(pct, cat.color)}
      <div style="${D.sub};margin-top:6px">${cat.desc} · ${lv.label}</div>
    </div>`;
  }).join('');

  const zodiacBlock = z ? `
    <div style="${D.card};display:flex;align-items:center;gap:14px;margin-top:10px">
      <span style="font-size:36px">${z.emoji}</span>
      <div>
        <div style="color:#dde1f2;font-weight:700;font-size:14px">${z.animal}띠 · ${dayMaster}일간</div>
        <div style="${D.sub};margin-top:2px">${z.years}년생</div>
        <div style="${D.txt};margin-top:5px">${z.trait}</div>
      </div>
    </div>` : '';

  return `<div style="${D.wrap}">
    ${sectionHeader('A', '기본 운세', '사주 원국 기반')}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
      ${cards}
    </div>
    ${zodiacBlock}
  </div>`;
}

// ─── B. 오늘의 운세 + 럭키 캘린더 ───────────────────────────

function renderDailyCalendar(saju, yp, mp, dp) {
  const raw = compareToNatal(saju.pillars, dp)
            + compareToNatal(saju.pillars, mp)*0.5
            + compareToNatal(saju.pillars, yp)*0.3;
  const todayPct = toPct(raw, 3);
  const todayLv  = getLevel(todayPct);
  const lk = getLucky(dp);

  const today = new Date();
  const cells = [];
  for (let i=0; i<7; i++) {
    const d = new Date(today); d.setDate(today.getDate()+i);
    const y=d.getFullYear(), m=d.getMonth()+1, dy=d.getDate(), dow=DAY_KR[d.getDay()];
    const dowCol = d.getDay()===0?'#f87171':d.getDay()===6?'#60a5fa':'#7a82a8';
    let dayP; try { [,,dayP]=getFourPillars(y,m,dy,12,0,false); } catch { continue; }
    const p2=toPct(compareToNatal(saju.pillars,dayP),4), lv2=getLevel(p2), lk2=getLucky(dayP);
    const isToday = i===0;
    const border = isToday ? 'border:1px solid #7c6af780;' : 'border:1px solid #252840;';
    const bg     = isToday ? 'background:#1e1b40;' : 'background:#1a1d2e;';
    cells.push(`<div style="${bg}${border}border-radius:10px;padding:8px 4px;text-align:center">
      <div style="font-size:11px;color:${dowCol};font-weight:600">${dow}</div>
      <div style="font-size:18px;font-weight:700;color:${isToday?'#a78bfa':'#dde1f2'};margin:2px 0">${dy}</div>
      ${isToday?'<div style="font-size:9px;color:#9d8ff5;margin-top:-4px">오늘</div>':''}
      <div style="font-size:10px;color:#565d80;font-family:monospace">${ganziStr(dayP)}</div>
      <div style="font-size:14px;margin-top:2px">${lv2.emoji}</div>
      <div style="width:10px;height:10px;border-radius:50%;background:${lk2.hex};margin:3px auto 0;border:1px solid #ffffff20"></div>
    </div>`);
  }

  const TODAY_DESC = {
    '대길(大吉)':'하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적입니다.',
    '길(吉)':    '기운이 좋은 날입니다. 계획한 일들이 진행되고 주변의 도움을 받기 쉬운 시기입니다.',
    '평(平)':    '평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하세요.',
    '소흉(小凶)':'약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루는 것이 좋습니다.',
    '흉(凶)':    '에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.',
  };

  return `<div style="${D.wrap}">
    ${sectionHeader('B', '오늘의 운세', '일진 분석')}
    <div style="${D.card};display:flex;align-items:center;gap:16px;margin-bottom:10px">
      <div style="text-align:center;min-width:60px">
        <div style="font-size:38px">${todayLv.emoji}</div>
        <div style="color:${scoreColor(todayPct)};font-weight:700;font-size:13px;margin-top:2px">${todayLv.label}</div>
      </div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="${D.sub}">운세 지수</span>
          <span style="color:${scoreColor(todayPct)};font-weight:700;font-size:13px">${Math.round(todayPct)}점</span>
        </div>
        ${dGauge(todayPct, scoreColor(todayPct))}
        <p style="${D.txt};margin-top:8px">${TODAY_DESC[todayLv.label]||TODAY_DESC['평(平)']}</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
      <div style="${D.card};text-align:center">
        <div style="${D.sub};margin-bottom:4px">행운의 색</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:5px">
          <div style="width:12px;height:12px;border-radius:50%;background:${lk.hex};border:1px solid #ffffff20"></div>
          <span style="color:#dde1f2;font-size:13px;font-weight:600">${lk.color}</span>
        </div>
      </div>
      <div style="${D.card};text-align:center">
        <div style="${D.sub};margin-bottom:4px">행운의 방향</div>
        <div style="color:#dde1f2;font-size:13px;font-weight:600">${lk.direction}</div>
      </div>
      <div style="${D.card};text-align:center">
        <div style="${D.sub};margin-bottom:4px">행운의 숫자</div>
        <div style="color:#dde1f2;font-size:13px;font-weight:600">${lk.number}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${cells.join('')}</div>
    <div style="${D.muted};margin-top:8px;text-align:center">⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉 · ● 행운의 색</div>
  </div>`;
}

// ─── C. 용신 분석 ─────────────────────────────────────────────

function renderYongShin(saju) {
  const ys = computeYongShin(saju);
  const ELEM_KO  = {'목':'木 목','화':'火 화','토':'土 토','금':'金 금','수':'水 수'};
  const ELEM_CLR = {'목':'#34d399','화':'#f87171','토':'#fbbf24','금':'#94a3b8','수':'#60a5fa'};
  const total = ys.total || 8;

  const elemBars = Object.entries(ys.elems).map(([e, cnt]) => {
    const pct = Math.round((cnt/total)*100);
    return `<div style="margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="color:${ELEM_CLR[e]};font-size:12px;font-weight:600">${ELEM_KO[e]}</span>
        <span style="${D.sub}">${cnt}개 · ${pct}%</span>
      </div>
      ${dGauge(pct, ELEM_CLR[e])}
    </div>`;
  }).join('');

  function yongCard(label, elem, role, desc) {
    const c = ELEM_CLR[elem] || '#7a82a8';
    const roleDesc = role==='용신'?'가장 필요한 기운':role==='희신'?'보조 도움 기운':'조심해야 할 기운';
    return `<div style="${D.card};border-left:3px solid ${c}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
        <span style="color:${c};font-weight:700;font-size:12px">${role}</span>
        <span style="background:${c}1a;color:${c};font-size:11px;padding:1px 7px;border-radius:10px;border:1px solid ${c}30">${elem ? ELEM_KO[elem] : '-'}</span>
      </div>
      <div style="${D.sub}">${roleDesc}</div>
    </div>`;
  }

  const gaugeLeft  = Math.max(5, Math.min(90, 100-ys.gauge));
  const gaugeRight = 100 - gaugeLeft;

  return `<div style="${D.wrap}">
    ${sectionHeader('C', '용신 분석', '일간 강약과 오행 균형')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <div style="${D.card}">
        <div style="${D.sub};margin-bottom:8px">일간 강약</div>
        <div style="color:#dde1f2;font-weight:700;font-size:15px;margin-bottom:8px">${ys.type}</div>
        <div style="display:flex;height:6px;border-radius:3px;overflow:hidden">
          <div style="background:#60a5fa;width:${gaugeLeft}%"></div>
          <div style="background:#f87171;width:${gaugeRight}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span style="color:#60a5fa;font-size:10px">신약</span>
          <span style="color:#f87171;font-size:10px">신강</span>
        </div>
      </div>
      <div style="${D.card}">
        <div style="${D.sub};margin-bottom:8px">오행 분포</div>
        ${elemBars}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      ${yongCard('용신', ys.yong, '용신', '')}
      ${yongCard('희신', ys.hee,  '희신', '')}
      ${yongCard('기신', ys.gi,   '기신', '')}
    </div>
  </div>`;
}

// ─── D. 12운성 ────────────────────────────────────────────────

function renderSijunseong(saju) {
  const dayMaster = saju.pillars[2]?.pillar?.stem;
  if (!dayMaster) return '';
  const PILLAR_NAMES = ['년주','월주','일주','시주'];
  const cards = saju.pillars.map((p, i) => {
    const sjs = getSijunseong(dayMaster, p.pillar.branch);
    if (!sjs) return '';
    return `<div style="${D.card};text-align:center">
      <div style="${D.sub};margin-bottom:4px">${PILLAR_NAMES[i]}</div>
      <div style="font-family:monospace;color:#9d8ff5;font-weight:700;font-size:14px;margin-bottom:6px">${p.pillar.ganzi}</div>
      <div style="font-size:26px;margin-bottom:4px">${sjs.emoji}</div>
      <div style="color:#dde1f2;font-weight:700;font-size:13px;margin-bottom:4px">${sjs.name}</div>
      <div style="${D.sub};font-size:11px;line-height:1.5">${sjs.desc}</div>
    </div>`;
  }).join('');

  return `<div style="${D.wrap}">
    ${sectionHeader('D', '12운성', '일간 기준 · 사주 각 기둥의 생명 단계')}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
      ${cards}
    </div>
  </div>`;
}

// ─── E. 자미두수 ──────────────────────────────────────────────

function renderZiweiSection(chart) {
  function palaceCard(palaceName, emoji, label) {
    const palace = chart.palaces[palaceName];
    if (!palace) return '';
    const mains = getMainStars(palace);
    if (mains.length === 0) {
      return `<div style="${D.card}">
        <div style="display:flex;align-items:center;gap:7px;margin-bottom:8px">
          <span style="font-size:16px">${emoji}</span>
          <span style="color:#dde1f2;font-weight:600;font-size:13px">${label}</span>
          <span style="${D.sub}">${palace.ganZhi}</span>
        </div>
        <p style="${D.sub}">이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.</p>
      </div>`;
    }
    const starCards = mains.map(s => {
      const info = STAR_DESC[s.name] || { fate:s.name, wealth:'', love:'' };
      const content = palaceName==='命宮' ? info.fate : palaceName==='財帛' ? info.wealth : info.love;
      const siHua = s.siHua
        ? `<span style="background:${s.siHua==='化忌'?'#f871711a':'#fbbf241a'};color:${s.siHua==='化忌'?'#f87171':'#fbbf24'};font-size:10px;padding:1px 6px;border-radius:8px;margin-left:4px">${SIHAU_LABEL[s.siHua]||s.siHua}</span>` : '';
      const bright = s.brightness ? `<span style="${D.sub}"> (${s.brightness})</span>` : '';
      return `<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid #1f2340">
        <span style="font-size:16px;flex-shrink:0">${emoji}</span>
        <div>
          <div style="display:flex;align-items:center;flex-wrap:wrap">
            <span style="color:#dde1f2;font-weight:600;font-size:13px">${s.name}</span>${bright}${siHua}
          </div>
          <p style="${D.txt};margin-top:3px">${content}</p>
        </div>
      </div>`;
    }).join('');

    return `<div style="${D.card}">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:8px">
        <span style="font-size:16px">${emoji}</span>
        <span style="color:#dde1f2;font-weight:600;font-size:13px">${label}</span>
        <span style="background:#7c6af71a;color:#9d8ff5;font-size:10px;padding:1px 6px;border-radius:6px">${palace.ganZhi} ${palaceName}</span>
      </div>
      ${starCards}
    </div>`;
  }

  const wu = chart.wuXingJu;
  return `<div style="${D.wrap}">
    ${sectionHeader('E', '자미두수', `${wu?.name||'명반'} · 3개 핵심 궁 분석`)}
    <div style="display:flex;flex-direction:column;gap:10px">
      ${palaceCard('命宮','🌟','기본 운명 (명궁)')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${palaceCard('財帛','💰','재물 성향 (재백궁)')}
        ${palaceCard('夫妻','💗','인연 성향 (부처궁)')}
      </div>
    </div>
  </div>`;
}

// ─── F. 점성학 ────────────────────────────────────────────────

function renderNatalSection(natalChart, transitChart, unknownTime) {
  const find = (chart, id) => chart?.planets?.find(p=>p.id===id);
  const signName = s => SIGN_KO[toSignIdx(s)] ?? ZODIAC_KO?.[s] ?? '알 수 없음';

  const sun     = find(natalChart, 'Sun');
  const moon    = find(natalChart, 'Moon');
  const ascObj  = !unknownTime ? (natalChart?.angles?.asc ?? null) : null;
  const jupiter = find(transitChart, 'Jupiter');
  const venus   = find(transitChart, 'Venus');

  function planetRow(iconTxt, title, subtitle, sign, descArr) {
    if (!sign && sign !== 0) return '';
    const idx = toSignIdx(sign);
    const desc = descArr[idx] || '';
    return `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #1f2340">
      <div style="font-size:20px;flex-shrink:0;width:28px;text-align:center">${iconTxt}</div>
      <div>
        <div style="color:#dde1f2;font-weight:600;font-size:13px">${title} <span style="${D.sub}">${subtitle}</span></div>
        <div style="font-weight:700;font-size:14px;margin:3px 0;color:#c8cee8">${SIGN_EMOJI[idx]} ${signName(sign)}</div>
        <p style="${D.txt};margin:0">${desc}</p>
      </div>
    </div>`;
  }

  const ascRow = ascObj ? `<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #1f2340">
    <div style="font-size:20px;flex-shrink:0;width:28px;text-align:center">⬆️</div>
    <div>
      <div style="color:#dde1f2;font-weight:600;font-size:13px">상승궁 (ASC) <span style="${D.sub}">첫인상·외면</span></div>
      <div style="font-weight:700;font-size:14px;margin:3px 0;color:#c8cee8">${SIGN_EMOJI[toSignIdx(ascObj.sign)]} ${signName(ascObj.sign)}</div>
      <p style="${D.txt};margin:0">타인에게 비치는 첫인상과 외면적 태도를 나타냅니다.</p>
    </div>
  </div>` : '';

  return `<div style="${D.wrap}">
    ${sectionHeader('F', '점성학', '서양 천궁도 분석')}
    <div style="${D.card}">
      ${planetRow('☀️', '태양 별자리', '핵심 정체성', sun?.sign, SUN_DESC)}
      ${planetRow('🌙', '달 별자리',   '감성·본능',   moon?.sign, MOON_DESC)}
      ${ascRow}
      ${planetRow('♃', '목성 현재 위치', '올해 성장 영역', jupiter?.sign, JUPITER_DESC)}
      ${planetRow('♀', '금성 현재 위치', '이번달 애정·재물', venus?.sign, VENUS_DESC)}
    </div>
  </div>`;
}

// ─── 입력 폼 (자동 추출 실패 시 폴백) ─────────────────────────

function inputHtml() {
  const curYear = new Date().getFullYear();
  const yearOpts = Array.from({length: curYear - 1899}, (_, i) => curYear - i)
    .map(y => `<option value="${y}">${y}년</option>`).join('');
  const monthOpts = Array.from({length:12},(_,i)=>`<option value="${i+1}">${i+1}월</option>`).join('');
  const dayOpts   = Array.from({length:31},(_,i)=>`<option value="${i+1}">${i+1}일</option>`).join('');
  const hourOpts  = `<option value="">시간 모름</option>` +
    Array.from({length:24},(_,i)=>`<option value="${i}">${i}시</option>`).join('');

  return `<div style="background:#1a1d2e;border:1px solid #fbbf2440;border-radius:12px;padding:18px">
    <p style="color:#fbbf24;font-weight:600;font-size:14px;margin-bottom:12px">
      생년월일시를 선택하면 사주·자미두수·점성학 무료 운세를 확인합니다.
    </p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">
      <select id="gf-year" style="height:36px;border-radius:8px;border:1px solid #252840;background:#12151f;color:#dde1f2;padding:0 10px;font-size:13px">
        <option value="">출생 연도</option>${yearOpts}
      </select>
      <select id="gf-month" style="height:36px;border-radius:8px;border:1px solid #252840;background:#12151f;color:#dde1f2;padding:0 10px;font-size:13px">
        <option value="">월</option>${monthOpts}
      </select>
      <select id="gf-day" style="height:36px;border-radius:8px;border:1px solid #252840;background:#12151f;color:#dde1f2;padding:0 10px;font-size:13px">
        <option value="">일</option>${dayOpts}
      </select>
      <select id="gf-hour" style="height:36px;border-radius:8px;border:1px solid #252840;background:#12151f;color:#dde1f2;padding:0 10px;font-size:13px">
        ${hourOpts}
      </select>
    </div>
    <div style="display:flex;gap:16px;margin-bottom:14px">
      <label style="display:flex;align-items:center;gap:6px;color:#dde1f2;font-size:13px;cursor:pointer">
        <input type="radio" name="gf-gender" value="M" checked /> 남성
      </label>
      <label style="display:flex;align-items:center;gap:6px;color:#dde1f2;font-size:13px;cursor:pointer">
        <input type="radio" name="gf-gender" value="F" /> 여성
      </label>
    </div>
    <button id="gf-calc" type="button"
      style="width:100%;border-radius:8px;padding:11px;font-size:14px;font-weight:700;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#7c6af7,#5b4ef0)">
      🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)
    </button>
    <div id="gf-error" style="color:#f87171;font-size:12px;margin-top:8px;display:none"></div>
  </div>`;
}

// ─── 패널 생성 ────────────────────────────────────────────────

function createPanel() {
  const el = document.createElement('div');
  el.id = 'honcheon-fortune-panel';
  el.style.display = 'none';
  el.innerHTML = `<div style="background:#0d0f1a;border-radius:16px;padding:20px;border:1px solid #1e2235">
    <div style="margin-bottom:16px">
      <h3 style="color:#e2e8f0;font-size:18px;font-weight:700;margin:0">🔮 무료 운세</h3>
      <p style="color:#7a82a8;font-size:13px;margin:4px 0 0">사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)</p>
    </div>
    <div id="gf-body">
      <p style="color:#7a82a8;font-size:13px;text-align:center;padding:24px 0">운세를 계산하는 중입니다…</p>
    </div>
  </div>`;
  return el;
}

function membershipCard() {
  return `<div style="background:#0d0f1a;border-radius:16px;padding:20px;border:1px solid #1e2235">
    <div style="border:2px dashed #fbbf2460;border-radius:12px;background:#fbbf240a;padding:24px;text-align:center">
      <div style="font-size:36px;margin-bottom:10px">🔐</div>
      <div style="color:#fbbf24;font-weight:700;font-size:16px;margin-bottom:8px">멤버십 전용 상세 분석</div>
      <p style="color:#d97706;font-size:13px;margin-bottom:14px">사주팔자 · 자미두수 · 천궁도 전체 결과를<br/>PDF로 정리하여 제공합니다.</p>
      <div style="color:#b45309;font-size:12px;line-height:2">
        <div>✅ 8글자 원국 전체 해석</div>
        <div>✅ 대운 흐름 · 세운 분석</div>
        <div>✅ 자미두수 12궁 상세 해석</div>
        <div>✅ 천궁도 행성·하우스·상(Aspect) 분석</div>
        <div>✅ AI 종합 해석 포함</div>
      </div>
    </div>
  </div>`;
}

function createTabs() {
  const el = document.createElement('div');
  el.id = 'honcheon-fortune-tabs';
  el.style.cssText = 'display:flex;border-radius:12px;background:#1a1d2e;padding:4px;gap:4px;border:1px solid #252840';
  el.innerHTML = `
    <button data-tab="fortune"
      style="flex:1;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;background:#7c6af7;color:#fff;border:none;cursor:pointer;transition:all 0.2s">
      🔮 무료 운세
    </button>
    <button data-tab="detail"
      style="flex:1;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:500;background:transparent;color:#7a82a8;border:none;cursor:pointer;transition:all 0.2s">
      🔐 멤버십 상세 분석
    </button>`;
  return el;
}

function createMembershipPanel() {
  const el = document.createElement('div');
  el.id = 'honcheon-membership-panel';
  el.style.display = 'none';
  el.innerHTML = membershipCard();
  return el;
}

// ─── 탭 전환 ─────────────────────────────────────────────────

function switchTab(tabId, results) {
  const tabs = document.getElementById('honcheon-fortune-tabs');
  if (!tabs) return;

  tabs.querySelectorAll('button').forEach(btn => {
    const active = btn.dataset.tab === tabId;
    btn.style.background = active ? '#7c6af7' : 'transparent';
    btn.style.color = active ? '#fff' : '#7a82a8';
    btn.style.fontWeight = active ? '600' : '500';
  });

  Array.from(results.children).forEach(child => {
    const id = child.id;
    if (id === 'honcheon-fortune-tabs') return;
    if (id === 'honcheon-fortune-panel')    { child.style.display = tabId==='fortune'?'':'none'; return; }
    if (id === 'honcheon-membership-panel') { child.style.display = tabId==='detail' ?'':'none'; return; }
    if (id === 'honcheon-ai-panel')         { child.style.display = 'none'; return; }
    if (id === 'honcheon-gunghap-panel')    { child.style.display = tabId==='detail' ?'':'none'; return; }
    child.style.display = tabId==='detail' ? '' : 'none';
  });
}

// ─── 계산 실행 ────────────────────────────────────────────────

async function runFortune(preInput = null) {
  const errorEl = document.getElementById('gf-error');
  const bodyEl  = document.getElementById('gf-body');

  let year, month, day, hour, minute, gender, unknownTime;
  if (preInput) {
    ({ year, month, day, hour, minute, gender, unknownTime } = preInput);
  } else {
    year        = parseInt(document.getElementById('gf-year')?.value   || '');
    month       = parseInt(document.getElementById('gf-month')?.value  || '');
    day         = parseInt(document.getElementById('gf-day')?.value    || '');
    const hourVal = document.getElementById('gf-hour')?.value;
    unknownTime = !hourVal;
    hour        = unknownTime ? 12 : parseInt(hourVal);
    minute      = 0;
    gender      = document.querySelector('input[name="gf-gender"]:checked')?.value ?? 'M';
  }

  if (errorEl) { errorEl.textContent=''; errorEl.style.display='none'; }
  if (bodyEl) bodyEl.innerHTML = '<p style="color:#7a82a8;font-size:13px;text-align:center;padding:24px 0">계산 중… 잠시만 기다려주세요.</p>';

  try {
    if (!year||!month||!day) throw new Error('생년월일을 입력해주세요.');
    if (year<1900||year>2100) throw new Error('올바른 연도를 입력해주세요.');

    const saju  = calculateSaju({ year, month, day, hour, minute, gender, unknownTime });
    const ziwei = createChart(year, month, day, hour, 0, gender==='M');

    const [natalChart, transitChart] = await Promise.all([
      calculateNatal({ year, month, day, hour, minute, unknownTime }),
      (()=>{ const t=new Date(); return calculateNatal({ year:t.getFullYear(), month:t.getMonth()+1, day:t.getDate(), hour:12, minute:0 }); })()
    ]);

    const today = new Date();
    const [yp, mp, dp] = getFourPillars(today.getFullYear(), today.getMonth()+1, today.getDate(), 12, 0, false);

    const infoLine = preInput
      ? `<div style="text-align:right;margin-bottom:8px"><span style="${D.sub}">${year}년 ${month}월 ${day}일 · ${gender==='F'?'여':'남'}</span></div>`
      : '';

    if (bodyEl) bodyEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px">
      ${infoLine}
      ${renderBasicFortune(saju, yp, mp, dp, gender)}
      ${renderDailyCalendar(saju, yp, mp, dp)}
      ${renderYongShin(saju)}
      ${renderSijunseong(saju)}
      ${renderZiweiSection(ziwei)}
      ${renderNatalSection(natalChart, transitChart, unknownTime)}
      <div style="text-align:center;padding:4px 0">
        <button id="gf-reset" type="button"
          style="color:#565d80;font-size:12px;text-decoration:underline;background:none;border:none;cursor:pointer">
          다른 생년월일로 다시 보기
        </button>
      </div>
      <p style="${D.muted};text-align:center;padding-bottom:4px">
        ※ 사주·자미두수·점성학 원국과 현재 날짜를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.
      </p>
    </div>`;

    document.getElementById('gf-reset')?.addEventListener('click', () => {
      if (bodyEl) bodyEl.innerHTML = inputHtml();
    });

  } catch (e) {
    console.error(e);
    if (bodyEl) {
      bodyEl.innerHTML = inputHtml();
      const err = document.getElementById('gf-error');
      if (err) { err.textContent=e.message||'계산 중 오류가 발생했습니다.'; err.style.display='block'; }
    }
  }
}

async function tryAutoRun() {
  const bodyEl = document.getElementById('gf-body');
  if (!bodyEl) return;
  let input = captureMainFormInput();
  if (!input) {
    try {
      const stored = sessionStorage.getItem('honcheon_last_input');
      if (stored) input = JSON.parse(stored);
    } catch {}
  }
  if (input) {
    await runFortune(input);
  } else {
    bodyEl.innerHTML = inputHtml();
  }
}

// ─── 마운트 ───────────────────────────────────────────────────

function mount() {
  const results = document.getElementById('results');
  if (!results || document.getElementById('honcheon-fortune-tabs')) return;
  if (results.children.length === 0) return;

  const tabs       = createTabs();
  const panel      = createPanel();
  const membership = createMembershipPanel();

  results.insertBefore(tabs, results.firstChild);
  results.appendChild(panel);
  results.appendChild(membership);

  switchTab('fortune', results);

  tabs.addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (btn) switchTab(btn.dataset.tab, results);
  });

  tryAutoRun().catch(console.error);
}

// ─── 글로벌 이벤트 ───────────────────────────────────────────

document.addEventListener('click', e => {
  if (e.target.id==='gf-calc' || e.target.closest('#gf-calc')) {
    runFortune(null).catch(console.error);
    return;
  }
  const btn = e.target.closest('button');
  if (btn && btn.textContent.includes('명식 산출하기')) {
    // capture 단계에서 React보다 먼저 실행 — 폼이 아직 DOM에 존재함
    const captured = captureMainFormInput();
    if (captured) {
      try { sessionStorage.setItem('honcheon_last_input', JSON.stringify(captured)); } catch {}
    }
    setTimeout(() => tryAutoRun().catch(console.error), 800);
  }
}, true);

new MutationObserver(mount).observe(document.body, { childList:true, subtree:true });
mount();
