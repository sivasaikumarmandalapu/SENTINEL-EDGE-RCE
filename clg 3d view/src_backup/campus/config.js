// ─────────────────────────────────────────────────────────────────────────────
// RCEE campus configuration. Everything geometric lives here so the layout can
// be tuned without touching components.
//
// Positions come from the hand-drawn 2D map (1725×1075 px). 1 world unit ≈ 3.7 m.
// Map X → world X (east), map Y → world Z (south). Map "up" = north = -Z.
// ─────────────────────────────────────────────────────────────────────────────
export const MAP_SCALE = 0.05;
const OX = 862, OY = 537; // map pixel that becomes world (0,0)
export const mapX = (px) => (px - OX) * MAP_SCALE;
export const mapZ = (py) => (py - OY) * MAP_SCALE;
const rect = (x0, y0, x1, y1) => ({
  x: mapX((x0 + x1) / 2), z: mapZ((y0 + y1) / 2),
  width: (x1 - x0) * MAP_SCALE, depth: (y1 - y0) * MAP_SCALE,
});

export const FLOOR_HEIGHT = 1.0;  // one storey
export const BAY_WIDTH = 1.3;     // one window bay (pilaster to pilaster)

export const PALETTE = {
  wall: '#efe7cc',       // warm ivory / cream
  pilaster: '#b9bd6c',   // pale yellowish / muted olive green
  band: '#dadea8',       // light-green horizontal borders
  plinth: '#cfc9b6',
  roof: '#b4b1a6',
  parapet: '#ebe3c6',
  frame: '#25292d',
};

export const STATUS_COLORS = {
  normal: '#38bdf8', high: '#f59e0b', threat: '#ef4444', secure: '#22c55e',
};

// front = which face carries the entrance porch ('n' = -Z, 's' = +Z, 'e' = +X, 'w' = -X)
// solar = { coverage 0..1, tilt radians }
export const BUILDINGS = {
  admin: { id: 'admin', label: 'Admin Block', ...rect(274, 253, 472, 540), floors: 3, front: 'e', style: 'academic', solar: { coverage: 0.8, tilt: 0.17 } },
  a:     { id: 'a', label: 'A Block', ...rect(572, 678, 1017, 902), floors: 4, front: 'n', style: 'academic', solar: { coverage: 1, tilt: 0.17 },
           roofSign: { text: 'RAMACHANDRA', sub: 'COLLEGE OF ENGINEERING', face: 'n' } },
  b:     { id: 'b', label: 'B Block', ...rect(1137, 667, 1624, 922), floors: 4, front: 'n', style: 'academic', solar: { coverage: 1, tilt: 0.17 } },
  c:     { id: 'c', label: 'C Block', ...rect(497, 62, 1038, 222), floors: 4, front: 's', style: 'academic', solar: { coverage: 1, tilt: 0.17 } },
  canteen: { id: 'canteen', label: 'Canteen', ...rect(958, 349, 1034, 473), floors: 2, front: 'w', style: 'academic', solar: { coverage: 0.9, tilt: 0.17 } },
  auditorium: { id: 'auditorium', label: 'Auditorium', ...rect(1402, 152, 1681, 518), x: 39, floors: 3, height: 4.6, front: 'w', style: 'auditorium', porch: false, solar: { coverage: 1, tilt: 0.17 } },
  girls: { id: 'girls', label: 'Girls Hostel', ...rect(229, 935, 557, 1061), x: -12, z: 48, floors: 4, front: 'n', style: 'academic', solar: { coverage: 0.9, tilt: 0.17 } },
  boys:  { id: 'boys', label: 'Boys Hostel', x: 44, z: 15.5, width: 5.2, depth: 17, floors: 4, front: 'n', style: 'academic', solar: { coverage: 0.9, tilt: 0.17 } }, // runs north-south along the east wall
  // single-storey high-bay workshop between B Block and the south road; front (roller-shutter bays) faces south
  mechlab: { id: 'mechlab', label: 'Mechanical Lab', x: 22, z: 31, width: 20, depth: 9, floors: 1, height: 2.4, front: 's', style: 'lab', porch: false,
             solar: { coverage: 1, tilt: 0.17 },
             roofKeepouts: [{ x: -3, z: -3, w: 1.2, d: 1.2 }, { x: 0, z: -3, w: 1.2, d: 1.2 }, { x: 3, z: -3, w: 1.2, d: 1.2 }, { x: 7.4, z: -3, w: 1.2, d: 1.2 }] },
  // small structures (own components)
  temple: { id: 'temple', label: 'Temple', ...rect(657, 374, 746, 427), floors: 1, height: 3.2, style: 'temple' },
  openAuditorium: { id: 'openAuditorium', label: 'Open Auditorium', x: 20.1, z: -8.2, width: 13.8, depth: 13, floors: 1, height: 0.8, style: 'open' },
};
export const BUILDING_LIST = Object.values(BUILDINGS);

