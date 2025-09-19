import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
  Text, 
  OrbitControls, 
  Sky, 
  Environment, 
  Sphere, 
  Html,
  useTexture,
  Plane
} from '@react-three/drei';
import { XR, Controllers, Hands, VRButton } from '@react-three/xr';
import { TextureLoader, DoubleSide } from 'three';
import { Button } from './ui/button';
import { VrHeadset, Eye, EyeOff, Home, ArrowLeft, ArrowRight } from 'lucide-react';

// 360° Panoramic Destination Scene
const PanoramicScene = ({ destination }) => {
  const meshRef = useRef();
  
  // For demo purposes, using a procedural texture
  // In production, you'd load actual 360° photos of destinations
  const texture = useTexture('/api/placeholder/2048/1024'); // 360° panoramic image

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001; // Slow rotation for immersion
    }
  });

  return (
    <group>
      {/* 360° Panoramic Sphere */}
      <Sphere ref={meshRef} args={[50, 60, 40]}>
        <meshBasicMaterial 
          map={texture} 
          side={DoubleSide}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Destination Information Panel */}
      <group position={[0, 2, -8]}>
        <Plane args={[6, 4]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
        </Plane>
        
        <Text
          position={[0, 1, 0.01]}
          fontSize={0.4}
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          {destination.name}
        </Text>

        <Text
          position={[0, 0.3, 0.01]}
          fontSize={0.2}
          color="#6b7280"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          {destination.location}
        </Text>

        <Text
          position={[0, -0.3, 0.01]}
          fontSize={0.15}
          color="#374151"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
        >
          {destination.description}
        </Text>

        <Text
          position={[0, -1, 0.01]}
          fontSize={0.2}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          ⭐ {destination.rating} | {destination.category}
        </Text>
      </group>

      {/* Interactive Hotspots */}
      <InteractiveHotspot position={[5, 0, -10]} label="View Details" />
      <InteractiveHotspot position={[-5, 0, -10]} label="Book Now" />
      <InteractiveHotspot position={[0, -2, -10]} label="More Photos" />
    </group>
  );
};

// Interactive Hotspot Component
const InteractiveHotspot = ({ position, label, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1);
      meshRef.current.rotation.y = state.clock.elapsedTime;
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
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#4ade80" : "#10b981"} 
          emissive={hovered ? "#10b981" : "#065f46"}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
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

// Virtual Tour Environment
const VirtualTour = ({ destinations, currentDestinationIndex, onNavigate }) => {
  const currentDestination = destinations[currentDestinationIndex] || destinations[0];

  return (
    <>
      <Controllers />
      <Hands />
      
      {/* Environment lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      
      {/* Sky environment */}
      <Sky sunPosition={[100, 20, 100]} />
      
      {/* Current destination panoramic scene */}
      <PanoramicScene destination={currentDestination} />

      {/* Navigation Controls in VR */}
      <group position={[0, -3, -5]}>
        {/* Previous Destination */}
        <InteractiveHotspot 
          position={[-3, 0, 0]} 
          label="Previous" 
          onClick={() => onNavigate('prev')}
        />
        
        {/* Home/Exit */}
        <InteractiveHotspot 
          position={[0, 0, 0]} 
          label="Home" 
          onClick={() => onNavigate('home')}
        />
        
        {/* Next Destination */}
        <InteractiveHotspot 
          position={[3, 0, 0]} 
          label="Next" 
          onClick={() => onNavigate('next')}
        />
      </group>

      {/* Destination Counter */}
      <Text
        position={[0, -4, -5]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {currentDestinationIndex + 1} / {destinations.length}
      </Text>
    </>
  );
};

const VRExperience = ({ 
  destinations = [], 
  selectedDestination, 
  isVRActive, 
  onVRToggle 
}) => {
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check VR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setIsSupported(supported);
      }).catch((err) => {
        setError('VR not supported on this device');
        console.error('VR support check failed:', err);
      });
    } else {
      setError('WebXR not supported in this browser');
    }
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
    } else if (direction === 'home') {
      onVRToggle(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-6">
          <VrHeadset className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">VR Not Available</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Try using a VR-compatible browser or device
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* VR Toggle Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={() => onVRToggle(!isVRActive)}
          className={`${
            isVRActive 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          size="sm"
        >
          <VrHeadset className="h-4 w-4 mr-2" />
          {isVRActive ? 'Exit VR' : 'Enter VR'}
        </Button>
      </div>

      {/* VR Status and Info */}
      {isVRActive && (
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            VR Active - {destinations[currentDestinationIndex]?.name}
          </div>
        </div>
      )}

      {/* Navigation Controls (2D overlay) */}
      {!isVRActive && destinations.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
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
              {currentDestinationIndex + 1} / {destinations.length}
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
      )}

      {/* Instructions */}
      {!isVRActive && (
        <div className="absolute bottom-4 left-4 right-4 z-40 mb-16">
          <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg">
            <h4 className="font-semibold mb-2">VR Tourism Experience</h4>
            <p className="text-sm mb-2">
              Explore Jharkhand destinations in immersive virtual reality.
            </p>
            <ul className="text-xs space-y-1">
              <li>• Use VR controllers to interact with hotspots</li>
              <li>• Look around to explore the 360° environment</li>
              <li>• Navigate between destinations using the control spheres</li>
            </ul>
          </div>
        </div>
      )}

      {/* 3D Canvas with XR */}
      <Canvas
        camera={{ position: [0, 0, 0.1], fov: 75 }}
        style={{ background: '#000' }}
      >
        <XR>
          <Suspense fallback={null}>
            <VirtualTour
              destinations={destinations}
              currentDestinationIndex={currentDestinationIndex}
              onNavigate={handleNavigate}
            />
          </Suspense>
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            enableRotate={!isVRActive}
            maxDistance={20}
            minDistance={0.1}
          />
        </XR>
      </Canvas>

      {/* VR Button for WebXR */}
      {isSupported && (
        <div className="absolute bottom-20 right-4 z-50">
          <VRButton
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VRExperience;