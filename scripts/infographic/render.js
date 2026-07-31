// card.html을 로컬 Chrome으로 열어 카드별 1080×1920 PNG를 뽑는 배치 스크립트 (실제 계산 엔진을 그대로 사용)
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const findChrome = () => {
  for (const p of CHROME_CANDIDATES) if (fs.existsSync(p)) return p;
  throw new Error('Chrome/Edge 실행 파일을 찾지 못했습니다.');
};

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const ROOT = path.resolve(__dirname, '..', '..');

// ESM import를 쓰므로 file:// 대신 임시 정적 서버로 띄운다
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      const file = path.join(ROOT, url === '/' ? 'index.html' : url);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); return res.end('not found');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function parseArgs() {
  const a = Object.fromEntries(process.argv.slice(2).map((s) => {
    const [k, ...v] = s.replace(/^--/, '').split('=');
    return [k, v.join('=')];
  }));
  if (!a.y || !a.m || !a.d) {
    console.error('사용법: node render.js --y=1971 --m=9 --d=22 --h=20 --mi=0 --g=M --name=홍길동 [--card=saju,natal] [--out=output]');
    process.exit(1);
  }
  return a;
}

async function main() {
  const a = parseArgs();
  const outDir = path.resolve(__dirname, a.out || 'output');
  fs.mkdirSync(outDir, { recursive: true });

  const params = new URLSearchParams({
    y: a.y, m: a.m, d: a.d, h: a.h ?? '12', mi: a.mi ?? '0',
    g: a.g || 'M', unknown: a.unknown || '0', name: a.name || '', export: '1',
  });
  if (a.card) params.set('card', a.card);

  const { server, port } = await serve();
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('page error:', e.message));

    await page.goto(`http://127.0.0.1:${port}/card.html#${params}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('body[data-ready="1"]', { timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);

    const cards = await page.$$('.card');
    if (!cards.length) throw new Error('렌더된 카드가 없습니다.');

    const label = (a.name || 'card').replace(/[\\/:*?"<>|]/g, '');
    for (const el of cards) {
      const id = await el.evaluate((n) => n.dataset.card);
      const out = path.join(outDir, `${label}_${id}.png`);
      await el.screenshot({ path: out });
      console.log('OK ->', out);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
