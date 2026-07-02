const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const SVG = path.join(PUBLIC, "favicon.svg");

async function main() {
  const svg = fs.readFileSync(SVG);

  // Standard favicons
  const sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
  };

  for (const [name, size] of Object.entries(sizes)) {
    const buf = await sharp(svg).resize(size, size).png().toBuffer();
    fs.writeFileSync(path.join(PUBLIC, name), buf);
    console.log(`Created ${name} (${size}x${size})`);
  }

  // Proper ICO
  const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
  const pngSize = png32.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const dir = Buffer.alloc(16);
  dir.writeUInt8(32, 0);
  dir.writeUInt8(32, 1);
  dir.writeUInt8(0, 2);
  dir.writeUInt8(0, 3);
  dir.writeUInt16LE(1, 4);
  dir.writeUInt16LE(32, 6);
  dir.writeUInt32LE(pngSize, 8);
  dir.writeUInt32LE(22, 12);
  const ico = Buffer.concat([header, dir, png32]);
  fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), ico);
  console.log(`Created favicon.ico (${ico.length} bytes)`);

  // Open Graph image (1200x630)
  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0b1121"/>
        <stop offset="100%" stop-color="#1F6B4F"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" rx="0"/>
    <rect x="540" y="200" width="120" height="140" rx="12" fill="#1F6B4F"/>
    <rect x="555" y="212" width="90" height="115" rx="6" fill="white"/>
    <rect x="565" y="235" width="70" height="4" rx="2" fill="#1F6B4F" opacity="0.3"/>
    <rect x="565" y="248" width="70" height="4" rx="2" fill="#1F6B4F" opacity="0.3"/>
    <rect x="565" y="261" width="50" height="4" rx="2" fill="#1F6B4F" opacity="0.3"/>
    <rect x="580" y="195" width="40" height="8" rx="3" fill="#d1fae5"/>
    <text x="600" y="430" font-family="system-ui, sans-serif" font-size="56" font-weight="800" fill="white" text-anchor="middle">JobStacker</text>
    <text x="600" y="465" font-family="system-ui, sans-serif" font-size="22" fill="#94a3b8" text-anchor="middle">Quotes · Jobs · Customers · Calendar</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toBuffer().then((buf) => {
    fs.writeFileSync(path.join(PUBLIC, "og-image.png"), buf);
    console.log(`Created og-image.png (1200x630, ${buf.length} bytes)`);
  });

  console.log("\nAll assets generated.");
}

main().catch(console.error);
