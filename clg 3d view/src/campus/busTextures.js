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

// ── Bus Side Texture (1024 × 320) ───────────────────────────────────────────
// Left side: Front is at Left (x ~ 0..200), Rear is at Right (x ~ 850..1024)
// Right side: Front is at Right (x ~ 850..1024), Rear is at Left (x ~ 0..200)
export function busSideTexture(isLeft = true) {
  const c = mk(1024, 320), g = c.getContext('2d');

  // Base golden school-bus yellow
  g.fillStyle = '#f6b800';
  g.fillRect(0, 0, 1024, 320);

  // Roof bevel highlight
  const roofGrad = g.createLinearGradient(0, 0, 0, 20);
  roofGrad.addColorStop(0, '#fde066');
  roofGrad.addColorStop(1, '#f6b800');
  g.fillStyle = roofGrad;
  g.fillRect(0, 0, 1024, 20);
  g.fillStyle = '#d89e00';
  g.fillRect(0, 19, 1024, 2);

  // Window band (y: 28 to 132)
  const winY = 28, winH = 104;
  g.fillStyle = '#141b24';
  g.fillRect(0, winY, 1024, winH);

  if (isLeft) {
    // Passenger boarding door at front (x: 45 to 160) - blue frame matching real bus
    g.fillStyle = '#0047a0';
    g.fillRect(45, winY - 4, 115, 252);
    g.strokeStyle = '#002f6c';
    g.lineWidth = 3;
    g.strokeRect(45, winY - 4, 115, 252);

    // Two vertical door window panes
    g.fillStyle = '#1c2b3a';
    g.fillRect(55, winY + 8, 42, 110);
    g.fillRect(105, winY + 8, 42, 110);
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.fillRect(57, winY + 10, 18, 106);
    g.fillRect(107, winY + 10, 18, 106);

    // Door lower panels and steps
    g.fillStyle = '#003780';
    g.fillRect(55, 160, 95, 60);
    g.fillStyle = '#1e2226';
    g.fillRect(50, 240, 105, 30); // entrance step well

    // 6 passenger windows
    for (let i = 0; i < 6; i++) {
      const wx = 185 + i * 135, ww = 120;
      // Window glass
      const glassGrad = g.createLinearGradient(wx, winY, wx, winY + winH);
      glassGrad.addColorStop(0, '#2b3f54');
      glassGrad.addColorStop(0.3, '#1a2634');
      glassGrad.addColorStop(1, '#0e1620');
      g.fillStyle = glassGrad;
      g.fillRect(wx, winY + 4, ww, winH - 8);

      // Glass highlight diagonal streak
      g.fillStyle = 'rgba(255, 255, 255, 0.08)';
      g.beginPath();
      g.moveTo(wx + 10, winY + winH - 8);
      g.lineTo(wx + 45, winY + 4);
      g.lineTo(wx + 65, winY + 4);
      g.lineTo(wx + 30, winY + winH - 8);
      g.fill();

      // Window rubber frame
      g.strokeStyle = '#0a0e14';
      g.lineWidth = 3;
      g.strokeRect(wx, winY + 4, ww, winH - 8);

      // 3 horizontal silver safety bars (classic Indian college bus feature)
      for (const by of [winY + 36, winY + 60, winY + 84]) {
        g.fillStyle = '#e4ebf5';
        g.fillRect(wx + 2, by, ww - 4, 3);
        g.fillStyle = '#7a8490';
        g.fillRect(wx + 2, by + 3, ww - 4, 1);
      }
    }
  } else {
    // Right side: driver cabin window at front (x: 875 to 985)
    const dwx = 875, dww = 110;
    const dGlass = g.createLinearGradient(dwx, winY, dwx, winY + winH);
    dGlass.addColorStop(0, '#2b3f54');
    dGlass.addColorStop(1, '#0e1620');
    g.fillStyle = dGlass;
    g.fillRect(dwx, winY + 4, dww, winH - 8);
    g.strokeStyle = '#0a0e14';
    g.lineWidth = 3;
    g.strokeRect(dwx, winY + 4, dww, winH - 8);

    // 6 passenger windows towards rear
    for (let i = 0; i < 6; i++) {
      const wx = 35 + i * 135, ww = 120;
      const glassGrad = g.createLinearGradient(wx, winY, wx, winY + winH);
      glassGrad.addColorStop(0, '#2b3f54');
      glassGrad.addColorStop(0.3, '#1a2634');
      glassGrad.addColorStop(1, '#0e1620');
      g.fillStyle = glassGrad;
      g.fillRect(wx, winY + 4, ww, winH - 8);

      g.fillStyle = 'rgba(255, 255, 255, 0.08)';
      g.beginPath();
      g.moveTo(wx + 10, winY + winH - 8);
      g.lineTo(wx + 45, winY + 4);
      g.lineTo(wx + 65, winY + 4);
      g.lineTo(wx + 30, winY + winH - 8);
      g.fill();

      g.strokeStyle = '#0a0e14';
      g.lineWidth = 3;
      g.strokeRect(wx, winY + 4, ww, winH - 8);

      for (const by of [winY + 36, winY + 60, winY + 84]) {
        g.fillStyle = '#e4ebf5';
        g.fillRect(wx + 2, by, ww - 4, 3);
        g.fillStyle = '#7a8490';
        g.fillRect(wx + 2, by + 3, ww - 4, 1);
      }
    }
  }

  // Lower rubber protective rub-rail strip
  g.fillStyle = '#22262c';
  g.fillRect(0, 274, 1024, 10);
  g.fillStyle = '#3a4048';
  g.fillRect(0, 274, 1024, 2);

  // Chassis bottom skirt
  g.fillStyle = '#181a1d';
  g.fillRect(0, 308, 1024, 12);

  // College emblem badge
  const badgeX = isLeft ? 220 : 810, badgeY = 205;
  g.beginPath();
  g.arc(badgeX, badgeY, 32, 0, Math.PI * 2);
  g.fillStyle = '#0047a0';
  g.fill();
  g.strokeStyle = '#ffd700';
  g.lineWidth = 3;
  g.stroke();

  g.beginPath();
  g.arc(badgeX, badgeY, 24, 0, Math.PI * 2);
  g.fillStyle = '#f6b800';
  g.fill();
  g.strokeStyle = '#0047a0';
  g.lineWidth = 2;
  g.stroke();

  g.fillStyle = '#0047a0';
  g.font = 'bold 15px "Trebuchet MS", "Arial Black", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('RCE', badgeX, badgeY);

  // Bold Royal Blue College Name Decal
  const textX = isLeft ? 590 : 455;
  g.fillStyle = '#0047a0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = 'bold 36px "Arial Black", "Trebuchet MS", sans-serif';
  g.fillText('RAMACHANDRA COLLEGE OF ENGINEERING', textX, 185);

  // Subtext: Location / Accreditation
  g.font = 'bold 18px "Trebuchet MS", Arial, sans-serif';
  g.fillText('VATLURU (V), ELURU - 534007', textX, 226);

  // Amber side marker lights
  g.fillStyle = '#ff9f00';
  g.fillRect(15, 276, 12, 6);
  g.fillRect(505, 276, 12, 6);
  g.fillRect(995, 276, 12, 6);

  return tex(c);
}

