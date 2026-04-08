#!/usr/bin/env node

/**
 * Generate PNG icons from the 🪴 emoji with gradient background
 * for iOS PWA and general PWA support.
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const assetsDir = join(__dirname, '..', 'assets');

// Ensure assets directory exists
mkdirSync(assetsDir, { recursive: true });

// Icon sizes we need
const sizes = [
  { name: 'favicon.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

// Gradient colors from the app
const gradientStart = { r: 102, g: 126, b: 234 }; // #667eea
const gradientEnd = { r: 118, g: 75, b: 162 }; // #764ba2

/**
 * Create a gradient background SVG
 */
function createGradientSVG(size) {
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(${gradientStart.r},${gradientStart.g},${gradientStart.b});stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgb(${gradientEnd.r},${gradientEnd.g},${gradientEnd.b});stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}" />
    </svg>
  `;
}

/**
 * Create emoji SVG text (will be composited on top of gradient)
 */
function createEmojiSVG(size) {
  const fontSize = size * 0.65; // 65% of icon size
  const y = size * 0.75; // Position from top
  
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <text 
        x="50%" 
        y="${y}" 
        font-size="${fontSize}" 
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"
      >🪴</text>
    </svg>
  `;
}

async function generateIcon(name, size) {
  try {
    console.log(`Generating ${name} (${size}x${size})...`);
    
    // Create gradient background
    const gradientSvg = createGradientSVG(size);
    const gradientBuffer = Buffer.from(gradientSvg);
    
    // Create emoji overlay
    const emojiSvg = createEmojiSVG(size);
    const emojiBuffer = Buffer.from(emojiSvg);
    
    // Composite them together
    await sharp(gradientBuffer)
      .composite([
        {
          input: emojiBuffer,
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toFile(join(assetsDir, name));
    
    console.log(`✅ Created ${name}`);
  } catch (error) {
    console.error(`❌ Error generating ${name}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🎨 Generating PWA icons with gradient background...\n');
  
  for (const { name, size } of sizes) {
    await generateIcon(name, size);
  }
  
  console.log('\n✨ All icons generated successfully!');
}

main();
