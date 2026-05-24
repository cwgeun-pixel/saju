// 사주 궁합(四柱 相性) 패널 — 두 사람의 생년월일시로 합충 분석
import { calculateSaju } from './orrery-core/saju.js';
import { analyzePillarRelations } from './orrery-core/pillars.js';

// ─── 상수 ─────────────────────────────────────────────────────

const PILLAR_LABELS = ['시(時)', '일(日)', '월(月)', '연(年)'];

const STEM_ELEMENT = {
  '甲': '목', '乙': '목',
  '丙': '화', '丁': '화',
  '戊': '토', '己': '토',
  '庚': '금', '辛': '금',
  '壬': '수', '癸': '수',
};

const STEM_KR = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
  '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
};

const BRANCH_KR = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘',
  '辰': '진', '巳': '사', '午': '오', '未': '미',
  '申': '신', '酉': '유', '戌': '술', '亥': '해',
};

// type 값 → 표시 정보. type은 한자 문자열 (예: "合", "沖", "怨嗔")
const RELATION_INFO = {
  '合':  { label: '합(合)',       cls: 'bg-emerald-100 text-emerald-800', score:  2 },
  '沖':  { label: '충(沖)',       cls: 'bg-red-100 text-red-800',         score: -2 },
  '破':  { label: '파(破)',       cls: 'bg-orange-100 text-orange-800',   score: -1 },
  '害':  { label: '해(害)',       cls: 'bg-orange-100 text-orange-800',   score: -1 },
  '刑':  { label: '형(刑)',       cls: 'bg-rose-100 text-rose-800',       score: -1.5 },
  '怨嗔': { label: '원진(怨嗔)', cls: 'bg-purple-100 text-purple-800',   score: -3 },
  '鬼門': { label: '귀문(鬼門)', cls: 'bg-violet-100 text-violet-800',   score:  0 },
};

// 오행 상생상극
const GENERATES = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
const CONTROLS  = { '목': '토', '화': '금', '토': '수', '수': '화', '금': '목' };

// ─── 유틸 ─────────────────────────────────────────────────────

function ganziLabel(ganzi) {
  if (!ganzi) return '?';
  const [s, b] = ganzi;
  return `${STEM_KR[s] || s}${BRANCH_KR[b] || b}(${s}${b})`;
}

function elemRelation(eA, eB) {
  if (eA === eB)               return { label: `${eA} = ${eB} (비겁)`,         cls: 'text-gray-600' };
  if (GENERATES[eA] === eB)    return { label: `${eA}이 ${eB}를 생함 (상생)`,  cls: 'text-emerald-700' };
  if (GENERATES[eB] === eA)    return { label: `${eB}이 ${eA}를 생함 (상생)`,  cls: 'text-emerald-600' };
  if (CONTROLS[eA]  === eB)    return { label: `${eA}이 ${eB}를 극함 (상극)`,  cls: 'text-amber-700' };
  if (CONTROLS[eB]  === eA)    return { label: `${eB}이 ${eA}를 극함 (상극)`,  cls: 'text-amber-600' };
  return { label: '특별한 관계 없음', cls: 'text-gray-500' };
}

function renderBadges(rels) {
  if (!rels || rels.length === 0) return '<span class="text-xs text-gray-400">없음</span>';
  return rels.map(r => {
    const info = RELATION_INFO[r.type] || { label: r.type, cls: 'bg-gray-100 text-gray-700' };
    const detail = r.detail ? ` <span class="opacity-60">(${r.detail})</span>` : '';
    return `<span class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${info.cls}">${info.label}${detail}</span>`;
  }).join(' ');
}

function scoreLabel(n) {
  if (n >=  4) return { text: '매우 좋은 궁합', cls: 'text-emerald-600' };
  if (n >=  2) return { text: '좋은 궁합',      cls: 'text-emerald-500' };
  if (n >=  0) return { text: '무난한 궁합',     cls: 'text-gray-700'   };
  if (n >= -2) return { text: '주의 필요',       cls: 'text-amber-600'  };
  return          { text: '어려운 궁합',          cls: 'text-red-600'    };
}

// ─── 입력 폼 HTML ─────────────────────────────────────────────

