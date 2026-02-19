import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
    }
  }
}

const NODE_COUNT = 40;

export const NetworkNodes: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const nodes = useMemo(() => {
    return new Array(NODE_COUNT).fill(0).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4 + 2 // Keep mostly in front/around
      ).normalize().multiplyScalar(2.5 + Math.random() * 2),
      rotationSpeed: Math.random() * 0.02,
      scale: Math.random() * 0.5 + 0.1,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <group key={i} position={node.position}>
          <mesh rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
            <icosahedronGeometry args={[node.scale * 0.2, 0]} />
            <meshBasicMaterial 
              color="#00f0ff" 
              wireframe 
              transparent 
              opacity={0.3} 
            />
          </mesh>
          <mesh>
             <sphereGeometry args={[0.02, 8, 8]} />
             <meshBasicMaterial color="#00f0ff" />
          </mesh>
          {/* Connecting lines could be complex, sticking to floating geometry for performance and clean look */}
        </group>
      ))}
      
      {/* Orbital Ring 1 */}
      <mesh rotation={[1.5, 0, 0]}>
        <torusGeometry args={[3.5, 0.005, 16, 100]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} />
      </mesh>
      
      {/* Orbital Ring 2 */}
      <mesh rotation={[1.8, 0.5, 0]}>
        <torusGeometry args={[4.2, 0.005, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};