import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import type { ThreeElements } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
    }
  }
}

export const Planet: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (meshRef.current) {
      meshRef.current.rotation.y = elapsedTime * 0.03; // Slower, more majestic
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = elapsedTime * 0.04;
    }
  });

  // Softer, cleaner atmosphere glow
  const atmosphereMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 5.0);
        // Using a sophisticated indigo/blue tint
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5; 
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
  }), []);

  return (
    <group>
      {/* Main Planet Sphere */}
      <mesh ref={meshRef} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[2, 128, 128]} /> {/* Higher poly for smoothness */}
        <meshStandardMaterial 
          map={colorMap}
          normalMap={normalMap}
          roughness={0.6} // More matte surface
          metalness={0.1}
          color="#cccccc" // Slightly brighter base
        />
      </mesh>

      {/* Specular Ocean Layer - Adds the shiny water effect */}
       <mesh rotation={[0, 0, 0.3]} scale={[1.001, 1.001, 1.001]}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial
          map={specularMap}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          color="#1e40af" // Deep blue reflection
          specular="#ffffff"
          shininess={50}
        />
      </mesh>

      {/* Clouds Layer */}
      <mesh ref={cloudsRef} scale={[1.015, 1.015, 1.015]}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent={true}
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          color="#ffffff"
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef} scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[2, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
    </group>
  );
};