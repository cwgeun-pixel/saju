// 번들된 결과 컴포넌트를 풀이용 상세 화면으로 교체하는 패치 스크립트
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const bundlePath = path.join(root, "assets", "index-B0lRK9V6.js");
const blockPath = path.join(__dirname, "enhanced-results-block.txt");

const source = fs.readFileSync(bundlePath, "utf8");
const replacement = fs.readFileSync(blockPath, "utf8").trim();

const start =
  source.indexOf("// 자미두수와 점성술 원본 계산 결과를 상세 화면으로 표시하는 번들 교체 블록") >= 0
    ? source.indexOf("// 자미두수와 점성술 원본 계산 결과를 상세 화면으로 표시하는 번들 교체 블록")
    : source.indexOf("bx=[5,6,7,8,4,-1,-1,9,3,-1,-1,10,2,1,0,11]");
const end = source.indexOf(",se=class", start);

if (start < 0 || end < 0) {
  throw new Error("Could not locate the bundled result component block.");
}

fs.writeFileSync(bundlePath, source.slice(0, start) + replacement + source.slice(end), "utf8");
console.log("Enhanced result components patched.");
