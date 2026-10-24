#!/usr/bin/env node
/**
 * Generates the placeholder SVG artwork in /public/images.
 *
 * These are original vector illustrations (no third-party photography or brand
 * marks) so the frontend can ship with assets we are allowed to distribute.
 * Replace them with real product photography during backend integration —
 * nothing else in the app depends on these files except the mock data.
 *
 *   npm run generate:placeholders
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");

export const COLORS = {
  maroon: "#6B1A1A",
  navy: "#1F2A44",
  beige: "#D8C7AE",
  black: "#1E1E1E",
  white: "#F3F2EE",
  olive: "#5B5E3C",
  stone: "#B9B2A6",
  charcoal: "#3A3A3C",
  sky: "#A7BCD3",
  brown: "#5A3A28",
  tan: "#A9744F",
  khaki: "#B9A57F",
  grey: "#9A9A98",
  cream: "#EDE6D8",
  indigo: "#2E3F63",
  silver: "#C9CACC",
  gold: "#C2A060",
};

// ---------- color helpers ----------
const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const rgbToHex = (r, g, b) => "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
const shade = (hex, amt) => {
  const [r, g, b] = hexToRgb(hex);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  return rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
};
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

// ---------- garment drawings (800 x 1000 artboard) ----------
const shirtBody =
  "M340,212 L255,245 Q200,265 186,330 L160,595 L230,614 L272,420 L280,832 Q400,870 520,832 L528,420 L570,614 L640,595 L614,330 Q600,265 545,245 L460,212 Q400,236 340,212 Z";

function shirt(c, { pocket = 1, collar = "point", pattern = null, slim = false } = {}) {
  const dark = shade(c, -0.28);
  const line = shade(c, luminance(c) > 0.6 ? -0.22 : 0.18);
  const fill = pattern ? "url(#pat)" : c;
  const btn = luminance(c) > 0.55 ? shade(c, -0.35) : shade(c, 0.55);
  const transform = slim ? ' transform="translate(400 0) scale(0.94 1) translate(-400 0)"' : "";
  const defs = pattern
    ? `<pattern id="pat" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="${pattern.base}"/><rect width="32" height="64" fill="${pattern.stripe}" opacity=".55"/><rect width="64" height="32" fill="${pattern.stripe}" opacity=".55"/><path d="M0 16h64M0 48h64M16 0v64M48 0v64" stroke="${pattern.thin}" stroke-width="3" opacity=".7"/></pattern>`
    : "";
  const pockets = [];
  if (pocket >= 1) pockets.push(`<path d="M296,392 h76 v74 q-38,14 -76,0 Z" fill="none" stroke="${line}" stroke-width="3" opacity=".8"/>`);
  if (pocket >= 2) pockets.push(`<path d="M428,392 h76 v74 q-38,14 -76,0 Z" fill="none" stroke="${line}" stroke-width="3" opacity=".8"/>`);
  if (pocket >= 2) pockets.push(`<path d="M292,388 h84 v18 h-84 Z M424,388 h84 v18 h-84 Z" fill="${dark}" opacity=".25"/>`);
  const collarShape =
    collar === "mandarin"
      ? `<path d="M336,206 Q400,186 464,206 L466,232 Q400,252 334,232 Z" fill="${fill}" stroke="${dark}" stroke-width="3"/>`
      : `<path d="M340,212 Q400,192 460,212 Q400,234 340,212 Z" fill="${dark}"/>
         <path d="M340,210 L400,262 L368,306 L318,234 Z" fill="${fill}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
         <path d="M460,210 L400,262 L432,306 L482,234 Z" fill="${fill}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>`;
  const buttons = [300, 372, 444, 516, 588, 660, 732, 800]
    .map((y) => `<circle cx="400" cy="${y}" r="7" fill="${btn}" stroke="${dark}" stroke-width="1.5"/>`)
    .join("");
  return {
    defs,
    body: `<g${transform}>
    <ellipse cx="400" cy="880" rx="250" ry="26" fill="#000" opacity=".08"/>
    <path d="${shirtBody}" fill="${fill}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M186,330 L160,595 L230,614 L272,420 Z" fill="#000" opacity=".10"/>
    <path d="M614,330 L640,595 L570,614 L528,420 Z" fill="#000" opacity=".16"/>
    <path d="M168,540 L236,558 M632,540 L564,558" stroke="${line}" stroke-width="3" opacity=".7"/>
    <path d="M520,832 L528,420 L545,245 L460,212 Q520,500 520,832 Z" fill="#000" opacity=".07"/>
    <path d="M300,250 Q330,520 300,830" stroke="#fff" stroke-width="40" opacity=".05" fill="none"/>
    <path d="M388,262 L388,848 M412,262 L412,848" stroke="${line}" stroke-width="2" opacity=".55"/>
    ${pockets.join("")}
    ${collarShape}
    ${buttons}
  </g>`,
  };
}

function pants(c, { style = "chino" } = {}) {
  const dark = shade(c, -0.3);
  const line = shade(c, luminance(c) > 0.6 ? -0.22 : 0.2);
  const wide = style === "relaxed" || style === "pleated";
  const legOut = wide ? 262 : 286;
  const legIn = wide ? 388 : 392;
  const extra = [];
  if (style === "denim") {
    extra.push(`<path d="M318,236 Q340,300 300,320 M482,236 Q460,300 500,320" stroke="#D9A15A" stroke-width="3" fill="none" stroke-dasharray="8 6"/>`);
    extra.push(`<path d="M${legOut + 12},${880} L${legIn - 10},${880} M${800 - legOut - 12},${880} L${800 - legIn + 10},${880}" stroke="#D9A15A" stroke-width="3" stroke-dasharray="8 6"/>`);
  }
  if (style === "cargo") {
    extra.push(`<rect x="${legOut - 2}" y="520" width="74" height="96" rx="6" fill="${shade(c, -0.08)}" stroke="${dark}" stroke-width="3"/><rect x="${legOut - 2}" y="520" width="74" height="22" rx="4" fill="${dark}" opacity=".35"/>`);
    extra.push(`<rect x="${800 - legOut - 72}" y="520" width="74" height="96" rx="6" fill="${shade(c, -0.12)}" stroke="${dark}" stroke-width="3"/><rect x="${800 - legOut - 72}" y="520" width="74" height="22" rx="4" fill="${dark}" opacity=".35"/>`);
  }
  if (style === "pleated") {
    extra.push(`<path d="M352,236 L356,330 M372,236 L374,300 M448,236 L444,330 M428,236 L426,300" stroke="${line}" stroke-width="3" opacity=".8"/>`);
  }
  return {
    defs: "",
    body: `<g transform="translate(400 0) scale(1.32 1) translate(-400 0)"><ellipse cx="400" cy="912" rx="210" ry="20" fill="#000" opacity=".08"/>
    <path d="M296,236 L${legOut},900 L${legIn},900 L400,380 L${800 - legIn},900 L${800 - legOut},900 L504,236 Z" fill="${c}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M400,380 L${800 - legIn},900 L${800 - legOut},900 L504,236 Q460,320 400,380 Z" fill="#000" opacity=".10"/>
    <rect x="292" y="196" width="216" height="42" rx="4" fill="${shade(c, -0.06)}" stroke="${dark}" stroke-width="3"/>
    ${[316, 360, 440, 484].map((x) => `<rect x="${x - 5}" y="192" width="10" height="50" rx="2" fill="${shade(c, -0.12)}" stroke="${dark}" stroke-width="2"/>`).join("")}
    <circle cx="400" cy="217" r="7" fill="${shade(c, 0.4)}" stroke="${dark}" stroke-width="2"/>
    <path d="M400,238 L400,350" stroke="${line}" stroke-width="3"/>
    <path d="M304,240 Q336,300 300,330 M496,240 Q464,300 500,330" stroke="${line}" stroke-width="3" fill="none" opacity=".8"/>
    <path d="M${(legOut + legIn) / 2 - 6},420 L${(legOut + legIn) / 2},890 M${800 - (legOut + legIn) / 2 + 6},420 L${800 - (legOut + legIn) / 2},890" stroke="${line}" stroke-width="2" opacity=".45"/>
    ${extra.join("")}</g>`,
  };
}

function sneaker(c, { style = "classic", accent } = {}) {
  const upper = c;
  const dark = shade(c, luminance(c) > 0.7 ? -0.18 : -0.3);
  const sole = style === "canvas" ? "#F2EEE6" : "#FAFAF8";
  const acc = accent || dark;
  const panels =
    style === "runner"
      ? `<path d="M170,600 Q260,520 380,540 Q470,500 560,520 Q640,540 680,600 Z" fill="${shade(c, -0.12)}" opacity=".9"/>`
      : "";
  const heel = style === "court" || style === "classic" ? `<path d="M140,600 C128,540 136,490 186,468 L214,466 Q222,540 210,600 Z" fill="${acc}"/>` : "";
  const toeCap = style === "canvas" ? `<path d="M600,500 Q684,516 704,584 L704,606 L620,606 Q630,540 600,500 Z" fill="${sole}" stroke="${shade(sole, -0.2)}" stroke-width="2"/>` : "";
  return {
    defs: "",
    body: `<ellipse cx="420" cy="672" rx="300" ry="20" fill="#000" opacity=".10"/>
    <path d="M140,606 C126,540 136,488 186,468 Q250,456 304,486 L366,438 Q394,418 426,428 L566,486 Q680,506 704,584 L704,606 Z" fill="${upper}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
    ${panels}
    ${heel}
    ${toeCap}
    <path d="M304,486 Q330,540 300,600 L160,606 Q150,540 186,488 Z" fill="#000" opacity=".05"/>
    <path d="M366,438 L426,428 L566,486 L520,520 Q440,470 366,470 Z" fill="${shade(c, luminance(c) > 0.6 ? -0.06 : 0.08)}" stroke="${dark}" stroke-width="2"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${392 + i * 30},${452 + i * 12} l26,-14" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`).join("")}
    <path d="M186,468 Q250,456 304,486" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>
    <rect x="124" y="600" width="596" height="50" rx="22" fill="${sole}" stroke="${shade(sole, -0.22)}" stroke-width="3"/>
    <path d="M150,626 H696" stroke="${shade(sole, -0.15)}" stroke-width="3" stroke-dasharray="10 8"/>
    <path d="M200,560 Q420,520 640,566" stroke="${shade(c, luminance(c) > 0.6 ? -0.12 : 0.15)}" stroke-width="3" fill="none" stroke-dasharray="7 6" opacity=".9"/>`,
  };
}

function belt(c, { style = "classic", metal = "#C9CACC" } = {}) {
  const dark = shade(c, -0.35);
  const fill = style === "woven" ? "url(#weave)" : c;
  const defs =
    style === "woven"
      ? `<pattern id="weave" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${c}"/><path d="M0 24 L24 0 M-6 6 L6 -6 M18 30 L30 18" stroke="${shade(c, -0.25)}" stroke-width="5"/></pattern>`
      : "";
  return {
    defs,
    body: `<ellipse cx="400" cy="760" rx="280" ry="24" fill="#000" opacity=".08"/>
    <ellipse cx="400" cy="560" rx="240" ry="170" fill="none" stroke="${dark}" stroke-width="66"/>
    <ellipse cx="400" cy="560" rx="240" ry="170" fill="none" stroke="${fill}" stroke-width="60"/>
    <ellipse cx="400" cy="560" rx="240" ry="170" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 8" opacity=".35" transform="translate(0 -22)"/>
    <path d="M150,700 L640,700" stroke="${dark}" stroke-width="66" stroke-linecap="round"/>
    <path d="M150,700 L640,700" stroke="${fill}" stroke-width="60" stroke-linecap="round"/>
    ${style === "reversible" ? `<path d="M150,722 L640,722" stroke="${shade(c, 0.35)}" stroke-width="14" stroke-linecap="round"/>` : ""}
    ${[470, 510, 550, 590].map((x) => `<ellipse cx="${x}" cy="700" rx="6" ry="9" fill="${dark}"/>`).join("")}
    <rect x="182" y="654" width="96" height="94" rx="14" fill="none" stroke="${shade(metal, -0.3)}" stroke-width="18"/>
    <rect x="182" y="654" width="96" height="94" rx="14" fill="none" stroke="${metal}" stroke-width="12"/>
    <path d="M200,700 H268" stroke="${metal}" stroke-width="8" stroke-linecap="round"/>
    <rect x="296" y="666" width="22" height="70" rx="4" fill="${shade(c, -0.15)}" stroke="${dark}" stroke-width="2"/>`,
  };
}

function wallet(c, { style = "bifold" } = {}) {
  const dark = shade(c, -0.35);
  const stitch = shade(c, luminance(c) > 0.5 ? -0.25 : 0.3);
  if (style === "cardholder") {
    return {
      defs: "",
      body: `<ellipse cx="400" cy="720" rx="230" ry="20" fill="#000" opacity=".08"/>
      <rect x="200" y="380" width="400" height="300" rx="26" fill="${c}" stroke="${dark}" stroke-width="3"/>
      <rect x="218" y="398" width="364" height="264" rx="18" fill="none" stroke="${stitch}" stroke-width="3" stroke-dasharray="9 7"/>
      <path d="M200,470 H600 M200,560 H600" stroke="${dark}" stroke-width="3"/>
      <path d="M200,470 Q400,500 600,470 V480 Q400,510 200,480 Z M200,560 Q400,590 600,560 V570 Q400,600 200,570 Z" fill="#000" opacity=".12"/>
      <rect x="250" y="330" width="250" height="90" rx="10" fill="#E9E4DA" stroke="#BFB7A8" stroke-width="2" transform="rotate(-4 375 375)"/>`,
    };
  }
  const w = style === "long" ? 520 : 400;
  const h = style === "long" ? 280 : 320;
  const x = 400 - w / 2;
  const y = 560 - h / 2;
  return {
    defs: "",
    body: `<ellipse cx="400" cy="${y + h + 34}" rx="${w / 2 + 30}" ry="22" fill="#000" opacity=".09"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${c}" stroke="${dark}" stroke-width="3"/>
    <rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${h - 32}" rx="14" fill="none" stroke="${stitch}" stroke-width="3" stroke-dasharray="9 7"/>
    <path d="M${x + w},${y + 30} Q${x + w + 18},${y + h / 2} ${x + w},${y + h - 30}" stroke="${dark}" stroke-width="10" fill="none" opacity=".5"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h * 0.42}" rx="22" fill="#fff" opacity=".06"/>
    ${style === "long" ? `<rect x="${x + w - 110}" y="${y + h / 2 - 26}" width="70" height="52" rx="12" fill="${shade(c, -0.12)}" stroke="${dark}" stroke-width="3"/><circle cx="${x + w - 75}" cy="${y + h / 2}" r="9" fill="#C9CACC" stroke="#8D8E90" stroke-width="2"/>` : ""}`,
  };
}

function watch(c, { style = "minimal", strap, dial } = {}) {
  const caseColor = c;
  const caseDark = shade(c, -0.35);
  const strapColor = strap || "#2A2A2A";
  const strapDark = shade(strapColor, -0.3);
  const dialColor = dial || "#F7F5F0";
  const ink = luminance(dialColor) > 0.5 ? "#1E1E1E" : "#F3F2EE";
  const strapShape =
    style === "steel"
      ? [0, 1, 2, 3, 4, 5].map((i) => `<rect x="336" y="${150 + i * 34}" width="128" height="30" rx="6" fill="${shade(strapColor, i % 2 ? -0.08 : 0.05)}" stroke="${strapDark}" stroke-width="2"/><rect x="336" y="${662 + i * 34}" width="128" height="30" rx="6" fill="${shade(strapColor, i % 2 ? -0.08 : 0.05)}" stroke="${strapDark}" stroke-width="2"/>`).join("")
      : `<path d="M340,150 H460 L452,370 H348 Z" fill="${strapColor}" stroke="${strapDark}" stroke-width="3"/>
         <path d="M348,630 H452 L460,860 H340 Z" fill="${strapColor}" stroke="${strapDark}" stroke-width="3"/>
         <path d="M356,170 L360,360 M444,170 L440,360 M360,640 L356,840 M440,640 L444,840" stroke="${shade(strapColor, 0.25)}" stroke-width="2" stroke-dasharray="7 6"/>
         ${[700, 740, 780].map((y) => `<ellipse cx="400" cy="${y}" rx="6" ry="8" fill="${strapDark}"/>`).join("")}`;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r1 = i % 3 === 0 ? 118 : 126;
    const x1 = 400 + Math.sin(a) * r1, y1 = 500 - Math.cos(a) * r1;
    const x2 = 400 + Math.sin(a) * 138, y2 = 500 - Math.cos(a) * 138;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ink}" stroke-width="${i % 3 === 0 ? 7 : 3}" stroke-linecap="round"/>`;
  }).join("");
  const sub =
    style === "chrono"
      ? [[-58, 20], [58, 20], [0, 70]].map(([dx, dy]) => `<circle cx="${400 + dx}" cy="${500 + dy}" r="30" fill="none" stroke="${ink}" stroke-width="2" opacity=".7"/><line x1="${400 + dx}" y1="${500 + dy}" x2="${400 + dx}" y2="${500 + dy - 22}" stroke="${ink}" stroke-width="2"/>`).join("")
      : "";
  return {
    defs: "",
    body: `<ellipse cx="400" cy="900" rx="170" ry="18" fill="#000" opacity=".08"/>
    ${strapShape}
    <rect x="550" y="482" width="26" height="36" rx="6" fill="${caseColor}" stroke="${caseDark}" stroke-width="3"/>
    ${style === "chrono" ? `<rect x="536" y="404" width="22" height="26" rx="5" fill="${caseColor}" stroke="${caseDark}" stroke-width="3" transform="rotate(30 547 417)"/><rect x="536" y="570" width="22" height="26" rx="5" fill="${caseColor}" stroke="${caseDark}" stroke-width="3" transform="rotate(-30 547 583)"/>` : ""}
    <circle cx="400" cy="500" r="168" fill="${caseColor}" stroke="${caseDark}" stroke-width="4"/>
    <circle cx="400" cy="500" r="150" fill="${dialColor}" stroke="${caseDark}" stroke-width="3"/>
    ${ticks}
    ${sub}
    <line x1="400" y1="500" x2="400" y2="400" stroke="${ink}" stroke-width="8" stroke-linecap="round" transform="rotate(-50 400 500)"/>
    <line x1="400" y1="500" x2="400" y2="380" stroke="${ink}" stroke-width="5" stroke-linecap="round" transform="rotate(60 400 500)"/>
    <line x1="400" y1="520" x2="400" y2="372" stroke="#8A1C1C" stroke-width="2" transform="rotate(140 400 500)"/>
    <circle cx="400" cy="500" r="9" fill="${ink}"/>
    <path d="M280,420 A150,150 0 0 1 420,352" stroke="#fff" stroke-width="10" fill="none" opacity=".25" stroke-linecap="round"/>`,
  };
}

// ---------- product styles ----------
// style id -> { draw(colorHex) , colors: [...] }
export const STYLES = {
  "shirt-classic": { colors: ["maroon", "beige", "navy", "black", "white", "sky", "grey", "brown"], draw: (c) => shirt(c) },
  "shirt-slim": { colors: ["grey", "brown", "white", "navy"], draw: (c) => shirt(c, { slim: true, pocket: 0 }) },
  "shirt-linen": { colors: ["beige", "brown", "black", "olive"], draw: (c) => shirt(c, { pocket: 0 }) },
  "shirt-mandarin": { colors: ["white", "olive", "black"], draw: (c) => shirt(c, { collar: "mandarin", pocket: 0 }) },
  "shirt-overshirt": { colors: ["olive", "brown", "maroon", "charcoal"], draw: (c) => shirt(c, { pocket: 2 }) },
  "shirt-check": {
    colors: ["black", "navy", "maroon"],
    draw: (c) =>
      shirt(c, { pattern: { base: shade(c, 0.12), stripe: shade(c, -0.25), thin: luminance(c) > 0.4 ? "#ffffff" : "#E8E3DA" } }),
  },
  "pants-relaxed": { colors: ["beige", "black", "olive", "stone"], draw: (c) => pants(c, { style: "relaxed" }) },
  "pants-chino": { colors: ["khaki", "navy", "stone", "black"], draw: (c) => pants(c, { style: "chino" }) },
  "pants-denim": { colors: ["indigo", "black"], draw: (c) => pants(c, { style: "denim" }) },
  "pants-pleated": { colors: ["charcoal", "stone", "brown"], draw: (c) => pants(c, { style: "pleated" }) },
  "pants-cargo": { colors: ["olive", "black", "khaki"], draw: (c) => pants(c, { style: "cargo" }) },
  "sneaker-classic": { colors: ["white", "black"], draw: (c) => sneaker(c, { style: "classic", accent: shade(c, -0.12) }) },
  "sneaker-court": { colors: ["white", "cream"], draw: (c) => sneaker(c, { style: "court", accent: COLORS.maroon }) },
  "sneaker-runner": { colors: ["stone", "navy", "grey"], draw: (c) => sneaker(c, { style: "runner" }) },
  "sneaker-canvas": { colors: ["black", "cream", "olive"], draw: (c) => sneaker(c, { style: "canvas" }) },
  "belt-classic": { colors: ["brown", "black", "tan"], draw: (c) => belt(c) },
  "belt-reversible": { colors: ["black", "brown"], draw: (c) => belt(c, { style: "reversible", metal: COLORS.gold }) },
  "belt-woven": { colors: ["tan", "navy"], draw: (c) => belt(c, { style: "woven" }) },
  "wallet-bifold": { colors: ["black", "brown", "tan"], draw: (c) => wallet(c) },
  "wallet-cardholder": { colors: ["maroon", "black", "tan"], draw: (c) => wallet(c, { style: "cardholder" }) },
  "wallet-long": { colors: ["brown", "black"], draw: (c) => wallet(c, { style: "long" }) },
  "watch-chrono": { colors: ["gold", "silver"], draw: (c) => watch(c, { style: "chrono", strap: "#232323", dial: "#1C1C1C" }) },
  "watch-minimal": { colors: ["silver", "gold"], draw: (c) => watch(c, { style: "minimal", strap: COLORS.brown, dial: "#F6F3EC" }) },
  "watch-steel": {
    colors: ["silver", "navy"],
    draw: (c) =>
      c === COLORS.navy
        ? watch(COLORS.silver, { style: "steel", strap: COLORS.silver, dial: COLORS.navy })
        : watch(c, { style: "steel", strap: COLORS.silver, dial: "#EDEDED" }),
  },
};

const BACKGROUNDS = { front: "#F4F2F0", detail: "#EFEBE6", alt: "#E9E7E3" };

function productSvg(styleId, colorId, view) {
  const style = STYLES[styleId];
  const hex = COLORS[colorId];
  const { defs, body } = style.draw(hex);
  // views: front (full), detail (zoomed crop), alt (mirrored on a different backdrop)
  const viewBox = view === "detail" ? "160 200 480 600" : "0 0 800 1000";
  const inner = view === "alt" ? `<g transform="translate(800 0) scale(-1 1)">${body}</g>` : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="800" height="1000" preserveAspectRatio="xMidYMid slice">
  <defs>${defs}<radialGradient id="bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>
  <rect x="-200" y="-200" width="1200" height="1400" fill="${BACKGROUNDS[view]}"/>
  <rect x="-200" y="-200" width="1200" height="1400" fill="url(#bg)"/>
  ${inner}
</svg>`;
}

// ---------- editorial banners ----------
function hanger(x, y, color, scale = 1) {
  const s = shirt(color);
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M400,150 q0,-40 26,-40 q22,0 22,22" fill="none" stroke="#4A3B30" stroke-width="7" stroke-linecap="round"/>
    <path d="M400,152 L250,250 H550 Z" fill="none" stroke="#4A3B30" stroke-width="7" stroke-linejoin="round"/>
    ${s.defs ? `<defs>${s.defs}</defs>` : ""}${s.body}
  </g>`;
}

function banner(w, h, bgFrom, bgTo, content, { columns = false } = {}) {
  const cols = columns
    ? Array.from({ length: 6 }, (_, i) => `<rect x="${w * 0.08 + i * (w / 6.2)}" y="0" width="${w / 18}" height="${h}" fill="#fff" opacity="${0.05 + (i % 2) * 0.03}"/>`).join("")
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bgFrom}"/><stop offset="1" stop-color="${bgTo}"/></linearGradient>
    <radialGradient id="light" cx="70%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${cols}
  <rect width="${w}" height="${h}" fill="url(#light)"/>
  <rect y="${h * 0.86}" width="${w}" height="${h * 0.14}" fill="#000" opacity=".06"/>
  ${content}
</svg>`;
}

function place(drawing, x, y, scale, flip = false) {
  const t = flip ? `translate(${x + 800 * scale} ${y}) scale(${-scale} ${scale})` : `translate(${x} ${y}) scale(${scale})`;
  return `${drawing.defs ? `<defs>${drawing.defs}</defs>` : ""}<g transform="${t}">${drawing.body}</g>`;
}

const banners = {
  "hero-style-elevated": banner(
    1600, 900, "#B8A492", "#6E5A4B",
    hanger(820, 10, COLORS.maroon, 0.92) + place(pants(COLORS.beige, { style: "relaxed" }), 1150, 120, 0.8),
    { columns: true },
  ),
  "hero-quiet-luxury": banner(
    1600, 900, "#D9CDBE", "#9F8D7B",
    hanger(780, 20, COLORS.cream, 0.88) + hanger(1080, 50, COLORS.stone, 0.82),
    { columns: true },
  ),
  "hero-clean-kicks": banner(
    1600, 900, "#CFCAC4", "#8C857E",
    place(sneaker(COLORS.white, { accent: shade(COLORS.white, -0.12) }), 760, 120, 1.05) + place(sneaker(COLORS.white, { accent: shade(COLORS.white, -0.12) }), 860, 300, 0.85, true),
  ),
  "side-new-arrivals": banner(800, 560, "#E3DCD3", "#C8BCAE", hanger(330, -40, COLORS.olive, 0.62)),
  "side-footwear": banner(800, 560, "#EDEBE8", "#D2CEC9", place(sneaker(COLORS.white), 300, -40, 0.68)),
  "promo-tonal": banner(
    1000, 560, "#E2D8CB", "#C3B3A1",
    [COLORS.charcoal, COLORS.brown, COLORS.stone, COLORS.beige, COLORS.cream]
      .map((c, i) => `<rect x="${560 + i * 6}" y="${400 - i * 52}" width="${340 - i * 12}" height="54" rx="10" fill="${c}" stroke="${shade(c, -0.25)}" stroke-width="2"/><path d="M${600 + i * 6},${427 - i * 52} h${260 - i * 12}" stroke="${shade(c, -0.18)}" stroke-width="2" stroke-dasharray="6 6"/>`)
      .join(""),
  ),
  "promo-comfort": banner(1000, 560, "#E6DED4", "#BBA996", place(pants(COLORS.stone, { style: "relaxed" }), 560, -30, 0.58) + place(pants(COLORS.olive, { style: "chino" }), 700, 10, 0.52)),
};

// ---------- category tiles ----------
const categories = {
  shirts: () => shirt(COLORS.navy),
  pants: () => pants(COLORS.khaki, { style: "chino" }),
  sneakers: () => sneaker(COLORS.white),
  belts: () => belt(COLORS.brown),
  wallets: () => wallet(COLORS.brown),
  watches: () => watch(COLORS.gold, { style: "chrono", strap: "#232323", dial: "#1C1C1C" }),
};

function categorySvg(draw) {
  const { defs, body } = draw();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 140 640 720" width="640" height="720" preserveAspectRatio="xMidYMid slice">
  <defs>${defs}</defs>
  <rect x="0" y="0" width="800" height="1000" fill="#F4F2F0"/>
  ${body}
</svg>`;
}

// ---------- write ----------
function write(rel, content) {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content.replace(/\n\s+/g, "\n"));
}

let count = 0;
for (const [styleId, style] of Object.entries(STYLES)) {
  for (const colorId of style.colors) {
    for (const view of ["front", "detail", "alt"]) {
      write(`products/${styleId}-${colorId}-${view}.svg`, productSvg(styleId, colorId, view));
      count++;
    }
  }
}
for (const [name, svg] of Object.entries(banners)) {
  write(`banners/${name}.svg`, svg);
  count++;
}
for (const [name, draw] of Object.entries(categories)) {
  write(`categories/${name}.svg`, categorySvg(draw));
  count++;
}
console.log(`Generated ${count} placeholder SVGs in ${root}`);
