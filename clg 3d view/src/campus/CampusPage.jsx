import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import CampusModel from './CampusModel';
import NetworkSimulation from './NetworkSimulation';
import { BUILDINGS, TOUR_ORDER, HOME_POS, HOME_TARGET, buildingHeight } from './config';
import { BLOCK_DETAILS } from './blockDetails';
import { NETWORK_NODES } from './networkConfig';

const DESC = {
  admin: 'Administrative headquarters – four storeys, slate-stone entrance under the RUDRA canopy with Central IT Server & Edge Firewall',
  a: 'Sarvesta – academic block housing CSE Computer Labs, Physics & Chemistry Labs',
  b: 'Vidhra – academic block housing ECE, EEE, M.Tech, and IoT laboratory suites',
  c: 'Shastra – academic block housing Cyber Security Lab, AI Lab, and Data Science centers',
  temple: 'Campus shrine & serene landmark',
  canteen: 'Central food court & student commons',
  openAuditorium: 'Open-air hall with elevated stage',
  auditorium: 'Main institutional auditorium & AV media center',
  girls: "Girls' residential campus and wireless mesh network",
  boys: "Boys' residential campus and wireless mesh network",
  mechlab: 'Mechanical engineering workshop and CAD/CAM research facility',
  cricket: 'Turf cricket ground with centre pitch',
  volleyball: 'Volleyball court with net',
  badminton: 'Badminton court with net',
  kabaddi: 'Kabaddi court with standard regulation lines',
};

const css = `
.rc-root{position:fixed;inset:0;background:#0b1220;color:#e6edf7;font-family:'Segoe UI',system-ui,sans-serif;overflow:hidden}
.rc-head{position:absolute;top:0;left:0;right:0;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;z-index:10;
 background:linear-gradient(180deg,rgba(8,14,28,.95),rgba(8,14,28,.75));border-bottom:1px solid rgba(56,189,248,.35);backdrop-filter:blur(8px)}
.rc-head-title{display:flex;align-items:center;gap:10px}
.rc-head-title h1{margin:0;font-size:16px;letter-spacing:.08em;font-weight:800;color:#38bdf8;display:flex;align-items:center;gap:6px}
.rc-head-title small{display:block;font-size:10.5px;letter-spacing:.14em;color:#94a3b8;font-weight:600}
.rc-hdr-btns{display:flex;gap:6px;align-items:center}
.rc-btn{background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.5);color:#38bdf8;padding:6px 11px;border-radius:6px;font-weight:700;cursor:pointer;letter-spacing:.04em;font-size:11.5px;white-space:nowrap;transition:all .15s ease;display:inline-flex;align-items:center;gap:4px}
.rc-btn:hover{background:rgba(56,189,248,.26);box-shadow:0 0 10px rgba(56,189,248,.4)}
.rc-btn.off{opacity:.5;border-color:rgba(255,255,255,.2);color:#94a3b8;background:rgba(255,255,255,.05)}
.rc-btn.threat-active{background:rgba(239,68,68,.25);border-color:#ef4444;color:#fca5a5;animation:pulseRed 1.5s infinite}
@keyframes pulseRed{0%{box-shadow:0 0 0 0 rgba(239,68,68,.7)}70%{box-shadow:0 0 0 8px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}

.rc-card{position:absolute;z-index:5;background:rgba(10,18,34,.88);border:1px solid rgba(56,189,248,.25);border-radius:10px;backdrop-filter:blur(10px);box-shadow:0 8px 32px rgba(0,0,0,.6)}
.rc-info{top:68px;right:16px;width:320px;padding:16px;max-height:calc(100vh - 68px - 80px);overflow-y:auto;box-sizing:border-box;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.25) transparent}
.rc-info::-webkit-scrollbar{width:4px}
.rc-info::-webkit-scrollbar-thumb{background:rgba(255,255,255,.25);border-radius:2px}
.rc-info h3{margin:0 0 6px;font-size:10.5px;letter-spacing:.16em;color:#94a3b8;font-weight:700}
.rc-info h2{margin:0 0 4px;font-size:18px;color:#fff;font-weight:800}
.rc-info p{margin:4px 0;font-size:12.5px;color:#cbd5e1;line-height:1.4}

.rc-net-box{background:rgba(15,23,42,.85);border:1px solid rgba(56,189,248,.3);border-radius:6px;padding:10px;margin:10px 0}
.rc-net-title{font-size:11px;font-weight:800;color:#38bdf8;letter-spacing:.08em;margin-bottom:6px;display:flex;align-items:center;gap:4px}
.rc-net-row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.rc-net-row b{color:#f8fafc}

.rc-sec{margin:12px 0 4px;font-size:10.5px;letter-spacing:.16em;font-weight:700;color:#f2d37a;text-transform:uppercase}
.rc-points{list-style:none;margin:6px 0 4px;padding:0}
.rc-points li{position:relative;padding:0 0 0 14px;margin:0 0 6px;font-size:12px;line-height:1.4;color:#c9d4e6}
.rc-points li::before{content:'';position:absolute;left:2px;top:6px;width:5px;height:5px;border-radius:1px;background:#38bdf8;box-shadow:0 0 5px rgba(56,189,248,.7)}

.rc-tags{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 10px}
.rc-tag{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;color:#38bdf8;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.35)}

.rc-bottom-bar{bottom:14px;left:16px;max-width:calc(100% - 350px);padding:6px 10px;display:flex;align-items:center;gap:8px;box-sizing:border-box}
.rc-bottom-title{font-size:10.5px;letter-spacing:.14em;font-weight:800;color:#38bdf8;white-space:nowrap;padding-right:8px;border-right:1px solid rgba(255,255,255,.14);text-transform:uppercase;user-select:none}
.rc-tabs-track{display:flex;align-items:center;gap:6px;overflow-x:auto;padding:2px 0;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.rc-tabs-track::-webkit-scrollbar{display:none}
.rc-tab{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:11.5px;font-weight:600;white-space:nowrap;color:#cbd5e1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);transition:all .15s ease;user-select:none}
.rc-tab:hover{background:rgba(56,189,248,.15);color:#fff;border-color:rgba(56,189,248,.4)}
.rc-tab.on{background:rgba(56,189,248,.2);border-color:#38bdf8;color:#38bdf8;box-shadow:0 0 12px rgba(56,189,248,.35)}
.rc-dot{width:7px;height:7px;border-radius:2px;background:#d9cf9f;flex:none}
.rc-hint{position:absolute;bottom:14px;right:16px;padding:6px 12px;font-size:11px;color:#94a3b8;pointer-events:none}

@media(max-width:960px){
  .rc-info{width:min(320px,calc(100% - 32px));max-height:36vh;top:62px}
  .rc-bottom-bar{max-width:calc(100% - 32px);bottom:10px;left:16px}
  .rc-hint{display:none}
}
`;

