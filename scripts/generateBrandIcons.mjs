import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const brandDir = path.join(publicDir, "brand");

function pngToIco(images) {
  const count = images.length;
  const headerSize = 6 + 16 * count;
  let offset = headerSize;
  const buf = Buffer.alloc(headerSize + images.reduce((sum, img) => sum + img.buffer.length, 0));
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  images.forEach((img, i) => {
    const entry = 6 + i * 16;
    buf.writeUInt8(img.size >= 256 ? 0 : img.size, entry);
    buf.writeUInt8(img.size >= 256 ? 0 : img.size, entry + 1);
    buf.writeUInt8(0, entry + 2);
    buf.writeUInt8(0, entry + 3);
    buf.writeUInt16LE(1, entry + 4);
    buf.writeUInt16LE(32, entry + 6);
    buf.writeUInt32LE(img.buffer.length, entry + 8);
    buf.writeUInt32LE(offset, entry + 12);
    offset += img.buffer.length;
  });

  let pos = headerSize;
  for (const img of images) {
    img.buffer.copy(buf, pos);
    pos += img.buffer.length;
  }
  return buf;
}

async function main() {
  const markSvg = fs.readFileSync(path.join(brandDir, "mixwise-app-icon.svg"));
  const wordmarkSvg = fs.readFileSync(path.join(brandDir, "mixwise-wordmark-cream.svg"));

  fs.copyFileSync(path.join(brandDir, "mixwise-app-icon.svg"), path.join(publicDir, "icon.svg"));

  const raster = async (size) =>
    sharp(markSvg, { density: 384 }).resize(size, size).png().toBuffer();

  const [png16, png32, png180, png192, png512] = await Promise.all(
    [16, 32, 180, 192, 512].map(raster)
  );

  await Promise.all([
    sharp(png32).toFile(path.join(publicDir, "icon-32.png")),
    sharp(png180).toFile(path.join(publicDir, "apple-touch-icon.png")),
    sharp(png192).toFile(path.join(publicDir, "icon-192.png")),
    sharp(png512).toFile(path.join(publicDir, "icon-512.png")),
    sharp(png512).toFile(path.join(publicDir, "logo.png")),
  ]);

  fs.writeFileSync(
    path.join(publicDir, "favicon.ico"),
    pngToIco([
      { size: 16, buffer: png16 },
      { size: 32, buffer: png32 },
    ])
  );

  const wordmark = await sharp(wordmarkSvg, { density: 400 }).resize({ width: 640 }).png().toBuffer();
  const wordmarkMeta = await sharp(wordmark).metadata();
  const wordmarkHeight = wordmarkMeta.height || 167;

  const tagline = await sharp(
    Buffer.from(`<svg width="760" height="88" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="34" font-family="Georgia, 'Times New Roman', Times, serif" font-size="30" fill="#F9F7F2">A smarter way to make cocktails at home</text>
      <text x="0" y="74" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="20" fill="#D1DAD0">getmixwise.com</text>
    </svg>`)
  )
    .png()
    .toBuffer();

  const period = await sharp(
    Buffer.from(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="78" fill="#F9F7F2"/>
    </svg>`)
  )
    .png()
    .toBuffer();

  const bar = await sharp({
    create: { width: 16, height: 630, channels: 3, background: "#BC5A45" },
  })
    .png()
    .toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: "#3A4D39" },
  })
    .composite([
      { input: bar, left: 0, top: 0 },
      { input: wordmark, left: 88, top: 208 },
      { input: tagline, left: 88, top: 208 + wordmarkHeight + 28 },
      { input: period, left: 920, top: 215 },
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(publicDir, "og-image.jpg"));

  console.log("Generated MixWise favicon, logo, and OG image.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