// ── Bus Front Face Texture (512 × 512) ───────────────────────────────────────
export function busFrontTexture() {
  const c = mk(512, 512), g = c.getContext('2d');

  // Base yellow body
  g.fillStyle = '#f6b800';
  g.fillRect(0, 0, 512, 512);

  // Roof curve
  const rGrad = g.createLinearGradient(0, 0, 0, 25);
  rGrad.addColorStop(0, '#fde066');
  rGrad.addColorStop(1, '#f6b800');
  g.fillStyle = rGrad;
  g.fillRect(0, 0, 512, 25);

  // Top destination board: Deep Royal Blue header with bold yellow "R C E"
  g.fillStyle = '#0047a0';
  g.fillRect(65, 26, 382, 70);
  g.strokeStyle = '#ffe044';
  g.lineWidth = 3;
  g.strokeRect(65, 26, 382, 70);

  g.fillStyle = '#ffda24';
  g.font = 'bold 44px "Arial Black", "Trebuchet MS", sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('R C E', 256, 61);

  // Large Dual-pane Windshield (y: 106 to 275)
  const wy = 106, wh = 170;
  g.fillStyle = '#0a0f16';
  g.fillRect(32, wy, 448, wh);

  // Glass gradient
  const wGrad = g.createLinearGradient(0, wy, 0, wy + wh);
  wGrad.addColorStop(0, '#2b3f54');
  wGrad.addColorStop(0.35, '#192634');
  wGrad.addColorStop(1, '#0e1620');
  g.fillStyle = wGrad;
  g.fillRect(40, wy + 6, 208, wh - 12);
  g.fillRect(264, wy + 6, 208, wh - 12);

  // Glass diagonal reflections
  g.fillStyle = 'rgba(255,255,255,0.12)';
  g.beginPath();
  g.moveTo(50, wy + wh - 6);
  g.lineTo(120, wy + 6);
  g.lineTo(155, wy + 6);
  g.lineTo(85, wy + wh - 6);
  g.fill();

  g.beginPath();
  g.moveTo(274, wy + wh - 6);
  g.lineTo(344, wy + 6);
  g.lineTo(379, wy + 6);
  g.lineTo(309, wy + wh - 6);
  g.fill();

  // Black center divider pillar
  g.fillStyle = '#0a0e14';
  g.fillRect(248, wy, 16, wh);

  // Black wiper arms
  g.strokeStyle = '#080a0e';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(110, wy + wh - 8);
  g.lineTo(180, wy + wh - 55);
  g.moveTo(330, wy + wh - 8);
  g.lineTo(400, wy + wh - 55);
  g.stroke();

  // Green fitness/inspection sticker on bottom corner of glass
  g.fillStyle = '#22c55e';
  g.fillRect(435, wy + wh - 30, 24, 20);

  // College Name banner below windshield
  g.fillStyle = '#0047a0';
  g.font = 'bold 16px "Trebuchet MS", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('RAMACHANDRA COLLEGE OF ENGINEERING', 256, 294);

  // Center Radiator Grille
  const gy = 320, gw = 200, gh = 86, gx = (512 - gw) / 2;
  g.fillStyle = '#1c1f24';
  g.fillRect(gx, gy, gw, gh);
  g.strokeStyle = '#383e46';
  g.lineWidth = 3;
  g.strokeRect(gx, gy, gw, gh);

  // Horizontal chrome grille slats
  for (let y = gy + 14; y < gy + gh - 6; y += 13) {
    g.fillStyle = '#b0b8c2';
    g.fillRect(gx + 8, y, gw - 16, 2);
  }

  // College emblem badge on grille
  g.beginPath();
  g.arc(256, gy + gh / 2, 16, 0, Math.PI * 2);
  g.fillStyle = '#0047a0';
  g.fill();
  g.strokeStyle = '#ffd700';
  g.lineWidth = 2;
  g.stroke();

  // Dual Headlights on left & right
  for (const hx of [42, 396]) {
    g.fillStyle = '#20242a';
    g.fillRect(hx, 324, 74, 78);
    g.strokeStyle = '#383e46';
    g.lineWidth = 2;
    g.strokeRect(hx, 324, 74, 78);

    // Twin round headlamps with chrome rings
    g.beginPath();
    g.arc(hx + 22, 350, 15, 0, Math.PI * 2);
    g.fillStyle = '#f0f5fa';
    g.fill();
    g.strokeStyle = '#9ca4af';
    g.lineWidth = 3;
    g.stroke();

    g.beginPath();
    g.arc(hx + 52, 350, 13, 0, Math.PI * 2);
    g.fillStyle = '#f0f5fa';
    g.fill();
    g.strokeStyle = '#9ca4af';
    g.lineWidth = 3;
    g.stroke();

    // Amber turn indicator bar
    g.fillStyle = '#ff9f00';
    g.fillRect(hx + 10, 376, 54, 18);
    g.strokeStyle = '#b87000';
    g.lineWidth = 1;
    g.strokeRect(hx + 10, 376, 54, 18);
  }

  // Heavy-duty Front Bumper (y: 422 to 482)
  g.fillStyle = '#1e2126';
  g.fillRect(18, 422, 476, 60);
  g.fillStyle = '#343840';
  g.fillRect(18, 422, 476, 4);

  // Yellow Indian commercial registration plate (AP 39 Y 7329)
  g.fillStyle = '#ffcc00';
  g.fillRect(180, 436, 152, 32);
  g.strokeStyle = '#111315';
  g.lineWidth = 2;
  g.strokeRect(180, 436, 152, 32);

  g.fillStyle = '#111315';
  g.font = 'bold 18px "Arial Black", "Trebuchet MS", sans-serif';
  g.fillText('AP 39 Y 7329', 256, 452);

  // Undercarriage
  g.fillStyle = '#121417';
  g.fillRect(0, 486, 512, 26);

  return tex(c);
}

