import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const iconDefs = [
  { name: "icon_16x16.png", size: 16 },
  { name: "icon_16x16@2x.png", size: 32 },
  { name: "icon_32x32.png", size: 32 },
  { name: "icon_32x32@2x.png", size: 64 },
  { name: "icon_128x128.png", size: 128 },
  { name: "icon_128x128@2x.png", size: 256 },
  { name: "icon_256x256.png", size: 256 },
  { name: "icon_256x256@2x.png", size: 512 },
  { name: "icon_512x512.png", size: 512 },
  { name: "icon_512x512@2x.png", size: 1024 },
];

const iconsetDir = join(projectRoot, "build", "icon.iconset");
const faviconPath = join(projectRoot, "..", "public", "favicon.svg");
const svgBuffer = readFileSync(faviconPath);

mkdirSync(iconsetDir, { recursive: true });

const promises = iconDefs.map(async ({ name, size }) => {
  const png = await sharp(svgBuffer).resize(size, size).png().toBuffer();
  writeFileSync(join(iconsetDir, name), png);
  console.log(`  ${name} (${size}x${size})`);
});

await Promise.all(promises);
console.log("\nIconset generated at:", iconsetDir);
