// 소개 페이지의 한국어 본문을 미리 렌더링해 정적 HTML로 심는 빌드 스크립트
// (본문이 JS 템플릿 안에만 있어 크롤러에게는 빈 페이지로 보이던 문제 해결)
// 실행: node scripts/prerender-about.js
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const PAGES = ['saju-about.html', 'ziwei-about.html', 'astro-about.html'];
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));

const PLACEHOLDER = '<div id="page-content"></div>';
// 이미 심어둔 정적 본문을 다시 심을 때 갈아끼우기 위한 표식
const START = '<div id="page-content"><!--prerendered-->';
const END = '<!--/prerendered--></div>';

function serve() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let u;
      try { u = decodeURIComponent(req.url.split('?')[0].split('#')[0]); } catch { res.writeHead(400); return res.end(); }
      let f = path.join(ROOT, u === '/' ? 'index.html' : u);
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end('nf'); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => resolve({ s, port: s.address().port }));
  });
}

(async () => {
  if (!CHROME) throw new Error('Chrome/Edge를 찾지 못했습니다.');
  const { s, port } = await serve();
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  try {
    for (const file of PAGES) {
      const p = await browser.newPage();
      // 항상 한국어로 심는다 (다른 언어는 방문자 브라우저에서 JS가 전환)
      await p.evaluateOnNewDocument(() => {
        try { localStorage.setItem('tod_lang', 'ko'); } catch (e) { /* 무시 */ }
      });
      await p.goto(`http://127.0.0.1:${port}/${file}`, { waitUntil: 'networkidle0' });
      await p.waitForFunction(() => {
        const el = document.getElementById('page-content');
        return el && el.innerHTML.length > 500;
      }, { timeout: 20000 });

      const html = await p.$eval('#page-content', (el) => el.innerHTML);
      await p.close();

      const src = fs.readFileSync(path.join(ROOT, file), 'utf-8');
      let out;
      if (src.includes(PLACEHOLDER)) {
        out = src.replace(PLACEHOLDER, START + html + END);
      } else {
        const i = src.indexOf(START);
        const j = src.indexOf(END);
        if (i < 0 || j < 0) { console.log(`${file}: 삽입 지점을 찾지 못해 건너뜀`); continue; }
        out = src.slice(0, i) + START + html + src.slice(j);
      }
      fs.writeFileSync(path.join(ROOT, file), out, 'utf-8');
      console.log(`${file}: 본문 ${html.length.toLocaleString()}자 정적 삽입`);
    }
  } finally {
    await browser.close();
    s.close();
  }
})();
