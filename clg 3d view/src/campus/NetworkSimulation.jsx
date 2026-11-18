import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CORE_ROUTER, NETWORK_NODES, TRAFFIC_TYPES } from './networkConfig';

// ── Server Rack Materials ──────────────────────────────────────────────────
const serverBoxMat = new THREE.MeshStandardMaterial({
  color: '#070b13',
  roughness: 0.7,
  metalness: 0.6,
});
const serverGlowMat = new THREE.MeshStandardMaterial({
  color: '#38bdf8',
  emissive: '#38bdf8',
  emissiveIntensity: 3.5,
  toneMapped: false,
});
const serverThreatMat = new THREE.MeshStandardMaterial({
  color: '#ef4444',
  emissive: '#ef4444',
  emissiveIntensity: 4.0,
  toneMapped: false,
});

// ── Moving Packet Stream along 3D Conduit Splines ──────────────────────────
function ConduitPackets({ curve, trafficType, packetCount = 6, attackMode = false }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // If attackMode is active on threat nodes, speed up and glow bright red
  const effectiveType = (attackMode && trafficType === 'threat') ? 'threat' : trafficType;
  const cfg = TRAFFIC_TYPES[effectiveType] || TRAFFIC_TYPES.normal;

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: cfg.color,
    emissive: cfg.color,
    emissiveIntensity: 4.8,
    roughness: 0.1,
    toneMapped: false,
  }), [cfg]);

  // Glowing packet spheres
  const geo = useMemo(() => new THREE.SphereGeometry(0.24, 14, 14), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !curve) return;
    const time = clock.getElapsedTime() * cfg.speed * 0.42;
    for (let i = 0; i < packetCount; i++) {
      const t = (time + i / packetCount) % 1.0;
      const pt = curve.getPoint(t);
      dummy.position.set(pt.x, pt.y + 0.06, pt.z);
      const s = 1.0 + Math.sin(time * 9 + i * 1.5) * 0.24;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, mat, packetCount]} />
  );
}

// ── Dark High-Visibility LAN Fiber Conduit ─────────────────────────────────
function LanConduit({ path, trafficType, attackMode = false }) {
  const curve = useMemo(() => {
    const points = path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.2);
  }, [path]);

  // Outer dark protective casing
  const outerCasingGeo = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.14, 8, false), [curve]);
  const outerCasingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#090d15',
    roughness: 0.85,
    metalness: 0.4,
  }), []);

  // Luminous fiber core
  const innerCoreGeo = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.05, 8, false), [curve]);
  const effectiveType = (attackMode && trafficType === 'threat') ? 'threat' : trafficType;
  const cfg = TRAFFIC_TYPES[effectiveType] || TRAFFIC_TYPES.normal;

  const innerCoreMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: cfg.color,
    emissive: cfg.color,
    emissiveIntensity: 3.2,
    roughness: 0.2,
    toneMapped: false,
  }), [cfg]);

  return (
    <group>
      <mesh geometry={outerCasingGeo} material={outerCasingMat} receiveShadow castShadow />
      <mesh geometry={innerCoreGeo} material={innerCoreMat} position={[0, 0.03, 0]} />
      <ConduitPackets curve={curve} trafficType={trafficType} packetCount={6} attackMode={attackMode} />
    </group>
  );
}

// ── Radiating WiFi Wave Rings (Floors / Access Points) ──────────────────────
function WifiPulseRings({ position, color = '#38bdf8' }) {
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1.current) {
      const s1 = (t * 0.8) % 1.0;
      ring1.current.scale.set(1 + s1 * 5, 1 + s1 * 5, 1);
      ring1.current.material.opacity = (1 - s1) * 0.55;
    }
    if (ring2.current) {
      const s2 = (t * 0.8 + 0.5) % 1.0;
      ring2.current.scale.set(1 + s2 * 5, 1 + s2 * 5, 1);
      ring2.current.material.opacity = (1 - s2) * 0.55;
    }
  });

  const mat1 = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide }), [color]);
  const mat2 = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide }), [color]);

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ring1} material={mat1}>
        <ringGeometry args={[0.5, 0.65, 32]} />
      </mesh>
      <mesh ref={ring2} material={mat2}>
        <ringGeometry args={[0.5, 0.65, 32]} />
      </mesh>
    </group>
  );
}

