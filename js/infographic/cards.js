// 정규화된 카드 데이터를 1080×1920 고정 레이아웃 HTML 카드 6종으로 렌더링하는 모듈
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// 밝은 회색(금 오행)은 어두운 글자로 대비 확보
const onLight = (c) => c === '#C9CDD2';
const vs = (sym) => `${esc(sym)}︎`; // 별자리·행성 기호를 이모지가 아닌 텍스트 글리프로

function shell(id, kicker, meta, body, footer) {
  return `
<article class="card" id="card-${id}" data-card="${id}">
  <header class="c-head">
    <div class="kicker">${esc(kicker)}</div>
    <div class="c-name">${esc(meta.name || '내 사주')}</div>
    <div class="c-birth">${esc(meta.birth)} · ${esc(meta.gender)} · ${esc(meta.age)}세</div>
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

  ${title('원국 사주')}
  <div class="pillars">
    ${s.pillars.map((p) => `
      <div class="pillar">
        <div class="p-label">${esc(p.label)}</div>
        <div class="p-char hanja ${onLight(p.ganColor) ? 'dark-ink' : ''}" style="background:${p.ganColor}">${esc(p.gan)}</div>
        <div class="p-char hanja ${onLight(p.jiColor) ? 'dark-ink' : ''}" style="background:${p.jiColor}">${esc(p.ji)}</div>
        <div class="p-sip">${esc(p.sipsinTop)}<br>${esc(p.sipsinBot)}</div>
      </div>`).join('')}
  </div>

  ${title('오행 분포')}
  <div class="bars">
    ${s.elements.map((e) => `
      <div class="bar-row">
        <div class="b-name"><span class="hanja">${esc(e.hanja)}</span> ${esc(e.kor)}</div>
        <div class="b-track"><div class="b-fill" style="width:${(e.count / 8) * 100}%;background:${e.color}"></div></div>
        <div class="b-val">${e.count}</div>
        <div class="b-mark ${e.mark ? (e.mark === '과다' ? 'over' : 'under') : ''}">${esc(e.mark)}</div>
      </div>`).join('')}
  </div>

  ${title('신강 · 신약')}
  <div class="strength">
    <div class="st-gauge"><div class="st-fill" style="width:${s.strength.gauge}%"></div>
      <div class="st-mid"></div></div>
    <div class="st-row">
      <span class="st-type">${esc(s.strength.type)}</span>
      <span class="st-yong">용신 <b>${esc(s.strength.yong)}</b> · 희신 ${esc(s.strength.hee)} · 기신 ${esc(s.strength.gi)}</span>
    </div>
    <div class="st-desc">${esc(s.strength.desc)}</div>
  </div>`;
  return shell('saju', '四柱命理 · 원국', meta, body, esc(s.elementLine));
}

// ── 2. 십신·신살 ──────────────────────────────
function renderSipsin(d, meta) {
  const s = d.sipsin;
  const body = `
  ${title('십신 강약')}
  <div class="bars">
    ${s.bars.map((b) => `
      <div class="bar-row">
        <div class="b-name">${esc(b.label)} <span class="b-sub hanja">${esc(b.hanja)}</span></div>
        <div class="b-track"><div class="b-fill" style="width:${b.pct}%;background:${b.color}"></div></div>
        <div class="b-val">${b.count}</div>
        <div class="b-mark ${b.strongest ? 'over' : ''}">${b.strongest ? '최강' : ''}</div>
      </div>`).join('')}
  </div>
  <div class="note">${esc(s.topLine)}</div>

  ${title('신살')}
  <div class="sals">
    ${s.sals.length ? s.sals.map((x) => `
      <div class="sal" style="--sc:${x.color}">
        <div class="sal-top">
          <span class="sal-name">${esc(x.name)}</span>
          <span class="sal-type">${esc(x.type)}</span>
        </div>
        <div class="sal-hanja hanja">${esc(x.hanja)}${x.where ? ` · ${esc(x.where)}` : ''}</div>
        <div class="sal-desc">${esc(x.desc)}</div>
      </div>`).join('') : '<div class="note">두드러진 신살이 없는 담백한 명조입니다.</div>'}
  </div>

  ${title('십이운성')}
  <div class="unseong">
    ${s.unseong.map((u) => `
      <div class="un">
        <div class="un-label">${esc(u.label)}</div>
        <div class="un-ko">${esc(u.ko)}</div>
        <div class="un-hanja hanja">${esc(u.hanja)}</div>
      </div>`).join('')}
  </div>`;
  const foot = s.gongmang.length ? `공망 · ${s.gongmang.map(esc).join(' ')}` : '';
  return shell('sipsin', '四柱命理 · 십신', meta, body, foot);
}

