// 정규화된 카드 데이터를 1080×1920 고정 레이아웃 HTML 카드로 렌더링하는 모듈
// 라벨은 data.pack(언어팩)에서 꺼내므로 이 파일에는 한국어를 직접 쓰지 않는다.
import { pick } from './i18n.js';
// 언어팩에서 라벨을 꺼내는 단축 헬퍼
const L = (d, path, fb = '') => pick(d.pack, path, fb);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 밝은 회색(금 오행)은 어두운 글자로 대비 확보
const onLight = (c) => c === '#C9CDD2';
// 한자권 언어는 이름이 곧 한자라 병기하지 않는다 (언어팩의 showHanja가 결정)
const dual = (d, name, hanja, cls = 'b-sub hanja') =>
  (!L(d, 'ui.showHanja', true) || name === hanja) ? '' : ` <span class="${cls}">${esc(hanja)}</span>`;
const vs = (sym) => `${esc(sym)}︎`; // 별자리·행성 기호를 이모지가 아닌 텍스트 글리프로

function shell(id, kicker, meta, body, footer) {
  return `
<article class="card" id="card-${id}" data-card="${id}">
  <header class="c-head">
    <div class="kicker">${esc(kicker)}</div>
    <div class="c-name">${esc(meta.name)}</div>
    <div class="c-birth">${esc(meta.birth)} · ${esc(meta.gender)} · ${esc(meta.age)}</div>
  </header>
  <div class="c-body">${body}</div>
  <footer class="c-foot">
    ${footer ? `<div class="c-concl">${footer}</div>` : ''}
    <div class="cta">saju0523.pages.dev</div>
  </footer>
</article>`;
}

const title = (t) => `<div class="sec-title">${esc(t)}</div>`;

// ── 1. 사주 원국 ──────────────────────────────
function renderSaju(d, meta) {
  const s = d.saju;
  const body = `
  <section class="hero">
    <div class="dm-badge hanja" style="--dm:${onLight(s.dayMaster.color) ? '#dfe3e8' : s.dayMaster.color}">${esc(s.dayMaster.char)}</div>
    <div class="hero-txt">
      <div class="dm-title serif">${esc(s.dayMaster.title)}</div>
      <div class="dm-desc">${esc(s.dayMaster.desc)}</div>
    </div>
  </section>

  ${title(L(d,'ui.secWongook'))}
  <div class="pillars">
    ${s.pillars.map((p) => `
      <div class="pillar">
        <div class="p-label">${esc(p.label)}</div>
        <div class="p-char hanja ${onLight(p.ganColor) ? 'dark-ink' : ''}" style="background:${p.ganColor}">${esc(p.gan)}</div>
        <div class="p-char hanja ${onLight(p.jiColor) ? 'dark-ink' : ''}" style="background:${p.jiColor}">${esc(p.ji)}</div>
        <div class="p-sip">${esc(p.sipsinTop)}<br>${esc(p.sipsinBot)}</div>
      </div>`).join('')}
  </div>

  ${title(L(d,'ui.secElements'))}
  <div class="bars">
    ${s.elements.map((e) => `
      <div class="bar-row">
        <div class="b-name hanja">${esc(e.label)}</div>
        <div class="b-track"><div class="b-fill" style="width:${(e.count / 8) * 100}%;background:${e.color}"></div></div>
        <div class="b-val">${e.count}</div>
        <div class="b-mark ${e.markKey}">${esc(e.mark)}</div>
      </div>`).join('')}
  </div>

  ${title(L(d,'ui.secStrength'))}
  <div class="strength">
    <div class="st-gauge"><div class="st-fill" style="width:${s.strength.gauge}%"></div>
      <div class="st-mid"></div></div>
    <div class="st-row">
      <span class="st-type">${esc(s.strength.type)}</span>
      <span class="st-yong">${esc(L(d,'ui.yong'))} <b>${esc(s.strength.yong)}</b> · ${esc(L(d,'ui.hee'))} ${esc(s.strength.hee)} · ${esc(L(d,'ui.gi'))} ${esc(s.strength.gi)}</span>
    </div>
    <div class="st-desc">${esc(s.strength.desc)}</div>
  </div>`;
  return shell('saju', L(d,'ui.kickerSaju'), meta, body, esc(s.elementLine));
}

