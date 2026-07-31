// template.html에 infographic.json을 주입하고 로컬 Chrome(puppeteer-core)으로 1080×1920 PNG를 찍는 스크립트
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) if (fs.existsSync(p)) return p;
  throw new Error('Chrome/Edge 실행 파일을 찾지 못했습니다.');
}

async function main() {
  // 사용법: node render.js <data.json> <out.png> [template.html]
  const here = __dirname;
  const dataPath = process.argv[2] || path.join(here, 'infographic_saju.json');
  const outPath = process.argv[3] || path.join(here, 'output', 'infographic.png');
  const templatePath = process.argv[4] || path.join(here, 'template_saju.html');

  const data = fs.readFileSync(dataPath, 'utf-8');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const html = template.replace('__DATA_JSON__', () => data.trim());

  const renderedPath = path.join(here, 'rendered_' + path.basename(templatePath, '.html') + '.html');
  fs.writeFileSync(renderedPath, html, 'utf-8');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: 'new',
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    // 웹폰트(Noto Serif KR/TC) 로드 완료까지 대기
    await page.goto('file:///' + renderedPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: outPath });
    console.log('OK ->', outPath);
  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
