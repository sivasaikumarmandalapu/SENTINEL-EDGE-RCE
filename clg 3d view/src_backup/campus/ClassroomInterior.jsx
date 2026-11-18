import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  smartBoardTexture,
  chalkboardTexture,
  posterTexture,
  marbleFloorTexture,
  deskWoodTexture,
} from './classroomTextures';

// ── Materials ───────────────────────────────────────────────────────────────
const wallMat = new THREE.MeshStandardMaterial({ color: '#f5f1e8', roughness: 0.9 }); // warm institutional cream
const ceilingMat = new THREE.MeshStandardMaterial({ color: '#fcfbfa', roughness: 0.95 });
const beamMat = new THREE.MeshStandardMaterial({ color: '#eae4d5', roughness: 0.9 });
const stageMat = new THREE.MeshStandardMaterial({ color: '#ded7c8', roughness: 0.85 });
const metalFrameMat = new THREE.MeshStandardMaterial({ color: '#4b5563', metalness: 0.7, roughness: 0.4 });
const fanMat = new THREE.MeshStandardMaterial({ color: '#3d2b1f', metalness: 0.3, roughness: 0.5 });
const lightMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
const windowGlassMat = new THREE.MeshStandardMaterial({ color: '#cde4f7', roughness: 0.1, metalness: 0.8, opacity: 0.7, transparent: true });
const doorMat = new THREE.MeshStandardMaterial({ color: '#c99a75', roughness: 0.7 });

// ── Single Student Desk + Bench Unit ────────────────────────────────────────
function StudentDeskUnit({ position, woodMat }) {
  const deskW = 1.7, deskD = 0.44, deskH = 0.76;
  const benchW = 1.7, benchD = 0.28, benchH = 0.46;
  const dist = 0.42; // distance between desk and bench

  return (
    <group position={position}>
      {/* Desk Top */}
      <mesh position={[0, deskH, 0]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[deskW, 0.035, deskD]} />
      </mesh>
      {/* Desk Book Shelf */}
      <mesh position={[0, deskH - 0.14, 0]} material={woodMat} castShadow>
        <boxGeometry args={[deskW - 0.08, 0.02, deskD - 0.06]} />
      </mesh>
      {/* Desk Steel Frame Legs */}
      {[-deskW / 2 + 0.1, deskW / 2 - 0.1].map((lx, i) => (
        <group key={i} position={[lx, deskH / 2, 0]}>
          <mesh material={metalFrameMat} position={[-deskD / 2 + 0.04, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, deskH, 8]} />
          </mesh>
          <mesh material={metalFrameMat} position={[deskD / 2 - 0.04, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, deskH, 8]} />
          </mesh>
          <mesh material={metalFrameMat} position={[0, -deskH / 2 + 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, deskD - 0.04, 8]} />
          </mesh>
        </group>
      ))}

      {/* Bench Seat */}
      <mesh position={[0, benchH, dist]} material={woodMat} castShadow receiveShadow>
        <boxGeometry args={[benchW, 0.035, benchD]} />
      </mesh>
      {/* Bench Backrest */}
      <mesh position={[0, benchH + 0.28, dist + benchD / 2 - 0.02]} material={woodMat} castShadow>
        <boxGeometry args={[benchW, 0.18, 0.025]} />
      </mesh>
      {/* Bench Steel Legs & Supports */}
      {[-benchW / 2 + 0.1, benchW / 2 - 0.1].map((lx, i) => (
        <group key={i} position={[lx, benchH / 2, dist]}>
          <mesh material={metalFrameMat} position={[-benchD / 2 + 0.04, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, benchH, 8]} />
          </mesh>
          <mesh material={metalFrameMat} position={[benchD / 2 - 0.04, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, benchH, 8]} />
          </mesh>
          {/* Backrest support post */}
          <mesh material={metalFrameMat} position={[benchD / 2 - 0.02, benchH * 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, benchH * 1.5, 8]} />
          </mesh>
        </group>
      ))}

      {/* Student Laptop on Left Seat */}
      <group position={[-0.4, deskH + 0.008, 0]}>
        {/* Laptop base */}
        <mesh>
          <boxGeometry args={[0.28, 0.012, 0.2]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Laptop screen lid */}
        <mesh position={[0, 0.09, -0.09]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.28, 0.17, 0.008]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Glowing LCD screen connected to Wi-Fi */}
        <mesh position={[0, 0.09, -0.084]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.26, 0.15]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Student Smartphone on Right */}
      <group position={[0.42, deskH + 0.006, 0.04]}>
        <mesh>
          <boxGeometry args={[0.075, 0.008, 0.14]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.068, 0.13]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      </group>

      {/* Notebook on desk */}
      <mesh position={[0.15, deskH + 0.012, 0.02]} rotation={[0, -0.05, 0]}>
        <boxGeometry args={[0.22, 0.01, 0.28]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ── Rotating Ceiling Fan ───────────────────────────────────────────────────
function CeilingFan({ position }) {
  const fanRef = useRef();
  useFrame((_, delta) => {
    if (fanRef.current) fanRef.current.rotation.y += delta * 7.5;
  });

  return (
    <group position={position}>
      {/* Downrod from ceiling */}
      <mesh position={[0, 0.3, 0]} material={fanMat}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 10]} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 0.58, 0]} material={fanMat}>
        <coneGeometry args={[0.09, 0.08, 12]} />
      </mesh>
      {/* Motor & Blades (Rotating) */}
      <group ref={fanRef}>
        <mesh material={fanMat}>
          <cylinderGeometry args={[0.13, 0.13, 0.1, 16]} />
        </mesh>
        {/* 3 Aerodynamic Blades */}
        {[0, 1, 2].map((i) => {
          const angle = (i * Math.PI * 2) / 3;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[0.42, 0, 0]} material={fanMat}>
                <boxGeometry args={[0.68, 0.012, 0.12]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

// ── Fluorescent Tube Light Fixture ──────────────────────────────────────────
function TubeLight({ position }) {
  return (
    <group position={position}>
      {/* Metal casing */}
      <mesh position={[0, 0.03, 0]} material={metalFrameMat}>
        <boxGeometry args={[1.3, 0.05, 0.14]} />
      </mesh>
      {/* Dual glowing tubes */}
      {[-0.035, 0.035].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]} material={lightMat}>
          <cylinderGeometry args={[0.016, 0.016, 1.2, 10]} />
        </mesh>
      ))}
      <pointLight color="#ffffff" intensity={0.4} distance={6} decay={2} position={[0, -0.3, 0]} />
    </group>
  );
}

