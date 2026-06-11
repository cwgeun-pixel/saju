// 계산 결과 화면에 섹션별 AI 해석 요청 패널을 추가하는 스크립트 (유료 회원 전용)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const _supabase = createClient(
  'https://smqekqdlkkqagzrvtnmh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcWVrcWRsa2txYWd6cnZ0bm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDkzODcsImV4cCI6MjA5NjE4NTM4N30.VomC09MBc9vEs9A-vZIiwM_LAoUrODXRZHFAX0CEvjc'
);
const INTERPRET_URL = 'https://smqekqdlkkqagzrvtnmh.supabase.co/functions/v1/interpret';

(function () {
  const sections = [
    { id: "personality", ko: "기본 성향", en: "Personality" },
    { id: "saju", ko: "사주 심층", en: "Saju" },
    { id: "ziwei", ko: "자미두수 심층", en: "Ziwei Doushu" },
    { id: "natal", ko: "점성술 심층", en: "Natal Astrology" },
    { id: "love", ko: "연애와 결혼", en: "Love & Marriage" },
    { id: "career", ko: "직업과 재물", en: "Career & Wealth" },
    { id: "year", ko: "올해 운세", en: "Annual Flow" },
    { id: "overall", ko: "세 가지 종합", en: "Synthesis" },
  ];

  const languages = [
    ["ko", "한국어"],
    ["en", "English"],
    ["ja", "日本語"],
    ["zh", "中文"],
    ["es", "Español"],
  ];

  const ui = {
    ko: {
      title: "AI 해석",
      description: "원하는 항목만 선택해서 계산 자료 기반 해석을 생성합니다.",
      short: "요약",
      standard: "표준",
      premium: "심층",
      needResults: "먼저 생년월일시를 입력해 계산 결과를 만들어주세요.",
      loading: "해석을 생성하는 중입니다.",
      done: "완료",
      empty: "해석 결과가 비어 있습니다.",
      failed: "AI 해석 요청에 실패했습니다.",
    },
    en: {
      title: "AI Interpretation",
      description: "Choose only the section you want and generate an interpretation from the chart data.",
      short: "Brief",
      standard: "Standard",
      premium: "Deep",
      needResults: "Please calculate a chart first.",
      loading: "Generating interpretation.",
      done: "Done",
      empty: "The interpretation result is empty.",
      failed: "AI interpretation request failed.",
    },
    ja: {
      title: "AI 解釈",
      description: "必要な項目だけを選び、命式データに基づく解釈を生成します。",
      short: "要約",
      standard: "標準",
      premium: "詳細",
      needResults: "先に命式を計算してください。",
      loading: "解釈を生成しています。",
      done: "完了",
      empty: "解釈結果が空です。",
      failed: "AI 解釈リクエストに失敗しました。",
    },
    zh: {
      title: "AI 解讀",
      description: "只選擇需要的項目，根據命盤資料生成解讀。",
      short: "摘要",
      standard: "標準",
      premium: "深入",
      needResults: "請先計算命盤。",
      loading: "正在生成解讀。",
      done: "完成",
      empty: "解讀結果為空。",
      failed: "AI 解讀請求失敗。",
    },
    es: {
      title: "Interpretación con IA",
      description: "Elige solo la sección que quieres e interpreta los datos calculados.",
      short: "Breve",
      standard: "Estándar",
      premium: "Profunda",
      needResults: "Primero calcula una carta.",
      loading: "Generando interpretación.",
      done: "Listo",
      empty: "El resultado de interpretación está vacío.",
      failed: "Falló la solicitud de interpretación con IA.",
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
      <div id="honcheon-ai-sections" class="grid grid-cols-2 md:grid-cols-4 gap-2"></div>
      <div id="honcheon-ai-status" class="text-sm text-muted-foreground"></div>
      <article id="honcheon-ai-result" class="hidden rounded-md border border-border bg-background p-4 text-sm leading-7 whitespace-pre-wrap"></article>
    `;

    const languageSelect = panel.querySelector("#honcheon-ai-language");
    languages.forEach(([value, text]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      languageSelect.appendChild(option);
    });
    languageSelect.value = currentLanguage();

    const sectionWrap = panel.querySelector("#honcheon-ai-sections");
    sections.forEach((section) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.section = section.id;
      button.dataset.sectionIndex = String(sections.indexOf(section));
      button.className =
        "rounded-md border border-input bg-card px-3 py-2 text-sm hover:bg-muted transition-colors";
      button.textContent = label(section);
      button.addEventListener("click", () => requestInterpretation(panel, section));
      sectionWrap.appendChild(button);
    });

    updatePanelLanguage(panel);
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
  }

  function setStatus(panel, message) {
    panel.querySelector("#honcheon-ai-status").textContent = message;
  }

  function setResult(panel, text) {
    const result = panel.querySelector("#honcheon-ai-result");
    result.textContent = text;
    result.classList.remove("hidden");
  }

  async function requestInterpretation(panel, section) {
    if (activeRequest) activeRequest.abort();
    activeRequest = new AbortController();

    const sourceText = collectResultsText();
    if (!sourceText) {
      setStatus(panel, text("needResults"));
      return;
    }

    const language = panel.querySelector("#honcheon-ai-language").value;
    const depth = panel.querySelector("#honcheon-ai-depth").value;

    setStatus(panel, `${label(section)} · ${text("loading")}`);
    setResult(panel, "");

    try {
      // 세션 확인
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

      if (response.status === 402 || data.error === 'SUBSCRIPTION_REQUIRED') {
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
