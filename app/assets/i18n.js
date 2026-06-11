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
      title: "사주 · 자미두수 · 천궁도 계산기",
      description: "브라우저에서 안전하게 계산하는 사주, 자미두수, 천궁도 계산기입니다.",
    },
    en: {
      title: "Saju · Ziwei Doushu · Natal Chart Calculator",
      description: "A private browser-based calculator for Saju, Ziwei Doushu, and natal astrology.",
    },
    ja: {
      title: "四柱推命 · 紫微斗数 · ネイタルチャート計算機",
      description: "ブラウザ内で安全に計算する四柱推命、紫微斗数、ネイタルチャート計算機です。",
    },
    zh: {
      title: "四柱八字 · 紫微斗數 · 星盤計算器",
      description: "在瀏覽器中安全計算四柱八字、紫微斗數與本命星盤。",
    },
    es: {
      title: "Saju · Ziwei Doushu · Carta Natal",
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
      "이용 안내 및 책임 제한": "Terms of Use & Disclaimer",
      "본 서비스에서 제공하는 사주, 자미두수, 점성학 해석은 전통적·상징적 해석을 바탕으로 한 참고용 콘텐츠입니다. 이는 개인의 성향, 흐름, 가능성을 재미로 살펴보기 위한 것이며, 실제 인생의 중요한 결정에 대한 확정적인 판단이나 보장을 의미하지 않습니다.": "The Saju, Ziwei Doushu, and astrology interpretations provided by this service are reference content based on traditional and symbolic readings. They are intended for personal exploration of tendencies, patterns, and possibilities — not as definitive judgments or guarantees for major life decisions.",
      "특히 다음 분야의 결정에는 본 해석을 근거로 사용해서는 안 됩니다: 질병 진단·치료 등 의료적 판단 / 투자·계약 등 금융·법률적 결정 / 결혼·취업·사업 등 중대한 인생 결정 / 정신 건강·심리 상담·위기 상황에 대한 판단": "These interpretations should NOT be used as a basis for: medical decisions including diagnosis or treatment / financial or legal decisions such as investments or contracts / major life decisions such as marriage, employment, or business / mental health, counseling, or crisis situations",
      "중요한 문제는 반드시 전문가와 상담하십시오. 본 서비스의 해석 결과를 바탕으로 사용자가 내린 결정과 그 결과에 대해 서비스 제공자는 책임을 지지 않습니다.": "Please consult a qualified professional for important matters. The service provider is not responsible for any decisions made or their consequences based on the results of this service.",
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
      "이용 안내 및 책임 제한": "ご利用案内 · 免責事項",
      "본 서비스에서 제공하는 사주, 자미두수, 점성학 해석은 전통적·상징적 해석을 바탕으로 한 참고용 콘텐츠입니다. 이는 개인의 성향, 흐름, 가능성을 재미로 살펴보기 위한 것이며, 실제 인생의 중요한 결정에 대한 확정적인 판단이나 보장을 의미하지 않습니다.": "本サービスが提供する四柱推命、紫微斗数、占星術の解釈は、伝統的・象徴的な解釈に基づく参考コンテンツです。これは個人の性格、流れ、可能性を楽しく探るためのものであり、実際の人生の重要な決定に対する確定的な判断や保証を意味するものではありません。",
      "특히 다음 분야의 결정에는 본 해석을 근거로 사용해서는 안 됩니다: 질병 진단·치료 등 의료적 판단 / 투자·계약 등 금융·법률적 결정 / 결혼·취업·사업 등 중대한 인생 결정 / 정신 건강·심리 상담·위기 상황에 대한 판단": "特に以下の分野の決定に本解釈を根拠として使用してはなりません：疾病の診断・治療等の医療的判断 / 投資・契約等の金融・法律的決定 / 結婚・就職・事業等の重大な人生の決定 / 精神健康・心理相談・危機状況に関する判断",
      "중요한 문제는 반드시 전문가와 상담하십시오. 본 서비스의 해석 결과를 바탕으로 사용자가 내린 결정과 그 결과에 대해 서비스 제공자는 책임을 지지 않습니다.": "重要な問題は必ず専門家に相談してください。本サービスの解釈結果に基づいてユーザーが下した決定とその結果について、サービス提供者は責任を負いません。",
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
      "이용 안내 및 책임 제한": "使用說明 · 免責聲明",
      "본 서비스에서 제공하는 사주, 자미두수, 점성학 해석은 전통적·상징적 해석을 바탕으로 한 참고용 콘텐츠입니다. 이는 개인의 성향, 흐름, 가능성을 재미로 살펴보기 위한 것이며, 실제 인생의 중요한 결정에 대한 확정적인 판단이나 보장을 의미하지 않습니다.": "本服務提供的四柱八字、紫微斗數及占星解讀，係以傳統象徵性詮釋為基礎的參考內容。旨在幫助用戶探索個人傾向、運勢與可能性，並非對人生重大決定的確定性判斷或保證。",
      "특히 다음 분야의 결정에는 본 해석을 근거로 사용해서는 안 됩니다: 질병 진단·치료 등 의료적 판단 / 투자·계약 등 금융·법률적 결정 / 결혼·취업·사업 등 중대한 인생 결정 / 정신 건강·심리 상담·위기 상황에 대한 판단": "請勿將本解讀作為以下領域決策的依據：疾病診斷、治療等醫療判斷 / 投資、合約等金融法律決定 / 婚姻、就業、事業等重大人生決定 / 心理健康、心理諮詢及危機處理",
      "중요한 문제는 반드시 전문가와 상담하십시오. 본 서비스의 해석 결과를 바탕으로 사용자가 내린 결정과 그 결과에 대해 서비스 제공자는 책임을 지지 않습니다.": "重要事項請務必諮詢專業人士。對於用戶基於本服務解讀結果所做的決定及其後果，本服務提供者概不負責。",
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
      "이용 안내 및 책임 제한": "Aviso legal y limitación de responsabilidad",
      "본 서비스에서 제공하는 사주, 자미두수, 점성학 해석은 전통적·상징적 해석을 바탕으로 한 참고용 콘텐츠입니다. 이는 개인의 성향, 흐름, 가능성을 재미로 살펴보기 위한 것이며, 실제 인생의 중요한 결정에 대한 확정적인 판단이나 보장을 의미하지 않습니다.": "Las interpretaciones de Saju, Ziwei Doushu y astrología que ofrece este servicio son contenido de referencia basado en lecturas tradicionales y simbólicas. Están pensadas para explorar tendencias, flujos y posibilidades personales, y no constituyen juicios definitivos ni garantías para decisiones importantes en la vida.",
      "특히 다음 분야의 결정에는 본 해석을 근거로 사용해서는 안 됩니다: 질병 진단·치료 등 의료적 판단 / 투자·계약 등 금융·법률적 결정 / 결혼·취업·사업 등 중대한 인생 결정 / 정신 건강·심리 상담·위기 상황에 대한 판단": "Estas interpretaciones NO deben usarse como base para: decisiones médicas, incluyendo diagnóstico o tratamiento / decisiones financieras o legales como inversiones o contratos / decisiones importantes de vida como matrimonio, empleo o negocios / situaciones de salud mental, asesoramiento o crisis",
      "중요한 문제는 반드시 전문가와 상담하십시오. 본 서비스의 해석 결과를 바탕으로 사용자가 내린 결정과 그 결과에 대해 서비스 제공자는 책임을 지지 않습니다.": "Consulte a un profesional cualificado para asuntos importantes. El proveedor del servicio no se hace responsable de las decisiones tomadas ni sus consecuencias a partir de los resultados de este servicio.",
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