// ── 3. 대운·세운 ──────────────────────────────
function renderLuck(d, meta) {
  const l = d.luck;
  const body = `
  ${title(`${l.seyun.year} 세운`)}
  <div class="seyun">
    <div class="sy-gz hanja">${esc(l.seyun.gz)}</div>
    <div class="sy-txt">
      <div class="sy-year">${esc(l.seyun.year)}년</div>
      <div class="sy-desc">${esc(l.seyunDesc)}</div>
    </div>
  </div>

  ${title('대운 10년 주기')}
  <div class="dw-list">
    ${l.daewoon.map((x) => `
      <div class="dw ${x.current ? 'now' : ''}">
        <div class="dw-age">${x.age}세</div>
        <div class="dw-gz hanja">${esc(x.gz)}</div>
        <div class="dw-sip">${esc(x.sipsin)}</div>
        <div class="dw-un">${esc(x.unseong)}</div>
        ${x.current ? '<div class="dw-badge">현재</div>' : ''}
      </div>`).join('')}
  </div>`;
  return shell('luck', '四柱命理 · 운의 흐름', meta, body, esc(l.currentDesc));
}

// ── 4. 자미두수 명반 ──────────────────────────
function renderZiwei(d, meta) {
  const z = d.ziwei;
  const body = `
  ${title('십이궁 명반')}
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

  ${title('대한 흐름')}
  <div class="dx-list">
    ${z.daxian.slice(0, 8).map((x) => `
      <div class="dx ${x.current ? 'now' : ''}">
        <div class="dx-age">${esc(x.age)}세</div>
        <div class="dx-gz hanja">${esc(x.gz)}</div>
        <div class="dx-pal">${esc(x.ko)}</div>
        <div class="dx-star hanja">${esc(x.stars)}</div>
      </div>`).join('')}
  </div>`;
  return shell('ziwei', '紫微斗數 · 명반', meta, body, esc(z.currentDesc));
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

  ${title('행성 배치')}
  <div class="pl-rows">
    ${n.planets.map((p) => `
      <div class="pr">
        <div class="pr-name">${vs(p.sym)} ${esc(p.ko)}${p.retro ? '<span class="rx">℞</span>' : ''}</div>
        <div class="pr-sign"><span class="z" style="color:${onLight(p.color) ? '#dfe3e8' : p.color}">${vs(p.signSym)}</span>${esc(p.signKo)}</div>
        <div class="pr-deg">${esc(p.degree)}</div>
        <div class="pr-house">${esc(p.house)}</div>
      </div>`).join('')}
  </div>

  ${title('주요 어스펙트')}
  <div class="as-rows">
    ${n.aspects.map((a) => `
      <div class="as">
        <div class="as-pair">${vs(a.s1)} ${esc(a.p1)}<span class="as-sym" style="color:${a.color}">${vs(a.sym)}</span>${vs(a.s2)} ${esc(a.p2)}</div>
        <div class="as-type" style="color:${a.color}">${esc(a.ko)}</div>
        <div class="as-orb">${esc(a.orb)}°</div>
      </div>`).join('')}
  </div>`;
  const foot = n.unknownTime ? '출생 시간 미상 — 상승궁과 하우스는 제외했습니다.' : '';
  return shell('natal', 'NATAL CHART', meta, body, foot);
}

// ── 6. 올해 흐름 ──────────────────────────────
function renderYear(d, meta) {
  const y = d.year;
  const body = `
  <section class="hero year-hero">
    <div class="yh-gz hanja">${esc(y.seyun)}</div>
    <div class="hero-txt">
      <div class="dm-title serif">${esc(y.year)}년의 흐름</div>
      <div class="dm-desc">${esc(y.summary)}</div>
    </div>
  </section>

  ${title('유년 사화')}
  <div class="sihua">
    ${y.sihua.map((s) => `
      <div class="sh">
        <div class="sh-type hanja" style="background:${s.color}">${esc(s.type)}</div>
        <div class="sh-star hanja">${esc(s.star)}</div>
        <div class="sh-pal">${esc(s.palace)}</div>
      </div>`).join('')}
  </div>

  ${title('월별 흐름')}
  <div class="months">
    ${y.months.map((m) => `
      <div class="mo ${m.tone}">
        <div class="mo-n">${m.month}월</div>
        <div class="mo-p">${esc(m.ko)}</div>
      </div>`).join('')}
  </div>
  <div class="legend">
    <span><i class="dot good"></i>기회</span>
    <span><i class="dot flat"></i>평이</span>
    <span><i class="dot watch"></i>주의</span>
  </div>`;
  return shell('year', `紫微斗數 · ${y.year} 유년`, meta, body, '');
}

export const CARD_DEFS = [
  { id: 'saju', label: '사주 원국', render: renderSaju },
  { id: 'sipsin', label: '십신·신살', render: renderSipsin },
  { id: 'luck', label: '대운·세운', render: renderLuck },
  { id: 'ziwei', label: '자미두수', render: renderZiwei },
  { id: 'natal', label: '점성술', render: renderNatal },
  { id: 'year', label: '올해 흐름', render: renderYear },
];

export function renderAll(data, ids) {
  const defs = ids && ids.length ? CARD_DEFS.filter((c) => ids.includes(c.id)) : CARD_DEFS;
  return defs.map((c) => c.render(data, data.meta)).join('');
}
