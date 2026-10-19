"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import map from "@/content/customer-map.json";

// Equirectangular projection centred on India, with longitude scaled by cos(lat) so the shape is not stretched.
const K = 0.42;
const project = (lat: number, lng: number): [number, number] => [(lng - 82.5) * K * Math.cos((22 * Math.PI) / 180), (lat - 22) * K];
const HQ: [number, number] = project(28.656, 77.231); // Old Lajpat Rai Market, Delhi

function Land() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(map.land.length * 3);
    map.land.forEach(([lat, lng], i) => { const [x, y] = project(lat, lng); pos.set([x, y, 0], i * 3); });
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#4c9fc4" size={0.055} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

/** Customer cells rise as glowing pillars (height ~ sqrt(count)) while the camera moves past them. */
function Customers({ progress }: { progress: number }) {
  const max = Math.sqrt(map.customers[0]?.[2] ?? 1);
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    group.current?.children.forEach((c, i) => {
      const s = 1 + Math.sin(clock.elapsedTime * 2 + i) * 0.08;
      c.scale.set(s, s, 1);
    });
  });
  return (
    <group ref={group}>
      {map.customers.map(([lat, lng, n]) => {
        const [x, y] = project(lat, lng);
        // a horizontal sweep line runs from 37°N to 8°N; pillars grow once it has passed them
        const sweepLat = 37 - progress * 31;
        const reveal = THREE.MathUtils.clamp((lat - sweepLat + 3) / 3, 0, 1);
        const k = Math.sqrt(n) / max;
        const h = (0.08 + k * 1.3) * reveal;
        return (
          <mesh key={`${lat},${lng}`} position={[x, y, h / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03 + k * 0.05, 0.03 + k * 0.05, Math.max(h, 0.001), 10]} />
            <meshBasicMaterial color={k > 0.45 ? "#5fd6c3" : "#2fb6a1"} transparent opacity={0.55 + k * 0.45} />
          </mesh>
        );
      })}
      <mesh position={[HQ[0], HQ[1], 0.02]}>
        <ringGeometry args={[0.16, 0.22, 40]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/** Camera tilts over the map and travels from Kashmir to Kanyakumari as progress goes 0 → 1. */
function Rig({ progress }: { progress: number }) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const y = THREE.MathUtils.lerp(4.5, -4.6, progress);
    target.set(0, y, 0);
    camera.position.lerp(new THREE.Vector3(0.3, y - 5.2, 6.2), 0.06);
    camera.lookAt(target);
  });
  return null;
}

export default function CustomerMap({ progress }: { progress: number }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, -1, 9], fov: 45 }} gl={{ antialias: true, alpha: true }} aria-label="Map of India with customer locations">
      <Land />
      <Customers progress={progress} />
      <Rig progress={progress} />
    </Canvas>
  );
}
