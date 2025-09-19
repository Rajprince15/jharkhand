import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Text, 
  Sphere, 
  Box,
  Environment,
  OrbitControls,
  Html
} from '@react-three/drei';
import { XR, VRButton, Controllers, Hands } from '@react-three/xr';
import * as THREE from 'three';
import { Button } from './ui/button';
import { Headphones, X, Home, ArrowLeft, ArrowRight } from 'lucide-react';

// 360° Tourism Environment
const TourismEnvironment = ({ destination, destinations, currentIndex, onNavigate }) => {
  const sphereRef = useRef();
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.001; // Slow rotation
    }
  });

  return (
    <group>
      {/* Environment Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#3B82F6" />

      {/* 360° Background Sphere */}
      <Sphere ref={sphereRef} args={[50]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#87CEEB" 
          side={THREE.BackSide}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Destination Information Panel */}
      <group position={[0, 2, -8]}>
        <Box args={[6, 4, 0.1]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
        </Box>
        
        <Text
          position={[0, 1, 0.1]}
          fontSize={0.4}
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          {destination.name}
        </Text>

        <Text
          position={[0, 0.3, 0.1]}
          fontSize={0.2}
          color="#6b7280"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          {destination.location || 'Jharkhand, India'}
        </Text>

        <Text
          position={[0, -0.3, 0.1]}
          fontSize={0.15}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          {destination.description || 'Beautiful tourist destination in Jharkhand'}
        </Text>

        <Text
          position={[0, -1, 0.1]}
          fontSize={0.2}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          ⭐ {destination.rating || '4.5'} | {destination.category || 'Tourism'}
        </Text>
      </group>

      {/* Interactive Hotspots */}
      <InteractiveHotspot 
        position={[8, 0, 0]} 
        label="View Details" 
        color="#4F46E5"
        onClick={() => setSelectedHotspot('details')}
      />
      <InteractiveHotspot 
        position={[-8, 0, 0]} 
        label="Book Tour" 
        color="#10B981"
        onClick={() => setSelectedHotspot('booking')}
      />
      <InteractiveHotspot 
        position={[0, 0, 8]} 
        label="More Photos" 
        color="#F59E0B"
        onClick={() => setSelectedHotspot('photos')}
      />

      {/* Navigation Controls */}
      <group position={[0, -3, -6]}>
        {/* Previous Destination */}
        <InteractiveHotspot 
          position={[-3, 0, 0]} 
          label="Previous" 
          color="#6B7280"
          onClick={() => onNavigate('prev')}
        />
        
        {/* Home */}
        <InteractiveHotspot 
          position={[0, 0, 0]} 
          label="Exit VR" 
          color="#EF4444"
          onClick={() => onNavigate('exit')}
        />
        
        {/* Next Destination */}
        <InteractiveHotspot 
          position={[3, 0, 0]} 
          label="Next" 
          color="#6B7280"
          onClick={() => onNavigate('next')}
        />
      </group>

      {/* Destination Counter */}
      <Text
        position={[0, -4.5, -6]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {currentIndex + 1} / {destinations.length}
      </Text>

      {/* Floor Grid for Reference */}
      <group position={[0, -5, 0]}>
        <Box args={[100, 0.1, 100]}>
          <meshStandardMaterial 
            color="#E5E7EB" 
            transparent 
            opacity={0.2}
            wireframe
          />
        </Box>
      </group>
    </group>
  );
};

// Interactive Hotspot Component
const InteractiveHotspot = ({ position, label, color = "#10B981", onClick }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.3 : 1);
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Pulsing Ring Effect */}
      <mesh>
        <ringGeometry args={[0.5, 0.7, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <Text
        position={[0, -1, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {label}
      </Text>
    </group>
  );
};

// Loading Fallback
const LoadingFallback = () => (
  <Html center>
    <div className="text-white text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
      <p>Loading VR Experience...</p>
    </div>
  </Html>
);

const VRTourExperience = ({ 
  destinations = [], 
  selectedDestination, 
  isOpen, 
  onClose 
}) => {
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check VR support
    const checkVRSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsVRSupported(supported);
        } catch (err) {
          console.error('VR support check failed:', err);
          setError('VR not supported on this device');
        }
      } else {
        setError('WebXR not available in this browser');
      }
    };

    checkVRSupport();
  }, []);

  useEffect(() => {
    // Set starting destination if one is selected
    if (selectedDestination && destinations.length > 0) {
      const index = destinations.findIndex(d => d.id === selectedDestination.id);
      if (index >= 0) {
        setCurrentDestinationIndex(index);
      }
    }
  }, [selectedDestination, destinations]);

  const handleNavigate = (direction) => {
    if (direction === 'next') {
      setCurrentDestinationIndex((prev) => 
        prev >= destinations.length - 1 ? 0 : prev + 1
      );
    } else if (direction === 'prev') {
      setCurrentDestinationIndex((prev) => 
        prev <= 0 ? destinations.length - 1 : prev - 1
      );
    } else if (direction === 'exit') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentDestination = destinations[currentDestinationIndex] || destinations[0] || {
    name: 'Jharkhand Tourism',
    location: 'Jharkhand, India',
    description: 'Explore the beautiful state of Jharkhand',
    rating: 4.5,
    category: 'Tourism'
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <Headphones className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold mb-4">VR Not Available</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-2 text-sm text-gray-400 mb-8">
            <p>• Use a WebXR compatible browser (Chrome, Edge)</p>
            <p>• Connect a VR headset (Oculus, HTC Vive, etc.)</p>
            <p>• Ensure HTTPS connection for WebXR features</p>
          </div>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 text-white border-gray-600 hover:bg-gray-800"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* VR Status */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          VR Experience - {currentDestination.name}
        </div>
      </div>

      {/* Navigation Controls (2D overlay) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-4 bg-black bg-opacity-70 p-3 rounded-lg">
          <Button
            onClick={() => handleNavigate('prev')}
            size="sm"
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-white text-sm">
            {currentDestinationIndex + 1} / {Math.max(destinations.length, 1)}
          </div>
          
          <Button
            onClick={() => handleNavigate('next')}
            size="sm"
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-10 mb-16">
        <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg">
          <h4 className="font-semibold mb-2">VR Tourism Experience</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2">🥽 <strong>VR Controls:</strong></p>
              <ul className="text-xs space-y-1">
                <li>• Use VR controllers to point and select</li>
                <li>• Look around to explore 360° environment</li>
                <li>• Walk or teleport to move around</li>
              </ul>
            </div>
            <div>
              <p className="mb-2">🎮 <strong>Navigation:</strong></p>
              <ul className="text-xs space-y-1">
                <li>• Click hotspots to interact</li>
                <li>• Use navigation spheres to change destinations</li>
                <li>• Click "Exit VR" sphere to return</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas with XR */}
      <Canvas
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        style={{ height: '100%', width: '100%' }}
        gl={{ xr: { enabled: true } }}
      >
        <XR>
          <Controllers />
          <Hands />
          <Suspense fallback={<LoadingFallback />}>
            <TourismEnvironment
              destination={currentDestination}
              destinations={destinations}
              currentIndex={currentDestinationIndex}
              onNavigate={handleNavigate}
            />
          </Suspense>
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            enableRotate={true}
            maxDistance={20}
            minDistance={0.1}
          />
        </XR>
      </Canvas>

      {/* VR Button for WebXR */}
      {isVRSupported && (
        <div className="absolute bottom-20 right-4 z-10">
          <VRButton
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VRTourExperience;