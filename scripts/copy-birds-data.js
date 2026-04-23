const fs = require("fs");
const path = require("path");

const sourcePath = path.join(
  process.cwd(),
  "データ更新用",
  "野鳥データ（岩瀬）.csv"
);

const destDir = path.join(process.cwd(), "public", "data");
const destPath = path.join(destDir, "birds_master.csv");

if (!fs.existsSync(sourcePath)) {
  console.error("元ファイルが見つかりません:");
  console.error(sourcePath);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(sourcePath, destPath);

console.log("CSVをコピーしました:");
console.log(`FROM: ${sourcePath}`);
console.log(`TO:   ${destPath}`);