function formHtml(id, heading) {
  return `
    <div class="flex-1 min-w-0 space-y-2">
      <h4 class="text-sm font-semibold text-muted-foreground">${heading}</h4>
      <input id="${id}-name" type="text" placeholder="이름 (선택)"
        class="w-full h-8 rounded border border-input bg-background px-2 text-sm" />
      <div class="flex gap-1">
        <input id="${id}-year"  type="number" placeholder="년" min="1900" max="2100"
          class="w-[4.5rem] h-8 rounded border border-input bg-background px-2 text-sm" />
        <input id="${id}-month" type="number" placeholder="월" min="1" max="12"
          class="w-12 h-8 rounded border border-input bg-background px-2 text-sm" />
        <input id="${id}-day"   type="number" placeholder="일" min="1" max="31"
          class="w-12 h-8 rounded border border-input bg-background px-2 text-sm" />
      </div>
      <div class="flex gap-2 items-center">
        <input id="${id}-hour" type="number" placeholder="시(0-23)" min="0" max="23"
          class="w-24 h-8 rounded border border-input bg-background px-2 text-sm" />
        <label class="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
          <input id="${id}-unknown" type="checkbox" /> 시간 미상
        </label>
      </div>
      <div class="flex gap-4">
        <label class="flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" name="${id}-gender" value="M" checked /> 남
        </label>
        <label class="flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" name="${id}-gender" value="F" /> 여
        </label>
      </div>
    </div>`;
}

// ─── 패널 생성 ────────────────────────────────────────────────

function createPanel() {
  const panel = document.createElement('section');
  panel.id = 'honcheon-gunghap-panel';
  panel.className = 'rounded-lg border bg-card p-4 md:p-6 shadow-soft space-y-4';
  panel.innerHTML = `
    <div>
      <h3 class="font-serif-display text-xl">궁합 (四柱 相性)</h3>
      <p class="text-sm text-muted-foreground mt-1">두 사람의 생년월일시로 사주 궁합을 분석합니다.</p>
    </div>
    <div class="flex flex-col sm:flex-row gap-6">
      ${formHtml('gha', '👤 첫 번째 사람')}
      <div class="hidden sm:flex items-center text-xl text-muted-foreground pt-6">⇌</div>
      ${formHtml('ghb', '👤 두 번째 사람')}
    </div>
    <button id="honcheon-gunghap-calc" type="button"
      class="w-full rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity">
      궁합 계산하기
    </button>
    <div id="honcheon-gunghap-result" class="hidden space-y-4"></div>`;

  panel.querySelector('#honcheon-gunghap-calc').addEventListener('click', runGunghap);
  return panel;
}

// ─── 계산 실행 ────────────────────────────────────────────────

function readInput(id) {
  const year    = parseInt(document.getElementById(`${id}-year`)?.value  || '');
  const month   = parseInt(document.getElementById(`${id}-month`)?.value || '');
  const day     = parseInt(document.getElementById(`${id}-day`)?.value   || '');
  const unknown = document.getElementById(`${id}-unknown`)?.checked ?? false;
  const hour    = unknown ? 12 : parseInt(document.getElementById(`${id}-hour`)?.value || '12');
  const gender  = document.querySelector(`input[name="${id}-gender"]:checked`)?.value ?? 'M';
  return { year, month, day, hour, minute: 0, gender, unknownTime: unknown };
}

function validate(inp, label) {
  if (!inp.year || !inp.month || !inp.day) throw new Error(`${label}: 생년월일을 입력해주세요.`);
  if (inp.year < 1900 || inp.year > 2100)  throw new Error(`${label}: 올바른 연도를 입력해주세요.`);
  if (inp.month < 1   || inp.month > 12)   throw new Error(`${label}: 월은 1~12 사이여야 합니다.`);
  if (inp.day   < 1   || inp.day   > 31)   throw new Error(`${label}: 일은 1~31 사이여야 합니다.`);
}

function runGunghap() {
  const resultEl = document.getElementById('honcheon-gunghap-result');
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = '<p class="text-sm text-muted-foreground animate-pulse">계산 중…</p>';

  try {
    const inpA = readInput('gha');
    const inpB = readInput('ghb');
    validate(inpA, '첫 번째 사람');
    validate(inpB, '두 번째 사람');

    const sajuA = calculateSaju(inpA);
    const sajuB = calculateSaju(inpB);

    const nameA = document.getElementById('gha-name')?.value.trim() || '甲';
    const nameB = document.getElementById('ghb-name')?.value.trim() || '乙';

    renderResult(resultEl, sajuA, sajuB, nameA, nameB);
  } catch (e) {
    resultEl.innerHTML = `<p class="text-sm text-red-500">${e.message}</p>`;
  }
}

// ─── 결과 렌더링 ──────────────────────────────────────────────

