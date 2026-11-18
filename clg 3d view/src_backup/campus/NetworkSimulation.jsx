import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { CORE_ROUTER, NETWORK_NODES, TRAFFIC_TYPES } from './networkConfig';

// ── Materials ───────────────────────────────────────────────────────────────
const serverBoxMat = new THREE.MeshStandardMaterial({
  color: '#0a0e17',
  roughness: 0.7,
  metalness: 0.5,
});
const serverGlowMat = new THREE.MeshStandardMaterial({
  color: '#38bdf8',
  emissive: '#38bdf8',
  emissiveIntensity: 3.0,
  toneMapped: false,
});

// ── Moving Packet Stream along a 3D Spline Curve ────────────────────────────
function ConduitPackets({ curve, trafficType, packetCount = 6 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cfg = TRAFFIC_TYPES[trafficType] || TRAFFIC_TYPES.normal;

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: cfg.color,
    emissive: cfg.color,
    emissiveIntensity: 4.5,
    roughness: 0.1,
    toneMapped: false,
  }), [cfg]);

  // Larger, bold glowing packet spheres
  const geo = useMemo(() => new THREE.SphereGeometry(0.24, 14, 14), []);

  useFrame(({ clock }) => {
    if (!meshRef.current || !curve) return;
    const time = clock.getElapsedTime() * cfg.speed * 0.42;
    for (let i = 0; i < packetCount; i++) {
      const t = (time + i / packetCount) % 1.0;
      const pt = curve.getPoint(t);
      // Position slightly on top of the dark conduit for maximum optical contrast
      dummy.position.set(pt.x, pt.y + 0.05, pt.z);
      // Energetic pulse scale
      const s = 1.0 + Math.sin(time * 9 + i * 1.5) * 0.22;
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

// ── Dark High-Visibility LAN Conduit (Dark Carbon Raceway + Glowing Fiber Core) ─
function LanConduit({ path, trafficType }) {
  const curve = useMemo(() => {
    const points = path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.2);
  }, [path]);

  // 1. Dark high-contrast outer conduit casing (broad and distinct against grass/roads)
  const outerCasingGeo = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.14, 8, false), [curve]);
  const outerCasingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#090d15',
    roughness: 0.85,
    metalness: 0.4,
  }), []);

  // 2. Luminous neon fiber core running inside the dark conduit
  const innerCoreGeo = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.05, 8, false), [curve]);
  const cfg = TRAFFIC_TYPES[trafficType] || TRAFFIC_TYPES.normal;

  const innerCoreMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: cfg.color,
    emissive: cfg.color,
    emissiveIntensity: 2.8,
    roughness: 0.2,
    toneMapped: false,
  }), [cfg]);

  return (
    <group>
      {/* Dark high-visibility outer conduit track */}
      <mesh geometry={outerCasingGeo} material={outerCasingMat} receiveShadow castShadow />
      {/* Luminous neon fiber stream */}
      <mesh geometry={innerCoreGeo} material={innerCoreMat} position={[0, 0.03, 0]} />
      {/* Bright moving data packets riding on top of the dark conduit */}
      <ConduitPackets curve={curve} trafficType={trafficType} packetCount={6} />
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
function BuildingTelemetryBadge({ node, onSelectNode }) {
  const cfg = TRAFFIC_TYPES[node.trafficType] || TRAFFIC_TYPES.normal;

  return (
    <Html
      position={[node.x, node.roofY + 2.2, node.z]}
      center
      distanceFactor={65}
      zIndexRange={[40, 0]}
      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
    >
      <div
        onClick={() => onSelectNode?.(node.id)}
        style={{
          background: 'rgba(8, 14, 28, 0.92)',
          border: `1.5px solid ${cfg.color}`,
          boxShadow: `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${cfg.glow}`,
          borderRadius: 10,
          padding: '6px 12px',
          color: '#ffffff',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backdropFilter: 'blur(8px)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {/* Status Dot */}
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: cfg.color,
            boxShadow: `0 0 10px ${cfg.color}`,
            flex: 'none',
          }}
        />

        {/* Node Label */}
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.04em' }}>
          {node.label}
        </span>

        {/* Labs & PCs / Specs pill */}
        <span
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 11,
            color: '#a5b4fc',
            fontWeight: 600,
          }}
        >
          {node.labs}
        </span>

        {/* WiFi APs & Device count */}
        <span
          style={{
            background: 'rgba(34, 211, 238, 0.12)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: 6,
            padding: '2px 7px',
            fontSize: 11,
            color: '#38bdf8',
            fontWeight: 600,
          }}
        >
          📶 {node.totalAps} APs • {node.devices} Devs
        </span>

        {/* Speed / Throughput */}
        <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700 }}>
          {node.throughput}
        </span>
      </div>
    </Html>
  );
}

// ── Core Router Data Center Hub Component ───────────────────────────────────
function CoreRouterHub({ showLabel }) {
  const beaconRef = useRef();

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      beaconRef.current.rotation.y = clock.getElapsedTime() * 1.5;
    }
  });

  return (
    <group position={[CORE_ROUTER.x, CORE_ROUTER.y, CORE_ROUTER.z]}>
      {/* Central Server Housing Cube */}
      <mesh material={serverBoxMat} position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.3, 0.9, 1.3]} />
      </mesh>
      {/* Glowing Status Bezel */}
      <mesh material={serverGlowMat} position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.08, 16]} />
      </mesh>
      {/* Rotating Cyber Core Beacon */}
      <group ref={beaconRef} position={[0, 1.15, 0]}>
        <mesh material={serverGlowMat}>
          <octahedronGeometry args={[0.22, 0]} />
        </mesh>
        <pointLight color="#38bdf8" intensity={1.8} distance={8} decay={2} />
      </group>

      {/* Core Server Label (only when selected) */}
      {showLabel && (
        <Html position={[0, 1.9, 0]} center distanceFactor={60} zIndexRange={[45, 0]}>
          <div style={{
            background: 'rgba(8, 14, 28, 0.92)',
            border: '1.5px solid #38bdf8',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.5)',
            borderRadius: 8,
            padding: '4px 10px',
            color: '#ffffff',
            font: 'bold 11px system-ui',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
            <span>MAIN CORE ROUTER & DATA CENTER</span>
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Full Network Simulation Layer (Permanently Active) ───────────────────────
export default function NetworkSimulation({ selectedId, onSelectNode }) {
  return (
    <group name="campus-network-simulation">
      {/* Central Core Data Center */}
      <CoreRouterHub showLabel={selectedId === 'admin' || selectedId === 'core-router'} />

      {/* LAN Fiber Conduits & Moving Packets to each Block */}
      {NETWORK_NODES.map((node) => (
        <React.Fragment key={node.id}>
          {/* Fiber Conduits + Moving Data Packets */}
          <LanConduit path={node.path} trafficType={node.trafficType} />

          {/* Building Distribution Switch Box */}
          <mesh position={[node.x, 0.25, node.z]} material={serverBoxMat} castShadow>
            <boxGeometry args={[0.65, 0.5, 0.65]} />
          </mesh>

          {/* Radiating Floor WiFi Pulse Waves */}
          <WifiPulseRings
            position={[node.x, 0.38, node.z]}
            color={TRAFFIC_TYPES[node.trafficType]?.color || '#38bdf8'}
          />

          {/* Overhead Telemetry Badge - Only visible when this block is clicked */}
          {selectedId === node.id && (
            <BuildingTelemetryBadge node={node} onSelectNode={onSelectNode} />
          )}
        </React.Fragment>
      ))}
    </group>
  );
}
