// 무료 운세 패널 — 오늘의 운세·띠·재물운·애정운·럭키 캘린더
import { calculateSaju } from './orrery-core/saju.js';
import { getFourPillars, analyzePillarRelations } from './orrery-core/pillars.js';

// ─── 상수 ─────────────────────────────────────────────────────

const ZODIAC = {
  '子': { animal: '쥐', emoji: '🐭', years: '1948·1960·1972·1984·1996·2008·2020', trait: '영리하고 재치가 넘치며 임기응변이 뛰어납니다. 재물복이 있고 사교성이 풍부합니다.' },
  '丑': { animal: '소', emoji: '🐂', years: '1949·1961·1973·1985·1997·2009·2021', trait: '성실하고 인내심이 강하며 묵묵히 목표를 향해 나아가는 타입입니다.' },
  '寅': { animal: '호랑이', emoji: '🐯', years: '1950·1962·1974·1986·1998·2010·2022', trait: '용감하고 리더십이 강하며 열정적이고 독립심이 넘칩니다.' },
  '卯': { animal: '토끼', emoji: '🐰', years: '1951·1963·1975·1987·1999·2011·2023', trait: '온화하고 섬세하며 예술적 감각이 뛰어나고 대인관계가 원만합니다.' },
  '辰': { animal: '용', emoji: '🐉', years: '1952·1964·1976·1988·2000·2012·2024', trait: '카리스마 넘치고 야망이 크며 성취욕이 강하고 창의적입니다.' },
  '巳': { animal: '뱀', emoji: '🐍', years: '1953·1965·1977·1989·2001·2013·2025', trait: '직관이 예리하고 지혜로우며 신중하고 끈기 있게 목표를 추구합니다.' },
  '午': { animal: '말', emoji: '🐎', years: '1954·1966·1978·1990·2002·2014·2026', trait: '활동적이고 자유로운 영혼으로 에너지가 넘치고 낙관적입니다.' },
  '未': { animal: '양', emoji: '🐑', years: '1955·1967·1979·1991·2003·2015·2027', trait: '온순하고 예술적이며 공감 능력이 뛰어나고 평화를 사랑합니다.' },
  '申': { animal: '원숭이', emoji: '🐒', years: '1956·1968·1980·1992·2004·2016·2028', trait: '영리하고 재주가 많으며 호기심이 왕성하고 적응력이 탁월합니다.' },
  '酉': { animal: '닭', emoji: '🐓', years: '1957·1969·1981·1993·2005·2017·2029', trait: '꼼꼼하고 완벽을 추구하며 실용적이고 부지런합니다.' },
  '戌': { animal: '개', emoji: '🐕', years: '1958·1970·1982·1994·2006·2018·2030', trait: '충직하고 정직하며 강한 정의감과 책임감을 지닙니다.' },
  '亥': { animal: '돼지', emoji: '🐷', years: '1959·1971·1983·1995·2007·2019·2031', trait: '넉넉하고 복이 많으며 진실하고 너그러운 성품입니다.' },
};

const ELEMENT_LUCKY = {
  '목': { color: '초록',  hex: '#22c55e', direction: '동쪽', numbers: [3, 8] },
  '화': { color: '빨강',  hex: '#ef4444', direction: '남쪽', numbers: [2, 7] },
  '토': { color: '황토',  hex: '#d97706', direction: '중앙', numbers: [5, 0] },
  '금': { color: '흰색',  hex: '#94a3b8', direction: '서쪽', numbers: [4, 9] },
  '수': { color: '검정',  hex: '#334155', direction: '북쪽', numbers: [1, 6] },
};

const STEM_ELEM = {
  '甲':'목','乙':'목','丙':'화','丁':'화','戊':'토',
  '己':'토','庚':'금','辛':'금','壬':'수','癸':'수',
};
const STEM_KR = {
  '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무',
  '己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
};
const BRANCH_KR = {
  '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사',
  '午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해',
};
const DAY_KR = ['일','월','화','수','목','금','토'];

const WEALTH_SIPSIN  = new Set(['偏財','正財']);
const OFFICIAL_SIPSIN = new Set(['偏官','正官']);

