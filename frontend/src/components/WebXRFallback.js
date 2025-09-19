import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

const WebXRFallback = ({ destination, mode }) => {
  const [rotationY, setRotationY] = useState(0);
  const sphereRef = useRef();
  const boxRef = useRef();

  // Animate the fallback content
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.01;
    }
    if (boxRef.current) {
      boxRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
      boxRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      boxRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const FallbackContent = () => (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#3B82F6" />

      {/* Background */}
      <Sphere ref={sphereRef} args={[30]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#E0F2FE" 
          side={THREE.BackSide}
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Main Content */}
      {destination ? (
        <group>
          {/* Destination Preview */}
          <group position={[0, 1, -4]}>
            <Box ref={boxRef} args={[2, 1.2, 0.1]} position={[0, 0, 0]}>
              <meshStandardMaterial 
                color="#FFFFFF"
                transparent
                opacity={0.9}
              />
            </Box>
            
            <Text
              position={[0, 0.3, 0.1]}
              fontSize={0.25}
              color="#1F2937"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.8}
              font="/fonts/Inter-Bold.woff"
            >
              {destination.name}
            </Text>
            
            <Text
              position={[0, 0, 0.1]}
              fontSize={0.12}
              color="#6B7280"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.8}
            >
              {destination.location}
            </Text>
            
            <Text
              position={[0, -0.3, 0.1]}
              fontSize={0.15}
              color="#F59E0B"
              anchorX="center"
              anchorY="middle"
            >
              ★ {destination.rating} • {destination.category}
            </Text>
          </group>

          {/* Feature Showcase */}
          <group position={[0, -1, -3]}>
            {/* AR Feature Demo */}
            <group position={[-2, 0, 0]}>
              <Box args={[0.5, 0.5, 0.1]}>
                <meshStandardMaterial 
                  color="#3B82F6"
                  emissive="#3B82F6"
                  emissiveIntensity={0.2}
                />
              </Box>
              <Text
                position={[0, -0.5, 0]}
                fontSize={0.1}
                color="#3B82F6"
                anchorX="center"
                anchorY="middle"
              >
                AR Preview
              </Text>
            </group>

            {/* VR Feature Demo */}
            <group position={[2, 0, 0]}>
              <Sphere args={[0.3]}>
                <meshStandardMaterial 
                  color="#8B5CF6"
                  emissive="#8B5CF6"
                  emissiveIntensity={0.2}
                />
              </Sphere>
              <Text
                position={[0, -0.5, 0]}
                fontSize={0.1}
                color="#8B5CF6"
                anchorX="center"
                anchorY="middle"
              >
                VR Tour
              </Text>
            </group>

            {/* Center Info */}
            <Text
              position={[0, -1, 0]}
              fontSize={0.12}
              color="#6B7280" 
              anchorX="center"
              anchorY="middle"
              maxWidth={4}
            >
              WebXR not supported on this device.
              {'\n'}Try Chrome or Edge browser for full AR/VR experience.
            </Text>
          </group>
        </group>
      ) : (
        // No destination selected
        <group>
          <Text
            position={[0, 1, -3]}
            fontSize={0.4}
            color="#1F2937"
            anchorX="center"
            anchorY="middle"
            maxWidth={6}
          >
            AR/VR Tourism Experience
          </Text>
          
          <Text
            position={[0, 0, -3]}
            fontSize={0.2}
            color="#6B7280"
            anchorX="center"
            anchorY="middle"
            maxWidth={6}
          >
            Select a destination from the sidebar to preview
            {'\n'}immersive AR and VR content
          </Text>

          {/* Feature Icons */}
          <group position={[0, -1.5, -3]}>
            <Box args={[0.6, 0.6, 0.2]} position={[-1.5, 0, 0]}>
              <meshStandardMaterial 
                color="#3B82F6"
                emissive="#3B82F6"
                emissiveIntensity={0.1}
              />
            </Box>
            
            <Sphere args={[0.35]} position={[1.5, 0, 0]}>
              <meshStandardMaterial 
                color="#8B5CF6"
                emissive="#8B5CF6"
                emissiveIntensity={0.1}
              />
            </Sphere>
            
            <Text
              position={[-1.5, -0.6, 0]}
              fontSize={0.12}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
            >
              Augmented Reality
            </Text>
            
            <Text
              position={[1.5, -0.6, 0]}
              fontSize={0.12}
              color="#8B5CF6"
              anchorX="center"
              anchorY="middle"
            >
              Virtual Reality
            </Text>
          </group>
        </group>
      )}

      {/* Interactive Elements */}
      <group position={[0, -3, -2]}>
        {/* Floating Particles */}
        {Array.from({ length: 12 }, (_, i) => (
          <Sphere 
            key={i}
            args={[0.02]} 
            position={[
              Math.sin(i * 0.5) * 3,
              Math.sin(i * 0.8 + Date.now() * 0.001) * 0.5,
              Math.cos(i * 0.5) * 2
            ]}
          >
            <meshBasicMaterial 
              color={i % 2 === 0 ? "#3B82F6" : "#8B5CF6"}
              transparent
              opacity={0.6}
            />
          </Sphere>
        ))}
      </group>

      {/* Instructions */}
      <group position={[0, 2.5, -4]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.1}
          color="#9CA3AF"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          For the best experience, use a WebXR-compatible browser
          {'\n'}on a device with camera and sensors
        </Text>
      </group>
    </group>
  );

  return <FallbackContent />;
};

export default WebXRFallback;