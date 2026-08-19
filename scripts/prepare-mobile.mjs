#!/usr/bin/env node
/**
 * Ensures the Capacitor webDir exists and refreshes iOS branding assets.
 */
import { mkdirSync, existsSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");
const indexPath = join(outDir, "index.html");
const iconSrc = join(root, "public", "icon-512.png");
const wordmarkSrc = join(root, "public", "brand", "mixwise-wordmark-forest.svg");
const iconDest = join(
  root,
  "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
);
const splashDir = join(root, "ios/App/App/Assets.xcassets/Splash.imageset");
const CREAM = { r: 249, g: 247, b: 242, alpha: 1 };

mkdirSync(outDir, { recursive: true });

if (!existsSync(indexPath)) {
  writeFileSync(
    indexPath,
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MixWise</title></head><body><p>MixWise is loading…</p></body></html>`
  );
}

async function refreshBrandingAssets() {
  if (!existsSync(iconSrc)) {
    console.warn("public/icon-512.png not found — skipping icon/splash update");
    return;
  }

  await sharp(iconSrc)
    .resize(1024, 1024, { fit: "contain", background: CREAM })
    .flatten({ background: CREAM })
    .png()
    .toFile(iconDest);
  console.log("Updated iOS app icon (1024×1024, no alpha) from public/icon-512.png");

  mkdirSync(splashDir, { recursive: true });

  const splashSizes = [
    { name: "splash-2732x2732-2.png", size: 911 },
    { name: "splash-2732x2732-1.png", size: 1822 },
    { name: "splash-2732x2732.png", size: 2732 },
  ];

  const splashMarkSrc = existsSync(wordmarkSrc) ? wordmarkSrc : iconSrc;

  for (const { name, size } of splashSizes) {
    const markWidth = Math.round(size * 0.42);
    const logo = await sharp(splashMarkSrc, { density: 400 })
      .resize({ width: markWidth })
      .png()
      .toBuffer();

    const splash = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: CREAM,
      },
    })
      .composite([{ input: logo, gravity: "center" }])
      .png()
      .toBuffer();

    writeFileSync(join(splashDir, name), splash);
  }

  console.log("Updated iOS splash screens (cream + production mixwise. wordmark)");
}

await refreshBrandingAssets();

const env = process.env.CAPACITOR_ENV === "production" ? "production" : "development";
console.log(`Mobile shell prepared (${env} mode). Run npm run dev, then build in Xcode.`);
