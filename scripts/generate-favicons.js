const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const SVG = path.join(PUBLIC, "favicon.svg");

async function main() {
  const svg = fs.readFileSync(SVG);

  // Google requires favicon >= 48x48 for search results
  const sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "favicon-96x96.png": 96,
    "apple-touch-icon.png": 180,
  };

  for (const [name, size] of Object.entries(sizes)) {
    const buf = await sharp(svg).resize(size, size).png().toBuffer();
    fs.writeFileSync(path.join(PUBLIC, name), buf);
    console.log(`Created ${name} (${size}x${size}, ${buf.length}b)`);
  }

  // Proper ICO (multi-resolution: 16, 32, 48)
  const icoSizes = [16, 32, 48];
  const iconImages = await Promise.all(icoSizes.map((s) => sharp(svg).resize(s, s).png().toBuffer()));
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(icoSizes.length, 4);

  let icoBody = Buffer.alloc(0);
  let offset = 6 + icoSizes.length * 16;
  for (let i = 0; i < icoSizes.length; i++) {
    const dimg = Buffer.alloc(16);
    dimg.writeUInt8(icoSizes[i], 0);
    dimg.writeUInt8(icoSizes[i], 1);
    dimg.writeUInt8(0, 2);
    dimg.writeUInt8(0, 3);
    dimg.writeUInt16LE(1, 4);
    dimg.writeUInt16LE(32, 6);
    dimg.writeUInt32LE(iconImages[i].length, 8);
    dimg.writeUInt32LE(offset, 12);
    icoBody = Buffer.concat([icoBody, dimg, iconImages[i]]);
    offset += iconImages[i].length;
  }
  fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), Buffer.concat([icoHeader, icoBody]));
  console.log(`Created favicon.ico (multi-size ${icoSizes.join(",")}, ${icoHeader.length + icoBody.length}b)`);

  // Open Graph image (1200x630)
  const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1121"/><stop offset="100%" stop-color="#1F6B4F"/>
    </linearGradient></defs>
    <rect width="1200" height="630" fill="url(#bg)" rx="0"/>
    <rect x="540" y="160" width="120" height="140" rx="12" fill="#1F6B4F"/>
    <rect x="555" y="172" width="90" height="115" rx="6" fill="white"/>
    <rect x="565" y="195" width="70" height="4" rx="2" fill="#1F6B4F" opacity="0.3"/>
    <rect x="565" y="208" width="70" height="4" rx="2" fill="#1F6B4F" opacity="0.3"/>
    <rect x="565" y="221" width="50" height="4" rx="2" fill="#1F6B4F" opacity="0.3"/>
    <rect x="580" y="155" width="40" height="8" rx="3" fill="#d1fae5"/>
    <text x="600" y="390" font-family="system-ui, sans-serif" font-size="56" font-weight="800" fill="white" text-anchor="middle">JobStacker</text>
    <text x="600" y="420" font-family="system-ui, sans-serif" font-size="22" fill="#94a3b8" text-anchor="middle">Quotes · Jobs · Customers · Calendar</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toBuffer().then((buf) => {
    fs.writeFileSync(path.join(PUBLIC, "og-image.png"), buf);
    console.log(`Created og-image.png (1200x630, ${buf.length}b)`);
  });

  console.log("\nDone.");
}

main().catch(console.error);
