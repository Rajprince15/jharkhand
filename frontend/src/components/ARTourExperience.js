import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Text, 
  Box,
  Sphere,
  Plane,
  Html
} from '@react-three/drei';
import { XR, ARButton, Controllers, Hands } from '@react-three/xr';
import * as THREE from 'three';
import { Button } from './ui/button';
import { Camera, X, MapPin, Star, Info } from 'lucide-react';

// AR Destination Marker Component
const ARDestinationMarker = ({ destination, position = [0, 0, -2] }) => {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const markerRef = useRef();
  const panelRef = useRef();

  useFrame((state) => {
    if (markerRef.current) {
      markerRef.current.rotation.y += 0.01;
      markerRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
    if (panelRef.current && expanded) {
      panelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Main AR Marker */}
      <group
        ref={markerRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setExpanded(!expanded)}
      >
        <Box args={[0.3, 0.6, 0.1]}>
          <meshStandardMaterial 
            color={hovered ? '#4ade80' : '#10b981'} 
            emissive="#10b981"
            emissiveIntensity={hovered ? 0.3 : 0.1}
            transparent
            opacity={0.9}
          />
        </Box>
        
        {/* Pulsing Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial 
            color="#10b981" 
            transparent 
            opacity={hovered ? 0.6 : 0.3}
          />
        </mesh>

        {/* Location Pin Icon */}
        <Sphere args={[0.05]} position={[0, 0.35, 0.06]}>
          <meshStandardMaterial color="#ffffff" />
        </Sphere>
      </group>

      {/* Information Panel */}
      {expanded && (
        <group ref={panelRef} position={[0, 1, 0]}>
          <Plane args={[2, 1.2]}>
            <meshStandardMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.95}
            />
          </Plane>
          
          {/* Destination Name */}
          <Text
            position={[0, 0.35, 0.01]}
            fontSize={0.12}
            color="#1f2937"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {destination.name}
          </Text>
          
          {/* Location */}
          <Text
            position={[0, 0.1, 0.01]}
            fontSize={0.08}
            color="#6b7280"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            📍 {destination.location || 'Jharkhand, India'}
          </Text>
          
          {/* Rating and Category */}
          <Text
            position={[0, -0.1, 0.01]}
            fontSize={0.08}
            color="#f59e0b"
            anchorX="center"
            anchorY="middle"
          >
            ⭐ {destination.rating || '4.5'} • {destination.category || 'Tourism'}
          </Text>
          
          {/* Description */}
          <Text
            position={[0, -0.35, 0.01]}
            fontSize={0.06}
            color="#374151"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.8}
          >
            {destination.description ? 
              destination.description.substring(0, 80) + '...' : 
              'Discover this amazing destination in Jharkhand'
            }
          </Text>

          {/* Action Buttons */}
          <group position={[0, -0.55, 0.01]}>
            <Box args={[0.4, 0.12, 0.02]} position={[-0.3, 0, 0]}>
              <meshStandardMaterial color="#3b82f6" />
            </Box>
            <Text
              position={[-0.3, 0, 0.02]}
              fontSize={0.05}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Details
            </Text>
            
            <Box args={[0.4, 0.12, 0.02]} position={[0.3, 0, 0]}>
              <meshStandardMaterial color="#10b981" />
            </Box>
            <Text
              position={[0.3, 0, 0.02]}
              fontSize={0.05}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              Book
            </Text>
          </group>
        </group>
      )}

      {/* Distance Indicator */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.08}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="white"
      >
        2.5 km away
      </Text>
    </group>
  );
};

