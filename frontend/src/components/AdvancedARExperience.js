import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Box, Plane, Html } from '@react-three/drei';
import { Button } from './ui/button';
import { Camera, X, MapPin, Navigation, Compass } from 'lucide-react';
import * as THREE from 'three';

// AR Location Marker Component
const ARLocationMarker = ({ destination, position, distance, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* AR Pin Marker */}
      <group
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
        scale={hovered ? 1.2 : 1}
      >
        {/* Pin Base */}
        <Sphere args={[0.1, 16, 16]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#10b981" />
        </Sphere>
        
        {/* Pin Stick */}
        <Box args={[0.02, 0.3, 0.02]} position={[0, 0.15, 0]}>
          <meshStandardMaterial color="#059669" />
        </Box>

        {/* Pulsing Ring */}
        <Sphere args={[0.3, 32, 16]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            color="#10b981" 
            transparent 
            opacity={0.2}
            wireframe
          />
        </Sphere>
      </group>

      {/* Distance Label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.08}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        {distance}km
      </Text>

      {/* Info Panel (shows on hover) */}
      {hovered && (
        <group position={[0.5, 0.5, 0]}>
          <Plane args={[1.5, 0.8]}>
            <meshStandardMaterial color="#ffffff" transparent opacity={0.95} />
          </Plane>
          
          <Text
            position={[0, 0.2, 0.01]}
            fontSize={0.08}
            color="#1f2937"
            anchorX="center"
            maxWidth={1.3}
          >
            {destination.name}
          </Text>
          
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.06}
            color="#6b7280"
            anchorX="center"
            maxWidth={1.3}
          >
            📍 {destination.location}
          </Text>
          
          <Text
            position={[0, -0.2, 0.01]}
            fontSize={0.06}
            color="#f59e0b"
            anchorX="center"
          >
            ⭐ {destination.rating} • {destination.category}
          </Text>
        </group>
      )}
    </group>
  );
};

// AR Compass Component
const ARCompass = () => {
  const compassRef = useRef();

  useFrame((state) => {
    if (compassRef.current) {
      compassRef.current.rotation.z = -state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group position={[2, 1, -1]}>
      <Sphere args={[0.2, 32, 16]} ref={compassRef}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} />
      </Sphere>
      
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.06}
        color="#3b82f6"
        anchorX="center"
      >
        N ↑
      </Text>
    </group>
  );
};

// AR Scene Component
const ARScene = ({ destinations, onDestinationClick }) => {
  return (
    <group>
      {/* AR Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />

      {/* Ground Reference Plane (invisible) */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1, 0]}
        visible={false}
      />

      {/* AR Location Markers */}
      {destinations.slice(0, 8).map((destination, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const radius = 2 + (index % 3) * 0.5; // Varied distances
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.random() * 0.5; // Varied heights
        
        const distance = (radius * 0.8 + Math.random() * 0.4).toFixed(1);
        
        return (
          <ARLocationMarker
            key={destination.id || index}
            destination={destination}
            position={[x, y, z]}
            distance={distance}
            onClick={() => onDestinationClick(destination)}
          />
        );
      })}

      {/* AR Compass */}
      <ARCompass />

      {/* AR Status Panel */}
      <group position={[0, 2.5, -3]}>
        <Plane args={[3, 0.8]}>
          <meshStandardMaterial color="#1f2937" transparent opacity={0.9} />
        </Plane>
        
        <Text
          position={[0, 0.15, 0.01]}
          fontSize={0.12}
          color="white"
          anchorX="center"
        >
          AR Tourism Mode Active
        </Text>
        
        <Text
          position={[0, -0.05, 0.01]}
          fontSize={0.08}
          color="#9ca3af"
          anchorX="center"
        >
          {destinations.length} attractions detected nearby
        </Text>
        
        <Text
          position={[0, -0.25, 0.01]}
          fontSize={0.06}
          color="#10b981"
          anchorX="center"
        >
          👆 Tap green markers to explore
        </Text>
      </group>
    </group>
  );
};

const AdvancedARExperience = ({ destinations = [], isOpen, onClose, onDestinationSelect }) => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('prompt');

  // Check AR support and camera permissions
  useEffect(() => {
    const checkARCapabilities = async () => {
      // Check WebXR AR support
      if ('xr' in navigator && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(supported);
        } catch (err) {
          console.warn('WebXR AR not supported:', err);
        }
      }

      // Check camera access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraPermission('granted');
          stream.getTracks().forEach(track => track.stop()); // Stop the stream
        } catch (err) {
          setCameraPermission('denied');
          setError('Camera access required for AR experience');
        }
      } else {
        setError('Camera not available on this device');
      }
    };

    if (isOpen) {
      checkARCapabilities();
    }
  }, [isOpen]);

  const handleDestinationClick = (destination) => {
    onDestinationSelect && onDestinationSelect(destination);
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      setError(null);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setCameraPermission('denied');
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  if (!isOpen) return null;

  // Camera permission error
  if (cameraPermission === 'denied' || error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold mb-4">Camera Access Required</h3>
          <p className="text-gray-300 mb-6">
            {error || 'AR experience needs camera access to overlay destination markers on the real world.'}
          </p>
          
          <div className="space-y-3 text-sm text-gray-400 mb-8">
            <p>✓ Point camera at surroundings</p>
            <p>✓ See destination markers in AR</p>
            <p>✓ Tap markers for information</p>
            <p>✓ Works best in well-lit areas</p>
          </div>

          <div className="flex space-x-3">
            {cameraPermission === 'denied' && (
              <Button 
                onClick={requestCameraPermission}
                className="bg-green-600 hover:bg-green-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                Enable Camera
              </Button>
            )}
            <Button onClick={onClose} variant="outline" className="text-white border-white">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Close Button */}
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-red-600 text-white hover:bg-red-700"
        size="sm"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* AR Status */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          AR Mode - {destinations.length} nearby attractions
        </div>
      </div>

      {/* AR Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-4 bg-black bg-opacity-70 p-3 rounded-lg">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Navigation className="h-4 w-4 mr-2" />
            Directions
          </Button>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Compass className="h-4 w-4 mr-2" />
            Recenter
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-green-400" />
            AR Tourism Guide
          </h4>
          <p className="text-sm mb-2">
            Move your device to explore Jharkhand destinations in augmented reality.
          </p>
          <div className="text-xs space-y-1 text-gray-300">
            <p>• Green markers show nearby attractions</p>
            <p>• Tap markers to view destination details</p>
            <p>• Distance indicators help with navigation</p>
            <p>• Blue compass shows direction</p>
          </div>
        </div>
      </div>

      {/* AR Canvas */}
      <Canvas 
        camera={{ position: [0, 0, 0], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ARScene 
          destinations={destinations} 
          onDestinationClick={handleDestinationClick}
        />
      </Canvas>

      {/* WebXR AR Button (if supported) */}
      {isARSupported && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            onClick={() => setIsARActive(!isARActive)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            size="sm"
          >
            <Camera className="h-4 w-4 mr-2" />
            {isARActive ? 'Exit WebXR' : 'WebXR AR'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdvancedARExperience;