// 브라우저 언어 감지와 화면 문구 번역을 담당하는 런타임 i18n 레이어
(function () {
  const supported = ["ko", "en", "ja", "zh", "es"];
  const names = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
    zh: "中文",
    es: "Español",
  };

  const meta = {
    ko: {
      title: "혼천 · 사주 · 자미두수 · 천궁도 계산기",
      description: "브라우저에서 안전하게 계산하는 사주, 자미두수, 천궁도 계산기입니다.",
    },
    en: {
      title: "Hon-Cheon · Saju · Ziwei Doushu · Natal Chart Calculator",
      description: "A private browser-based calculator for Saju, Ziwei Doushu, and natal astrology.",
    },
    ja: {
      title: "渾天 · 四柱推命 · 紫微斗数 · ネイタルチャート計算機",
      description: "ブラウザ内で安全に計算する四柱推命、紫微斗数、ネイタルチャート計算機です。",
    },
    zh: {
      title: "渾天 · 四柱八字 · 紫微斗數 · 星盤計算器",
      description: "在瀏覽器中安全計算四柱八字、紫微斗數與本命星盤。",
    },
    es: {
      title: "Hon-Cheon · Saju · Ziwei Doushu · Carta Natal",
      description: "Calculadora privada en el navegador para Saju, Ziwei Doushu y astrología natal.",
    },
  };

  const dict = {
    en: {
      "Hon-Cheon · 渾天": "Hon-Cheon · 渾天",
      "사주 · 자미두수 · 천궁도": "Saju · Ziwei Doushu · Natal Chart",
      "하나의 명식, 세 가지 시선": "One birth chart, three traditions",
      "동·서양 점성술과 명리학을 한 화면에서 계산합니다. 모든 데이터는 브라우저 안에서만 처리됩니다.": "Calculate Eastern and Western astrology in one screen. All data stays in your browser.",
      "생년월일 (양력)": "Date of Birth (Solar)",
      "출생시각": "Time",
      "시간 모름": "Unknown time",
      "남": "M",
      "여": "F",
      "출생지": "Birthplace",
      "위도": "Latitude",
      "경도": "Longitude",
      "명식 산출하기": "Calculate",
      "모든 계산은 브라우저에서 처리됩니다. 정보가 외부로 전송되지 않습니다.": "All calculations are processed in your browser. Your information is never sent to a server.",
      "모든 계산은 브라우저에서 처리됩니다 · 정보를 외부로 전송하지 않습니다": "All calculations are processed in your browser · No information is sent out",
      "다시": "Reset",
      "사주": "Saju",
      "자미두수": "Ziwei Doushu",
      "천궁도": "Natal Chart",
      "四柱八字": "Four Pillars",
      "八字關係": "Pillar Relations",
      "神殺": "Special Stars",
      "坐法": "Seat Method",
      "引從法": "Following Method",
      "大運": "Daewoon",
      "歲運": "Annual Luck",
      "紫微斗數 命盤": "Ziwei Doushu Chart",
      "四化": "Four Transformations",
      "大限": "Major Periods",
      "流年": "Annual Chart",
      "流年四化": "Annual Transformations",
      "流月": "Monthly Flow",
      "大限 ": "Major Period ",
      "流年命宮": "Annual Life Palace",
      "本命": "Natal",
      "陽曆": "Solar",
      "陰曆": "Lunar",
      "年柱": "Year Pillar",
      "男": "Male",
      "女": "Female",
      "命宮": "Life",
      "身宮": "Body",
      "歲": "yrs",
    },
    ja: {
      "Hon-Cheon · 渾天": "渾天 · Hon-Cheon",
      "사주 · 자미두수 · 천궁도": "四柱推命 · 紫微斗数 · ネイタルチャート",
      "하나의 명식, 세 가지 시선": "一つの命式、三つの視点",
      "동·서양 점성술과 명리학을 한 화면에서 계산합니다. 모든 데이터는 브라우저 안에서만 처리됩니다.": "東洋と西洋の占術を一つの画面で計算します。すべてのデータはブラウザ内で処理されます。",
      "생년월일 (양력)": "生年月日（太陽暦）",
      "출생시각": "出生時刻",
      "시간 모름": "時刻不明",
      "남": "男",
      "여": "女",
      "출생지": "出生地",
      "위도": "緯度",
      "경도": "経度",
      "명식 산출하기": "命式を計算",
      "모든 계산은 브라우저에서 처리됩니다. 정보가 외부로 전송되지 않습니다.": "すべての計算はブラウザ内で処理され、情報は外部に送信されません。",
      "모든 계산은 브라우저에서 처리됩니다 · 정보를 외부로 전송하지 않습니다": "すべての計算はブラウザ内で処理されます · 情報は外部に送信されません",
      "다시": "戻る",
      "사주": "四柱推命",
      "자미두수": "紫微斗数",
      "천궁도": "ネイタル",
      "四柱八字": "四柱八字",
      "八字關係": "八字関係",
      "神殺": "神殺",
      "坐法": "坐法",
      "引從法": "引従法",
      "大運": "大運",
      "歲運": "年運",
      "紫微斗數 命盤": "紫微斗数 命盤",
      "四化": "四化",
      "大限": "大限",
      "流年": "流年",
      "流年四化": "流年四化",
      "流月": "流月",
      "陽曆": "陽暦",
      "陰曆": "陰暦",
      "年柱": "年柱",
      "男": "男",
      "女": "女",
      "歲": "歳",
    },
    zh: {
      "Hon-Cheon · 渾天": "渾天 · Hon-Cheon",
      "사주 · 자미두수 · 천궁도": "四柱八字 · 紫微斗數 · 本命星盤",
      "하나의 명식, 세 가지 시선": "一張命盤，三種視角",
      "동·서양 점성술과 명리학을 한 화면에서 계산합니다. 모든 데이터는 브라우저 안에서만 처리됩니다.": "在同一畫面計算東西方命理與占星。所有資料只在瀏覽器內處理。",
      "생년월일 (양력)": "出生日期（陽曆）",
      "출생시각": "出生時間",
      "시간 모름": "時間不詳",
      "남": "男",
      "여": "女",
      "출생지": "出生地",
      "위도": "緯度",
      "경도": "經度",
      "명식 산출하기": "開始計算",
      "모든 계산은 브라우저에서 처리됩니다. 정보가 외부로 전송되지 않습니다.": "所有計算都在瀏覽器內處理，資訊不會傳送到外部。",
      "모든 계산은 브라우저에서 처리됩니다 · 정보를 외부로 전송하지 않습니다": "所有計算都在瀏覽器內處理 · 資訊不會傳送到外部",
      "다시": "重算",
      "사주": "四柱",
      "자미두수": "紫微斗數",
      "천궁도": "星盤",
      "四柱八字": "四柱八字",
      "八字關係": "八字關係",
      "神殺": "神煞",
      "坐法": "坐法",
      "引從法": "引從法",
      "大運": "大運",
      "歲運": "歲運",
      "紫微斗數 命盤": "紫微斗數 命盤",
      "四化": "四化",
      "大限": "大限",
      "流年": "流年",
      "流年四化": "流年四化",
      "流月": "流月",
      "陽曆": "陽曆",
      "陰曆": "陰曆",
      "年柱": "年柱",
      "歲": "歲",
    },
    es: {
      "Hon-Cheon · 渾天": "Hon-Cheon · 渾天",
      "사주 · 자미두수 · 천궁도": "Saju · Ziwei Doushu · Carta Natal",
      "하나의 명식, 세 가지 시선": "Una carta, tres miradas",
      "동·서양 점성술과 명리학을 한 화면에서 계산합니다. 모든 데이터는 브라우저 안에서만 처리됩니다.": "Calcula astrología oriental y occidental en una sola pantalla. Todos los datos se procesan en tu navegador.",
      "생년월일 (양력)": "Fecha de nacimiento (solar)",
      "출생시각": "Hora",
      "시간 모름": "Hora desconocida",
      "남": "H",
      "여": "M",
      "출생지": "Lugar de nacimiento",
      "위도": "Latitud",
      "경도": "Longitud",
      "명식 산출하기": "Calcular",
      "모든 계산은 브라우저에서 처리됩니다. 정보가 외부로 전송되지 않습니다.": "Todos los cálculos se procesan en tu navegador. La información no se envía a ningún servidor.",
      "모든 계산은 브라우저에서 처리됩니다 · 정보를 외부로 전송하지 않습니다": "Todos los cálculos se procesan en tu navegador · No se envía información",
      "다시": "Reiniciar",
      "사주": "Saju",
      "자미두수": "Ziwei Doushu",
      "천궁도": "Carta Natal",
      "四柱八字": "Cuatro Pilares",
      "八字關係": "Relaciones Bazi",
      "神殺": "Estrellas especiales",
      "坐法": "Método de asiento",
      "引從法": "Método de seguimiento",
      "大運": "Grandes ciclos",
      "歲運": "Ciclo anual",
      "紫微斗數 命盤": "Carta Ziwei Doushu",
      "四化": "Cuatro transformaciones",
      "大限": "Grandes periodos",
      "流年": "Año actual",
      "流年四化": "Transformaciones anuales",
      "流月": "Meses",
      "陽曆": "Solar",
      "陰曆": "Lunar",
      "年柱": "Pilar anual",
      "男": "Hombre",
      "女": "Mujer",
      "命宮": "Vida",
      "身宮": "Cuerpo",
      "歲": "años",
    },
  };

  const originalText = new WeakMap();
  let lang = pickLanguage();
  let translating = false;

  function pickLanguage() {
    const saved = localStorage.getItem("honcheon.lang");
    if (supported.includes(saved)) return saved;
    const code = (navigator.languages || [navigator.language || "ko"])
      .map((value) => value.toLowerCase())
      .find(Boolean) || "ko";
    if (code.startsWith("ko")) return "ko";
    if (code.startsWith("ja")) return "ja";
    if (code.startsWith("zh")) return "zh";
    if (code.startsWith("es")) return "es";
    return "en";
  }

  function translate(raw) {
    if (lang === "ko") return raw;
    const table = dict[lang] || {};
    const trimmed = raw.trim();
    if (!trimmed) return raw;
    if (table[trimmed]) return raw.replace(trimmed, table[trimmed]);

    let next = raw;
    Object.keys(table)
      .sort((a, b) => b.length - a.length)
      .forEach((key) => {
        next = next.split(key).join(table[key]);
      });

    if (lang !== "ko") {
      next = next
        .replace(/(\d{4})년/g, "$1")
        .replace(/(\d{1,2})월/g, lang === "en" ? "$1 mo" : lang === "es" ? "$1 mes" : "$1月")
        .replace(/(\d{1,2})일/g, lang === "en" ? "$1 day" : lang === "es" ? "$1 día" : "$1日")
        .replace(/(\d{1,2})시/g, lang === "en" ? "$1 h" : lang === "es" ? "$1 h" : "$1時")
        .replace(/(\d{2})분/g, lang === "en" ? "$1 min" : lang === "es" ? "$1 min" : "$1分")
        .replace(/남 ·/g, (lang === "ja" || lang === "zh") ? "男 ·" : lang === "es" ? "Hombre ·" : "Male ·")
        .replace(/여 ·/g, (lang === "ja" || lang === "zh") ? "女 ·" : lang === "es" ? "Mujer ·" : "Female ·");
    }
    return next;
  }

  function translateTextNode(node) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const raw = originalText.get(node);
    const next = translate(raw);
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  function shouldSkip(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "OPTION"].includes(parent.tagName);
  }

  function translateTree(root) {
    if (translating) return;
    translating = true;
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        if (!shouldSkip(node)) translateTextNode(node);
      });
      applyMeta();
      syncControl();
    } finally {
      translating = false;
    }
  }

  function applyMeta() {
    const info = meta[lang] || meta.ko;
    document.documentElement.lang = lang;
    document.title = info.title;
    setMeta("description", info.description);
    setMeta("og:title", info.title, true);
    setMeta("og:description", info.description, true);
  }

  function setMeta(name, content, property) {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", content);
  }

  function syncControl() {
    const select = document.getElementById("honcheon-language");
    if (select && select.value !== lang) select.value = lang;
  }

  function installControl() {
    if (document.getElementById("honcheon-language")) return;
    const wrap = document.createElement("div");
    wrap.style.position = "fixed";
    wrap.style.right = "16px";
    wrap.style.bottom = "16px";
    wrap.style.zIndex = "50";
    wrap.style.background = "hsl(var(--card, 0 0% 100%))";
    wrap.style.border = "1px solid hsl(var(--border, 214 32% 91%))";
    wrap.style.borderRadius = "8px";
    wrap.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.12)";
    wrap.style.padding = "6px";

    const select = document.createElement("select");
    select.id = "honcheon-language";
    select.setAttribute("aria-label", "Language");
    select.style.border = "0";
    select.style.background = "transparent";
    select.style.fontSize = "13px";
    select.style.outline = "none";
    supported.forEach((code) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = names[code];
      select.appendChild(option);
    });
    select.value = lang;
    select.addEventListener("change", () => {
      lang = select.value;
      localStorage.setItem("honcheon.lang", lang);
      translateTree(document.body);
      document.dispatchEvent(new CustomEvent("honcheon:langchange", { detail: { lang } }));
    });
    wrap.appendChild(select);
    document.body.appendChild(wrap);
  }

  function boot() {
    installControl();
    translateTree(document.body);
    const observer = new MutationObserver((mutations) => {
      if (translating) return;
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && !shouldSkip(node)) translateTextNode(node);
          if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