// ── Bus Rear Face Texture (512 × 512) ────────────────────────────────────────
export function busRearTexture() {
  const c = mk(512, 512), g = c.getContext('2d');

  g.fillStyle = '#f6b800';
  g.fillRect(0, 0, 512, 512);

  // Roof bevel
  g.fillStyle = '#fde066';
  g.fillRect(0, 0, 512, 20);

  // College name at top
  g.fillStyle = '#0047a0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = 'bold 22px "Arial Black", "Trebuchet MS", sans-serif';
  g.fillText('RAMACHANDRA', 256, 44);
  g.font = 'bold 15px "Trebuchet MS", Arial, sans-serif';
  g.fillText('COLLEGE OF ENGINEERING', 256, 70);

  // Rear windshield
  g.fillStyle = '#0e141c';
  g.fillRect(52, 95, 408, 145);
  g.fillStyle = '#1c2838';
  g.fillRect(60, 102, 392, 131);
  g.strokeStyle = '#080a0e';
  g.lineWidth = 3;
  g.strokeRect(52, 95, 408, 145);

  // Emergency Exit text stencil
  g.fillStyle = '#ffffff';
  g.font = 'bold 14px sans-serif';
  g.fillText('EMERGENCY EXIT', 256, 168);

  // Caution banner
  g.fillStyle = '#d32f2f';
  g.fillRect(115, 305, 282, 32);
  g.fillStyle = '#ffffff';
  g.font = 'bold 15px sans-serif';
  g.fillText('COLLEGE BUS', 256, 321);

  // Vertical Taillight Clusters
  for (const tx of [42, 416]) {
    g.fillStyle = '#1c1f24';
    g.fillRect(tx, 265, 54, 126);
    g.strokeStyle = '#32373e';
    g.lineWidth = 2;
    g.strokeRect(tx, 265, 54, 126);

    // Red brake light
    g.fillStyle = '#e52525';
    g.fillRect(tx + 6, 272, 42, 36);
    // Amber indicator
    g.fillStyle = '#ff9f00';
    g.fillRect(tx + 6, 312, 42, 34);
    // White reverse lamp
    g.fillStyle = '#f0f5fa';
    g.fillRect(tx + 6, 350, 42, 34);
  }

  // Rear Bumper
  g.fillStyle = '#1e2126';
  g.fillRect(18, 422, 476, 60);
  g.fillStyle = '#343840';
  g.fillRect(18, 422, 476, 4);

  // Registration plate
  g.fillStyle = '#ffcc00';
  g.fillRect(180, 436, 152, 32);
  g.strokeStyle = '#111315';
  g.lineWidth = 2;
  g.strokeRect(180, 436, 152, 32);

  g.fillStyle = '#111315';
  g.font = 'bold 18px "Arial Black", "Trebuchet MS", sans-serif';
  g.fillText('AP 39 Y 7329', 256, 452);

  // Undercarriage
  g.fillStyle = '#121417';
  g.fillRect(0, 486, 512, 26);

  return tex(c);
}