// AR Environment Setup
const AREnvironment = ({ destinations, nearbyDestinations, userLocation }) => {
  return (
    <group>
      {/* AR Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />

      {/* Ground Plane for AR Tracking */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        visible={false}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      {/* Display nearby destinations */}
      {nearbyDestinations.slice(0, 5).map((destination, index) => {
        const angle = (index / nearbyDestinations.length) * Math.PI * 2;
        const radius = 2 + index * 0.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <ARDestinationMarker
            key={destination.id}
            destination={destination}
            position={[x, 0, z]}
          />
        );
      })}

      {/* AR Instructions */}
      <group position={[0, 2.5, -3]}>
        <Plane args={[3, 0.8]}>
          <meshStandardMaterial 
            color="#1f2937" 
            transparent 
            opacity={0.8}
          />
        </Plane>
        
        <Text
          position={[0, 0.1, 0.01]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.8}
        >
          AR Tourism Mode Active
        </Text>
        
        <Text
          position={[0, -0.15, 0.01]}
          fontSize={0.07}
          color="#9ca3af"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.8}
        >
          Point your camera around to discover nearby attractions
        </Text>
      </group>

      {/* Compass/Direction Indicator */}
      <group position={[0, -1, -1]}>
        <Sphere args={[0.1]}>
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
        </Sphere>
        <Text
          position={[0, -0.3, 0]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="black"
        >
          N
        </Text>
      </group>
    </group>
  );
};

// Loading Fallback
const LoadingFallback = () => (
  <Html center>
    <div className="text-white text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
      <p>Initializing AR Camera...</p>
    </div>
  </Html>
);

const ARTourExperience = ({ 
  destinations = [], 
  userLocation, 
  isOpen, 
  onClose 
}) => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyDestinations, setNearbyDestinations] = useState([]);

  useEffect(() => {
    // Check AR support
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(supported);
        } catch (err) {
          console.error('AR support check failed:', err);
          setError('AR not supported on this device');
        }
      } else {
        setError('WebXR not available in this browser');
      }
    };

    checkARSupport();
  }, []);

  useEffect(() => {
    // Filter nearby destinations (for demo, showing all destinations)
    // In a real app, you'd calculate distance based on user location
    setNearbyDestinations(destinations.slice(0, 8));
  }, [destinations, userLocation]);

  if (!isOpen) return null;

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white p-8">
          <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold mb-4">AR Not Available</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-2 text-sm text-gray-400 mb-8">
            <p>• Use a mobile device with camera and sensors</p>
            <p>• Try Chrome or Safari on iOS/Android</p>
            <p>• Ensure camera permissions are granted</p>
            <p>• Use HTTPS connection for WebXR features</p>
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
    <div className="fixed inset-0 z-50 bg-transparent">
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 text-white border-gray-600 hover:bg-gray-800"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* AR Status */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          AR Mode - {nearbyDestinations.length} nearby attractions
        </div>
      </div>

      {/* AR Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            AR Tourism Guide
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2">📱 <strong>How to use:</strong></p>
              <ul className="text-xs space-y-1">
                <li>• Move your phone to look around</li>
                <li>• Tap on AR markers to see details</li>
                <li>• Green markers show tourist attractions</li>
              </ul>
            </div>
            <div>
              <p className="mb-2">🎯 <strong>Features:</strong></p>
              <ul className="text-xs space-y-1">
                <li>• Real-time distance to attractions</li>
                <li>• Detailed information panels</li>
                <li>• Quick booking and navigation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Canvas with XR */}
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        style={{ height: '100%', width: '100%', background: 'transparent' }}
        gl={{ xr: { enabled: true } }}
      >
        <XR>
          <Controllers />
          <Hands />
          <Suspense fallback={<LoadingFallback />}>
            <AREnvironment
              destinations={destinations}
              nearbyDestinations={nearbyDestinations}
              userLocation={userLocation}
            />
          </Suspense>
        </XR>
      </Canvas>

      {/* AR Button for WebXR */}
      {isARSupported && (
        <div className="absolute bottom-20 right-4 z-10">
          <ARButton
            sessionInit={{
              requiredFeatures: ['hit-test'],
              optionalFeatures: ['dom-overlay', 'light-estimation'],
            }}
            style={{
              background: '#ea580c',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ARTourExperience;