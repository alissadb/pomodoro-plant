#!/usr/bin/env node

/**
 * Generate PNG icons from the Begonia Maculata plant (full grown) with soft white background
 * for iOS PWA and general PWA support. Background color matches the app's UI theme.
 */

import sharp from 'sharp';
import { mkdirSync } from 'fs';
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

// Background colors matching the app's UI theme
const bgColor = { r: 247, g: 251, b: 245 }; // #f7fbf5 (--visual-a from app)

/**
 * Create the full icon SVG with soft white/green background and Begonia Maculata plant (stage 5 - full grown)
 */
function createIconSVG(size) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="potGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b9723d" />
          <stop offset="100%" stop-color="#8c4f2a" />
        </linearGradient>
        <linearGradient id="bLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#5f9b76" />
          <stop offset="100%" stop-color="#275f45" />
        </linearGradient>
        <linearGradient id="bStem" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#5f8248" />
          <stop offset="100%" stop-color="#344c31" />
        </linearGradient>
        <style>
          .shadow { fill: rgba(20, 40, 28, 0.15); }
          .stem { fill: none; stroke-width: 4; stroke-linecap: round; }
          .pot-rim { fill: url(#potGradient); stroke: #5d3618; stroke-width: 2; }
          .pot-body { fill: url(#potGradient); stroke: #5d3618; stroke-width: 2; }
          .begonia-leaf { filter: drop-shadow(0 1px 2px rgba(15, 44, 25, 0.25)); }
          .begonia-dot { fill: #f4ede5; opacity: 0.92; }
        </style>
      </defs>
      
      <!-- Background - soft white/green matching app theme -->
      <rect width="420" height="420" fill="rgb(${bgColor.r},${bgColor.g},${bgColor.b})" rx="42" />
      
      <!-- Shadow -->
      <ellipse cx="210" cy="374" rx="140" ry="22" class="shadow" />
      
      <!-- Begonia Maculata - Stage 5 (Full Grown) -->
      <g class="plant-stage stage-5">
        <path class="stem" d="M210 300 C203 264 216 224 234 172" stroke="url(#bStem)" />
        <ellipse class="leaf begonia-leaf" cx="122" cy="220" rx="39" ry="55" transform="rotate(-39 122 220)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="298" cy="220" rx="39" ry="55" transform="rotate(39 298 220)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="210" cy="134" rx="33" ry="45" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="166" cy="136" rx="25" ry="36" transform="rotate(-20 166 136)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="254" cy="136" rx="25" ry="36" transform="rotate(20 254 136)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="188" cy="106" rx="18" ry="28" transform="rotate(-12 188 106)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="232" cy="106" rx="18" ry="28" transform="rotate(12 232 106)" fill="url(#bLeaf)" />
        <circle class="begonia-dot" cx="109" cy="203" r="2.9" /><circle class="begonia-dot" cx="129" cy="226" r="2.7" /><circle class="begonia-dot" cx="123" cy="246" r="2.5" /><circle class="begonia-dot" cx="145" cy="260" r="2.3" />
        <circle class="begonia-dot" cx="311" cy="203" r="2.9" /><circle class="begonia-dot" cx="291" cy="226" r="2.7" /><circle class="begonia-dot" cx="297" cy="246" r="2.5" /><circle class="begonia-dot" cx="275" cy="260" r="2.3" />
        <circle class="begonia-dot" cx="200" cy="123" r="2.5" /><circle class="begonia-dot" cx="220" cy="142" r="2.5" /><circle class="begonia-dot" cx="184" cy="103" r="2.1" /><circle class="begonia-dot" cx="236" cy="103" r="2.1" />
      </g>
      
      <!-- Pot -->
      <path class="pot-rim" d="M118 296 H302 C314 296 324 305 324 317 C324 325 319 332 312 336 H108 C101 332 96 325 96 317 C96 305 106 296 118 296Z" />
      <path class="pot-body" d="M110 335 H310 L290 386 H130 Z" />
    </svg>
  `;
}

async function generateIcon(name, size) {
  try {
    console.log(`Generating ${name} (${size}x${size})...`);
    
    // Create the full icon SVG (gradient background + Begonia plant)
    const iconSvg = createIconSVG(size);
    const iconBuffer = Buffer.from(iconSvg);
    
    // Convert to PNG
    await sharp(iconBuffer)
      .resize(size, size)
      .png()
      .toFile(join(assetsDir, name));
    
    console.log(`✅ Created ${name}`);
  } catch (error) {
    console.error(`❌ Error generating ${name}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🌿 Generating PWA icons with Begonia Maculata plant...\n');
  
  for (const { name, size } of sizes) {
    await generateIcon(name, size);
  }
  
  console.log('\n✨ All icons generated successfully!');
}

main();
