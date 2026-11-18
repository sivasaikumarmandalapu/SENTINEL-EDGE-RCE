import * as THREE from 'three';
import { PALETTE, BAY_WIDTH } from './config';

const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const tex = (canvas, srgb = true) => {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// ── Facade tile: one bay × one storey (260×200 px = 1.3 × 1.0 units) ─────────
const TW = 260, TH = 200;
function drawFacade(mode, variant) {
  const c = mk(TW, TH), g = c.getContext('2d');
  const col = mode === 'color';
  const v = (color, rough, metal) => (col ? color : mode === 'rough' ? rough : metal);
  g.fillStyle = v(PALETTE.wall, '#e8e8e8', '#000'); g.fillRect(0, 0, TW, TH);
  if (col) for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(120,110,80,${Math.random() * 0.05})`; g.fillRect(Math.random() * TW, 0, 1 + Math.random() * 2, TH); }
  // olive-green pilaster
  g.fillStyle = v(PALETTE.pilaster, '#d0d0d0', '#000'); g.fillRect(0, 0, 22, TH);
  if (col) { g.fillStyle = 'rgba(80,85,30,.45)'; g.fillRect(22, 0, 2, TH); g.fillStyle = 'rgba(255,255,230,.35)'; g.fillRect(0, 0, 2, TH); }
  // light-green storey band
  g.fillStyle = v(PALETTE.band, '#dcdcdc', '#000'); g.fillRect(0, TH - 14, TW, 14);
  if (col) { g.fillStyle = 'rgba(90,85,60,.35)'; g.fillRect(0, TH - 1, TW, 1); g.fillStyle = 'rgba(60,55,40,.16)'; g.fillRect(24, TH - 18, TW - 24, 4); }
  if (variant === 'academic') {
    const wx = 88, wy = 46, ww = 112, wh = 88;
    if (col) { g.fillStyle = 'rgba(70,65,45,.22)'; g.fillRect(wx - 8, wy - 8, ww + 16, 8); }
    g.fillStyle = v('#d9d0b0', '#d8d8d8', '#000'); g.fillRect(wx - 8, wy + wh, ww + 16, 8);
    g.fillStyle = v(PALETTE.frame, '#808080', '#808080'); g.fillRect(wx, wy, ww, wh);
    const panes = [[wx + 5, wy + 5, ww / 2 - 8, wh * 0.58], [wx + ww / 2 + 3, wy + 5, ww / 2 - 8, wh * 0.58], [wx + 5, wy + wh * 0.58 + 9, ww - 10, wh * 0.42 - 14]];
    panes.forEach(([x, y, w, h]) => {
      if (col) { const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#33475a'); gr.addColorStop(1, '#10181f'); g.fillStyle = gr; }
      else g.fillStyle = mode === 'rough' ? '#262626' : '#a6a6a6';
      g.fillRect(x, y, w, h);
      if (col) { g.fillStyle = 'rgba(190,215,240,.13)'; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w * 0.5, y); g.lineTo(x + w * 0.75, y); g.lineTo(x + w * 0.25, y + h); g.fill(); }
    });
  } else if (col) { // plain (auditorium): faint recessed panels
    g.fillStyle = 'rgba(150,140,100,.14)'; g.fillRect(70, 20, 150, TH - 50);
    g.fillStyle = 'rgba(255,255,240,.25)'; g.fillRect(70, 20, 150, 2);
  }
  return c;
}
const baseTiles = {};
const getTiles = (variant) => baseTiles[variant] ??= {
  map: tex(drawFacade('color', variant)),
  rough: tex(drawFacade('rough', variant), false),
  metal: tex(drawFacade('metal', variant), false),
};
const facadeCache = new Map();
export function facadeMaterial(bays, floors, variant) {
  const key = `${variant}|${bays}|${floors}`;
  if (!facadeCache.has(key)) {
    const b = getTiles(variant);
    const set = (t) => { const c = t.clone(); c.repeat.set(bays, floors); c.needsUpdate = true; return c; };
    facadeCache.set(key, new THREE.MeshStandardMaterial({
      map: set(b.map), roughnessMap: set(b.rough), metalnessMap: set(b.metal), roughness: 1, metalness: 1,
    }));
  }
  return facadeCache.get(key);
}
export const roofMaterial = new THREE.MeshStandardMaterial({ color: PALETTE.roof, roughness: 0.95 });
export const bayCount = (len) => Math.max(1, Math.round(len / BAY_WIDTH));

// ── Solar module texture (dark blue/black, subtle grid) ─────────────────────
let _solar;
export function solarMaterial() {
  if (_solar) return _solar;
  const c = mk(192, 128), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 192, 128); gr.addColorStop(0, '#16284a'); gr.addColorStop(1, '#0a1226');
  g.fillStyle = gr; g.fillRect(0, 0, 192, 128);
  g.strokeStyle = 'rgba(150,175,215,.5)'; g.lineWidth = 1;
  for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 128); g.stroke(); }
  for (let j = 1; j < 10; j++) { g.beginPath(); g.moveTo(0, j * 12.8); g.lineTo(192, j * 12.8); g.stroke(); }
  g.strokeStyle = '#c9d2de'; g.lineWidth = 4; g.strokeRect(2, 2, 188, 124);
  _solar = new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.28, metalness: 0.55 });
  return _solar;
}

// ── Misc canvas textures ────────────────────────────────────────────────────
let _grass;
export function grassTexture() {
  if (_grass) return _grass;
  const c = mk(256, 256), g = c.getContext('2d');
  g.fillStyle = '#6c9a45'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const s = 40 + Math.random() * 40;
    g.fillStyle = `hsla(${85 + Math.random() * 30},${35 + Math.random() * 20}%,${s}%,.35)`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2 + Math.random() * 3);
  }
  _grass = tex(c); _grass.repeat.set(30, 24); return _grass;
}
let _tiles;
export function pillarTexture() { // olive tile cladding with seams
  if (_tiles) return _tiles;
  const c = mk(128, 128), g = c.getContext('2d');
  g.fillStyle = '#b3b45c'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(70,72,25,.55)'; g.lineWidth = 2;
  for (let i = 0; i <= 128; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
  _tiles = tex(c); return _tiles;
}
let _dentil;
export function dentilTexture() { // cream with a row of small olive squares (cornice band)
  if (_dentil) return _dentil;
  const c = mk(128, 64), g = c.getContext('2d');
  g.fillStyle = '#eee4c2'; g.fillRect(0, 0, 128, 64);
  g.fillStyle = '#a9ab55'; for (let i = 0; i < 128; i += 32) g.fillRect(i + 10, 22, 12, 12);
  g.fillStyle = 'rgba(80,70,40,.3)'; g.fillRect(0, 0, 128, 3); g.fillRect(0, 61, 128, 3);
  _dentil = tex(c); return _dentil;
}
let _lattice;
export function latticeTexture() {
  if (_lattice) return _lattice;
  const c = mk(128, 128), g = c.getContext('2d');
  g.strokeStyle = '#0c0c0e'; g.lineWidth = 6;
  g.beginPath(); for (let i = -128; i <= 256; i += 32) { g.moveTo(i, 0); g.lineTo(i + 128, 128); g.moveTo(i + 128, 0); g.lineTo(i, 128); } g.stroke();
  _lattice = tex(c); return _lattice;
}
// navy sign with raised gold letters (+ bump)
export function signTextures(text, w = 1024, h = 160) {
  const draw = (mode) => {
    const c = mk(w, h), g = c.getContext('2d');
    g.fillStyle = mode === 'color' ? '#0f1c36' : '#000'; g.fillRect(0, 0, w, h);
    g.font = `bold ${h * 0.58}px "Trebuchet MS", Verdana, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (mode === 'color') { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2d37a'); gr.addColorStop(1, '#b8892a'); g.fillStyle = gr; }
    else g.fillStyle = '#fff';
    g.fillText(text, w / 2, h / 2 + 4);
    return c;
  };
  return { map: tex(draw('color')), bump: tex(draw('bump'), false) };
}
export function boardTexture(text, sub) { // white rooftop board with blue lettering
  const c = mk(1024, 256), g = c.getContext('2d');
  g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = '#c9cdd3'; g.fillRect(0, 0, 1024, 8); g.fillRect(0, 248, 1024, 8);
  g.fillStyle = '#1a3d8f'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 118px "Trebuchet MS", Verdana, sans-serif'; g.fillText(text, 512, 112);
  g.fillStyle = '#e64b2a'; g.font = 'bold 44px "Trebuchet MS", Verdana, sans-serif'; g.fillText(sub, 512, 205);
  return tex(c);
}

// ── Mechanical lab: roller-shutter slats + name plate ───────────────────────
export function shutterTexture() {
  const c = mk(128, 128), g = c.getContext('2d');
  g.fillStyle = '#8f979e'; g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 112; y += 8) { g.fillStyle = 'rgba(30,35,40,.38)'; g.fillRect(0, y + 6, 128, 2); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(0, y, 128, 1); }
  g.fillStyle = '#5d646a'; g.fillRect(0, 118, 128, 10); // bottom bar
  return tex(c);
}
export function plateTexture(text) {
  const c = mk(1024, 128), g = c.getContext('2d');
  g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, 1024, 128);
  g.fillStyle = '#c9cdd3'; g.fillRect(0, 0, 1024, 6); g.fillRect(0, 122, 1024, 6);
  g.fillStyle = '#e64b2a'; g.fillRect(0, 108, 1024, 8);
  g.fillStyle = '#1a3d8f'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let size = 92; g.font = `bold ${size}px "Trebuchet MS", Verdana, sans-serif`;
  const textW = () => g.measureText?.(text)?.width ?? text.length * size * 0.7;
  while (textW() > 940 && size > 20) { size -= 4; g.font = `bold ${size}px "Trebuchet MS", Verdana, sans-serif`; }
  g.fillText(text, 512, 54);
  return tex(c);
}