function renderResult(el, sajuA, sajuB, nameA, nameB) {
  const pA = sajuA.pillars; // [0]=시, [1]=일, [2]=월, [3]=연
  const pB = sajuB.pillars;

  // 일주 관계 (index 1)
  const dayRel  = analyzePillarRelations(pA[1].pillar.ganzi, pB[1].pillar.ganzi);
  // 연주 관계 (index 3)
  const yearRel = analyzePillarRelations(pA[3].pillar.ganzi, pB[3].pillar.ganzi);

  // 오행 궁합 — 일간 기준
  const eA = STEM_ELEMENT[pA[1].pillar.stem] || '?';
  const eB = STEM_ELEMENT[pB[1].pillar.stem] || '?';
  const eRel = elemRelation(eA, eB);

  // 4×4 전체 합충표
  const allPairs = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const rel = analyzePillarRelations(pA[i].pillar.ganzi, pB[j].pillar.ganzi);
      if (rel.stem.length > 0 || rel.branch.length > 0) {
        allPairs.push({ aLbl: PILLAR_LABELS[i], bLbl: PILLAR_LABELS[j], ...rel });
      }
    }
  }

  // 점수 합산
  let score = 0;
  const cnt = { 합: 0, 충: 0, 원진: 0, 귀문: 0, 기타: 0 };
  for (const p of allPairs) {
    for (const r of [...p.stem, ...p.branch]) {
      const info = RELATION_INFO[r.type];
      if (!info) continue;
      score += info.score;
      if (r.type === '合')  cnt.합++;
      else if (r.type === '沖')  cnt.충++;
      else if (r.type === '怨嗔') cnt.원진++;
      else if (r.type === '鬼門') cnt.귀문++;
      else cnt.기타++;
    }
  }
  const sl = scoreLabel(score);

  // AI 요청용 텍스트
  const summaryText = buildSummaryText(nameA, nameB, pA, pB, dayRel, yearRel, allPairs, eA, eB, eRel, score, cnt);

  el.innerHTML = `
    <!-- 종합 판정 -->
    <div class="rounded-md border p-4 text-center space-y-1">
      <div class="text-2xl font-bold ${sl.cls}">${sl.text}</div>
      <div class="text-xs text-muted-foreground">
        합(合) ${cnt.합}회 &middot; 충(沖) ${cnt.충}회 &middot; 원진 ${cnt.원진}회 &middot; 귀문 ${cnt.귀문}회
      </div>
    </div>

    <!-- 일주 궁합 -->
    <div class="rounded-md border p-4 space-y-2">
      <h4 class="text-sm font-semibold">일주 궁합 (日柱 — 가장 중요)</h4>
      <div class="flex flex-wrap items-center gap-2 text-sm font-mono">
        <span>${nameA} ${ganziLabel(pA[1].pillar.ganzi)}</span>
        <span class="text-muted-foreground">⇌</span>
        <span>${nameB} ${ganziLabel(pB[1].pillar.ganzi)}</span>
      </div>
      <div class="space-y-1 text-sm">
        <div class="flex items-center gap-2">
          <span class="w-7 text-xs text-muted-foreground shrink-0">天干</span>
          ${renderBadges(dayRel.stem)}
        </div>
        <div class="flex items-center gap-2">
          <span class="w-7 text-xs text-muted-foreground shrink-0">地支</span>
          ${renderBadges(dayRel.branch)}
        </div>
      </div>
    </div>

    <!-- 연주(띠) 궁합 -->
    <div class="rounded-md border p-4 space-y-2">
      <h4 class="text-sm font-semibold">연주 궁합 (年柱 · 띠)</h4>
      <div class="flex flex-wrap items-center gap-2 text-sm font-mono">
        <span>${nameA} ${ganziLabel(pA[3].pillar.ganzi)}</span>
        <span class="text-muted-foreground">⇌</span>
        <span>${nameB} ${ganziLabel(pB[3].pillar.ganzi)}</span>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <span class="w-7 text-xs text-muted-foreground shrink-0">地支</span>
        ${renderBadges(yearRel.branch)}
      </div>
    </div>

    <!-- 오행 궁합 -->
    <div class="rounded-md border p-4 space-y-1">
      <h4 class="text-sm font-semibold">오행 궁합 (일간 기준)</h4>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <span>${nameA} ${pA[1].pillar.stem}(${eA})</span>
        <span class="text-muted-foreground">⇌</span>
        <span>${nameB} ${pB[1].pillar.stem}(${eB})</span>
        <span class="font-medium ${eRel.cls}">${eRel.label}</span>
      </div>
    </div>

    <!-- 4×4 합충표 -->
    ${allPairs.length > 0 ? `
    <div class="rounded-md border p-4 space-y-2">
      <h4 class="text-sm font-semibold">전체 기둥 합충 (4 × 4)</h4>
      <div class="space-y-2 text-sm">
        ${allPairs.map(p => `
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs text-muted-foreground w-28 shrink-0">
              ${nameA} ${p.aLbl} ↔ ${nameB} ${p.bLbl}
            </span>
            ${p.stem.length   > 0 ? `<span class="text-xs text-muted-foreground">天</span>${renderBadges(p.stem)}`   : ''}
            ${p.branch.length > 0 ? `<span class="text-xs text-muted-foreground">地</span>${renderBadges(p.branch)}` : ''}
          </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- AI 해석 -->
    <div class="space-y-2">
      <button id="honcheon-gunghap-ai" type="button"
        class="w-full rounded-md border border-input bg-card px-4 py-2 text-sm hover:bg-muted transition-colors">
        AI 궁합 해석 생성
      </button>
      <div id="honcheon-gunghap-ai-status" class="text-sm text-muted-foreground"></div>
      <article id="honcheon-gunghap-ai-result"
        class="hidden rounded-md border border-border bg-background p-4 text-sm leading-7 whitespace-pre-wrap"></article>
    </div>`;

  document.getElementById('honcheon-gunghap-ai')
    .addEventListener('click', () => requestAI(summaryText));
}

// ─── AI 텍스트 빌더 ───────────────────────────────────────────

function buildSummaryText(nameA, nameB, pA, pB, dayRel, yearRel, allPairs, eA, eB, eRel, score, cnt) {
  const fmt = (p) => `${p.pillar.stem}${p.pillar.branch}`;
  const relStr = (rels) => rels.length ? rels.map(r => r.detail ? `${r.type}(${r.detail})` : r.type).join(', ') : '없음';

  let t = '=== 사주 궁합 분석 ===\n';
  t += `${nameA}: 연${fmt(pA[3])} 월${fmt(pA[2])} 일${fmt(pA[1])} 시${fmt(pA[0])}\n`;
  t += `${nameB}: 연${fmt(pB[3])} 월${fmt(pB[2])} 일${fmt(pB[1])} 시${fmt(pB[0])}\n\n`;

  t += `[일주 궁합]\n`;
  t += `  ${nameA} 일주: ${ganziLabel(pA[1].pillar.ganzi)}\n`;
  t += `  ${nameB} 일주: ${ganziLabel(pB[1].pillar.ganzi)}\n`;
  t += `  天干 관계: ${relStr(dayRel.stem)}\n`;
  t += `  地支 관계: ${relStr(dayRel.branch)}\n\n`;

  t += `[연주(띠) 궁합]\n`;
  t += `  ${nameA} 연주: ${ganziLabel(pA[3].pillar.ganzi)}\n`;
  t += `  ${nameB} 연주: ${ganziLabel(pB[3].pillar.ganzi)}\n`;
  t += `  地支 관계: ${relStr(yearRel.branch)}\n\n`;

  t += `[오행 궁합] ${nameA} 일간 오행: ${eA} / ${nameB} 일간 오행: ${eB}\n`;
  t += `  → ${eRel.label}\n\n`;

  t += `[합충 통계] 합 ${cnt.합}회, 충 ${cnt.충}회, 원진 ${cnt.원진}회, 귀문 ${cnt.귀문}회\n\n`;

  if (allPairs.length > 0) {
    t += '[세부 합충표]\n';
    for (const p of allPairs) {
      const s = relStr(p.stem);
      const b = relStr(p.branch);
      t += `  ${nameA} ${p.aLbl} ↔ ${nameB} ${p.bLbl}: 天干 ${s} / 地支 ${b}\n`;
    }
  }

  return t;
}

// ─── AI 요청 ─────────────────────────────────────────────────

let activeAI = null;

async function requestAI(summaryText) {
  if (activeAI) activeAI.abort();
  activeAI = new AbortController();

  const statusEl = document.getElementById('honcheon-gunghap-ai-status');
  const resultEl = document.getElementById('honcheon-gunghap-ai-result');

  statusEl.textContent = 'AI 궁합 해석을 생성하는 중입니다…';
  resultEl.classList.add('hidden');

  try {
    const res = await fetch('/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: activeAI.signal,
      body: JSON.stringify({
        section: 'gunghap',
        sectionLabel: '궁합',
        language: document.getElementById('honcheon-language')?.value || 'ko',
        depth: 'standard',
        sourceText: summaryText,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI 해석 실패');

    statusEl.textContent = `완료 · ${data.model || 'AI'}`;
    resultEl.textContent = data.text || '해석 결과가 없습니다.';
    resultEl.classList.remove('hidden');
  } catch (e) {
    if (e.name === 'AbortError') return;
    statusEl.textContent = e.message || 'AI 해석 중 오류가 발생했습니다.';
  } finally {
    activeAI = null;
  }
}

// ─── 마운트 ───────────────────────────────────────────────────

function mountPanel() {
  const results = document.getElementById('results');
  if (!results || document.getElementById('honcheon-gunghap-panel')) return;
  results.appendChild(createPanel());
}

const observer = new MutationObserver(mountPanel);
observer.observe(document.body, { childList: true, subtree: true });
mountPanel();