// ── Ceiling-Mounted Enterprise High-Tech WiFi AP Box ────────────────────────
function ClassroomWifiAP({ position }) {
  const wave1 = useRef();
  const wave2 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (wave1.current) {
      const s1 = (t * 0.8) % 1.0;
      wave1.current.scale.set(1 + s1 * 5, 1 + s1 * 5, 1);
      wave1.current.material.opacity = (1 - s1) * 0.55;
    }
    if (wave2.current) {
      const s2 = (t * 0.8 + 0.5) % 1.0;
      wave2.current.scale.set(1 + s2 * 5, 1 + s2 * 5, 1);
      wave2.current.material.opacity = (1 - s2) * 0.55;
    }
  });

  return (
    <group position={position}>
      {/* White modern square AP casing with rounded edges */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.38, 0.04, 0.38]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Cyan status LED ring */}
      <mesh position={[0, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.065, 0.09, 24]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <pointLight color="#38bdf8" intensity={0.45} distance={3.5} decay={2} position={[0, -0.15, 0]} />

      {/* Downward wireless pulse signal rings */}
      <group position={[0, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={wave1}>
          <ringGeometry args={[0.22, 0.28, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={wave2}>
          <ringGeometry args={[0.22, 0.28, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ── Teacher Podium / Rostrum ────────────────────────────────────────────────
function TeacherPodium({ position, woodMat }) {
  return (
    <group position={position}>
      {/* Main pillar / stand */}
      <mesh position={[0, 0.55, 0]} material={woodMat} castShadow>
        <boxGeometry args={[0.55, 1.05, 0.44]} />
      </mesh>
      {/* Slanted reading shelf */}
      <mesh position={[0, 1.1, 0.02]} rotation={[0.25, 0, 0]} material={woodMat} castShadow>
        <boxGeometry args={[0.62, 0.04, 0.48]} />
      </mesh>
      {/* RCE Emblem plate on front */}
      <mesh position={[0, 0.7, 0.225]}>
        <circleGeometry args={[0.09, 24]} />
        <meshStandardMaterial color="#0047a0" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ── Classroom Main Component ────────────────────────────────────────────────
export default function ClassroomInterior() {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: marbleFloorTexture(),
    roughness: 0.35,
    metalness: 0.1,
  }), []);

  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: deskWoodTexture(),
    roughness: 0.5,
    metalness: 0.1,
  }), []);

  const smartMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: smartBoardTexture(),
    roughness: 0.2,
    metalness: 0.3,
  }), []);

  const chalkMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: chalkboardTexture(),
    roughness: 0.85,
  }), []);

  const posterMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: posterTexture(),
    roughness: 0.6,
  }), []);

  // Room Dimensions (8.8m wide, 11m deep, 3.4m high)
  const rw = 8.8, rd = 11.0, rh = 3.4;
  const hw = rw / 2, hd = rd / 2;

  // Student Desks Grid (2 columns: left bank at X=-2.1, right bank at X=+2.1; 4 rows in Z)
  const deskZ = [-1.8, -0.2, 1.4, 3.0];

  return (
    <group name="classroom-interior">
      {/* Ambient Lighting & Downlights */}
      <ambientLight intensity={0.65} color="#fffcf5" />
      <directionalLight position={[-8, 6, 0]} intensity={1.5} color="#fff8e7" castShadow />
      <directionalLight position={[0, 4, -4]} intensity={0.8} color="#ffffff" />

      {/* ── Floor (Polished Marble) ────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[rw, rd]} />
      </mesh>

      {/* ── Ceiling ───────────────────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, rh, 0]} material={ceilingMat}>
        <planeGeometry args={[rw, rd]} />
      </mesh>

      {/* Ceiling Structural Cross Beams */}
      {[-2.0, 1.6].map((bz, i) => (
        <mesh key={i} position={[0, rh - 0.16, bz]} material={beamMat} castShadow>
          <boxGeometry args={[rw, 0.32, 0.38]} />
        </mesh>
      ))}

      {/* ── Front Wall (Z = -hd) ─────────────────────────────────────────── */}
      <mesh position={[0, rh / 2, -hd]} material={wallMat} receiveShadow>
        <boxGeometry args={[rw, rh, 0.1]} />
      </mesh>

      {/* ── Rear Wall (Z = +hd) ──────────────────────────────────────────── */}
      <mesh position={[0, rh / 2, hd]} material={wallMat}>
        <boxGeometry args={[rw, rh, 0.1]} />
      </mesh>

      {/* ── Right Wall (X = +hw) with Door ───────────────────────────────── */}
      <mesh position={[hw, rh / 2, 0]} material={wallMat}>
        <boxGeometry args={[0.1, rh, rd]} />
      </mesh>

      {/* Door on right wall towards front */}
      <group position={[hw - 0.04, 1.1, -3.8]}>
        <mesh material={doorMat}>
          <boxGeometry args={[0.06, 2.2, 1.05]} />
        </mesh>
        {/* Door frame */}
        <mesh material={woodMat}>
          <boxGeometry args={[0.08, 2.26, 1.12]} />
        </mesh>
        {/* Stainless steel door handle */}
        <mesh position={[-0.04, 0, -0.38]} material={metalFrameMat}>
          <boxGeometry args={[0.03, 0.18, 0.03]} />
        </mesh>
      </group>

      {/* Framed Department Vision & Mission Posters on Right Wall */}
      <mesh position={[hw - 0.04, 2.0, -1.0]} rotation={[0, -Math.PI / 2, 0]} material={posterMat} castShadow>
        <boxGeometry args={[1.05, 1.5, 0.03]} />
      </mesh>
      <mesh position={[hw - 0.04, 2.0, 1.2]} rotation={[0, -Math.PI / 2, 0]} material={posterMat} castShadow>
        <boxGeometry args={[1.05, 1.5, 0.03]} />
      </mesh>

      {/* ── Left Wall (X = -hw) with Large Grid Windows ──────────────────── */}
      <mesh position={[-hw, rh / 2, 0]} material={wallMat}>
        <boxGeometry args={[0.1, rh, rd]} />
      </mesh>

      {/* 3 Large Multi-pane Grid Windows (as in Image 2 & 3) */}
      {[-3.0, 0.2, 3.4].map((wz, i) => (
        <group key={i} position={[-hw + 0.04, 1.9, wz]}>
          {/* Window Glass */}
          <mesh material={windowGlassMat}>
            <boxGeometry args={[0.04, 1.6, 2.1]} />
          </mesh>
          {/* Frame */}
          <mesh material={metalFrameMat}>
            <boxGeometry args={[0.06, 1.68, 2.18]} />
          </mesh>
          {/* Security Window Grilles (horizontal & vertical bars) */}
          {[-0.6, 0, 0.6].map((gy, k) => (
            <mesh key={k} position={[0, gy, 0]} material={metalFrameMat}>
              <boxGeometry args={[0.02, 0.02, 2.1]} />
            </mesh>
          ))}
          {[-0.7, -0.35, 0, 0.35, 0.7].map((gz, k) => (
            <mesh key={k} position={[0, 0, gz]} material={metalFrameMat}>
              <boxGeometry args={[0.02, 1.6, 0.02]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Front Dais / Platform ────────────────────────────────────────── */}
      <mesh position={[0, 0.1, -hd + 1.1]} material={stageMat} receiveShadow castShadow>
        <boxGeometry args={[rw - 0.8, 0.2, 2.1]} />
      </mesh>

      {/* ── Green Chalkboard on Front Wall ───────────────────────────────── */}
      <mesh position={[-1.6, 1.95, -hd + 0.06]} material={chalkMat} castShadow receiveShadow>
        <boxGeometry args={[3.1, 1.6, 0.04]} />
      </mesh>

      {/* ── Smart Interactive Digital Board (Large Screen) on Front Wall ──── */}
      <mesh position={[1.85, 2.05, -hd + 0.07]} material={smartMat} castShadow receiveShadow>
        <boxGeometry args={[2.7, 1.55, 0.06]} />
      </mesh>
      {/* Subtle Screen Ambient Glow */}
      <pointLight color="#38bdf8" intensity={0.55} distance={3.8} decay={2} position={[1.85, 2.05, -hd + 0.5]} />

      {/* Wall Notices on Left of Chalkboard */}
      {[-3.6, -3.1].map((nx, i) => (
        <mesh key={i} position={[nx, 2.1, -hd + 0.05]} material={posterMat}>
          <boxGeometry args={[0.42, 0.62, 0.02]} />
        </mesh>
      ))}

      {/* ── Teacher Podium / Rostrum on Dais ─────────────────────────────── */}
      <TeacherPodium position={[2.9, 0.2, -hd + 1.2]} woodMat={woodMat} />

      {/* Teacher Stool next to podium */}
      <group position={[3.6, 0.2, -hd + 1.0]}>
        <mesh position={[0, 0.48, 0]} material={woodMat} castShadow>
          <boxGeometry args={[0.38, 0.035, 0.38]} />
        </mesh>
        {[[-0.14, -0.14], [-0.14, 0.14], [0.14, -0.14], [0.14, 0.14]].map(([sx, sz], i) => (
          <mesh key={i} position={[sx, 0.24, sz]} material={metalFrameMat}>
            <cylinderGeometry args={[0.015, 0.015, 0.48, 8]} />
          </mesh>
        ))}
      </group>

      {/* ── Student Desks & Benches Grid (Rows of dual desks) ─────────────── */}
      {deskZ.map((z, rowIdx) => (
        <React.Fragment key={rowIdx}>
          {/* Left Bank */}
          <StudentDeskUnit position={[-2.1, 0, z]} woodMat={woodMat} />
          {/* Right Bank */}
          <StudentDeskUnit position={[2.1, 0, z]} woodMat={woodMat} />
        </React.Fragment>
      ))}

      {/* ── Floor High-Tech Enterprise WiFi AP Box ──────────────────────── */}
      <ClassroomWifiAP position={[0, rh - 0.02, -0.2]} />

      {/* ── Ceiling Fans (Rotating) ──────────────────────────────────────── */}
      <CeilingFan position={[-2.1, rh - 0.65, -1.8]} />
      <CeilingFan position={[2.1, rh - 0.65, -1.8]} />
      <CeilingFan position={[-2.1, rh - 0.65, 1.8]} />
      <CeilingFan position={[2.1, rh - 0.65, 1.8]} />

      {/* ── Tube Light Fixtures ──────────────────────────────────────────── */}
      <TubeLight position={[-2.1, rh - 0.05, -3.6]} />
      <TubeLight position={[2.1, rh - 0.05, -3.6]} />
      <TubeLight position={[-2.1, rh - 0.05, 0]} />
      <TubeLight position={[2.1, rh - 0.05, 0]} />
      <TubeLight position={[-2.1, rh - 0.05, 3.4]} />
      <TubeLight position={[2.1, rh - 0.05, 3.4]} />
    </group>
  );
}