// stage sits on the WEST side of the open auditorium (map)
export const STAGE = { width: 2.4, depth: 9, height: 0.55, offsetX: -BUILDINGS.openAuditorium.width / 2 + 1.5 };

export const buildingHeight = (b) => b.height ?? b.floors * FLOOR_HEIGHT;
export const buildingAnchor = (id, lift = 1.0) => {
  const b = BUILDINGS[id];
  return [b.x, buildingHeight(b) + lift, b.z];
};

// Roads / walkways as rectangles {x,z,width,depth} in world units
export const ROADS = [
  { id: 'west', x: mapX(155.5), z: 15.5, width: 2.85, depth: 85 },                 // outside N–S approach road (between the two left lines of the map)
  { id: 'internal', x: 7.35, z: 3.9, width: 85.3, depth: 3.75 },               // the horizontal internal road
  { id: 'mid', x: mapX(1076.5), z: -9.0, width: 2.4, depth: 22.2 },
  { id: 'south-link', x: -12, z: 35.6, width: 2.6, depth: 18.4 },                 // bus park -> girls hostel
  { id: 'south-cross', x: 16, z: 39.5, width: 56, depth: 2.6 },                   // branch east to boys hostel
  { id: 'aud-road', x: 29.6, z: -8.6, width: 2.4, depth: 21.4 },                 // new road between open auditorium and auditorium            // N–S road between canteen & open auditorium
];
export const PATHS = [
  { id: 'temple-ns', x: mapX(700), z: -6.8, width: 2.0, depth: 17.6 },
  { id: 'admin-canteen', x: -7.35, z: mapZ(400), width: 24.3, depth: 1.2 },
  { id: 'lab-apron', x: 22, z: 36.85, width: 19.6, depth: 2.7 },           // loading apron: lab shutters -> south road
  { id: 'boys-path', x: 44, z: 6.4, width: 2.9, depth: 1.2 },             // internal road -> boys hostel porch
];

export const PARKING = [
  { id: 'buses', x: -17.5, z: 23.2, width: 29, depth: 6.4, kind: 'bus' },
  { id: 'two-wheelers', x: 39, z: 0.95, width: 14, depth: 1.5, kind: 'bike' },
  { id: 'lot-nw', x: -26, z: -20.6, width: 13, depth: 10.6, kind: 'lot' },      // replaces the old garden, behind the second gate
  { id: 'lot-south', x: -23.5, z: 36.5, width: 17, depth: 11, kind: 'lot' },    // car + bike lot in the southern extension
];
export const GARDENS = [
  { id: 'temple', x: -8.1, z: -6.8, width: 6.5, depth: 5.5 },
];

export const BOUNDS = { x0: -33.7, x1: 50, z0: -27, z1: 56 }; // west wall = east edge of the west road

// Main entrance (map label 'gate entrance'): in the west boundary wall, across the start of the
// internal road, facing west toward the approach road.
export const ENTRANCE = { x: BOUNDS.x0, z: 3.9, rotationY: -Math.PI / 2, halfSpan: 2.6 };

export const HOME_TARGET = [8, 0, 14];
export const HOME_POS = [8, 88, 102];

// Second, bigger gate: west wall, at the former garden spot, opening onto the west road.
export const GATE2 = { x: BOUNDS.x0, z: -20.6, rotationY: -Math.PI / 2, halfSpan: 3.0, scale: 1.15 };
