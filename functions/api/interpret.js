/**
 * Cloudflare Pages Function: /api/interpret
 * POST handler for AI-powered saju/ziwei/natal interpretation
 */

const MAX_SOURCE_CHARS = 8000;

const LANGUAGE_NAMES = {
  ko: "Korean",
  en: "English",
  ja: "Japanese",
  zh: "Chinese (Simplified)",
  es: "Spanish",
};

function buildPrompt(payload) {
  const language = payload.language || "ko";
  const languageName = LANGUAGE_NAMES[language] || "Korean";
  const section = payload.section || "overall";
  const source = String(payload.sourceText || "").slice(0, MAX_SOURCE_CHARS);

  const depth = payload.depth || "standard";
  const lengthGuide =
    depth === "detailed"
      ? "Write 700-1000 words."
      : depth === "summary"
        ? "Write 250-400 words."
        : "Write 450-650 words.";

  return [
    {
      role: "system",
      content:
        "You are a professional interpretive writer for Saju (Four Pillars), Ziwei Doushu, and natal astrology. " +
        "Use only the provided calculation data. Do not invent missing placements. " +
        `Write ENTIRELY in ${languageName}. Every single word of your response must be in ${languageName}. ` +
        "Be specific, warm, practical, and structured. " +
        "Avoid fatalistic claims, medical diagnosis, legal advice, and guaranteed predictions.",
    },
    {
      role: "user",
      content:
        `IMPORTANT: Respond entirely in ${languageName}.\n` +
        `Requested section: ${section}\n\n` +
        "Calculation data from the user's chart follows.\n\n" +
        source +
        "\n\nWrite the interpretation for only the requested section. " +
        lengthGuide +
        " " +
        "Use short headings, clear paragraphs, and concrete synthesis across the available systems.",
    },
  ];
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY가 설정되어 있지 않습니다. Cloudflare Pages 대시보드에서 환경변수를 설정해주세요." }),
      { status: 501, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body." }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const model = env.OPENAI_MODEL || "gpt-4.1-mini";
  const messages = buildPrompt(payload);

  try {
    const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: payload.depth === "detailed" ? 1800 : payload.depth === "summary" ? 800 : 1200,
        temperature: 0.7,
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || "AI 해석 요청에 실패했습니다." }),
        { status: apiResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return new Response(
      JSON.stringify({ text, model: data.model || model }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "AI 해석 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