const LEVELS = [
  { min:85, label:'대길(大吉)', color:'#b45309', bg:'#fef3c7', emoji:'⭐' },
  { min:70, label:'길(吉)',     color:'#15803d', bg:'#dcfce7', emoji:'✨' },
  { min:48, label:'평(平)',     color:'#1d4ed8', bg:'#dbeafe', emoji:'🌀' },
  { min:30, label:'소흉(小凶)', color:'#7c3aed', bg:'#f3e8ff', emoji:'⚡' },
  { min: 0, label:'흉(凶)',     color:'#dc2626', bg:'#fee2e2', emoji:'⚠️' },
];

// ─── 점수 계산 ────────────────────────────────────────────────

const R_SCORE = {'合':2,'沖':-2,'破':-1,'害':-1,'刑':-1.5,'怨嗔':-3,'鬼門':0};

function relScore(rels) {
  return rels.reduce((s,r) => s + (R_SCORE[r.type] || 0), 0);
}

function compareToNatal(natalPillars, ganzi) {
  return natalPillars.reduce((sum, p) => {
    const r = analyzePillarRelations(p.pillar.ganzi, ganzi);
    return sum + relScore(r.stem) + relScore(r.branch);
  }, 0);
}

function toPct(raw, scale = 4) {
  return Math.max(5, Math.min(97, 50 + raw * scale));
}

function getLevel(pct) {
  return LEVELS.find(l => pct >= l.min) || LEVELS[LEVELS.length - 1];
}

function getLucky(ganzi) {
  const elem = STEM_ELEM[ganzi[0]] || '토';
  const info = ELEMENT_LUCKY[elem];
  const n = info.numbers[(ganzi[1].charCodeAt(0)) % 2];
  return { ...info, number: n, elem };
}

function ganziStr(ganzi) {
  return `${STEM_KR[ganzi[0]]||ganzi[0]}${BRANCH_KR[ganzi[1]]||ganzi[1]}`;
}

// ─── 재물운/애정운 ────────────────────────────────────────────

function calcWealthScore(natalSaju, monthGanzi) {
  let score = compareToNatal(natalSaju.pillars, monthGanzi);
  for (const p of natalSaju.pillars) {
    if (WEALTH_SIPSIN.has(p.stemSipsin) || WEALTH_SIPSIN.has(p.branchSipsin)) {
      const r = analyzePillarRelations(p.pillar.ganzi, monthGanzi);
      if ([...r.stem,...r.branch].some(x => x.type === '合')) score += 3;
    }
  }
  return score;
}

function calcLoveScore(natalSaju, monthGanzi, gender) {
  let score = compareToNatal(natalSaju.pillars, monthGanzi);
  const target = gender === 'F' ? OFFICIAL_SIPSIN : WEALTH_SIPSIN;
  for (const p of natalSaju.pillars) {
    if (target.has(p.stemSipsin) || target.has(p.branchSipsin)) {
      const r = analyzePillarRelations(p.pillar.ganzi, monthGanzi);
      if ([...r.stem,...r.branch].some(x => x.type === '合')) score += 3;
    }
    const r = analyzePillarRelations(p.pillar.ganzi, monthGanzi);
    if (r.branch.some(x => x.type === '合')) score += 1;
  }
  return score;
}

// ─── 렌더 함수들 ──────────────────────────────────────────────

function gauge(pct, color) {
  return `<div class="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
    <div class="absolute inset-y-0 left-0 rounded-full" style="width:${pct}%;background:${color}"></div>
  </div>`;
}

