// 계산 결과 화면에 AI 해석 패널을 추가하는 스크립트 (일반 스크립트, window.supabase 사용)
(function () {
  console.log('[AI해석] 스크립트 로드됨 v20260611c');
  const SUPABASE_URL = 'https://smqekqdlkkqagzrvtnmh.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcWVrcWRsa2txYWd6cnZ0bm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDkzODcsImV4cCI6MjA5NjE4NTM4N30.VomC09MBc9vEs9A-vZIiwM_LAoUrODXRZHFAX0CEvjc';
  const INTERPRET_URL = SUPABASE_URL + '/functions/v1/interpret';
  const PREMIUM_URL   = '/premium.html';

  function getSupabase() {
    if (window._todSupabase) return window._todSupabase;
    if (window.supabase && window.supabase.createClient) {
      window._todSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
      return window._todSupabase;
    }
    return null;
  }

  const sections = [
    { id: 'personality', ko: '기본 성향',    en: 'Personality'     },
    { id: 'saju',        ko: '사주 심층',    en: 'Saju'            },
    { id: 'ziwei',       ko: '자미두수 심층', en: 'Ziwei Doushu'   },
    { id: 'natal',       ko: '점성술 심층',  en: 'Natal Astrology' },
    { id: 'love',        ko: '연애와 결혼',  en: 'Love & Marriage' },
    { id: 'career',      ko: '직업과 재물',  en: 'Career & Wealth' },
    { id: 'year',        ko: '올해 운세',    en: 'Annual Flow'     },
    { id: 'overall',     ko: '세 가지 종합', en: 'Synthesis'       },
  ];

  const languages = [
    ['ko','한국어'],['en','English'],['ja','日本語'],['zh','中文'],['es','Español'],
  ];

  const ui = {
    ko: {
      title:'AI 해석', desc:'원하는 항목을 선택해 계산 자료 기반 해석을 생성합니다.',
      short:'요약', standard:'표준', premium:'심층',
      needResults:'먼저 생년월일시를 입력해 계산 결과를 만들어주세요.',
      loading:'해석 생성 중', done:'완료', failed:'요청 실패',
      empty:'결과가 비어 있습니다.',
      fullReport:'⭐ AI 전체 해석 받기', fullReportDesc:'프리미엄 페이지에서 8개 섹션 전체 해석을 생성합니다.',
    },
    en: {
      title:'AI Interpretation', desc:'Choose a section to generate an interpretation from chart data.',
      short:'Brief', standard:'Standard', premium:'Deep',
      needResults:'Please calculate a chart first.',
      loading:'Generating', done:'Done', failed:'Request failed',
      empty:'Result is empty.',
      fullReport:'⭐ Full AI Report', fullReportDesc:'Generate all 8 sections on the premium page.',
    },
    ja: {
      title:'AI 解釈', desc:'必要な項目を選び、命式データに基づく解釈を生成します。',
      short:'要約', standard:'標準', premium:'詳細',
      needResults:'先に命式を計算してください。',
      loading:'生成中', done:'完了', failed:'失敗',
      empty:'結果が空です。',
      fullReport:'⭐ 全解釈レポート', fullReportDesc:'プレミアムページで8セクション全解釈を生成します。',
    },
    zh: {
      title:'AI 解讀', desc:'選擇需要的項目，根據命盤資料生成解讀。',
      short:'摘要', standard:'標準', premium:'深入',
      needResults:'請先計算命盤。',
      loading:'生成中', done:'完成', failed:'請求失敗',
      empty:'結果為空。',
      fullReport:'⭐ 完整AI報告', fullReportDesc:'在高級頁面生成8個部分的完整解讀。',
    },
    es: {
      title:'Interpretación con IA', desc:'Elige una sección e interpreta los datos calculados.',
      short:'Breve', standard:'Estándar', premium:'Profunda',
      needResults:'Primero calcula una carta.',
      loading:'Generando', done:'Listo', failed:'Falló',
      empty:'El resultado está vacío.',
      fullReport:'⭐ Informe Completo', fullReportDesc:'Genera los 8 secciones en la página premium.',
    },
  };

  let activeRequest = null;

  function currentLang() {
    return document.getElementById('honcheon-language')?.value ||
           document.documentElement.lang || 'ko';
  }

  function t(key) {
    const l = currentLang();
    return (ui[l] || ui.en)[key] || ui.ko[key] || key;
  }

  function sectionLabel(s) {
    return currentLang() === 'ko' ? s.ko : s.en;
  }

  function collectResultsText() {
    const el = document.getElementById('results');
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('#honcheon-ai-panel, button, select').forEach(n => n.remove());
    return clone.innerText.replace(/\n{3,}/g, '\n\n').trim();
  }

  async function checkPremium() {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return false;
      const { data, error } = await sb.rpc('is_subscribed');
      if (!error) return !!data;
      const { data: row } = await sb
        .from('subscriptions')
        .select('status,current_period_end')
        .eq('user_id', session.user.id)
        .maybeSingle();
      return row?.status === 'active' && new Date(row.current_period_end) > new Date();
    } catch { return false; }
  }

  function createPanel() {
    const panel = document.createElement('section');
    panel.id = 'honcheon-ai-panel';
    panel.className = 'rounded-lg border bg-card p-4 md:p-6 shadow-soft space-y-4';
    panel.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="tod-ai-title" class="font-serif-display text-xl"></h3>
          <p id="tod-ai-desc" class="text-sm text-muted-foreground mt-1"></p>
        </div>
        <div class="flex flex-wrap gap-2">
          <select id="tod-ai-lang" class="h-10 rounded-md border border-input bg-card px-3 text-sm"></select>
          <select id="tod-ai-depth" class="h-10 rounded-md border border-input bg-card px-3 text-sm">
            <option value="short"></option>
            <option value="standard" selected></option>
            <option value="premium"></option>
          </select>
        </div>
      </div>

      <!-- 유료 회원: 프리미엄 페이지 바로가기 배너 -->
      <div id="tod-premium-banner" class="hidden items-center justify-between gap-3 rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-3">
        <div>
          <p id="tod-full-report-label" class="text-sm font-medium text-amber-400"></p>
          <p id="tod-full-report-desc" class="text-xs text-muted-foreground mt-0.5"></p>
        </div>
        <a id="tod-premium-link" href="${PREMIUM_URL}"
           class="shrink-0 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 transition-colors">
          →
        </a>
      </div>

      <div id="tod-ai-sections" class="grid grid-cols-2 md:grid-cols-4 gap-2"></div>
      <div id="tod-ai-status" class="text-sm text-muted-foreground"></div>
      <article id="tod-ai-result" class="hidden rounded-md border border-border bg-background p-4 text-sm leading-7 whitespace-pre-wrap"></article>
    `;

    // 언어 셀렉트 채우기
    const langSel = panel.querySelector('#tod-ai-lang');
    languages.forEach(([v, label]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = label;
      langSel.appendChild(o);
    });
    langSel.value = currentLang();

    // 섹션 버튼
    const wrap = panel.querySelector('#tod-ai-sections');
    sections.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.idx = i;
      btn.className = 'rounded-md border border-input bg-card px-3 py-2 text-sm hover:bg-muted transition-colors';
      btn.textContent = sectionLabel(s);
      btn.addEventListener('click', () => requestInterpretation(panel, s));
      wrap.appendChild(btn);
    });

    refreshLabels(panel);

    // 구독 확인 후 프리미엄 배너 표시
    checkPremium().then(isPremium => {
      if (isPremium) {
        const banner = panel.querySelector('#tod-premium-banner');
        banner.classList.remove('hidden');
        banner.classList.add('flex');
        // 클릭 시 결과 text를 sessionStorage에 저장
        panel.querySelector('#tod-premium-link').addEventListener('click', () => {
          const txt = collectResultsText();
          if (txt) sessionStorage.setItem('tod-calc-results', txt);
        });
      }
    });

    return panel;
  }

  function refreshLabels(panel) {
    panel.querySelector('#tod-ai-title').textContent = t('title');
    panel.querySelector('#tod-ai-desc').textContent  = t('desc');
    panel.querySelectorAll('#tod-ai-depth option').forEach((o, i) => {
      o.textContent = t(['short','standard','premium'][i]);
    });
    panel.querySelectorAll('[data-idx]').forEach(btn => {
      btn.textContent = sectionLabel(sections[+btn.dataset.idx]);
    });
    const lbl = panel.querySelector('#tod-full-report-label');
    const dsc = panel.querySelector('#tod-full-report-desc');
    if (lbl) lbl.textContent = t('fullReport');
    if (dsc) dsc.textContent = t('fullReportDesc');
  }

  async function requestInterpretation(panel, section) {
    if (activeRequest) activeRequest.abort();
    activeRequest = new AbortController();

    const sourceText = collectResultsText();
    if (!sourceText) {
      panel.querySelector('#tod-ai-status').textContent = t('needResults');
      return;
    }

    const lang  = panel.querySelector('#tod-ai-lang').value;
    const depth = panel.querySelector('#tod-ai-depth').value;
    panel.querySelector('#tod-ai-status').textContent = sectionLabel(section) + ' · ' + t('loading') + '…';
    panel.querySelector('#tod-ai-result').classList.add('hidden');
    panel.querySelector('#tod-ai-result').textContent = '';

    const sb = getSupabase();
    try {
      const session = sb ? (await sb.auth.getSession()).data.session : null;
      if (!session) {
        panel.querySelector('#tod-ai-status').textContent = '';
        showResult(panel, '🔒 로그인 후 이용할 수 있습니다.');
        return;
      }

      const res = await fetch(INTERPRET_URL, {
        method: 'POST',
        signal: activeRequest.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify({ section: section.id, sectionLabel: sectionLabel(section), language: lang, depth, sourceText }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error === 'SUBSCRIPTION_REQUIRED') {
        panel.querySelector('#tod-ai-status').textContent = '';
        showResult(panel, '⭐ 유료 멤버십 전용 기능입니다.\n\n→ 멤버십 가입: /pricing.html');
        return;
      }
      if (!res.ok) throw new Error(data.error || t('failed'));

      panel.querySelector('#tod-ai-status').textContent = t('done') + ' · ' + (data.model || 'AI');
      showResult(panel, data.text || t('empty'));
    } catch (e) {
      if (e.name === 'AbortError') return;
      panel.querySelector('#tod-ai-status').textContent = e.message;
    } finally {
      activeRequest = null;
    }
  }

  function showResult(panel, text) {
    const el = panel.querySelector('#tod-ai-result');
    el.textContent = text;
    el.classList.remove('hidden');
  }

  function mountPanel() {
    const results = document.getElementById('results');
    if (!results || document.getElementById('honcheon-ai-panel')) return;
    results.appendChild(createPanel());
  }

  // 결과 자동 저장 + premium.html 복귀 (500ms 디바운스)
  // mountPanel은 #results 첫 등장 시 한 번만 실행되지만,
  // 실제 계산 결과는 그 이후에 채워지므로 별도로 감시한다.
  let _autoSaveTimer = null;
  function scheduleAutoSave(obs) {
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(function() {
      const txt = collectResultsText();
      if (!txt || txt.length < 200) return;
      sessionStorage.setItem('tod-calc-results', txt);
      if (sessionStorage.getItem('tod-return-to-premium')) {
        sessionStorage.removeItem('tod-return-to-premium');
        obs.disconnect();
        setTimeout(function() { window.location.href = '/premium.html'; }, 400);
      }
    }, 500);
  }

  // MutationObserver로 #results 감시
  var _bodyObs = new MutationObserver(function(_, obs) {
    mountPanel();
    scheduleAutoSave(obs);
  });
  _bodyObs.observe(document.body, { childList: true, subtree: true });

  // 언어 변경 이벤트
  document.addEventListener('change', e => {
    if (e.target?.id === 'honcheon-language') {
      const panel = document.getElementById('honcheon-ai-panel');
      if (panel) {
        panel.querySelector('#tod-ai-lang').value = currentLang();
        refreshLabels(panel);
      }
    }
  });

  mountPanel();
})();
