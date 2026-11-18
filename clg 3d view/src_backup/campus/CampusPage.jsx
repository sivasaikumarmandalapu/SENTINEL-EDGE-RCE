import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import CampusModel from './CampusModel';
import NetworkSimulation from './NetworkSimulation';
import { BUILDINGS, HOME_POS, HOME_TARGET, buildingHeight } from './config';
import { NETWORK_NODES, TRAFFIC_TYPES } from './networkConfig';

const css = `
.rc-root{position:fixed;inset:0;background:#0b1220;color:#e6edf7;font-family:'Segoe UI',system-ui,sans-serif;overflow:hidden}
.rc-selected-pill{position:absolute;top:16px;left:50%;transform:translateX(-50%);z-index:10;display:flex;align-items:center;gap:10px;
 background:rgba(8,14,28,.93);border:1.5px solid #22d3ee;box-shadow:0 8px 32px rgba(0,0,0,.6),0 0 20px rgba(34,211,238,.35);
 backdrop-filter:blur(10px);padding:6px 18px;border-radius:30px;color:#fff;font-size:14px;font-weight:700;letter-spacing:.03em;
 animation:fadeInDown .22s cubic-bezier(0.16,1,0.3,1);white-space:nowrap}
.rc-pill-title{font-size:15px;font-weight:800;color:#ffffff;letter-spacing:.04em;margin-right:2px}
.rc-pill-chip{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:6px;padding:3px 8px;font-size:11px;color:#cbd5e1;font-weight:600}
.rc-pill-speed{font-size:12px;font-weight:800;margin-right:4px}
.rc-selected-dot{width:9px;height:9px;border-radius:50%;flex:none;transition:background 0.2s}
.rc-selected-close{background:none;border:none;color:#9fb0c8;font-size:16px;cursor:pointer;padding:0 0 0 6px;line-height:1}
.rc-selected-close:hover{color:#fff}
.rc-hint{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);z-index:10;
 background:rgba(10,18,34,.75);border:1px solid rgba(255,255,255,.1);padding:5px 14px;border-radius:18px;
 font-size:11px;color:#94a3b8;letter-spacing:.03em;backdrop-filter:blur(6px);pointer-events:none}

@keyframes fadeInDown{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
`;