// ── Building Telemetry Badge (Overhead Floating UI) ─────────────────────────
function BuildingTelemetryBadge({ node, onSelectNode, attackMode = false }) {
  const effectiveType = (attackMode && node.id === 'a') ? 'threat' : node.trafficType;
  const cfg = TRAFFIC_TYPES[effectiveType] || TRAFFIC_TYPES.normal;

  return (
    <Html
      position={[node.x, node.roofY + 2.2, node.z]}
      center
      distanceFactor={48}
      zIndexRange={[100, 0]}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectNode) onSelectNode(node.id);
        }}
        style={{
          background: 'rgba(8, 14, 28, 0.94)',
          border: `1.5px solid ${cfg.color}`,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px ${cfg.glow}`,
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#f8fafc',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: '11px',
          minWidth: '150px',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
          userSelect: 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
          <b style={{ fontSize: '12px', color: '#fff', letterSpacing: '0.02em' }}>{node.label}</b>
          <span style={{
            fontSize: '9px',
            fontWeight: 800,
            color: cfg.color,
            background: 'rgba(255,255,255,0.08)',
            padding: '2px 5px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {effectiveType === 'threat' ? '🚨 THREAT' : effectiveType === 'quarantined' ? '🔒 JAILED' : 'NORMAL'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>
          <span>🌐 {node.ip}</span>
          <span style={{ color: cfg.color, fontWeight: 700 }}>⚡ {node.throughput}</span>
        </div>
        <div style={{ fontSize: '9.5px', color: '#cbd5e1', marginTop: '3px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3px' }}>
          {node.labs}
        </div>
      </div>
    </Html>
  );
}

// ── Central Server Rack & Perimeter Firewall Visual ────────────────────────
function CentralServerRack({ position = [-24.45, 0.35, -2.0], attackMode = false }) {
  return (
    <group position={position}>
      {/* Heavy Steel Server Cabinet */}
      <mesh material={serverBoxMat} position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.8, 1.2]} />
      </mesh>
      {/* Front Server Bays & LEDs */}
      <mesh material={attackMode ? serverThreatMat : serverGlowMat} position={[0, 1.4, 0.62]}>
        <planeGeometry args={[1.3, 2.4]} />
      </mesh>
      {/* Telecom Dish / Antenna on top */}
      <mesh position={[0, 3.0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={attackMode ? '#ef4444' : '#38bdf8'} emissive={attackMode ? '#ef4444' : '#38bdf8'} emissiveIntensity={3.0} />
      </mesh>
      {/* Floating Router Badge */}
      <Html position={[0, 4.0, 0]} center distanceFactor={42}>
        <div style={{
          background: 'rgba(8, 14, 28, 0.95)',
          border: '1.5px solid #38bdf8',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.45)',
          borderRadius: '20px',
          padding: '4px 12px',
          color: '#fff',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          fontSize: '11px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          🛡️ CORE ROUTER & PERIMETER FIREWALL (10 Gbps)
        </div>
      </Html>
    </group>
  );
}

// ── Main Network Simulation Export ─────────────────────────────────────────
export default function NetworkSimulation({
  showPackets = true,
  showLabels = true,
  attackMode = false,
  onSelectNode,
}) {
  return (
    <group name="sentinel-network-layer">
      {/* Core Router Gateway */}
      <CentralServerRack position={[CORE_ROUTER.x, CORE_ROUTER.y, CORE_ROUTER.z]} attackMode={attackMode} />

      {/* Optical Fiber Conduits & Packet Streams */}
      {showPackets && NETWORK_NODES.map((node) => (
        <LanConduit
          key={`conduit-${node.id}`}
          path={node.path}
          trafficType={node.trafficType}
          attackMode={attackMode}
        />
      ))}

      {/* Building WiFi Pulse Rings */}
      {NETWORK_NODES.map((node) => {
        const effectiveType = (attackMode && node.id === 'a') ? 'threat' : node.trafficType;
        const color = TRAFFIC_TYPES[effectiveType]?.color || '#38bdf8';
        return (
          <WifiPulseRings
            key={`wifi-${node.id}`}
            position={[node.x, node.roofY + 0.1, node.z]}
            color={color}
          />
        );
      })}

      {/* Overhead Telemetry Badges */}
      {showLabels && NETWORK_NODES.map((node) => (
        <BuildingTelemetryBadge
          key={`badge-${node.id}`}
          node={node}
          onSelectNode={onSelectNode}
          attackMode={attackMode}
        />
      ))}
    </group>
  );
}
