const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");
const SVG = path.join(PUBLIC, "favicon.svg");

const sizes = {
  "favicon-16x16.png": 16,
  "favicon-32x32.png": 32,
  "apple-touch-icon.png": 180,
};

function createIco(png32Buffer) {
  // ICO file format:
  // - Header: 6 bytes  (reserved=0, type=1=icon, count=1)
  // - Directory: 16 bytes (w, h, colors, reserved, planes, bpp, size, offset)
  // - PNG data: the actual PNG

  const pngSize = png32Buffer.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // type: 1=icon
  header.writeUInt16LE(1, 4);     // count: 1

  const dir = Buffer.alloc(16);
  dir.writeUInt8(32, 0);          // width (32, or 0 for 256)
  dir.writeUInt8(32, 1);          // height (32, or 0 for 256)
  dir.writeUInt8(0, 2);           // colors (0 = no palette)
  dir.writeUInt8(0, 3);           // reserved
  dir.writeUInt16LE(1, 4);        // color planes
  dir.writeUInt16LE(32, 6);       // bits per pixel
  dir.writeUInt32LE(pngSize, 8);  // image size
  dir.writeUInt32LE(22, 12);      // offset (6 + 16 = 22)

  return Buffer.concat([header, dir, png32Buffer]);
}

async function main() {
  const svg = fs.readFileSync(SVG);

  for (const [name, size] of Object.entries(sizes)) {
    const buf = await sharp(svg).resize(size, size).png().toBuffer();
    fs.writeFileSync(path.join(PUBLIC, name), buf);
    console.log(`Created ${name} (${size}x${size}, ${buf.length} bytes)`);
  }

  // Create proper .ico from the 32px PNG
  const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
  const ico = createIco(png32);
  fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), ico);
  console.log(`Created favicon.ico (proper ICO format, ${ico.length} bytes)`);

  console.log("\nAll favicon files generated successfully.");
}

main().catch(console.error);
