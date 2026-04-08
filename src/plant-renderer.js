function hashStringToSeed(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BUILT_IN_PLANT_FAMILY = {
  snake: "upright",
  zz: "upright",
  begonia: "spotted",
};

function familyForBuiltIn(plantId) {
  return BUILT_IN_PLANT_FAMILY[plantId] ?? "auto";
}

function stylePaletteForFamily(resolvedFamily, random) {
  if (resolvedFamily === "broad-leaf") {
    return {
      leafLight: "#5faa73",
      leafDark: "#2f8b58",
      vein: "#1f5d39",
      accent: "#f4f0d7",
      spots: false,
      rxBoost: 8,
      ryBoost: 2,
    };
  }
  if (resolvedFamily === "upright") {
    return {
      leafLight: "#62b089",
      leafDark: "#3a8d60",
      vein: "#2c6f54",
      accent: "#d9efd6",
      spots: false,
      rxBoost: -2,
      ryBoost: 10,
    };
  }
  if (resolvedFamily === "spotted") {
    return {
      leafLight: "#4f8e67",
      leafDark: "#2a6d4a",
      vein: "#1f5036",
      accent: "#f2f6ef",
      spots: true,
      rxBoost: 2,
      ryBoost: 4,
    };
  }
  const pick = random();
  if (pick < 0.33) return stylePaletteForFamily("broad-leaf", random);
  if (pick < 0.66) return stylePaletteForFamily("upright", random);
  return stylePaletteForFamily("spotted", random);
}

function createLeafPath(cx, cy, rx, ry) {
  const leftX = cx - rx;
  const rightX = cx + rx;
  const topY = cy - ry;
  const bottomY = cy + ry;

  return `M ${cx.toFixed(1)} ${topY.toFixed(1)} C ${(leftX - rx * 0.35).toFixed(1)} ${(cy - ry * 0.25).toFixed(1)} ${(leftX + rx * 0.1).toFixed(1)} ${(bottomY - ry * 0.2).toFixed(1)} ${cx.toFixed(1)} ${bottomY.toFixed(1)} C ${(rightX - rx * 0.1).toFixed(1)} ${(bottomY - ry * 0.2).toFixed(1)} ${(rightX + rx * 0.35).toFixed(1)} ${(cy - ry * 0.25).toFixed(1)} ${cx.toFixed(1)} ${topY.toFixed(1)} Z`;
}

function generatePlantSvg(seed, family) {
  const random = mulberry32((seed >>> 0) + 7);
  const palette = stylePaletteForFamily(family, random);
  const stages = [];

  for (let stage = 1; stage <= 5; stage += 1) {
    const stageRandom = mulberry32((seed >>> 0) + stage * 997);
    const leafCount = stage + 1 + (palette.spots ? 1 : 0);
    const stemTop = 300 - (52 + stage * 34);
    const leaves = [];

    for (let i = 0; i < leafCount; i += 1) {
      const ratio = leafCount === 1 ? 0 : i / (leafCount - 1);
      const centered = ratio * 2 - 1;
      const cx = 210 + centered * (26 + stage * 26) + (stageRandom() - 0.5) * 10;
      const cy = stemTop + 45 + Math.abs(centered) * 25 + (stageRandom() - 0.5) * 10;
      const angle = centered * (35 + stage * 8) + (stageRandom() - 0.5) * 16;
      const rx = 12 + stage * 4 + palette.rxBoost + stageRandom() * 4;
      const ry = 18 + stage * 6 + palette.ryBoost + stageRandom() * 6;
      const bend = stageRandom() * 0.9 - 0.45;
      const leafPath = createLeafPath(cx, cy, rx, ry, bend);
      const leafId = `leaf-${stage}-${i}-${Math.floor(cx * 10)}`;
      leaves.push(`<g transform="rotate(${angle.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})"><path class="leaf generated-leaf" d="${leafPath}" fill="url(#leafGradient-${leafId})" /><path class="leaf-vein" d="M ${cx.toFixed(1)} ${(cy + ry * 0.95).toFixed(1)} C ${(cx + bend * rx * 0.28).toFixed(1)} ${(cy + ry * 0.2).toFixed(1)} ${(cx - bend * rx * 0.2).toFixed(1)} ${(cy - ry * 0.1).toFixed(1)} ${cx.toFixed(1)} ${(cy - ry * 0.9).toFixed(1)}" /></g>`);

      leaves.push(`<defs><linearGradient id="leafGradient-${leafId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette.leafLight}"/><stop offset="100%" stop-color="${palette.leafDark}"/></linearGradient></defs>`);

      if (!palette.spots && stageRandom() > 0.58) {
        const vx = cx + (stageRandom() - 0.5) * 10;
        const vy = cy + (stageRandom() - 0.5) * 10;
        leaves.push(`<ellipse class="variegation" cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" rx="${(rx * 0.24).toFixed(1)}" ry="${(ry * 0.35).toFixed(1)}" transform="rotate(${angle.toFixed(1)} ${vx.toFixed(1)} ${vy.toFixed(1)})" />`);
      }

      if (palette.spots) {
        const dots = 2 + Math.floor(stage / 2);
        for (let d = 0; d < dots; d += 1) {
          const dx = cx + (stageRandom() - 0.5) * (rx * 1.2);
          const dy = cy + (stageRandom() - 0.5) * (ry * 1.2);
          const rr = 1.6 + stageRandom() * 1.4;
          leaves.push(`<circle class="begonia-dot" cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${rr.toFixed(1)}" />`);
        }
      }
    }

    stages.push(`<g class="plant-stage stage-${stage}"><path class="stem" d="M210 300 L210 ${stemTop.toFixed(1)}" />${leaves.join("")}</g>`);
  }

  return `
    <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="potGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b9723d" />
          <stop offset="100%" stop-color="#8c4f2a" />
        </linearGradient>
        <style>
          .generated-leaf { filter: drop-shadow(0 1px 1px rgba(15, 44, 25, 0.22)); }
          .leaf-vein { fill: none; stroke: ${palette.vein}; stroke-width: 1.7; stroke-linecap: round; opacity: 0.45; }
          .variegation { fill: ${palette.accent}; }
        </style>
      </defs>
      <ellipse cx="210" cy="374" rx="140" ry="22" class="shadow" />
      ${stages.join("")}
      <path class="pot-rim" d="M118 296 H302 C314 296 324 305 324 317 C324 325 319 332 312 336 H108 C101 332 96 325 96 317 C96 305 106 296 118 296Z" />
      <path class="pot-body" d="M110 335 H310 L290 386 H130 Z" />
    </svg>
  `;
}

function getSnakePlantBotanicalSvg() {
  return `
    <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="potGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b9723d" />
          <stop offset="100%" stop-color="#8c4f2a" />
        </linearGradient>
        <linearGradient id="snLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#a8d08e" />
          <stop offset="26%" stop-color="#6a9759" />
          <stop offset="44%" stop-color="#86b172" />
          <stop offset="66%" stop-color="#557f4d" />
          <stop offset="100%" stop-color="#355f3d" />
        </linearGradient>
      </defs>

      <ellipse cx="210" cy="374" rx="140" ry="22" class="shadow" />

      <g class="plant-stage stage-1">
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M198 300 C194 268 196 242 202 220 C208 244 210 268 208 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M212 300 C210 272 216 247 224 227 C230 249 229 273 222 300 Z" />
      </g>

      <g class="plant-stage stage-2">
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M184 300 C178 258 182 222 194 190 C206 223 207 260 199 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M201 300 C198 247 205 205 220 160 C232 203 231 251 219 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M222 300 C220 262 228 230 240 200 C249 232 248 264 239 300 Z" />
      </g>

      <g class="plant-stage stage-3">
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M170 300 C161 253 166 210 182 163 C198 211 198 256 188 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M190 300 C184 238 192 187 210 125 C226 186 226 242 212 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M212 300 C210 232 220 180 239 112 C254 179 252 236 235 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M236 300 C233 251 244 214 260 168 C270 210 268 252 256 300 Z" />
      </g>

      <g class="plant-stage stage-4">
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M156 300 C145 247 152 200 171 145 C190 199 190 251 176 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M179 300 C170 230 180 175 202 102 C223 173 222 234 206 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M204 300 C198 219 210 158 232 82 C252 157 251 223 234 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M230 300 C225 235 239 184 258 120 C272 181 270 236 254 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M254 300 C252 250 265 213 280 164 C289 209 286 251 274 300 Z" />
      </g>

      <g class="plant-stage stage-5">
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M146 300 C134 244 142 193 163 134 C184 194 184 248 168 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M170 300 C159 224 171 162 196 86 C220 161 219 226 202 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M198 300 C192 211 206 145 231 64 C254 143 253 214 235 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M226 300 C221 225 237 166 260 92 C278 165 276 227 258 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M253 300 C251 246 266 205 284 150 C295 203 292 247 279 300 Z" />
        <path class="leaf snake-leaf" fill="url(#snLeaf)" d="M274 300 C273 257 286 226 300 183 C308 223 306 257 295 300 Z" />
      </g>

      <path class="pot-rim" d="M118 296 H302 C314 296 324 305 324 317 C324 325 319 332 312 336 H108 C101 332 96 325 96 317 C96 305 106 296 118 296Z" />
      <path class="pot-body" d="M110 335 H310 L290 386 H130 Z" />
    </svg>
  `;
}

function getZZPlantBotanicalSvg() {
  return `
    <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="potGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b9723d" />
          <stop offset="100%" stop-color="#8c4f2a" />
        </linearGradient>
        <linearGradient id="zzLeaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#89c678" />
          <stop offset="100%" stop-color="#3e7a45" />
        </linearGradient>
      </defs>

      <ellipse cx="210" cy="374" rx="140" ry="22" class="shadow" />

      <g class="plant-stage stage-1">
        <path class="zz-stem" d="M210 300 C210 280 214 264 220 248" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="212" cy="262" rx="9" ry="16" transform="rotate(-18 212 262)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="222" cy="279" rx="8" ry="14" transform="rotate(18 222 279)" />
        <path class="zz-highlight" d="M211 269 C214 264 216 259 217 254" />
        <path class="zz-highlight" d="M221 285 C224 281 226 276 227 272" />
      </g>

      <g class="plant-stage stage-2">
        <path class="zz-stem" d="M203 300 C198 272 203 245 217 212" />
        <path class="zz-stem" d="M217 300 C221 274 229 250 242 225" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="202" cy="262" rx="10" ry="17" transform="rotate(-26 202 262)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="214" cy="242" rx="10" ry="18" transform="rotate(-16 214 242)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="225" cy="276" rx="9" ry="16" transform="rotate(12 225 276)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="236" cy="252" rx="10" ry="17" transform="rotate(24 236 252)" />
        <path class="zz-highlight" d="M201 269 C205 263 208 257 210 250" />
        <path class="zz-highlight" d="M214 248 C217 242 219 236 220 230" />
        <path class="zz-highlight" d="M235 259 C239 253 242 247 244 241" />
      </g>

      <g class="plant-stage stage-3">
        <path class="zz-stem" d="M192 300 C182 267 188 234 208 188" />
        <path class="zz-stem" d="M210 300 C210 262 220 220 236 172" />
        <path class="zz-stem" d="M229 300 C238 270 251 236 268 196" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="193" cy="257" rx="11" ry="19" transform="rotate(-30 193 257)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="207" cy="246" rx="10" ry="17" transform="rotate(18 207 246)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="218" cy="214" rx="11" ry="19" transform="rotate(-16 218 214)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="233" cy="202" rx="11" ry="18" transform="rotate(14 233 202)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="244" cy="248" rx="11" ry="18" transform="rotate(-14 244 248)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="259" cy="236" rx="11" ry="19" transform="rotate(24 259 236)" />
        <path class="zz-highlight" d="M193 264 C197 258 200 252 202 246" />
        <path class="zz-highlight" d="M219 221 C223 215 226 209 228 202" />
        <path class="zz-highlight" d="M259 244 C263 238 266 232 268 226" />
      </g>

      <g class="plant-stage stage-4">
        <path class="zz-stem" d="M182 300 C171 264 178 226 202 173" />
        <path class="zz-stem" d="M206 300 C204 252 215 203 236 146" />
        <path class="zz-stem" d="M232 300 C244 266 261 225 282 177" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="181" cy="257" rx="12" ry="21" transform="rotate(-32 181 257)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="197" cy="243" rx="12" ry="20" transform="rotate(18 197 243)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="205" cy="206" rx="12" ry="21" transform="rotate(-18 205 206)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="221" cy="190" rx="12" ry="20" transform="rotate(12 221 190)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="234" cy="270" rx="11" ry="20" transform="rotate(10 234 270)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="248" cy="252" rx="12" ry="20" transform="rotate(-12 248 252)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="264" cy="216" rx="12" ry="20" transform="rotate(20 264 216)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="278" cy="197" rx="11" ry="19" transform="rotate(-10 278 197)" />
        <path class="zz-highlight" d="M181 265 C186 258 190 251 192 244" />
        <path class="zz-highlight" d="M206 214 C210 207 214 199 216 191" />
        <path class="zz-highlight" d="M265 224 C269 217 272 209 274 201" />
        <path class="zz-highlight" d="M278 204 C282 198 285 191 287 185" />
      </g>

      <g class="plant-stage stage-5">
        <path class="zz-stem" d="M172 300 C160 261 169 218 196 158" />
        <path class="zz-stem" d="M201 300 C198 247 212 193 237 132" />
        <path class="zz-stem" d="M232 300 C245 264 265 219 290 168" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="170" cy="254" rx="13" ry="23" transform="rotate(-34 170 254)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="186" cy="238" rx="13" ry="22" transform="rotate(18 186 238)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="196" cy="202" rx="13" ry="23" transform="rotate(-18 196 202)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="212" cy="184" rx="13" ry="22" transform="rotate(12 212 184)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="224" cy="154" rx="12" ry="20" transform="rotate(-8 224 154)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="239" cy="270" rx="12" ry="22" transform="rotate(10 239 270)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="252" cy="251" rx="13" ry="22" transform="rotate(-12 252 251)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="268" cy="216" rx="13" ry="22" transform="rotate(20 268 216)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="281" cy="196" rx="12" ry="21" transform="rotate(-10 281 196)" />
        <ellipse class="leaf zz-leaf" fill="url(#zzLeaf)" cx="293" cy="175" rx="11" ry="18" transform="rotate(26 293 175)" />
        <path class="zz-highlight" d="M170 262 C175 254 179 246 181 238" />
        <path class="zz-highlight" d="M197 210 C201 202 205 194 207 186" />
        <path class="zz-highlight" d="M224 162 C228 155 231 148 233 141" />
        <path class="zz-highlight" d="M268 224 C273 216 277 208 280 199" />
        <path class="zz-highlight" d="M293 183 C297 177 300 170 302 164" />
      </g>

      <path class="pot-rim" d="M118 296 H302 C314 296 324 305 324 317 C324 325 319 332 312 336 H108 C101 332 96 325 96 317 C96 305 106 296 118 296Z" />
      <path class="pot-body" d="M110 335 H310 L290 386 H130 Z" />
    </svg>
  `;
}

function getBegoniaBotanicalSvg() {
  return `
    <svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg">
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
      </defs>

      <ellipse cx="210" cy="374" rx="140" ry="22" class="shadow" />

      <g class="plant-stage stage-1">
        <path class="stem" d="M210 300 C208 276 211 258 219 243" stroke="url(#bStem)" />
        <ellipse class="leaf begonia-leaf" cx="194" cy="253" rx="21" ry="30" transform="rotate(-22 194 253)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="226" cy="253" rx="21" ry="30" transform="rotate(22 226 253)" fill="url(#bLeaf)" />
        <circle class="begonia-dot" cx="187" cy="250" r="2.1" /><circle class="begonia-dot" cx="203" cy="259" r="1.9" /><circle class="begonia-dot" cx="233" cy="248" r="2" />
      </g>

      <g class="plant-stage stage-2">
        <path class="stem" d="M210 300 C206 272 212 247 224 218" stroke="url(#bStem)" />
        <ellipse class="leaf begonia-leaf" cx="178" cy="245" rx="24" ry="34" transform="rotate(-30 178 245)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="244" cy="245" rx="24" ry="34" transform="rotate(30 244 245)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="210" cy="220" rx="20" ry="28" fill="url(#bLeaf)" />
        <circle class="begonia-dot" cx="170" cy="236" r="2.2" /><circle class="begonia-dot" cx="188" cy="253" r="2" /><circle class="begonia-dot" cx="252" cy="236" r="2.2" /><circle class="begonia-dot" cx="236" cy="253" r="2" /><circle class="begonia-dot" cx="204" cy="218" r="2" />
      </g>

      <g class="plant-stage stage-3">
        <path class="stem" d="M210 300 C205 270 214 238 228 198" stroke="url(#bStem)" />
        <ellipse class="leaf begonia-leaf" cx="162" cy="235" rx="29" ry="41" transform="rotate(-34 162 235)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="258" cy="235" rx="29" ry="41" transform="rotate(34 258 235)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="210" cy="190" rx="24" ry="35" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="188" cy="170" rx="18" ry="28" transform="rotate(-16 188 170)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="232" cy="170" rx="18" ry="28" transform="rotate(16 232 170)" fill="url(#bLeaf)" />
        <circle class="begonia-dot" cx="154" cy="223" r="2.4" /><circle class="begonia-dot" cx="170" cy="243" r="2.2" /><circle class="begonia-dot" cx="266" cy="223" r="2.4" /><circle class="begonia-dot" cx="250" cy="243" r="2.2" /><circle class="begonia-dot" cx="205" cy="182" r="2" /><circle class="begonia-dot" cx="218" cy="194" r="2" />
      </g>

      <g class="plant-stage stage-4">
        <path class="stem" d="M210 300 C204 266 214 230 230 183" stroke="url(#bStem)" />
        <ellipse class="leaf begonia-leaf" cx="144" cy="228" rx="34" ry="47" transform="rotate(-37 144 228)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="276" cy="228" rx="34" ry="47" transform="rotate(37 276 228)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="210" cy="160" rx="29" ry="40" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="178" cy="149" rx="22" ry="33" transform="rotate(-18 178 149)" fill="url(#bLeaf)" />
        <ellipse class="leaf begonia-leaf" cx="242" cy="149" rx="22" ry="33" transform="rotate(18 242 149)" fill="url(#bLeaf)" />
        <circle class="begonia-dot" cx="132" cy="214" r="2.7" /><circle class="begonia-dot" cx="153" cy="239" r="2.5" /><circle class="begonia-dot" cx="145" cy="255" r="2.2" />
        <circle class="begonia-dot" cx="288" cy="214" r="2.7" /><circle class="begonia-dot" cx="267" cy="239" r="2.5" /><circle class="begonia-dot" cx="275" cy="255" r="2.2" />
        <circle class="begonia-dot" cx="202" cy="152" r="2.3" /><circle class="begonia-dot" cx="218" cy="170" r="2.3" />
      </g>

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

      <path class="pot-rim" d="M118 296 H302 C314 296 324 305 324 317 C324 325 319 332 312 336 H108 C101 332 96 325 96 317 C96 305 106 296 118 296Z" />
      <path class="pot-body" d="M110 335 H310 L290 386 H130 Z" />
    </svg>
  `;
}

const PLANT_RENDERERS = {
  snake: getSnakePlantBotanicalSvg,
  zz: getZZPlantBotanicalSvg,
  begonia: getBegoniaBotanicalSvg,
};

// Cache for generated SVGs to avoid regenerating on every render
const svgCache = new Map();

export function getPlantSvg(plantId) {
  // Check cache first
  if (svgCache.has(plantId)) {
    return svgCache.get(plantId);
  }
  
  // Generate and cache
  const renderer = PLANT_RENDERERS[plantId];
  let svg;
  if (renderer) {
    svg = renderer();
  } else {
    svg = generatePlantSvg(hashStringToSeed(plantId), familyForBuiltIn(plantId));
  }
  
  svgCache.set(plantId, svg);
  return svg;
}