// ── Bus Roof Texture (512 × 256) ────────────────────────────────────────────
export function busRoofTexture() {
  const c = mk(512, 256), g = c.getContext('2d');

  g.fillStyle = '#f6b800';
  g.fillRect(0, 0, 512, 256);

  // Longitudinal reinforcement ribs
  for (let y = 35; y < 230; y += 38) {
    g.fillStyle = '#fde277';
    g.fillRect(10, y, 492, 4);
    g.fillStyle = '#d59800';
    g.fillRect(10, y + 4, 492, 2);
  }

  // Escape / ventilation hatches
  for (const hx of [140, 340]) {
    g.fillStyle = '#e0a500';
    g.fillRect(hx, 96, 56, 64);
    g.strokeStyle = '#c08a00';
    g.lineWidth = 3;
    g.strokeRect(hx, 96, 56, 64);
  }

  return tex(c);
}

// ── Bus Wheel Face Texture (128 × 128) ───────────────────────────────────────
export function busWheelTexture() {
  const c = mk(128, 128), g = c.getContext('2d');

  // Outer tyre rubber
  g.fillStyle = '#18191c';
  g.beginPath();
  g.arc(64, 64, 62, 0, Math.PI * 2);
  g.fill();

  // Tyre sidewall rim line
  g.strokeStyle = '#121315';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(64, 64, 52, 0, Math.PI * 2);
  g.stroke();

  // Yellow steel bus wheel rim
  g.fillStyle = '#f6b800';
  g.beginPath();
  g.arc(64, 64, 42, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#c48f00';
  g.lineWidth = 3;
  g.stroke();

  // Dark center axle hub
  g.fillStyle = '#25282d';
  g.beginPath();
  g.arc(64, 64, 20, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = '#141517';
  g.lineWidth = 2;
  g.stroke();

  // Ring of 6 silver lug nuts
  for (let i = 0; i < 6; i++) {
    const angle = i * (Math.PI / 3);
    const lx = 64 + Math.cos(angle) * 29;
    const ly = 64 + Math.sin(angle) * 29;
    g.fillStyle = '#e4ebf5';
    g.beginPath();
    g.arc(lx, ly, 3.5, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#333';
    g.lineWidth = 1;
    g.stroke();
  }

  return tex(c);
}

// ── Multi-Material Factory for Bus Body ─────────────────────────────────────
let _busMaterials = null;
export function getBusMaterials() {
  if (!_busMaterials) {
    _busMaterials = [
      // 0: +X face (Front)
      new THREE.MeshStandardMaterial({ map: busFrontTexture(), roughness: 0.45, metalness: 0.15 }),
      // 1: -X face (Rear)
      new THREE.MeshStandardMaterial({ map: busRearTexture(), roughness: 0.45, metalness: 0.15 }),
      // 2: +Y face (Roof)
      new THREE.MeshStandardMaterial({ map: busRoofTexture(), roughness: 0.55, metalness: 0.1 }),
      // 3: -Y face (Chassis/Bottom)
      new THREE.MeshStandardMaterial({ color: '#141619', roughness: 0.95 }),
      // 4: +Z face (Right / Driver side)
      new THREE.MeshStandardMaterial({ map: busSideTexture(false), roughness: 0.45, metalness: 0.15 }),
      // 5: -Z face (Left / Passenger Door side)
      new THREE.MeshStandardMaterial({ map: busSideTexture(true), roughness: 0.45, metalness: 0.15 }),
    ];
  }
  return _busMaterials;
}

let _busWheelMaterials = null;
export function getBusWheelMaterials() {
  if (!_busWheelMaterials) {
    const rim = busWheelTexture();
    _busWheelMaterials = [
      // 0: cylinder side (tyre tread)
      new THREE.MeshStandardMaterial({ color: '#16181b', roughness: 0.9 }),
      // 1: top cap (outer rim)
      new THREE.MeshStandardMaterial({ map: rim, roughness: 0.5, metalness: 0.2 }),
      // 2: bottom cap (inner rim)
      new THREE.MeshStandardMaterial({ map: rim, roughness: 0.5, metalness: 0.2 }),
    ];
  }
  return _busWheelMaterials;
}
