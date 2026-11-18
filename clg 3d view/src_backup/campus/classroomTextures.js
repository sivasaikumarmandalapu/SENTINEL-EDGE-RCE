import * as THREE from 'three';

const mk = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const tex = (canvas, srgb = true) => {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// ── Smart Interactive Digital Board (1024 × 576) ───────────────────────────
let _smartBoard;
export function smartBoardTexture() {
  if (_smartBoard) return _smartBoard;
  const c = mk(1024, 576), g = c.getContext('2d');

  // Outer bezel
  g.fillStyle = '#0f1318';
  g.fillRect(0, 0, 1024, 576);
  g.strokeStyle = '#28303d';
  g.lineWidth = 4;
  g.strokeRect(2, 2, 1020, 572);

  // Screen background (dark slate blue)
  g.fillStyle = '#141d28';
  g.fillRect(10, 10, 1004, 556);

  // Header bar
  g.fillStyle = '#0d131a';
  g.fillRect(10, 10, 1004, 46);
  g.strokeStyle = '#223040';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(10, 56);
  g.lineTo(1014, 56);
  g.stroke();

  g.fillStyle = '#38bdf8';
  g.font = 'bold 20px "Segoe UI", sans-serif';
  g.textBaseline = 'middle';
  g.fillText('RAMACHANDRA SMART CLASSROOM — ENGINEERING GRAPHICS & 3D PROJECTION', 28, 33);

  g.fillStyle = '#94a3b8';
  g.font = '14px "Segoe UI", sans-serif';
  g.textAlign = 'right';
  g.fillText('ROOM 204 · DIGITAL BOARD', 994, 33);

  // Technical Diagrams (based directly on Image 2)
  g.textAlign = 'left';
  // X-Y Reference Line
  g.strokeStyle = '#475569';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(120, 310);
  g.lineTo(920, 310);
  g.stroke();

  g.fillStyle = '#94a3b8';
  g.font = 'bold 18px sans-serif';
  g.fillText('X', 95, 310);
  g.fillText('Y', 935, 310);

  // Figure 1: Elevation View (Pyramid Projection in Cyan)
  g.strokeStyle = '#38bdf8';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(270, 140);
  g.lineTo(180, 290);
  g.lineTo(360, 290);
  g.closePath();
  g.stroke();

  // Axis of pyramid
  g.strokeStyle = '#facc15';
  g.lineWidth = 2;
  g.setLineDash([6, 4]);
  g.beginPath();
  g.moveTo(270, 140);
  g.lineTo(270, 290);
  g.stroke();
  g.setLineDash([]);

  // Projection projectors downward
  g.strokeStyle = '#334155';
  g.lineWidth = 1;
  g.setLineDash([3, 3]);
  for (const px of [180, 270, 360]) {
    g.beginPath();
    g.moveTo(px, 290);
    g.lineTo(px, 470);
    g.stroke();
  }
  g.setLineDash([]);

  // Figure 1: Plan View (Green)
  g.strokeStyle = '#4ade80';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(270, 480);
  g.lineTo(180, 360);
  g.lineTo(360, 360);
  g.closePath();
  g.stroke();

  // Figure 2: Isometric 3D Model (Right side)
  g.strokeStyle = '#38bdf8';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(680, 120);
  g.lineTo(540, 270);
  g.lineTo(820, 270);
  g.closePath();
  g.stroke();

  g.strokeStyle = '#f43f5e';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(680, 120);
  g.lineTo(630, 285);
  g.moveTo(680, 120);
  g.lineTo(730, 285);
  g.stroke();

  // Diagram labels
  g.fillStyle = '#38bdf8';
  g.font = 'bold 16px "Segoe UI", sans-serif';
  g.fillText("Apex a'", 270, 120);
  g.fillStyle = '#facc15';
  g.font = '14px sans-serif';
  g.fillText("b'", 160, 295);
  g.fillText("c'", 370, 295);
  g.fillStyle = '#4ade80';
  g.fillText("Plan view (Top)", 270, 505);
  g.fillStyle = '#38bdf8';
  g.fillText("3D Spatial Geometry", 680, 95);

  // Bottom interactive toolbar
  g.fillStyle = '#0d131a';
  g.fillRect(10, 520, 1004, 46);
  g.strokeStyle = '#223040';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(10, 520);
  g.lineTo(1014, 520);
  g.stroke();

  const tools = ['Pointer', 'Pen', 'Highlighter', 'Eraser', 'Shapes', 'Compass', 'Grid', 'Page 1/3'];
  tools.forEach((t, i) => {
    const tx = 30 + i * 115;
    g.fillStyle = i === 1 ? '#0284c7' : '#1e293b';
    g.fillRect(tx, 528, 95, 30);
    g.strokeStyle = i === 1 ? '#38bdf8' : '#334155';
    g.lineWidth = 1;
    g.strokeRect(tx, 528, 95, 30);
    g.fillStyle = '#ffffff';
    g.font = 'bold 13px sans-serif';
    g.textAlign = 'center';
    g.fillText(t, tx + 47, 543);
  });

  _smartBoard = tex(c);
  return _smartBoard;
}

// ── Green Chalkboard (1024 × 512) ───────────────────────────────────────────
let _chalkboard;
export function chalkboardTexture() {
  if (_chalkboard) return _chalkboard;
  const c = mk(1024, 512), g = c.getContext('2d');

  // Outer wooden frame
  g.fillStyle = '#6d421d';
  g.fillRect(0, 0, 1024, 512);
  g.fillStyle = '#8b5a2b';
  g.fillRect(8, 8, 1008, 496);

  // Dark matte green chalkboard surface
  g.fillStyle = '#1e3f2b';
  g.fillRect(18, 18, 988, 476);

  // Subtle chalk dust texture
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.04})`;
    g.fillRect(20 + Math.random() * 980, 20 + Math.random() * 470, 4 + Math.random() * 8, 3);
  }

  // Header notes written in white chalk
  g.fillStyle = 'rgba(255, 255, 255, 0.85)';
  g.font = 'bold 24px "Trebuchet MS", sans-serif';
  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.fillText('RAMACHANDRA COLLEGE OF ENGINEERING', 40, 36);

  g.font = '18px "Segoe UI", sans-serif';
  g.fillStyle = 'rgba(255, 255, 255, 0.7)';
  g.fillText('Date: 03-11-2026      Subject: Engineering Mechanics & Graphics', 40, 72);
  g.fillStyle = 'rgba(255, 255, 255, 0.4)';
  g.fillRect(40, 100, 520, 2);

  // Chalk notes & equations
  g.fillStyle = '#fef08a';
  g.font = 'bold 20px "Segoe UI", sans-serif';
  g.fillText('Topic: Equilibrium of Coplanar Force Systems', 40, 120);

  g.fillStyle = 'rgba(255, 255, 255, 0.85)';
  g.font = '18px "Segoe UI", sans-serif';
  g.fillText('Conditions of Static Equilibrium:', 40, 160);
  g.fillText('1.  Σ Fx = 0  (Sum of horizontal forces)', 60, 196);
  g.fillText('2.  Σ Fy = 0  (Sum of vertical forces)', 60, 230);
  g.fillText('3.  Σ M_A = 0 (Moment about point A)', 60, 264);

  g.fillStyle = '#fef08a';
  g.fillText("Lami's Theorem: P / sin(α) = Q / sin(β) = R / sin(γ)", 60, 310);

  // Free body diagram in chalk
  g.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(800, 220, 8, 0, Math.PI * 2);
  g.stroke();
  g.moveTo(800, 220);
  g.lineTo(800, 140); // Force P
  g.moveTo(800, 220);
  g.lineTo(730, 270); // Force Q
  g.moveTo(800, 220);
  g.lineTo(870, 270); // Force R
  g.stroke();

  g.fillStyle = 'rgba(255, 255, 255, 0.85)';
  g.font = 'bold 16px sans-serif';
  g.fillText('P', 810, 140);
  g.fillText('Q', 710, 275);
  g.fillText('R', 885, 275);

  // Chalk tray at bottom with chalk sticks & duster
  g.fillStyle = '#a06530';
  g.fillRect(0, 496, 1024, 16);
  // Chalk sticks
  g.fillStyle = '#ffffff';
  g.fillRect(180, 490, 28, 8);
  g.fillRect(220, 490, 28, 8);
  g.fillStyle = '#fef08a';
  g.fillRect(260, 490, 28, 8);
  // Wooden felt duster
  g.fillStyle = '#4a2c14';
  g.fillRect(310, 486, 65, 14);
  g.fillStyle = '#261609';
  g.fillRect(310, 498, 65, 6);

  _chalkboard = tex(c);
  return _chalkboard;
}

// ── Department Vision & Mission Wall Poster (512 × 768) ────────────────────
let _poster;
export function posterTexture() {
  if (_poster) return _poster;
  const c = mk(512, 768), g = c.getContext('2d');

  // Outer frame
  g.fillStyle = '#1e293b';
  g.fillRect(0, 0, 512, 768);
  g.fillStyle = '#ffffff';
  g.fillRect(8, 8, 496, 752);

  // Top header banner
  g.fillStyle = '#0047a0';
  g.fillRect(8, 8, 496, 110);

  g.fillStyle = '#ffffff';
  g.font = 'bold 22px "Trebuchet MS", sans-serif';
  g.textAlign = 'center';
  g.fillText('RAMACHANDRA', 256, 38);
  g.font = 'bold 15px "Trebuchet MS", sans-serif';
  g.fillStyle = '#fde047';
  g.fillText('COLLEGE OF ENGINEERING', 256, 65);
  g.font = '12px sans-serif';
  g.fillStyle = '#e2e8f0';
  g.fillText('(AUTONOMOUS) · NBA & NAAC ACCREDITED', 256, 90);

  // Section: Vision & Mission
  g.fillStyle = '#0047a0';
  g.fillRect(24, 130, 464, 34);
  g.fillStyle = '#ffffff';
  g.font = 'bold 15px sans-serif';
  g.fillText('DEPARTMENT VISION & MISSION', 256, 148);

  g.textAlign = 'left';
  g.fillStyle = '#0047a0';
  g.font = 'bold 15px sans-serif';
  g.fillText('VISION:', 36, 190);

  g.fillStyle = '#1e293b';
  g.font = '13px "Segoe UI", sans-serif';
  g.fillText('To emerge as a premier centre of excellence in', 36, 216);
  g.fillText('technical education and innovative research, producing', 36, 236);
  g.fillText('globally competent and ethical engineers.', 36, 256);

  g.fillStyle = '#0047a0';
  g.font = 'bold 15px sans-serif';
  g.fillText('MISSION:', 36, 295);

  g.fillStyle = '#1e293b';
  g.font = '13px "Segoe UI", sans-serif';
  g.fillText('M1: Impart quality education through innovative', 36, 320);
  g.fillText('    student-centric teaching methodologies.', 36, 340);
  g.fillText('M2: Provide state-of-the-art laboratory facilities', 36, 370);
  g.fillText('    and collaborative research opportunities.', 36, 390);
  g.fillText('M3: Inculcate professional ethics, leadership qualities', 36, 420);
  g.fillText('    and lifelong learning aptitude.', 36, 440);

  // Section: Program Educational Objectives
  g.fillStyle = '#0047a0';
  g.fillRect(24, 480, 464, 34);
  g.fillStyle = '#ffffff';
  g.font = 'bold 15px sans-serif';
  g.textAlign = 'center';
  g.fillText('PROGRAM OUTCOMES (POs)', 256, 498);

  g.textAlign = 'left';
  g.fillStyle = '#334155';
  g.font = '13px sans-serif';
  const pos = [
    'PO1: Engineering Knowledge & Problem Analysis',
    'PO2: Design & Development of Scalable Solutions',
    'PO3: Modern Engineering Tools Usage',
    'PO4: Ethics, Teamwork, and Lifelong Learning',
  ];
  pos.forEach((p, idx) => {
    g.fillText(p, 36, 545 + idx * 30);
  });

  _poster = tex(c);
  return _poster;
}

// ── Polished Marble Tile Floor Texture (512 × 512) ──────────────────────────
let _marble;
export function marbleFloorTexture() {
  if (_marble) return _marble;
  const c = mk(512, 512), g = c.getContext('2d');

  // Base warm light marble
  g.fillStyle = '#ebe6dc';
  g.fillRect(0, 0, 512, 512);

  // Subtle marble veining
  g.strokeStyle = 'rgba(180, 170, 155, 0.35)';
  g.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    g.beginPath();
    let x = Math.random() * 512, y = Math.random() * 512;
    g.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (Math.random() - 0.5) * 80;
      y += (Math.random() - 0.5) * 80;
      g.lineTo(x, y);
    }
    g.stroke();
  }

  // 2x2 tile grid seams (vitrified joints)
  g.strokeStyle = 'rgba(140, 130, 115, 0.45)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 256);
  g.lineTo(512, 256);
  g.moveTo(256, 0);
  g.lineTo(256, 512);
  g.stroke();

  _marble = tex(c);
  _marble.wrapS = _marble.wrapT = THREE.RepeatWrapping;
  _marble.repeat.set(4, 5);
  return _marble;
}

// ── Desk Teak Wood Texture (256 × 256) ──────────────────────────────────────
let _deskWood;
export function deskWoodTexture() {
  if (_deskWood) return _deskWood;
  const c = mk(256, 256), g = c.getContext('2d');

  // Golden teak wood base
  g.fillStyle = '#c88f4e';
  g.fillRect(0, 0, 256, 256);

  // Wood grain lines
  for (let y = 0; y < 256; y += 3) {
    g.fillStyle = `rgba(145, 95, 45, ${0.1 + Math.random() * 0.15})`;
    g.fillRect(0, y, 256, 1 + Math.random() * 2);
  }

  _deskWood = tex(c);
  return _deskWood;
}
