// 계산 결과 화면에 섹션별 AI 해석 요청 패널을 추가하는 스크립트 (유료 회원 전용)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const _supabase = createClient(
  'https://smqekqdlkkqagzrvtnmh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcWVrcWRsa2txYWd6cnZ0bm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDkzODcsImV4cCI6MjA5NjE4NTM4N30.VomC09MBc9vEs9A-vZIiwM_LAoUrODXRZHFAX0CEvjc'
);
const INTERPRET_URL = 'https://smqekqdlkkqagzrvtnmh.supabase.co/functions/v1/interpret';
const SEND_REPORT_URL = 'https://smqekqdlkkqagzrvtnmh.supabase.co/functions/v1/send-report';

(function () {
  const sections = [
    { id: "personality", ko: "기본 성향",    en: "Personality"     },
    { id: "saju",        ko: "사주 심층",    en: "Saju"            },
    { id: "ziwei",       ko: "자미두수 심층", en: "Ziwei Doushu"   },
    { id: "natal",       ko: "점성술 심층",  en: "Natal Astrology" },
    { id: "love",        ko: "연애와 결혼",  en: "Love & Marriage" },
    { id: "career",      ko: "직업과 재물",  en: "Career & Wealth" },
    { id: "year",        ko: "올해 운세",    en: "Annual Flow"     },
    { id: "overall",     ko: "세 가지 종합", en: "Synthesis"       },
  ];

  const languages = [
    ["ko", "한국어"], ["en", "English"], ["ja", "日本語"], ["zh", "中文"], ["es", "Español"],
  ];

  const ui = {
    ko: {
      title: "AI 해석", description: "원하는 항목만 선택해서 계산 자료 기반 해석을 생성합니다.",
      short: "요약", standard: "표준", premium: "심층",
      needResults: "먼저 생년월일시를 입력해 계산 결과를 만들어주세요.",
      loading: "해석을 생성하는 중입니다.", done: "완료",
      empty: "해석 결과가 비어 있습니다.", failed: "AI 해석 요청에 실패했습니다.",
      generateAll: "⭐ 전체 해석 자동 생성", regenerate: "⭐ 다시 생성",
      generating: "전체 해석 생성 중", emailBtn: "📧 이메일로 받기",
      emailSending: "발송 중...", emailSent: "✅ 이메일 발송 완료", emailFail: "발송 실패, 다시 시도",
      allDone: "✅ 전체 해석 완료",
    },
    en: {
      title: "AI Interpretation", description: "Choose only the section you want and generate an interpretation from the chart data.",
      short: "Brief", standard: "Standard", premium: "Deep",
      needResults: "Please calculate a chart first.",
      loading: "Generating interpretation.", done: "Done",
      empty: "The interpretation result is empty.", failed: "AI interpretation request failed.",
      generateAll: "⭐ Generate Full Report", regenerate: "⭐ Regenerate",
      generating: "Generating full report", emailBtn: "📧 Send to Email",
      emailSending: "Sending...", emailSent: "✅ Email Sent", emailFail: "Failed, try again",
      allDone: "✅ Full report complete",
    },
    ja: {
      title: "AI 解釈", description: "必要な項目だけを選び、命式データに基づく解釈を生成します。",
      short: "要約", standard: "標準", premium: "詳細",
      needResults: "先に命式を計算してください。",
      loading: "解釈を生成しています。", done: "完了",
      empty: "解釈結果が空です。", failed: "AI 解釈リクエストに失敗しました。",
      generateAll: "⭐ 全解釈を自動生成", regenerate: "⭐ 再生成",
      generating: "全解釈を生成中", emailBtn: "📧 メールで受け取る",
      emailSending: "送信中...", emailSent: "✅ メール送信完了", emailFail: "送信失敗、再試行",
      allDone: "✅ 全解釈完了",
    },
    zh: {
      title: "AI 解讀", description: "只選擇需要的項目，根據命盤資料生成解讀。",
      short: "摘要", standard: "標準", premium: "深入",
      needResults: "請先計算命盤。",
      loading: "正在生成解讀。", done: "完成",
      empty: "解讀結果為空。", failed: "AI 解讀請求失敗。",
      generateAll: "⭐ 自動生成完整解讀", regenerate: "⭐ 重新生成",
      generating: "正在生成完整解讀", emailBtn: "📧 發送到郵件",
      emailSending: "發送中...", emailSent: "✅ 郵件已發送", emailFail: "發送失敗，請重試",
      allDone: "✅ 完整解讀完成",
    },
    es: {
      title: "Interpretación con IA", description: "Elige solo la sección que quieres e interpreta los datos calculados.",
      short: "Breve", standard: "Estándar", premium: "Profunda",
      needResults: "Primero calcula una carta.",
      loading: "Generando interpretación.", done: "Listo",
      empty: "El resultado de interpretación está vacío.", failed: "Falló la solicitud de interpretación con IA.",
      generateAll: "⭐ Generar Informe Completo", regenerate: "⭐ Regenerar",
      generating: "Generando informe completo", emailBtn: "📧 Enviar por Email",
      emailSending: "Enviando...", emailSent: "✅ Email Enviado", emailFail: "Falló, intenta de nuevo",
      allDone: "✅ Informe completo listo",
    },
  };

  let activeRequest = null;

  function currentLanguage() {
    return (
      document.getElementById("honcheon-language")?.value ||
      document.documentElement.lang ||
      "ko"
    );
  }

  function label(section) {
    return currentLanguage() === "ko" ? section.ko : section.en;
  }

  function text(key) {
    const language = currentLanguage();
    return (ui[language] || ui.en)[key] || ui.ko[key] || key;
  }

  function collectResultsText() {
    const results = document.getElementById("results");
    if (!results) return "";
    const clone = results.cloneNode(true);
    clone.querySelectorAll("#honcheon-ai-panel, button, select").forEach((node) => node.remove());
    return clone.innerText.replace(/\n{3,}/g, "\n\n").trim();
  }

  async function checkPremiumStatus() {
    try {
      const { data: { session }, error: sessErr } = await _supabase.auth.getSession();
      console.log('[AI해석] 세션:', session ? `uid=${session.user.id}` : '없음', sessErr || '');
      if (!session) return false;

      // 1순위: security definer 함수 (RLS 우회)
      const { data: rpcData, error: rpcError } = await _supabase.rpc('is_subscribed');
      console.log('[AI해석] is_subscribed():', rpcData, rpcError?.message || '');
      if (!rpcError) return !!rpcData;

      // 2순위: 직접 테이블 조회
      const { data, error: tblError } = await _supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', session.user.id)
        .maybeSingle();
      console.log('[AI해석] 테이블 조회:', data, tblError?.message || '');
      return data?.status === 'active' && new Date(data.current_period_end) > new Date();
    } catch (e) {
      console.error('[AI해석] 구독 확인 실패:', e);
      return false;
    }
  }

  function createPanel() {
    const panel = document.createElement("section");
    panel.id = "honcheon-ai-panel";
    panel.className = "rounded-lg border bg-card p-4 md:p-6 shadow-soft space-y-4";
    panel.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="honcheon-ai-title" class="font-serif-display text-xl"></h3>
          <p id="honcheon-ai-description" class="text-sm text-muted-foreground mt-1"></p>
        </div>
        <div class="flex flex-wrap gap-2">
          <select id="honcheon-ai-language" class="h-10 rounded-md border border-input bg-card px-3 text-sm"></select>
          <select id="honcheon-ai-depth" class="h-10 rounded-md border border-input bg-card px-3 text-sm">
            <option value="short" data-i18n-depth="short"></option>
            <option value="standard" data-i18n-depth="standard" selected></option>
            <option value="premium" data-i18n-depth="premium"></option>
          </select>
        </div>
      </div>

      <!-- 유료 회원 전용 액션 줄 (구독 확인 후 표시) -->
      <div id="honcheon-ai-premium-actions" class="hidden items-center flex-wrap gap-3 p-3 rounded-md border border-amber-500/30 bg-amber-500/5">
        <button id="honcheon-ai-generate-all"
          class="rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        </button>
        <button id="honcheon-ai-email-btn"
          class="hidden rounded-md border border-amber-400 text-amber-400 hover:bg-amber-400/10 px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        </button>
        <span id="honcheon-ai-progress" class="text-xs text-amber-400/70 hidden"></span>
      </div>

      <div id="honcheon-ai-sections" class="grid grid-cols-2 md:grid-cols-4 gap-2"></div>
      <div id="honcheon-ai-status" class="text-sm text-muted-foreground"></div>

      <!-- 단일 섹션 결과 (개별 버튼 클릭 시) -->
      <article id="honcheon-ai-result" class="hidden rounded-md border border-border bg-background p-4 text-sm leading-7 whitespace-pre-wrap"></article>

      <!-- 전체 섹션 결과 (전체 생성 시) -->
      <div id="honcheon-ai-all-results" class="hidden divide-y divide-border space-y-0"></div>
    `;

    const languageSelect = panel.querySelector("#honcheon-ai-language");
    languages.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      languageSelect.appendChild(option);
    });
    languageSelect.value = currentLanguage();

    const sectionWrap = panel.querySelector("#honcheon-ai-sections");
    sections.forEach((section) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.section = section.id;
      button.dataset.sectionIndex = String(sections.indexOf(section));
      button.className = "rounded-md border border-input bg-card px-3 py-2 text-sm hover:bg-muted transition-colors";
      button.textContent = label(section);
      button.addEventListener("click", () => requestInterpretation(panel, section));
      sectionWrap.appendChild(button);
    });

    panel.querySelector("#honcheon-ai-generate-all").addEventListener("click", () => generateAllSections(panel));
    panel.querySelector("#honcheon-ai-email-btn").addEventListener("click", () => sendReportEmail(panel));

    updatePanelLanguage(panel);

    // 구독 상태 확인 후 유료 UI 표시
    checkPremiumStatus().then((isPremium) => {
      if (isPremium) {
        const premiumActions = panel.querySelector("#honcheon-ai-premium-actions");
        premiumActions.classList.remove("hidden");
        premiumActions.classList.add("flex");
        panel.querySelector("#honcheon-ai-generate-all").textContent = text("generateAll");
        panel.querySelector("#honcheon-ai-email-btn").textContent = text("emailBtn");
      }
    });

    return panel;
  }

  function updatePanelLanguage(panel) {
    panel.querySelector("#honcheon-ai-title").textContent = text("title");
    panel.querySelector("#honcheon-ai-description").textContent = text("description");
    panel.querySelectorAll("[data-i18n-depth]").forEach((option) => {
      option.textContent = text(option.dataset.i18nDepth);
    });
    panel.querySelectorAll("[data-section-index]").forEach((button) => {
      const section = sections[Number(button.dataset.sectionIndex)];
      button.textContent = label(section);
    });
    const genAll = panel.querySelector("#honcheon-ai-generate-all");
    if (genAll && !genAll.disabled) genAll.textContent = text("generateAll");
    const emailBtn = panel.querySelector("#honcheon-ai-email-btn");
    if (emailBtn && !emailBtn.disabled && !emailBtn.dataset.sent) emailBtn.textContent = text("emailBtn");
  }

  function setStatus(panel, message) {
    panel.querySelector("#honcheon-ai-status").textContent = message;
  }

  function setResult(panel, content) {
    const result = panel.querySelector("#honcheon-ai-result");
    result.textContent = content;
    result.classList.toggle("hidden", !content);
  }

  // 전체 섹션 자동 생성
  async function generateAllSections(panel) {
    const sourceText = collectResultsText();
    if (!sourceText) { setStatus(panel, text("needResults")); return; }

    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) {
      setResult(panel, "🔒 로그인 후 이용하실 수 있습니다.");
      return;
    }

    const language = panel.querySelector("#honcheon-ai-language").value;
    const depth = panel.querySelector("#honcheon-ai-depth").value;
    const genBtn = panel.querySelector("#honcheon-ai-generate-all");
    const emailBtn = panel.querySelector("#honcheon-ai-email-btn");
    const progress = panel.querySelector("#honcheon-ai-progress");
    const allResultsContainer = panel.querySelector("#honcheon-ai-all-results");

    genBtn.disabled = true;
    emailBtn.classList.add("hidden");
    emailBtn.dataset.allResults = "";
    emailBtn.dataset.sent = "";
    emailBtn.textContent = text("emailBtn");
    emailBtn.disabled = false;
    allResultsContainer.innerHTML = "";
    allResultsContainer.classList.remove("hidden");
    panel.querySelector("#honcheon-ai-result").classList.add("hidden");
    progress.classList.remove("hidden");
    setStatus(panel, "");

    const allResults = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      progress.textContent = `(${i + 1}/${sections.length}) ${label(section)} ${text("loading")}`;

      try {
        const response = await fetch(INTERPRET_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            section: section.id,
            sectionLabel: label(section),
            language,
            depth,
            sourceText,
          }),
        });

        if (response.status === 402) {
          allResultsContainer.innerHTML = `
            <p class="p-4 text-sm text-amber-400">
              ⭐ 유료 멤버십 전용 기능입니다.<br>
              <a href="/pricing.html" class="underline">멤버십 가입하기 →</a>
            </p>`;
          break;
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || text("failed"));

        if (data.text) {
          allResults.push({ section: section.id, text: data.text });

          const block = document.createElement("div");
          block.className = "py-5 first:pt-0 last:pb-0";
          block.innerHTML = `
            <h4 class="text-sm font-semibold text-amber-400 mb-3">${label(section)}</h4>
            <p class="text-sm leading-7 whitespace-pre-wrap text-foreground/90"></p>
          `;
          block.querySelector("p").textContent = data.text;
          allResultsContainer.appendChild(block);
        }
      } catch (e) {
        const block = document.createElement("div");
        block.className = "py-5 first:pt-0";
        block.innerHTML = `<p class="text-sm text-muted-foreground">[${label(section)}] ${e.message}</p>`;
        allResultsContainer.appendChild(block);
      }
    }

    progress.classList.add("hidden");
    genBtn.disabled = false;
    genBtn.textContent = text("regenerate");

    if (allResults.length > 0) {
      setStatus(panel, text("allDone"));
      emailBtn.dataset.allResults = JSON.stringify(allResults);
      emailBtn.classList.remove("hidden");
    }
  }

  // 이메일로 전체 해석 발송
  async function sendReportEmail(panel) {
    const emailBtn = panel.querySelector("#honcheon-ai-email-btn");
    const allResultsData = emailBtn.dataset.allResults;
    if (!allResultsData) return;

    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    emailBtn.disabled = true;
    emailBtn.textContent = text("emailSending");

    try {
      const language = panel.querySelector("#honcheon-ai-language").value;
      const response = await fetch(SEND_REPORT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          interpretations: JSON.parse(allResultsData),
          language,
        }),
      });

      if (response.ok) {
        emailBtn.textContent = text("emailSent");
        emailBtn.dataset.sent = "1";
      } else {
        emailBtn.disabled = false;
        emailBtn.textContent = text("emailFail");
      }
    } catch {
      emailBtn.disabled = false;
      emailBtn.textContent = text("emailFail");
    }
  }

  // 개별 섹션 요청
  async function requestInterpretation(panel, section) {
    if (activeRequest) activeRequest.abort();
    activeRequest = new AbortController();

    const sourceText = collectResultsText();
    if (!sourceText) { setStatus(panel, text("needResults")); return; }

    const language = panel.querySelector("#honcheon-ai-language").value;
    const depth = panel.querySelector("#honcheon-ai-depth").value;

    // 전체 생성 결과 숨기고 단일 결과 표시
    panel.querySelector("#honcheon-ai-all-results").classList.add("hidden");
    setStatus(panel, `${label(section)} · ${text("loading")}`);
    setResult(panel, "");

    try {
      const { data: { session } } = await _supabase.auth.getSession();
      if (!session) {
        setStatus(panel, "");
        setResult(panel, "🔒 AI 해석은 로그인 후 이용할 수 있습니다.\n로그인하려면 상단 '로그인 / 회원가입' 버튼을 눌러 주세요.");
        return;
      }

      const response = await fetch(INTERPRET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        signal: activeRequest.signal,
        body: JSON.stringify({
          section: section.id,
          sectionLabel: label(section),
          language,
          depth,
          sourceText,
        }),
      });

      const data = await response.json();

      if (response.status === 402 || data.error === "SUBSCRIPTION_REQUIRED") {
        setStatus(panel, "");
        setResult(panel, "⭐ AI 해석은 유료 멤버십 전용 기능입니다.\n멤버십에 가입하면 사주·자미두수·점성술 모든 섹션의 AI 심층 해석을 이용할 수 있습니다.\n\n→ 멤버십 가입: https://saju0523.pages.dev/pricing.html");
        return;
      }

      if (!response.ok) throw new Error(data.error || text("failed"));

      setStatus(panel, `${text("done")} · ${data.model || "AI"}`);
      setResult(panel, data.text || text("empty"));
    } catch (error) {
      if (error.name === "AbortError") return;
      setStatus(panel, error.message || "AI 해석 중 오류가 발생했습니다.");
    } finally {
      activeRequest = null;
    }
  }

  function mountPanel() {
    const results = document.getElementById("results");
    if (!results || document.getElementById("honcheon-ai-panel")) return;
    results.appendChild(createPanel());
  }

  const observer = new MutationObserver(mountPanel);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("change", (event) => {
    if (event.target && event.target.id === "honcheon-language") {
      const panel = document.getElementById("honcheon-ai-panel");
      if (panel) {
        panel.querySelector("#honcheon-ai-language").value = currentLanguage();
        updatePanelLanguage(panel);
      }
    }
  });
  mountPanel();
})();