// ── 2. 십신·신살 ──────────────────────────────
function renderSipsin(d, meta) {
  const s = d.sipsin;
  const body = `
  ${title(L(d,'ui.secSipsin'))}
  <div class="bars">
    ${s.bars.map((b) => `
      <div class="bar-row">
        <div class="b-name">${esc(b.label)}${dual(d, b.label, b.hanja)}</div>
        <div class="b-track"><div class="b-fill" style="width:${b.pct}%;background:${b.color}"></div></div>
        <div class="b-val">${b.count}</div>
        <div class="b-mark ${b.strongest ? 'over' : ''}">${b.strongest ? esc(L(d,'ui.strongest')) : ''}</div>
      </div>`).join('')}
  </div>
  <div class="note">${esc(s.topLine)}</div>

  ${title(L(d,'ui.secSinsal'))}
  <div class="sals">
    ${s.sals.length ? s.sals.map((x) => `
      <div class="sal" style="--sc:${x.color}">
        <div class="sal-top">
          <span class="sal-name">${esc(x.name)}</span>
          <span class="sal-type">${esc(x.type)}</span>
        </div>
<div class="sal-hanja hanja">${[L(d,'ui.showHanja',true) && x.name !== x.hanja ? esc(x.hanja) : '', x.where ? esc(x.where) : ''].filter(Boolean).join(' · ')}</div>
        <div class="sal-desc">${esc(x.desc)}</div>
      </div>`).join('') : `<div class="note">${esc(L(d,'ui.noSinsal'))}</div>`}
  </div>

  ${title(L(d,'ui.secUnseong'))}
  <div class="unseong">
    ${s.unseong.map((u) => `
      <div class="un">
        <div class="un-label">${esc(u.label)}</div>
        <div class="un-ko">${esc(u.ko)}</div>
        <div class="un-hanja hanja">${L(d,'ui.showHanja',true) && u.ko !== u.hanja ? esc(u.hanja) : ''}</div>
      </div>`).join('')}
  </div>`;
  const foot = s.gongmang.length ? esc(L(d,'ui.gongmang')(s.gongmang.join(' '))) : '';
  return shell('sipsin', L(d,'ui.kickerSipsin'), meta, body, foot);
}

// ── 3. 대운·세운 ──────────────────────────────
function renderLuck(d, meta) {
  const l = d.luck;
  const body = `
  ${title(L(d,'ui.secSeyun')(l.seyun.year))}
  <div class="seyun">
    <div class="sy-gz hanja">${esc(l.seyun.gz)}</div>
    <div class="sy-txt">
      <div class="sy-year">${esc(L(d,'ui.yearLabel')(l.seyun.year))}</div>
      <div class="sy-desc">${esc(l.seyunDesc)}</div>
    </div>
  </div>

  ${title(L(d,'ui.secDaewoon'))}
  <div class="dw-list">
    ${l.daewoon.map((x) => `
      <div class="dw ${x.current ? 'now' : ''}">
        <div class="dw-age">${esc(L(d,'ui.ageFrom')(x.age))}</div>
        <div class="dw-gz hanja">${esc(x.gz)}</div>
        <div class="dw-sip">${esc(x.sipsin)}</div>
        <div class="dw-un">${esc(x.unseong)}</div>
        ${x.current ? `<div class="dw-badge">${esc(L(d,'ui.now'))}</div>` : ''}
      </div>`).join('')}
  </div>`;
  return shell('luck', L(d,'ui.kickerLuck'), meta, body, esc(l.currentDesc));
}

