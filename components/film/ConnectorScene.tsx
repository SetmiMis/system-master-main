"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Copied from setmi-overview (company reference site). drei <Html> labels removed: they throw on unmount when the film changes scene.
// Stylised BNC plug built from primitives (revolved profiles + cylinders). Built along +Y, laid on its side below.
const steel = { color: "#cfd6de", metalness: 1, roughness: 0.22 } as const;
const gold = { color: "#e0b040", metalness: 1, roughness: 0.28 } as const;

function Connector() {
  const nut = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0.92, -0.9], [1.08, -0.9], [1.08, 0.85], [1.02, 1.0], [0.92, 1.0], [0.92, -0.9],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        64,
      ),
    [],
  );
  const shell = useMemo(
    () =>
      new THREE.LatheGeometry(
        [[0.5, -0.9], [0.62, -0.9], [0.62, 1.25], [0.55, 1.25], [0.5, 1.15], [0.5, -0.9]].map(([x, y]) => new THREE.Vector2(x, y)),
        48,
      ),
    [],
  );
  const tail = useMemo(
    () =>
      new THREE.LatheGeometry(
        [[0, -2.7], [0.55, -2.7], [0.55, -2.55], [0.5, -2.45], [0.62, -2.35], [0.62, -2.1], [0.5, -2.0], [0.66, -1.9], [0.66, -1.6], [0.85, -1.6], [0.85, -0.9], [0, -0.9]].map(([x, y]) => new THREE.Vector2(x, y)),
        48,
      ),
    [],
  );

  const knurl = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = knurl.current;
    if (!m) return;
    const d = new THREE.Object3D();
    const n = 36;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      d.position.set(Math.cos(a) * 1.09, 0.05, Math.sin(a) * 1.09);
      d.rotation.set(0, -a, 0);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group rotation={[0, 0, -Math.PI / 2]} position={[1.3, 0, 0]}>
      <mesh geometry={tail}><meshStandardMaterial {...steel} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={nut}><meshStandardMaterial {...steel} side={THREE.DoubleSide} /></mesh>
      <instancedMesh ref={knurl} args={[undefined, undefined, 36]}>
        <boxGeometry args={[0.06, 1.2, 0.05]} />
        <meshStandardMaterial color="#9aa4af" metalness={1} roughness={0.35} />
      </instancedMesh>
      {[0, Math.PI].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.97, 0.72, Math.sin(a) * 0.97]} rotation={[0, -a, 0]}>
          <boxGeometry args={[0.12, 0.42, 0.22]} />
          <meshStandardMaterial color="#1b2733" metalness={0.4} roughness={0.7} />
        </mesh>
      ))}
      <mesh geometry={shell}><meshStandardMaterial {...steel} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.49, 0.49, 1.98, 48]} />
        <meshStandardMaterial color="#f1f1ec" metalness={0} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.5, 24]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.1, 24, 16]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <mesh position={[0, -3.4, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 1.5, 32]} />
        <meshStandardMaterial color="#14181d" metalness={0} roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function ConnectorScene() {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.0, 8.2], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        // horizontal drag rotates, vertical swipe still scrolls the page on phones
        gl.domElement.style.touchAction = "pan-y";
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <pointLight position={[-5, -2, 4]} intensity={30} color="#2fb6a1" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 4]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-6, 0, 2]} scale={[2, 6, 1]} color="#7fe3d3" />
        <Lightformer form="rect" intensity={2} position={[6, 1, -2]} scale={[2, 5, 1]} color="#9cc7ff" />
        <Lightformer form="ring" intensity={1.5} position={[0, -3, 5]} scale={4} />
      </Environment>
      <Connector />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={!reduced} autoRotateSpeed={1.1} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
    </Canvas>
  );
}