function CameraRig({ selectedId, cameraProgress = 0 }) {
  const { camera, controls, size } = useThree();
  const goal = useRef(null);

  useEffect(() => {
    const aspect = size.width / size.height, k = Math.max(1, 1.8 / aspect);
    if (!selectedId) {
      const t = new THREE.Vector3(...HOME_TARGET);
      if (controls) controls.minDistance = 20;

      // Start position (3D angled perspective)
      const startPos = t.clone().add(
        new THREE.Vector3(HOME_POS[0] - HOME_TARGET[0], HOME_POS[1], HOME_POS[2] - HOME_TARGET[2]).multiplyScalar(k)
      );
      // Top-down position (Overhead perspective)
      const topPos = new THREE.Vector3(HOME_TARGET[0], 118, HOME_TARGET[2] + 0.1);
      const pos = new THREE.Vector3().lerpVectors(startPos, topPos, cameraProgress);

      goal.current = {
        target: t,
        pos,
      };
    } else {
      const b = BUILDINGS[selectedId];
      if (!b) return;
      const r = Math.max(b.width, b.depth);
      const h = buildingHeight(b);
      const t = new THREE.Vector3(b.x, h / 2, b.z);
      if (controls) controls.minDistance = Math.max(14, r * 0.72);
      goal.current = {
        target: t,
        pos: t.clone().add(new THREE.Vector3(r * 0.35, Math.max(7, h * 0.9 + 4), Math.max(13, r * 0.9))),
      };
    }
  }, [selectedId, cameraProgress, controls, size]);

  useFrame((_, dt) => {
    const g = goal.current; if (!g || !controls) return;
    const k = 1 - Math.pow(0.0008, dt);
    camera.position.lerp(g.pos, k); controls.target.lerp(g.target, k); controls.update();
    if (camera.position.distanceTo(g.pos) < 0.05) goal.current = null;
  });

  useEffect(() => {
    if (!controls) return;
    const stop = () => { goal.current = null; };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  return null;
}

export default function CampusPage() {
  const [selected, setSelected] = useState(null);
  const [, setHover] = useState(null);
  const [cameraProgress, setCameraProgress] = useState(0);
  const [showLabels, setShowLabels] = useState(true);

  // Parent dashboard message integration
  useEffect(() => {
    const handleParentMsg = (event) => {
      if (event.data?.type === 'SENTINEL_SELECT_BLOCK' && event.data.blockId) {
        setSelected(event.data.blockId);
      }
      if (event.data?.type === 'SENTINEL_CAMERA_PROGRESS' && Number.isFinite(event.data.progress)) {
        setCameraProgress(Math.min(1, Math.max(0, event.data.progress)));
      }
      if (event.data?.type === 'SENTINEL_TOGGLE_LABELS' && typeof event.data.show === 'boolean') {
        setShowLabels(event.data.show);
      }
    };
    window.addEventListener('message', handleParentMsg);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'SENTINEL_CAMERA_READY' }, '*');
    }
    return () => window.removeEventListener('message', handleParentMsg);
  }, []);

  const handleSelectBuilding = (id) => {
    setSelected((prev) => {
      const next = prev === id ? null : id;
      if (window.parent && window.parent !== window && next) {
        window.parent.postMessage({ type: 'SENTINEL_BLOCK_SELECTED', blockId: next }, '*');
      }
      return next;
    });
  };

  const sel = selected ? BUILDINGS[selected] : null;
  const netNode = sel ? NETWORK_NODES.find((n) => n.id === sel.id) : null;
  const trafficCfg = netNode ? TRAFFIC_TYPES[netNode.trafficType] : null;

  return (
    <div className="rc-root">
      <style>{css}</style>

      {/* Selected Building Floating Banner with Network & Lab Data */}
      {sel && (
        <div className="rc-selected-pill">
          <span
            className="rc-selected-dot"
            style={{
              background: trafficCfg?.color || '#22d3ee',
              boxShadow: `0 0 10px ${trafficCfg?.color || '#22d3ee'}`,
            }}
          />
          <span className="rc-pill-title">{sel.label}</span>

          {netNode && (
            <>
              <span className="rc-pill-chip">{netNode.labs}</span>
              <span className="rc-pill-chip">📶 {netNode.totalAps} APs • {netNode.devices} Devs</span>
              <span className="rc-pill-speed" style={{ color: trafficCfg?.color || '#38bdf8' }}>
                {netNode.throughput}
              </span>
            </>
          )}

          <button className="rc-selected-close" onClick={() => setSelected(null)} title="Close">✕</button>
        </div>
      )}

      {/* Subtle Hint */}
      {!sel && (
        <div className="rc-hint">
          Left click: Rotate • Scroll: Zoom • Right click: Pan • Click building: Focus
        </div>
      )}

      {/* ── 3D Viewport ────────────────────────────────────────────────────── */}
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: HOME_POS, fov: 45, near: 0.5, far: 900 }}
        onPointerMissed={() => setSelected(null)}
        gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <color attach="background" args={['#cfe3f5']} />
        <fog attach="fog" args={['#d6e6f2', 140, 380]} />
        <Sky sunPosition={[60, 45, 30]} turbidity={4} rayleigh={1.2} />
        <hemisphereLight args={['#dbeaff', '#7d8a5a', 0.75]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[45, 70, 30]} intensity={2.4} castShadow shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-80} shadow-camera-right={80} shadow-camera-top={75} shadow-camera-bottom={-75} shadow-camera-near={5} shadow-camera-far={280}
          shadow-bias={-0.0004} shadow-normalBias={0.05} />
        <Suspense fallback={null}>
          <CampusModel selectedId={selected} onSelect={handleSelectBuilding} onHover={setHover} showLabels={showLabels} />
          {/* Permanent Network Simulation with LAN fiber conduits, moving packets & floor WiFi waves */}
          <NetworkSimulation selectedId={selected} onSelectNode={handleSelectBuilding} />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={20} maxDistance={170} maxPolarAngle={Math.PI / 2.08} target={HOME_TARGET} />
        <CameraRig selectedId={selected} cameraProgress={cameraProgress} />
      </Canvas>
    </div>
  );
}
