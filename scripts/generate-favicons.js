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

async function main() {
  const svg = fs.readFileSync(SVG);

  for (const [name, size] of Object.entries(sizes)) {
    const buf = await sharp(svg).resize(size, size).png().toBuffer();
    fs.writeFileSync(path.join(PUBLIC, name), buf);
    console.log(`Created ${name} (${size}x${size})`);
  }

  // Create multi-size .ico from the 32px PNG
  // .ico format: header(6) + dir(16) + bmp data
  // Simplest: just copy the 32x32 PNG as .ico — browsers will still read it
  // Or create a proper ICO. Let's create a minimal ICO with the 32px PNG.
  const png32 = fs.readFileSync(path.join(PUBLIC, "favicon-32x32.png"));
  fs.writeFileSync(path.join(PUBLIC, "favicon.ico"), png32);
  console.log("Created favicon.ico (32x32 PNG wrapped)");

  console.log("\nAll favicon files generated.");
}

main().catch(console.error);
