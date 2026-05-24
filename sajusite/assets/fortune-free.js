// 무료 운세 패널 — 사주 · 자미두수 · 점성학 세 시스템 통합
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
const DAY_KR     = ['일','월','화','수','목','금','토'];
const WEALTH_SIP = new Set(['偏財','正財']);
const LOVE_SIP_F = new Set(['偏官','正官']);
const R_SCORE    = {'合':2,'沖':-2,'破':-1,'害':-1,'刑':-1.5,'怨嗔':-3,'鬼門':0};
const LEVELS = [
  { min:85, label:'대길(大吉)', color:'#b45309', bg:'#fef3c7', emoji:'⭐' },
  { min:70, label:'길(吉)',     color:'#15803d', bg:'#dcfce7', emoji:'✨' },
  { min:48, label:'평(平)',     color:'#1d4ed8', bg:'#dbeafe', emoji:'🌀' },
  { min:30, label:'소흉(小凶)', color:'#7c3aed', bg:'#f3e8ff', emoji:'⚡' },
  { min: 0, label:'흉(凶)',     color:'#dc2626', bg:'#fee2e2', emoji:'⚠️' },
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
function gauge(pct, color) {
  return `<div class="relative h-2.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
    <div class="absolute inset-y-0 left-0 rounded-full" style="width:${pct}%;background:${color}"></div>
  </div>`;
}
function getMainStars(palace) {
  return (palace?.stars||[]).filter(s => MAIN_STARS.has(s.name));
}

// ─── 메인 폼 데이터 자동 추출 ────────────────────────────────
// 메인 React 앱의 Radix UI Select 값을 읽어서 재입력 없이 자동 계산

function captureMainFormInput() {
  // Radix Select 트리거는 role="combobox" 버튼으로 렌더링됨
  const triggers = [...document.querySelectorAll('button[role="combobox"]')];

  let year = null, month = null, day = null, hour = 12, minute = 0,
      gender = 'M', unknownTime = false;

  for (const btn of triggers) {
    const txt = btn.textContent.trim();
    let m;
    if      ((m = txt.match(/^(\d{4})년$/)))   year  = +m[1];
    else if ((m = txt.match(/^(\d{1,2})월$/))) month = +m[1];
    else if ((m = txt.match(/^(\d{1,2})일$/))) day   = +m[1];
    else if ((m = txt.match(/^(\d{1,2})시$/))) {
      // disabled 상태이면 시간 모름
      if (btn.disabled || btn.hasAttribute('data-disabled')) unknownTime = true;
      else hour = +m[1];
    }
    else if ((m = txt.match(/^(\d{2})분$/)))   minute = +m[1];
  }

  // 시간 모름 스위치(role="switch") 체크
  const sw = document.querySelector('button[role="switch"]');
  if (sw && sw.getAttribute('data-state') === 'checked') {
    unknownTime = true;
    hour = 12;
  }

  // 성별: Radix ToggleGroup 아이템은 role="radio" 버튼
  const radioItems = [...document.querySelectorAll('button[role="radio"]')];
  for (const btn of radioItems) {
    if (btn.getAttribute('data-state') === 'on') {
      const txt = btn.textContent.trim();
      if (txt === '여' || txt.includes('여성') || txt === '女') gender = 'F';
      break;
    }
  }
  // 네이티브 라디오 버튼 폴백
  if (document.querySelector('input[type="radio"][value="F"]:checked')) gender = 'F';

  if (!year || !month || !day) return null;
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  return { year, month, day, hour: unknownTime ? 12 : hour, minute, gender, unknownTime };
}

// ─── 사주 기반 렌더 ───────────────────────────────────────────

function renderSajuToday(saju, yp, mp, dp) {
  const raw = compareToNatal(saju.pillars, dp)
            + compareToNatal(saju.pillars, mp)*0.5
            + compareToNatal(saju.pillars, yp)*0.3;
  const pct = toPct(raw, 3);
  const lv  = getLevel(pct);
  const lk  = getLucky(dp);
  const DESC = {
    '대길(大吉)':'하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정에 최적이며 기다리던 소식이 올 수 있습니다.',
    '길(吉)':    '기운이 좋은 날입니다. 계획한 일들이 차례로 진행되고 주변의 도움을 받기 쉬우니 적극적으로 행동해 보세요.',
    '평(平)':    '평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하는 것이 좋습니다.',
    '소흉(小凶)':'약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루고 차분하게 현재 상황을 점검하세요.',
    '흉(凶)':    '에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하세요.',
  };
  return `<div class="rounded-xl overflow-hidden border shadow-sm" style="background:linear-gradient(135deg,${lv.bg} 0%,#fff 55%)">
    <div class="p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="font-semibold">🌅 오늘의 운세 <span class="text-xs font-normal text-muted-foreground ml-1">사주</span></h4>
        <span class="text-xs text-muted-foreground">${ganziStr(yp)}년 ${ganziStr(mp)}월 ${ganziStr(dp)}일</span>
      </div>
      <div class="flex items-center gap-5">
        <div class="text-center shrink-0 w-20">
          <div class="text-5xl">${lv.emoji}</div>
          <div class="text-base font-bold mt-1" style="color:${lv.color}">${lv.label}</div>
        </div>
        <div class="flex-1">
          <div class="flex justify-between text-xs text-muted-foreground">\
            <span>운세 지수</span><span class="font-semibold">${Math.round(pct)}점</span>
          </div>
          ${gauge(pct, lv.color)}
          <p class="text-xs leading-5 mt-2 text-gray-700">${DESC[lv.label]||DESC['평(平)']}</p>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
        <div><div class="text-xs text-muted-foreground mb-1">행운의 색</div>
          <div class="flex items-center justify-center gap-1">
            <div class="w-4 h-4 rounded-full border border-white shadow" style="background:${lk.hex}"></div>
            <span class="text-sm font-medium">${lk.color}</span>
          </div>
        </div>
        <div><div class="text-xs text-muted-foreground mb-1">행운의 방향</div>
          <div class="text-sm font-medium">${lk.direction}</div></div>
        <div><div class="text-xs text-muted-foreground mb-1">행운의 숫자</div>
          <div class="text-sm font-medium">${lk.number}</div></div>
      </div>
    </div>
  </div>`;
}

function renderZodiac(saju) {
  const b = saju.pillars[3].pillar.branch;
  const z = ZODIAC_ANIMAL[b];
  if (!z) return '';
  const s = saju.pillars[3].pillar.stem;
  return `<div class="rounded-xl border bg-white shadow-sm p-5 flex items-start gap-4">
    <div class="text-5xl shrink-0">${z.emoji}</div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xl font-bold">${z.animal}띠 (${b})</span>
        <span class="text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-600">${s}${b}年</span>
      </div>
      <div class="text-xs text-muted-foreground mt-0.5">${z.years}년생</div>
      <p class="text-sm leading-6 mt-2 text-gray-700">${z.trait}</p>
    </div>
  </div>`;
}

function renderSajuMonthly(saju, mp, gender) {
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
  const wPct = toPct(calcW(mp), 3.5), wLv = getLevel(wPct);
  const lPct = toPct(calcL(mp), 3.5), lLv = getLevel(lPct);
  const wDesc = wPct>=70?'재물 흐름이 원활합니다. 투자나 중요한 재정 결정에 유리한 시기입니다.':wPct>=48?'지출을 점검하고 무리하지 않으면 안정적으로 유지됩니다.':'재물 누수가 생길 수 있습니다. 충동적인 지출을 삼가세요.';
  const lDesc = lPct>=70?'감정 흐름이 좋습니다. 마음을 표현하기 좋은 시기입니다.':lPct>=48?'차분하게 관계를 가꾸면 좋습니다.':'오해나 갈등에 주의하고 감정 표현에 신중하세요.';
  function card(emoji, title, pct, color, lv, desc) {
    return `<div class="rounded-xl border bg-white shadow-sm p-4 space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2"><span class="text-lg">${emoji}</span>
          <span class="font-semibold text-sm">${title}</span>
          <span class="text-xs text-muted-foreground">사주</span>
        </div>
        <span class="text-xs font-bold" style="color:${lv.color}">${lv.label}</span>
      </div>
      <div><div class="flex justify-between text-xs text-muted-foreground mb-1">
        <span>지수</span><span class="font-semibold">${Math.round(pct)}점</span>
      </div>${gauge(pct, color)}</div>
      <p class="text-xs leading-5 text-gray-600">${desc}</p>
    </div>`;
  }
  return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    ${card('💰','이번달 재물운',wPct,'#d97706',wLv,wDesc)}
    ${card('💕','이번달 애정운',lPct,'#ec4899',lLv,lDesc)}
  </div>`;
}

function renderCalendar(saju) {
  const today = new Date();
  const cells = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate()+i);
    const y=d.getFullYear(), m=d.getMonth()+1, day=d.getDate(), dow=DAY_KR[d.getDay()];
    const dowColor = d.getDay()===0?'color:#ef4444':d.getDay()===6?'color:#3b82f6':'color:#6b7280';
    let dp; try { [,,dp]=getFourPillars(y,m,day,12,0,false); } catch { continue; }
    const pct=toPct(compareToNatal(saju.pillars,dp),4), lv=getLevel(pct), lk=getLucky(dp);
    const stars='★'.repeat(Math.round(pct/20))+'☆'.repeat(5-Math.round(pct/20));
    const ring=i===0?'box-shadow:0 0 0 2px #818cf8':'', bg=i===0?`background:${lv.bg}`:'background:#fff';
    cells.push(`<div class="rounded-xl border text-center p-2 space-y-0.5" style="${bg};${ring}">
      <div class="text-xs font-medium" style="${dowColor}">${dow}</div>
      <div class="text-lg font-bold ${i===0?'text-indigo-600':''}">${day}${i===0?'<div style="font-size:9px;color:#818cf8;margin-top:-4px">오늘</div>':''}</div>
      <div class="text-xs font-mono text-gray-500">${ganziStr(dp)}</div>
      <div class="text-xs font-medium" style="color:${lv.color}">${lv.emoji}</div>
      <div class="text-xs" style="color:${lv.color};letter-spacing:-1px">${stars}</div>
      <div class="flex justify-center">
        <div class="w-4 h-4 rounded-full border border-white shadow-sm" style="background:${lk.hex}" title="${lk.color}"></div>
      </div>
    </div>`);
  }
  return `<div class="rounded-xl border bg-white shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b flex items-center justify-between">
      <h4 class="font-semibold text-sm">📅 럭키 캘린더</h4>
      <span class="text-xs text-muted-foreground">오늘 포함 7일 · 사주</span>
    </div>
    <div class="p-3 grid grid-cols-7 gap-1.5">${cells.join('')}</div>
    <div class="px-4 py-2 border-t text-xs text-muted-foreground flex gap-x-3 flex-wrap">
      <span>⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉</span>
      <span class="ml-auto">● 행운의 색</span>
    </div>
  </div>`;
}

// ─── 자미두수 기반 렌더 ───────────────────────────────────────

function renderZiweiSection(chart) {
  function palaceCard(palaceName, label, desc) {
    const palace = chart.palaces[palaceName];
    if (!palace) return '';
    const mains = getMainStars(palace);
    if (mains.length === 0) {
      return `<div class="rounded-xl border bg-white shadow-sm p-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm font-semibold">${label}</span>
          <span class="text-xs text-muted-foreground">${palace.ganZhi}</span>
        </div>
        <p class="text-xs text-gray-500">${desc}</p>
        <p class="text-xs text-muted-foreground mt-1">이 궁에는 주성이 없어 대궁(對宮) 성향으로 판단합니다.</p>
      </div>`;
    }
    const starCards = mains.map(s => {
      const info = STAR_DESC[s.name] || { fate: s.name, wealth: '', love: '' };
      const siHua = s.siHua ? `<span class="ml-1 text-xs px-1.5 py-0.5 rounded-full ${s.siHua==='化忌'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}">${SIHAU_LABEL[s.siHua]||s.siHua}</span>` : '';
      const bright = s.brightness ? `<span class="text-xs text-muted-foreground">(${s.brightness})</span>` : '';
      const content = palaceName==='命宮' ? info.fate : palaceName==='財帛' ? info.wealth : info.love;
      return `<div class="flex items-start gap-2">
        <span class="text-lg shrink-0">${palaceName==='命宮'?'🌟':palaceName==='財帛'?'💰':'💕'}</span>
        <div><div class="flex items-center gap-1 flex-wrap">
          <span class="font-semibold text-sm">${s.name} ${bright}</span>${siHua}
        </div>
        <p class="text-xs leading-5 text-gray-700 mt-0.5">${content}</p>
        </div>
      </div>`;
    }).join('');
    return `<div class="rounded-xl border bg-white shadow-sm p-4 space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold">${label}</span>
        <span class="text-xs text-muted-foreground bg-gray-100 rounded px-1.5">${palace.ganZhi} ${palaceName}</span>
      </div>
      ${starCards}
    </div>`;
  }

  const wu = chart.wuXingJu;
  return `<div class="rounded-xl border overflow-hidden shadow-sm">
    <div class="px-5 py-4 border-b" style="background:linear-gradient(135deg,#eef2ff,#fff)">
      <h4 class="font-semibold flex items-center gap-2">
        🌌 자미두수로 보는 운세
        <span class="text-xs font-normal text-muted-foreground">${wu?.name||''} · 명반 분석</span>
      </h4>
    </div>
    <div class="p-4 space-y-3">
      ${palaceCard('命宮', '🌟 기본 운명 (명궁)', '타고난 운명과 성격의 근간')}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${palaceCard('財帛', '💰 재물 성향 (재백궁)', '재물을 대하는 방식과 재물복')}
        ${palaceCard('夫妻', '💕 인연 성향 (부처궁)', '이성과 파트너십을 대하는 방식')}
      </div>
    </div>
  </div>`;
}

// ─── 점성학 기반 렌더 ─────────────────────────────────────────

function renderNatalSection(natalChart, transitChart, unknownTime) {
  const findPlanet = (chart, id) => chart.planets?.find(p => p.id === id);
  const signName = s => SIGN_KO[s] ?? (Array.isArray(ZODIAC_KO) ? ZODIAC_KO[s] : '알 수 없음');

  const sun     = findPlanet(natalChart, 'Sun');
  const moon    = findPlanet(natalChart, 'Moon');
  const asc     = !unknownTime && natalChart.houses ? natalChart.houses[0] : null;
  const jupiter = findPlanet(transitChart, 'Jupiter');
  const venus   = findPlanet(transitChart, 'Venus');

  const ascBlock = asc != null ? `
    <div class="flex items-start gap-3 py-2 border-b border-gray-50">
      <div class="w-8 text-center text-lg shrink-0">⬆️</div>
      <div><div class="text-sm font-semibold">상승궁 (ASC)</div>
        <div class="text-xs text-muted-foreground">${SIGN_EMOJI[Math.floor(asc/30)%12]} ${signName(Math.floor(asc/30)%12)}</div>
        <p class="text-xs text-gray-600 mt-0.5">타인에게 비치는 첫인상과 외면적 태도</p>
      </div>
    </div>` : '';

  return `<div class="rounded-xl border overflow-hidden shadow-sm">
    <div class="px-5 py-4 border-b" style="background:linear-gradient(135deg,#fdf4ff,#fff)">
      <h4 class="font-semibold flex items-center gap-2">
        🔭 점성학으로 보는 운세
        <span class="text-xs font-normal text-muted-foreground">서양 천궁도 분석</span>
      </h4>
    </div>
    <div class="p-4 space-y-0 divide-y divide-gray-50">

      ${sun ? `<div class="flex items-start gap-3 py-3">
        <div class="w-8 text-center text-xl shrink-0">☀️</div>
        <div><div class="text-sm font-semibold">태양 별자리 <span class="font-normal text-muted-foreground text-xs">핵심 정체성</span></div>
          <div class="text-sm font-bold mt-0.5">${SIGN_EMOJI[sun.sign]} ${signName(sun.sign)}</div>
          <p class="text-xs text-gray-600 mt-0.5">${SUN_DESC[sun.sign]||''}</p>
        </div>
      </div>` : ''}

      ${moon ? `<div class="flex items-start gap-3 py-3">
        <div class="w-8 text-center text-xl shrink-0">🌙</div>
        <div><div class="text-sm font-semibold">달 별자리 <span class="font-normal text-muted-foreground text-xs">감성·본능</span></div>
          <div class="text-sm font-bold mt-0.5">${SIGN_EMOJI[moon.sign]} ${signName(moon.sign)}</div>
          <p class="text-xs text-gray-600 mt-0.5">${MOON_DESC[moon.sign]||''}</p>
        </div>
      </div>` : ''}

      ${ascBlock}

      ${jupiter ? `<div class="flex items-start gap-3 py-3">
        <div class="w-8 text-center text-xl shrink-0">♃</div>
        <div><div class="text-sm font-semibold">목성 현재 위치 <span class="font-normal text-muted-foreground text-xs">올해 성장 영역</span></div>
          <div class="text-sm font-bold mt-0.5">${SIGN_EMOJI[jupiter.sign]} ${signName(jupiter.sign)}</div>
          <p class="text-xs text-gray-600 mt-0.5">${JUPITER_DESC[jupiter.sign]||''}</p>
        </div>
      </div>` : ''}

      ${venus ? `<div class="flex items-start gap-3 py-3">
        <div class="w-8 text-center text-xl shrink-0">♀</div>
        <div><div class="text-sm font-semibold">금성 현재 위치 <span class="font-normal text-muted-foreground text-xs">이번달 애정·재물 에너지</span></div>
          <div class="text-sm font-bold mt-0.5">${SIGN_EMOJI[venus.sign]} ${signName(venus.sign)}</div>
          <p class="text-xs text-gray-600 mt-0.5">${VENUS_DESC[venus.sign]||''}</p>
        </div>
      </div>` : ''}

    </div>
  </div>`;
}

// ─── 입력 폼 (자동 추출 실패 시 폴백) ─────────────────────────

function inputHtml() {
  return `<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
    <p class="text-sm text-amber-800 font-medium">생년월일시를 입력하면 사주 · 자미두수 · 점성학 무료 운세를 확인합니다. (회원가입 불필요)</p>
    <div class="flex flex-wrap gap-2">
      <input id="gf-year"  type="number" placeholder="출생년도" min="1900" max="2100"
        class="w-24 h-9 rounded-lg border border-input bg-white px-2 text-sm" />
      <input id="gf-month" type="number" placeholder="월" min="1" max="12"
        class="w-14 h-9 rounded-lg border border-input bg-white px-2 text-sm" />
      <input id="gf-day"   type="number" placeholder="일" min="1" max="31"
        class="w-14 h-9 rounded-lg border border-input bg-white px-2 text-sm" />
      <input id="gf-hour"  type="number" placeholder="시(0-23)" min="0" max="23"
        class="w-24 h-9 rounded-lg border border-input bg-white px-2 text-sm" />
      <label class="flex items-center gap-1.5 text-sm self-center">
        <input id="gf-unknown" type="checkbox" /> 시간 미상
      </label>
    </div>
    <div class="flex gap-4">
      <label class="flex items-center gap-1.5 text-sm"><input type="radio" name="gf-gender" value="M" checked /> 남</label>
      <label class="flex items-center gap-1.5 text-sm"><input type="radio" name="gf-gender" value="F" /> 여</label>
    </div>
    <button id="gf-calc" type="button"
      class="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      style="background:linear-gradient(135deg,#f59e0b,#d97706)">
      🔮 무료 운세 보기 (사주 · 자미두수 · 점성학)
    </button>
    <div id="gf-error" class="text-xs text-red-500 hidden"></div>
  </div>`;
}

// ─── 패널 생성 ────────────────────────────────────────────────

function createPanel() {
  const el = document.createElement('div');
  el.id = 'honcheon-fortune-panel';
  el.className = 'space-y-4';
  el.style.display = 'none';
  el.innerHTML = `<div class="rounded-lg border bg-card p-4 md:p-6 shadow-soft space-y-4">
    <div>
      <h3 class="font-serif-display text-xl">🔮 무료 운세</h3>
      <p class="text-sm text-muted-foreground mt-1">사주 · 자미두수 · 점성학 세 시스템 통합 분석 (회원가입 불필요)</p>
    </div>
    <div id="gf-body">
      <p class="text-sm text-muted-foreground text-center py-6 animate-pulse">운세를 계산하는 중입니다…</p>
    </div>
  </div>`;
  return el;
}

function membershipCard() {
  return `<div class="rounded-lg border bg-card p-4 md:p-6 shadow-soft">
    <div class="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center space-y-3">
      <div class="text-4xl">🔐</div>
      <div class="text-lg font-bold text-amber-800">멤버십 전용 상세 분석</div>
      <p class="text-sm text-amber-700">사주팔자 · 자미두수 · 천궁도 전체 결과를<br/>PDF로 정리하여 제공합니다.</p>
      <div class="text-xs text-amber-600 space-y-1">
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
  el.className = 'flex rounded-xl border bg-muted p-1 gap-1';
  el.innerHTML = `
    <button data-tab="fortune"
      class="flex-1 rounded-lg px-4 py-2 text-sm font-medium bg-background shadow-sm text-foreground transition-colors">
      🔮 무료 운세
    </button>
    <button data-tab="detail"
      class="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
  const fortunePanel    = document.getElementById('honcheon-fortune-panel');
  const membershipPanel = document.getElementById('honcheon-membership-panel');
  const tabs            = document.getElementById('honcheon-fortune-tabs');
  if (!tabs) return;

  tabs.querySelectorAll('button').forEach(btn => {
    const active = btn.dataset.tab === tabId;
    btn.className = `flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`;
  });

  Array.from(results.children).forEach(child => {
    const id = child.id;
    if (id === 'honcheon-fortune-tabs') return;
    if (id === 'honcheon-fortune-panel')    { child.style.display = tabId==='fortune' ? '' : 'none'; return; }
    if (id === 'honcheon-membership-panel') { child.style.display = tabId==='detail'  ? '' : 'none'; return; }
    if (id === 'honcheon-ai-panel')         { child.style.display = 'none'; return; }
    if (id === 'honcheon-gunghap-panel')    { child.style.display = tabId==='detail'  ? '' : 'none'; return; }
    child.style.display = tabId==='detail' ? '' : 'none';
  });
}

// ─── 계산 실행 ────────────────────────────────────────────────

async function runFortune(preInput = null) {
  const errorEl = document.getElementById('gf-error');
  const bodyEl  = document.getElementById('gf-body');

  // 입력값을 innerHTML 교체 전에 먼저 읽어야 함
  let year, month, day, hour, minute, gender, unknownTime;
  if (preInput) {
    ({ year, month, day, hour, minute, gender, unknownTime } = preInput);
  } else {
    year       = parseInt(document.getElementById('gf-year')?.value   || '');
    month      = parseInt(document.getElementById('gf-month')?.value  || '');
    day        = parseInt(document.getElementById('gf-day')?.value    || '');
    unknownTime = document.getElementById('gf-unknown')?.checked ?? false;
    hour       = unknownTime ? 12 : parseInt(document.getElementById('gf-hour')?.value || '12');
    minute     = 0;
    gender     = document.querySelector('input[name="gf-gender"]:checked')?.value ?? 'M';
  }

  if (errorEl) { errorEl.textContent=''; errorEl.classList.add('hidden'); }
  if (bodyEl) bodyEl.innerHTML = '<p class="text-sm text-muted-foreground animate-pulse py-4 text-center">계산 중… 잠시만 기다려주세요.</p>';

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

    const sourceLabel = preInput
      ? `<span class="text-xs text-muted-foreground">${year}년 ${month}월 ${day}일 · ${gender==='F'?'여':'남'}</span>`
      : '';

    if (bodyEl) bodyEl.innerHTML = `<div class="space-y-5">
      ${sourceLabel ? `<div class="flex justify-end">${sourceLabel}</div>` : ''}
      ${renderSajuToday(saju, yp, mp, dp)}
      ${renderZodiac(saju)}
      ${renderSajuMonthly(saju, mp, gender)}
      <hr class="border-dashed" />
      ${renderZiweiSection(ziwei)}
      <hr class="border-dashed" />
      ${renderNatalSection(natalChart, transitChart, unknownTime)}
      <hr class="border-dashed" />
      ${renderCalendar(saju)}
      <div class="flex justify-center pt-1">
        <button id="gf-reset" type="button" class="text-xs text-muted-foreground underline hover:text-foreground">
          다른 생년월일로 다시 보기
        </button>
      </div>
      <p class="text-xs text-center text-muted-foreground pb-2">
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
      if (err) { err.textContent=e.message||'계산 중 오류가 발생했습니다.'; err.classList.remove('hidden'); }
    }
  }
}

// 메인 폼 데이터를 자동 추출해서 운세 계산
async function tryAutoRun() {
  const bodyEl = document.getElementById('gf-body');
  if (!bodyEl) return;
  const input = captureMainFormInput();
  if (input) {
    await runFortune(input);
  } else {
    // 자동 추출 실패 시 입력 폼 표시
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

  // 패널이 마운트되면 메인 폼 데이터를 자동으로 읽어서 운세 계산
  tryAutoRun().catch(console.error);
}

// ─── 글로벌 이벤트 ───────────────────────────────────────────

document.addEventListener('click', e => {
  // 직접 입력 폼의 계산 버튼
  if (e.target.id==='gf-calc' || e.target.closest('#gf-calc')) {
    runFortune(null).catch(console.error);
    return;
  }
  // 메인 폼 "명식 산출하기" 재클릭 → 새 데이터로 자동 갱신
  const btn = e.target.closest('button');
  if (btn && btn.textContent.includes('명식 산출하기')) {
    setTimeout(() => tryAutoRun().catch(console.error), 800);
  }
});

new MutationObserver(mount).observe(document.body, { childList:true, subtree:true });
mount();