function CameraRig({ selectedId, resetKey, cameraProgress = 0, onArrived }) {
  const { camera, controls, size } = useThree();
  const goal = useRef(null);

  useEffect(() => {
    const aspect = size.width / size.height;
    const k = Math.max(1, 1.8 / aspect);

    if (!selectedId) {
      const t = new THREE.Vector3(...HOME_TARGET);
      if (controls) controls.minDistance = 15;

      const startPos = t.clone().add(
        new THREE.Vector3(HOME_POS[0] - HOME_TARGET[0], HOME_POS[1], HOME_POS[2] - HOME_TARGET[2]).multiplyScalar(k)
      );
      const topPos = new THREE.Vector3(HOME_TARGET[0], 120, HOME_TARGET[2] + 0.1);
      const pos = new THREE.Vector3().lerpVectors(startPos, topPos, cameraProgress);

      goal.current = { target: t, pos };
    } else {
      const b = BUILDINGS[selectedId];
      if (!b) return;
      const r = Math.max(b.width, b.depth);
      const h = buildingHeight(b);
      const t = new THREE.Vector3(b.x, h / 2, b.z);
      if (controls) controls.minDistance = Math.max(12, r * 0.7);

      goal.current = {
        target: t,
        pos: t.clone().add(new THREE.Vector3(r * 0.35, Math.max(7, h * 0.9 + 5), Math.max(13, r * 0.95))),
      };
    }
  }, [selectedId, resetKey, cameraProgress, controls, size]);

  useFrame((_, dt) => {
    const g = goal.current;
    if (!g || !controls) return;
    const k = 1 - Math.pow(0.0008, dt);
    camera.position.lerp(g.pos, k);
    controls.target.lerp(g.target, k);
    controls.update();

    if (camera.position.distanceTo(g.pos) < 0.08) {
      camera.position.copy(g.pos);
      controls.target.copy(g.target);
      controls.update();
      goal.current = null;
      if (onArrived) onArrived();
    }
  });

  useEffect(() => {
    if (!controls) return;
    const stop = () => { goal.current = null; };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  return null;
}

const dotColor = (b) => ({ auditorium: '#c9b98a', temple: '#c97d4b', open: '#9aa0a6', lab: '#8fb3c9', sport: '#4ade80' }[b.style] || '#d9d9a3');

export default function CampusPage() {
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [cyberLayer, setCyberLayer] = useState(true);
  const [showPackets, setShowPackets] = useState(true);
  const [attackMode, setAttackMode] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraProgress, setCameraProgress] = useState(0);

  const rootRef = useRef(null);
  const trackRef = useRef(null);

  const sel = selected ? BUILDINGS[selected] : null;
  const det = selected ? BLOCK_DETAILS[selected] : null;
  const netNode = selected ? NETWORK_NODES.find((n) => n.id === selected) : null;

  const reset = () => {
    setSelected(null);
    setCameraProgress(0);
    setResetKey((k) => k + 1);
  };

  const handleSelectBlock = useCallback((id) => {
    setSelected(id);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'SENTINEL_BLOCK_SELECTED', blockId: id }, '*');
    }
  }, []);

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
      if (event.data?.type === 'SENTINEL_SET_ATTACK_MODE' && typeof event.data.active === 'boolean') {
        setAttackMode(event.data.active);
      }
    };
    window.addEventListener('message', handleParentMsg);
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'SENTINEL_CAMERA_READY' }, '*');
    }
    return () => window.removeEventListener('message', handleParentMsg);
  }, []);

  // Active tab scrolls into view in bottom bar
  useEffect(() => {
    const tr = trackRef.current;
    const el = tr?.querySelector('.rc-tab.on');
    if (!el) return;
    const left = el.getBoundingClientRect().left - tr.getBoundingClientRect().left + tr.scrollLeft - (tr.clientWidth - el.offsetWidth) / 2;
    tr.scrollTo({ left, behavior: 'smooth' });
  }, [selected]);

  return (
    <div className="rc-root" ref={rootRef}>
      <style>{css}</style>
      <header className="rc-head">
        <div className="rc-head-title">
          <div>
            <h1>🛡️ RAMACHANDRA COLLEGE OF ENGINEERING</h1>
            <small>ENTERPRISE PERIMETER DEFENSE · 3D DIGITAL TWIN</small>
          </div>
        </div>
        <div className="rc-hdr-btns">
          <button
            className={`rc-btn ${cyberLayer ? '' : 'off'}`}
            onClick={() => setCyberLayer((c) => !c)}
            title="Toggle optical fiber conduits and network infrastructure"
          >
            🛡️ CYBER LAYER: {cyberLayer ? 'ON' : 'OFF'}
          </button>
          <button
            className={`rc-btn ${showPackets ? '' : 'off'}`}
            onClick={() => setShowPackets((p) => !p)}
            title="Toggle animated data packet streams along the fiber conduits"
          >
            ⚡ PACKETS: {showPackets ? 'ON' : 'OFF'}
          </button>
          <button
            className={`rc-btn ${attackMode ? 'threat-active' : ''}`}
            onClick={() => setAttackMode((a) => !a)}
            title="Simulate live TLS 1.3 C2 Tunnel / DoH attack pulse"
          >
            🚨 ATTACK SIM: {attackMode ? 'ACTIVE' : 'IDLE'}
          </button>
          <button
            className={`rc-btn ${autoRotate ? '' : 'off'}`}
            onClick={() => setAutoRotate((r) => !r)}
            title="Toggle 360° slow rotation around focused block"
          >
            ↻ 360° ROTATION: {autoRotate ? 'ON' : 'OFF'}
          </button>
          <button className="rc-btn" onClick={reset} title="Reset camera to campus overview">
            ⟲ RESET
          </button>
        </div>
      </header>

      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: HOME_POS, fov: 45, near: 0.5, far: 900 }}
        onPointerMissed={() => setSelected(null)}
        gl={{ antialias: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#cfe3f5']} />
        <fog attach="fog" args={['#d6e6f2', 190, 520]} />
        <Sky sunPosition={[60, 45, 30]} turbidity={4} rayleigh={1.2} />
        <hemisphereLight args={['#dbeaff', '#7d8a5a', 0.75]} />
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[45, 70, 30]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-110}
          shadow-camera-right={110}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-camera-near={5}
          shadow-camera-far={300}
          shadow-bias={-0.0004}
          shadow-normalBias={0.05}
        />

        <Suspense fallback={null}>
          <CampusModel
            selectedId={selected}
            onSelect={handleSelectBlock}
            onHover={setHover}
            showLabels={showLabels}
          />
          {cyberLayer && (
            <NetworkSimulation
              showPackets={showPackets}
              showLabels={showLabels}
              attackMode={attackMode}
              onSelectNode={handleSelectBlock}
            />
          )}
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enableZoom={true}
          minDistance={6}
          maxDistance={250}
          maxPolarAngle={Math.PI / 2.08}
          target={HOME_TARGET}
          autoRotate={Boolean(selected) && autoRotate}
          autoRotateSpeed={2.0}
        />

        <CameraRig
          selectedId={selected}
          resetKey={resetKey}
          cameraProgress={cameraProgress}
        />
      </Canvas>

      {/* Building Info & Network Telemetry Card */}
      <aside className="rc-card rc-info">
        <h3>{sel ? 'SELECTED NODE' : 'PERIMETER NODE INSPECTION'}</h3>
        {sel ? (
          <div key={sel.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2>{sel.label}</h2>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '0 4px',
                }}
              >
                ✕
              </button>
            </div>
            {det && det.title !== sel.label && (
              <p style={{ color: '#94a3b8', fontSize: 11 }}>Part of: {det.title}</p>
            )}
            <p>{DESC[sel.id]}</p>

            {/* SentinelEdge Cyber Network Telemetry Box */}
            {netNode && (
              <div className="rc-net-box">
                <div className="rc-net-title">
                  <span>🌐</span> SENTINELEDGE NETWORK SPECS
                </div>
                <div className="rc-net-row">
                  <span>Subnet IP:</span>
                  <b>{netNode.subnet}</b>
                </div>
                <div className="rc-net-row">
                  <span>Node Gateway:</span>
                  <b>{netNode.ip}</b>
                </div>
                <div className="rc-net-row">
                  <span>Live Throughput:</span>
                  <b style={{ color: '#38bdf8' }}>{netNode.throughput}</b>
                </div>
                <div className="rc-net-row">
                  <span>Security State:</span>
                  <b style={{
                    color: (attackMode && netNode.id === 'a') ? '#ef4444' : netNode.trafficType === 'quarantined' ? '#f59e0b' : '#22c55e'
                  }}>
                    {(attackMode && netNode.id === 'a') ? '🚨 C2 THREAT DETECTED' : netNode.trafficType === 'quarantined' ? '🔒 JAILED / QUARANTINED' : 'NORMAL ENCRYPTED'}
                  </b>
                </div>
                <div className="rc-net-row">
                  <span>Hardware & Labs:</span>
                  <b>{netNode.labs}</b>
                </div>
              </div>
            )}

            {det && (
              <>
                <div className="rc-sec">About this block</div>
                <ul className="rc-points">
                  {det.points.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                {det.tags && (
                  <div className="rc-tags">
                    {det.tags.map((t) => (
                      <span className="rc-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <p>
            {hover
              ? BUILDINGS[hover]?.label
              : 'Click any campus building or pick from the blocks below to inspect real-time network telemetry, subnet configuration, and physical labs.'}
          </p>
        )}
      </aside>

      {/* Bottom Block Selector Tabs */}
      <nav className="rc-card rc-bottom-bar" aria-label="Campus Blocks">
        <div className="rc-bottom-title">
          <span>BLOCKS</span>
        </div>
        <div className="rc-tabs-track" ref={trackRef}>
          {TOUR_ORDER.map((id) => {
            const b = BUILDINGS[id];
            return (
              <div
                key={id}
                className={`rc-tab ${selected === id ? 'on' : ''}`}
                onClick={() => handleSelectBlock(selected === id ? null : id)}
                onMouseEnter={() => setHover(id)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="rc-dot" style={{ background: dotColor(b) }} />
                {b.label}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="rc-card rc-hint">
        Drag: Rotate · Right-drag: Pan · Scroll: Zoom in/out · Click building to inspect
      </div>
    </div>
  );
}
