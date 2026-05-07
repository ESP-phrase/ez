import sharp from "sharp";
import { writeFileSync } from "fs";

const svg = `<svg width="512" height="512" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" rx="9" fill="url(#bg)"/>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
  <path d="M13 16C11 11.5 8.5 6 6 2C5 0.5 6.5 -0.5 8 0.5C9.5 1.5 10 5 10.5 8C11 11 12.5 14 15 16Z" fill="white"/>
  <path d="M27 16C29 11.5 31.5 6 34 2C35 0.5 33.5 -0.5 32 0.5C30.5 1.5 30 5 29.5 8C29 11 27.5 14 25 16Z" fill="white"/>
  <path d="M6.5 20C4 17.5 2.5 22 4.5 23.5C6 24.5 9 23.5 8 20.5C7.5 19 6.5 20 6.5 20Z" fill="white"/>
  <path d="M33.5 20C36 17.5 37.5 22 35.5 23.5C34 24.5 31 23.5 32 20.5C32.5 19 33.5 20 33.5 20Z" fill="white"/>
  <ellipse cx="20" cy="26" rx="12" ry="13" fill="white"/>
  <ellipse cx="20" cy="32" rx="7" ry="4.5" fill="rgba(148,163,184,0.22)"/>
  <rect x="13" y="24.5" width="4" height="2.5" rx="1" fill="#0f172a"/>
  <rect x="23" y="24.5" width="4" height="2.5" rx="1" fill="#0f172a"/>
  <path d="M15.5 38C15 40 16.5 40.5 20 40.5C23.5 40.5 25 40 24.5 38C23.5 36.5 16.5 36.5 15.5 38Z" fill="white"/>
</svg>`;

const buf = Buffer.from(svg);

// 512x512
await sharp(buf).resize(512, 512).png().toFile("public/logo-512.png");
// 192x192
await sharp(buf).resize(192, 192).png().toFile("public/logo-192.png");
// 64x64
await sharp(buf).resize(64, 64).png().toFile("public/logo-64.png");

console.log("✅ Exported: public/logo-512.png, logo-192.png, logo-64.png");