// ── 4. 자미두수 명반 ──────────────────────────
function renderZiwei(d, meta) {
  const z = d.ziwei;
  const body = `
  ${title(L(d,'ui.secPalaces'))}
  <div class="chart">
    ${z.palaces.map((p) => `
      <div class="palace ${p.isMing ? 'ming' : ''}" style="grid-row:${p.row + 1};grid-column:${p.col + 1}">
        <div class="pl-head">
          <span class="pl-name">${esc(p.ko)}</span>
          ${p.isDaxian ? '<span class="pl-badge">大限</span>' : p.isShen ? '<span class="pl-badge shen">身</span>' : ''}
        </div>
        <div class="pl-stars hanja">
          ${p.stars.slice(0, 4).map((s) => `<span class="${s.isMain ? 'main' : ''}">${esc(s.name)}${s.brightness ? `<i>${esc(s.brightness)}</i>` : ''}${s.sihua ? `<em style="background:${s.sihuaColor}">${esc(s.sihua.slice(-1))}</em>` : ''}</span>`).join('')}
        </div>
        <div class="pl-gz hanja">${esc(p.ganzhi)}</div>
      </div>`).join('')}
    <div class="chart-center">
      <div class="cc-star hanja">${esc(z.center.mainStar)}</div>
      <div class="cc-ju hanja">${esc(z.center.ju)}</div>
      <div class="cc-desc">${esc(z.center.desc)}</div>
    </div>
  </div>

  ${title(L(d,'ui.secDaxian'))}
  <div class="dx-list">
    ${z.daxian.slice(0, 8).map((x) => `
      <div class="dx ${x.current ? 'now' : ''}">
        <div class="dx-age">${esc(x.age)}</div>
        <div class="dx-gz hanja">${esc(x.gz)}</div>
        <div class="dx-pal">${esc(x.ko)}</div>
        <div class="dx-star hanja">${esc(x.stars)}</div>
      </div>`).join('')}
  </div>`;
  return shell('ziwei', L(d,'ui.kickerZiwei'), meta, body, esc(z.currentDesc));
}

// ── 5. 점성술 네이탈 ──────────────────────────
function renderNatal(d, meta) {
  const n = d.natal;
  const body = `
  <section class="big3">
    ${n.big3.map((b) => `
      <div class="b3" style="--bc:${onLight(b.color) ? '#dfe3e8' : b.color}">
        <div class="b3-sym">${vs(b.sym)}</div>
        <div class="b3-label">${esc(b.label)}</div>
        <div class="b3-sign">${esc(b.ko)}</div>
        <div class="b3-sub">${esc(b.sub)}</div>
      </div>`).join('')}
  </section>
  <div class="note center">${esc(n.overview)}</div>

  ${title(L(d,'ui.secPlanets'))}
  <div class="pl-rows">
    ${n.planets.map((p) => `
      <div class="pr">
        <div class="pr-name">${vs(p.sym)} ${esc(p.ko)}${p.retro ? '<span class="rx">℞</span>' : ''}</div>
        <div class="pr-sign"><span class="z" style="color:${onLight(p.color) ? '#dfe3e8' : p.color}">${vs(p.signSym)}</span>${esc(p.signKo)}</div>
        <div class="pr-deg">${esc(p.degree)}</div>
        <div class="pr-house">${esc(p.house)}</div>
      </div>`).join('')}
  </div>

  ${title(L(d,'ui.secAspects'))}
  <div class="as-rows">
    ${n.aspects.map((a) => `
      <div class="as">
        <div class="as-pair">${vs(a.s1)} ${esc(a.p1)}<span class="as-sym" style="color:${a.color}">${vs(a.sym)}</span>${vs(a.s2)} ${esc(a.p2)}</div>
        <div class="as-type" style="color:${a.color}">${esc(a.ko)}</div>
        <div class="as-orb">${esc(L(d,'ui.orb')(a.orb))}</div>
      </div>`).join('')}
  </div>`;
  const foot = n.unknownTime ? esc(n.unknownNote) : '';
  return shell('natal', L(d,'ui.kickerNatal'), meta, body, foot);
}

// ── 6. 올해 흐름 ──────────────────────────────
function renderYear(d, meta) {
  const y = d.year;
  const body = `
  <section class="hero year-hero">
    <div class="yh-gz hanja">${esc(y.seyun)}</div>
    <div class="hero-txt">
      <div class="dm-title serif">${esc(L(d,'ui.yearFlow')(y.year))}</div>
      <div class="dm-desc">${esc(y.summary)}</div>
    </div>
  </section>

  ${title(L(d,'ui.secSihua'))}
  <div class="sihua">
    ${y.sihua.map((s) => `
      <div class="sh">
        <div class="sh-type hanja" style="background:${s.color}">${esc(s.type)}</div>
        <div class="sh-star hanja">${esc(s.star)}</div>
        <div class="sh-pal">${esc(s.palace)}</div>
      </div>`).join('')}
  </div>

  ${title(L(d,'ui.secMonths'))}
  <div class="months">
    ${y.months.map((m) => `
      <div class="mo ${m.tone}">
        <div class="mo-n">${esc(m.label)}</div>
        <div class="mo-p">${esc(m.ko)}</div>
      </div>`).join('')}
  </div>
  <div class="legend">
    <span><i class="dot good"></i>${esc(y.legend.good)}</span>
    <span><i class="dot flat"></i>${esc(y.legend.flat)}</span>
    <span><i class="dot watch"></i>${esc(y.legend.watch)}</span>
  </div>`;
  return shell('year', L(d,'ui.kickerYear')(y.year), meta, body, '');
}