function renderToday(natalSaju, yp, mp, dp) {
  const raw = compareToNatal(natalSaju.pillars, dp)
            + compareToNatal(natalSaju.pillars, mp) * 0.5
            + compareToNatal(natalSaju.pillars, yp) * 0.3;
  const pct = toPct(raw, 3);
  const lv  = getLevel(pct);
  const lk  = getLucky(dp);

  const DESC = {
    '대길(大吉)': '하는 일마다 순탄하게 풀리는 날입니다. 새로운 시작이나 중요한 결정을 내리기에 최적이며, 기다리던 좋은 소식이 올 수 있습니다.',
    '길(吉)':     '전반적으로 기운이 좋은 날입니다. 계획한 일들이 차례로 진행되고 주변의 도움을 받기 쉬운 날이니 적극적으로 행동해 보세요.',
    '평(平)':     '특별한 굴곡 없이 평온하게 흘러가는 날입니다. 무리한 새 시도보다 기존 일을 꼼꼼히 마무리하는 것이 좋습니다.',
    '소흉(小凶)': '약간의 주의가 필요한 날입니다. 중요한 결정이나 큰 지출은 미루고 차분하게 현재 상황을 점검하세요.',
    '흉(凶)':     '에너지 소모가 클 수 있는 날입니다. 충동적인 행동을 자제하고 안정을 취하면서 내면을 돌보는 날로 삼으세요.',
  };

  return `<div class="rounded-xl overflow-hidden border shadow-sm" style="background:linear-gradient(135deg,${lv.bg} 0%,#fff 60%)">
    <div class="p-5 space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="font-semibold">오늘의 운세</h4>
        <span class="text-xs text-muted-foreground">${ganziStr(yp)}년 ${ganziStr(mp)}월 ${ganziStr(dp)}일</span>
      </div>
      <div class="flex items-center gap-5">
        <div class="text-center shrink-0 w-20">
          <div class="text-5xl">${lv.emoji}</div>
          <div class="text-base font-bold mt-1" style="color:${lv.color}">${lv.label}</div>
        </div>
        <div class="flex-1 space-y-2">
          <div class="flex justify-between text-xs text-muted-foreground">
            <span>운세 지수</span><span class="font-semibold">${Math.round(pct)}점</span>
          </div>
          ${gauge(pct, lv.color)}
          <p class="text-xs leading-5 text-gray-700">${DESC[lv.label] || DESC['평(平)']}</p>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
        <div>
          <div class="text-xs text-muted-foreground mb-1">행운의 색</div>
          <div class="flex items-center justify-center gap-1">
            <div class="w-4 h-4 rounded-full border border-white shadow" style="background:${lk.hex}"></div>
            <span class="text-sm font-medium">${lk.color}</span>
          </div>
        </div>
        <div>
          <div class="text-xs text-muted-foreground mb-1">행운의 방향</div>
          <div class="text-sm font-medium">${lk.direction}</div>
        </div>
        <div>
          <div class="text-xs text-muted-foreground mb-1">행운의 숫자</div>
          <div class="text-sm font-medium">${lk.number}</div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderZodiac(natalSaju) {
  const branch = natalSaju.pillars[3].pillar.branch;
  const z = ZODIAC[branch];
  if (!z) return '';
  const yearStem = natalSaju.pillars[3].pillar.stem;
  return `<div class="rounded-xl border bg-white shadow-sm p-5 flex items-start gap-4">
    <div class="text-5xl shrink-0">${z.emoji}</div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xl font-bold">${z.animal}띠 (${branch})</span>
        <span class="text-xs bg-gray-100 rounded-full px-2 py-0.5 text-gray-600">${yearStem}${branch}年</span>
      </div>
      <div class="text-xs text-muted-foreground mt-0.5">${z.years}년생</div>
      <p class="text-sm leading-6 mt-2 text-gray-700">${z.trait}</p>
    </div>
  </div>`;
}

function renderMonthly(natalSaju, mp, gender) {
  const wRaw = calcWealthScore(natalSaju, mp);
  const lRaw = calcLoveScore(natalSaju, mp, gender);
  const wPct = toPct(wRaw, 3.5);
  const lPct = toPct(lRaw, 3.5);
  const wLv  = getLevel(wPct);
  const lLv  = getLevel(lPct);

  const wDesc = wPct >= 70
    ? '재물 흐름이 원활합니다. 투자나 중요한 재정 결정에 유리한 시기입니다.'
    : wPct >= 48
    ? '지출을 점검하고 무리하지 않으면 안정적으로 유지됩니다.'
    : '재물 누수가 생길 수 있습니다. 충동적인 지출을 삼가세요.';

  const lDesc = lPct >= 70
    ? '감정의 흐름이 좋습니다. 마음을 표현하기 좋은 시기이며 인연의 발전도 기대됩니다.'
    : lPct >= 48
    ? '소소한 변화가 있을 수 있습니다. 차분하게 관계를 가꾸세요.'
    : '오해나 갈등이 생길 수 있습니다. 감정 표현에 신중하세요.';

  function card(emoji, title, pct, color, lv, desc) {
    return `<div class="rounded-xl border bg-white shadow-sm p-4 space-y-2.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">${emoji}</span>
          <span class="font-semibold text-sm">${title}</span>
        </div>
        <span class="text-xs font-bold" style="color:${lv.color}">${lv.label}</span>
      </div>
      <div>
        <div class="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>지수</span><span class="font-semibold">${Math.round(pct)}점</span>
        </div>
        ${gauge(pct, color)}
      </div>
      <p class="text-xs leading-5 text-gray-600">${desc}</p>
    </div>`;
  }

  return `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    ${card('💰', '이번달 재물운', wPct, '#d97706', wLv, wDesc)}
    ${card('💕', '이번달 애정운', lPct, '#ec4899', lLv, lDesc)}
  </div>`;
}

function renderCalendar(natalSaju) {
  const today = new Date();
  const cells = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    const dow = DAY_KR[d.getDay()];
    const dowColor = d.getDay() === 0 ? 'color:#ef4444' : d.getDay() === 6 ? 'color:#3b82f6' : 'color:#6b7280';

    let dp;
    try {
      [,, dp] = getFourPillars(y, m, day, 12, 0, false);
    } catch { continue; }

    const raw = compareToNatal(natalSaju.pillars, dp);
    const pct = toPct(raw, 4);
    const lv  = getLevel(pct);
    const lk  = getLucky(dp);

    const starCount = Math.round(pct / 20);
    const starStr   = '★'.repeat(starCount) + '☆'.repeat(5 - starCount);

    const ring = i === 0 ? 'box-shadow:0 0 0 2px #818cf8' : '';
    const bg   = i === 0 ? `background:${lv.bg}` : 'background:#fff';

    cells.push(`<div class="rounded-xl border text-center p-2 space-y-1" style="${bg};${ring}">
      <div class="text-xs font-medium" style="${dowColor}">${dow}</div>
      <div class="text-lg font-bold ${i===0?'text-indigo-600':''}">${day}${i===0?'<div class="text-xs font-normal text-indigo-400" style="margin-top:-4px">오늘</div>':''}</div>
      <div class="text-xs font-mono text-gray-500">${ganziStr(dp)}</div>
      <div class="text-xs font-medium" style="color:${lv.color}">${lv.emoji}</div>
      <div class="text-xs" style="color:${lv.color};letter-spacing:-1px">${starStr}</div>
      <div class="flex justify-center">
        <div class="w-4 h-4 rounded-full border border-white shadow-sm" style="background:${lk.hex}" title="${lk.color}"></div>
      </div>
    </div>`);
  }

  return `<div class="rounded-xl border bg-white shadow-sm overflow-hidden">
    <div class="px-4 py-3 border-b flex items-center justify-between">
      <h4 class="font-semibold text-sm">📅 럭키 캘린더</h4>
      <span class="text-xs text-muted-foreground">오늘 포함 7일</span>
    </div>
    <div class="p-3 grid grid-cols-7 gap-1.5">${cells.join('')}</div>
    <div class="px-4 py-2 border-t flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span>⭐대길 ✨길 🌀평 ⚡소흉 ⚠️흉</span>
      <span class="ml-auto flex items-center gap-1">●행운의 색</span>
    </div>
  </div>`;
}

// ─── 입력 폼 & 패널 ───────────────────────────────────────────

function inputHtml() {
  return `<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
    <p class="text-sm text-amber-800 font-medium">생년월일시를 입력하면 무료 운세를 확인할 수 있습니다. (회원가입 불필요)</p>
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
      class="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      style="background:linear-gradient(135deg,#f59e0b,#d97706)">
      🔮 무료 운세 보기
    </button>
    <div id="gf-error" class="text-xs text-red-500 hidden"></div>
  </div>`;
}

function createPanel() {
  const el = document.createElement('div');
  el.id = 'honcheon-fortune-panel';
  el.className = 'space-y-4';
  el.style.display = 'none';
  el.innerHTML = `<div class="rounded-lg border bg-card p-4 md:p-6 shadow-soft space-y-4">
    <div>
      <h3 class="font-serif-display text-xl">🔮 무료 운세</h3>
      <p class="text-sm text-muted-foreground mt-1">오늘의 운세 · 당신의 띠 · 재물운 · 애정운 · 럭키 캘린더</p>
    </div>
    <div id="gf-body">${inputHtml()}</div>
  </div>`;
  return el;
}

function createTabs() {
  const el = document.createElement('div');
  el.id = 'honcheon-fortune-tabs';
  el.className = 'flex rounded-xl border bg-muted p-1 gap-1';
  el.innerHTML = `
    <button data-tab="detail"
      class="flex-1 rounded-lg px-4 py-2 text-sm font-medium bg-background shadow-sm text-foreground transition-colors">
      📊 상세 분석
    </button>
    <button data-tab="fortune"
      class="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
      🔮 무료 운세
    </button>`;
  return el;
}

// ─── 탭 전환 ─────────────────────────────────────────────────

const PANEL_IDS = new Set(['honcheon-fortune-tabs','honcheon-fortune-panel','honcheon-gunghap-panel','honcheon-ai-panel']);

function switchTab(tabId, results) {
  const fortunePanel = document.getElementById('honcheon-fortune-panel');
  const tabs = document.getElementById('honcheon-fortune-tabs');
  if (!tabs || !fortunePanel) return;

  tabs.querySelectorAll('button').forEach(btn => {
    const active = btn.dataset.tab === tabId;
    btn.className = `flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`;
  });

  Array.from(results.children).forEach(child => {
    if (child.id === 'honcheon-fortune-tabs') return;
    if (child.id === 'honcheon-fortune-panel') {
      child.style.display = tabId === 'fortune' ? '' : 'none';
    } else {
      child.style.display = tabId === 'detail' ? '' : 'none';
    }
  });
}

// ─── 운세 계산 실행 ───────────────────────────────────────────

function runFortune() {
  const errorEl = document.getElementById('gf-error');
  const bodyEl  = document.getElementById('gf-body');
  if (errorEl) { errorEl.textContent = ''; errorEl.classList.add('hidden'); }

  try {
    const year    = parseInt(document.getElementById('gf-year')?.value  || '');
    const month   = parseInt(document.getElementById('gf-month')?.value || '');
    const day     = parseInt(document.getElementById('gf-day')?.value   || '');
    const unknown = document.getElementById('gf-unknown')?.checked ?? false;
    const hour    = unknown ? 12 : parseInt(document.getElementById('gf-hour')?.value || '12');
    const gender  = document.querySelector('input[name="gf-gender"]:checked')?.value ?? 'M';

    if (!year || !month || !day) throw new Error('생년월일을 입력해주세요.');
    if (year < 1900 || year > 2100) throw new Error('올바른 연도를 입력해주세요.');

    const natal = calculateSaju({ year, month, day, hour, minute: 0, gender, unknownTime: unknown });
    const today = new Date();
    const [yp, mp, dp] = getFourPillars(
      today.getFullYear(), today.getMonth() + 1, today.getDate(), 12, 0, false
    );

    bodyEl.innerHTML = `<div class="space-y-4">
      ${renderToday(natal, yp, mp, dp)}
      ${renderZodiac(natal)}
      ${renderMonthly(natal, mp, gender)}
      ${renderCalendar(natal)}
      <div class="flex justify-center pt-1">
        <button id="gf-reset" type="button" class="text-xs text-muted-foreground underline hover:text-foreground">
          다른 생년월일로 다시 보기
        </button>
      </div>
      <p class="text-xs text-center text-muted-foreground">
        ※ 사주 원국과 오늘 날짜의 합충 관계를 기반으로 자동 계산됩니다. 참고용으로 활용하세요.
      </p>
    </div>`;

    document.getElementById('gf-reset')?.addEventListener('click', () => {
      bodyEl.innerHTML = inputHtml();
    });

  } catch (e) {
    const err = document.getElementById('gf-error');
    if (err) { err.textContent = e.message; err.classList.remove('hidden'); }
  }
}

// ─── 마운트 ───────────────────────────────────────────────────

function mount() {
  const results = document.getElementById('results');
  if (!results || document.getElementById('honcheon-fortune-tabs')) return;
  if (results.children.length === 0) return;

  const tabs  = createTabs();
  const panel = createPanel();

  results.insertBefore(tabs, results.firstChild);
  results.appendChild(panel);

  tabs.addEventListener('click', e => {
    const btn = e.target.closest('[data-tab]');
    if (btn) switchTab(btn.dataset.tab, results);
  });

  document.addEventListener('click', e => {
    if (e.target.id === 'gf-calc' || e.target.closest('#gf-calc')) runFortune();
  });
}

new MutationObserver(mount).observe(document.body, { childList: true, subtree: true });
mount();
