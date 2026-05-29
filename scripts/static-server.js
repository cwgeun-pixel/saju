// 정적 파일 제공과 AI 해석 API를 함께 처리하는 로컬 서버
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function loadEnvFile(fileName) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;

    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const maxSourceChars = Number(process.env.AI_SOURCE_CHARS || 24_000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large."));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function buildInterpretationPrompt(payload) {
  const language = payload.language || "ko";
  const section = payload.section || "overall";
  const source = String(payload.sourceText || "").slice(0, maxSourceChars);
  const lengthGuide =
    payload.depth === "premium"
      ? "Write 700-1000 words."
      : payload.depth === "short"
        ? "Write 250-400 words."
        : "Write 450-650 words.";

  return [
    {
      role: "system",
      content:
        "You are a professional interpretive writer for Saju, Ziwei Doushu, and natal astrology. " +
        "Use only the provided calculation data. Do not invent missing placements. " +
        "Write in the requested language. Be specific, warm, practical, and structured. " +
        "Avoid fatalistic claims, medical diagnosis, legal advice, and guaranteed predictions.",
    },
    {
      role: "user",
      content:
        `Requested language: ${language}\n` +
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

async function handleInterpret(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 501, {
      error: "OPENAI_API_KEY가 설정되어 있지 않습니다. 서버 실행 전에 환경변수나 .env.local에 API 키를 넣어주세요.",
    });
    return;
  }

  try {
    const payload = JSON.parse(await readBody(request));
    const startedAt = Date.now();
    console.log(
      `AI interpretation request: section=${payload.section || "overall"} depth=${payload.depth || "standard"} sourceChars=${String(payload.sourceText || "").length}`
    );
    const input = buildInterpretationPrompt(payload);
    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input,
        reasoning: { effort: payload.depth === "premium" ? "medium" : "low" },
        text: { verbosity: payload.depth === "short" ? "medium" : "high" },
        max_output_tokens: payload.depth === "premium" ? 1800 : payload.depth === "short" ? 800 : 1200,
      }),
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      sendJson(response, apiResponse.status, {
        error: data.error?.message || "AI 해석 요청에 실패했습니다.",
      });
      return;
    }

    const text =
      data.output_text ||
      data.output?.flatMap((item) => item.content || [])
        .map((item) => item.text || "")
        .join("")
        .trim();

    console.log(`AI interpretation completed in ${Date.now() - startedAt}ms.`);
    sendJson(response, 200, { text, model });
  } catch (error) {
    console.error(`AI interpretation failed: ${error.message || error}`);
    sendJson(response, 500, { error: error.message || "AI 해석 중 오류가 발생했습니다." });
  }
}

function serveStatic(request, response) {
  let pathname = decodeURIComponent(request.url.split("?")[0]);
  if (pathname === "/" || pathname === "") pathname = "/index.html";
  // Cloudflare _redirects: /app/* → /app/index.html
  if (pathname.startsWith("/app") && !pathname.match(/\.\w+$/)) pathname = "/app/index.html";
  // Cloudflare _redirects: /fortune/* → /fortune/index.html
  if (pathname.startsWith("/fortune") && !pathname.match(/\.\w+$/)) pathname = "/fortune/index.html";

  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(request.url.split("?")[0]);
  if (pathname === "/api/interpret") {
    handleInterpret(request, response);
    return;
  }
  serveStatic(request, response);
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}`);
  console.log(`AI interpretation model: ${model}`);
  console.log(process.env.OPENAI_API_KEY ? "OPENAI_API_KEY loaded." : "OPENAI_API_KEY is missing.");
});