// ── 7. 궁합 ──────────────────────────────────
function renderGoonghap(d, meta) {
  const g = d.goonghap;
  const face = (p) => `
    <div class="gh-face">
      <div class="gh-badge hanja ${onLight(p.color) ? 'dark-ink' : ''}" style="background:${p.color}">${esc(p.gan)}${esc(p.ji)}</div>
      <div class="gh-name">${esc(p.name)}</div>
      <div class="gh-elem">${esc(p.ganLabel)}</div>
      <div class="gh-trait">${esc(p.title)}</div>
    </div>`;

  const body = `
  <section class="gh-pair">
    ${face(g.a)}
    <div class="gh-rel">
      <div class="gh-sym">${esc(g.symbol)}</div>
      <div class="gh-rel-label">${esc(g.relLabel)}</div>
    </div>
    ${face(g.b)}
  </section>

  <div class="gh-score">
    <div class="gh-stars">${esc(g.stars)}</div>
    <div class="gh-title serif">${esc(g.title)}</div>
    <div class="gh-scorelabel">${esc(g.scoreLabel)}</div>
  </div>

  ${title(L(d,'ui.secAreas'))}
  <div class="bars">
    ${g.areas.map((a) => `
      <div class="bar-row">
        <div class="b-name">${esc(a.label)}</div>
        <div class="b-track"><div class="b-fill" style="width:${a.score * 20}%;background:${a.color}"></div></div>
        <div class="b-stars">${'★'.repeat(a.score)}${'☆'.repeat(5 - a.score)}</div>
      </div>`).join('')}
  </div>

  ${title(L(d,'ui.secBranchRel'))}
  <div class="gh-branch" style="--bc:${g.branch.color}">
    <div class="gh-btag hanja">${esc(g.branch.tag)}</div>
    <div class="gh-bdesc">${esc(g.branch.desc)}</div>
  </div>
  <div class="note">${esc(g.desc)}</div>
  <div class="note">${esc(g.yinyang)}</div>`;

  return `
<article class="card" id="card-goonghap" data-card="goonghap">
  <header class="c-head">
    <div class="kicker">${esc(L(d,'ui.kickerGoonghap'))}</div>
    <div class="c-name">${esc(g.a.name)} · ${esc(g.b.name)}</div>
    <div class="c-birth hanja">${esc(g.flow)}</div>
  </header>
  <div class="c-body">${body}</div>
  <footer class="c-foot">
    <div class="cta">saju0523.pages.dev</div>
  </footer>
</article>`;
}

export const CARD_DEFS = [
  { id: 'saju', labelKey: 'cardSaju', render: renderSaju },
  { id: 'sipsin', labelKey: 'cardSipsin', render: renderSipsin },
  { id: 'luck', labelKey: 'cardLuck', render: renderLuck },
  { id: 'ziwei', labelKey: 'cardZiwei', render: renderZiwei },
  { id: 'natal', labelKey: 'cardNatal', render: renderNatal },
  { id: 'year', labelKey: 'cardYear', render: renderYear },
  { id: 'goonghap', labelKey: 'cardGoonghap', render: renderGoonghap, needs: 'goonghap' },
];

export function renderAll(data, ids) {
  let defs = CARD_DEFS.filter((c) => !c.needs || data[c.needs]);
  if (ids && ids.length) defs = defs.filter((c) => ids.includes(c.id));
  return defs.map((c) => c.render(data, data.meta)).join('');
}

/** 실제로 렌더될 카드 정의만 돌려준다 (탭 구성용). */
export function availableCards(data, ids) {
  let defs = CARD_DEFS.filter((c) => !c.needs || data[c.needs]);
  if (ids && ids.length) defs = defs.filter((c) => ids.includes(c.id));
  return defs;
}
