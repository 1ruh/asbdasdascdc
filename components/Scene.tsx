import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { ThreeElements } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import { Planet } from './Planet';
import { SpaceDust } from './SpaceDust';
import * as THREE from 'three';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
    }
  }
}

const CameraController = () => {
  const mouse = useRef({ x: 0, y: 0 });

  useFrame(({ camera, mouse: r3fMouse }) => {
    // Very subtle, smooth parallax
    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, r3fMouse.x * 0.2, 0.05);
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, r3fMouse.y * 0.2, 0.05);

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.current.y, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export const Scene: React.FC = () => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping, 
        toneMappingExposure: 1.0 
      }}
      className="bg-transparent"
    >
      <PerspectiveCamera makeDefault position={[0, 0, 6.5]} fov={40} />
      <CameraController />
      
      {/* Premium Studio Lighting */}
      <ambientLight intensity={0.1} color="#ffffff" />
      {/* Main Key Light */}
      <directionalLight position={[10, 5, 5]} intensity={2.5} color="#ffffff" />
      {/* Rim Light for edge definition */}
      <spotLight position={[-10, 0, -5]} intensity={3} color="#4f46e5" angle={0.5} penumbra={1} />
      {/* Fill Light */}
      <pointLight position={[0, -10, 5]} intensity={0.5} color="#3b82f6" />

      {/* Objects */}
      <group position={[0, -0.8, 0]}>
        <Planet />
      </group>
      
      {/* Environment */}
      <SpaceDust />
      {/* Subtle background stars, not too overwhelming */}
      <Stars radius={300} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
      
      <fog attach="fog" args={['#030305', 5, 20]} />
    </Canvas>
  );
};