import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, ARButton, Controllers, Hands } from '@react-three/xr';
import { Text, Box, Sphere, Plane } from '@react-three/drei';
import { Button } from './ui/button';
import { Camera, X, MapPin } from 'lucide-react';
import * as THREE from 'three';

// AR Marker Component
const ARMarker = ({ destination, position }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <group position={position}>
      {/* Main Marker */}
      <Box 
        args={[0.3, 0.6, 0.1]} 
        onClick={() => setExpanded(!expanded)}
      >
        <meshStandardMaterial color="#10b981" />
      </Box>

      {/* Pulsing Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
      </mesh>

      {/* Info Panel */}
      {expanded && (
        <group position={[0, 1, 0]}>
          <Plane args={[2, 1]}>
            <meshStandardMaterial color="#ffffff" />
          </Plane>
          
          <Text
            position={[0, 0.3, 0.01]}
            fontSize={0.1}
            color="#1f2937"
            anchorX="center"
          >
            {destination?.name || 'Tourist Spot'}
          </Text>
          
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.08}
            color="#6b7280"
            anchorX="center"
          >
            📍 {destination?.location || 'Jharkhand'}
          </Text>
          
          <Text
            position={[0, -0.3, 0.01]}
            fontSize={0.08}
            color="#f59e0b"
            anchorX="center"
          >
            ⭐ {destination?.rating || '4.5'} • {destination?.category || 'Tourism'}
          </Text>
        </group>
      )}

      {/* Distance */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.08}
        color="#10b981"
        anchorX="center"
      >
        2.5 km away
      </Text>
    </group>
  );
};

// AR Scene
const ARScene = ({ destinations }) => {
  return (
    <group>
      {/* AR Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />

      {/* Ground Plane (invisible) */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        visible={false}
      />

      {/* AR Markers */}
      {destinations.slice(0, 5).map((destination, index) => {
        const angle = (index / 5) * Math.PI * 2;
        const radius = 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <ARMarker
            key={destination.id || index}
            destination={destination}
            position={[x, 0, z]}
          />
        );
      })}

      {/* AR Instructions */}
      <group position={[0, 2, -2]}>
        <Plane args={[3, 0.6]}>
          <meshStandardMaterial color="#1f2937" transparent opacity={0.8} />
        </Plane>
        
        <Text
          position={[0, 0.1, 0.01]}
          fontSize={0.1}
          color="white"
          anchorX="center"
        >
          AR Tourism Active
        </Text>
        
        <Text
          position={[0, -0.1, 0.01]}
          fontSize={0.07}
          color="#9ca3af"
          anchorX="center"
        >
          Tap markers to explore attractions
        </Text>
      </group>
    </group>
  );
};

const SimpleARTour = ({ destinations = [], isOpen, onClose }) => {
  const [isARSupported, setIsARSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkARSupport = async () => {
      if ('xr' in navigator && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(supported);
        } catch (err) {
          setError('AR not supported on this device');
        }
      } else {
        setError('WebXR not available in this browser');
      }
    };
    
    checkARSupport();
  }, []);

  if (!isOpen) return null;

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold mb-4">AR Not Available</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-2 text-sm text-gray-400 mb-8">
            <p>• Use a mobile device with camera</p>
            <p>• Try Chrome or Safari</p>
            <p>• Grant camera permissions</p>
            <p>• Ensure HTTPS connection</p>
          </div>
          <Button onClick={onClose} className="bg-white text-black">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Close Button */}
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-red-600 text-white hover:bg-red-700"
        size="sm"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Status */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm">
          AR Mode - {destinations.length} attractions nearby
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg">
          <h4 className="font-semibold mb-2">AR Tourism Guide</h4>
          <p className="text-sm">
            Point your camera around to discover nearby attractions. 
            Tap on green markers to see details.
          </p>
        </div>
      </div>

      {/* AR Canvas */}
      <Canvas camera={{ position: [0, 0, 0] }}>
        <XR>
          <Controllers />
          <Hands />
          <ARScene destinations={destinations} />
        </XR>
      </Canvas>

      {/* AR Button */}
      {isARSupported && (
        <div className="absolute bottom-20 right-4 z-10">
          <ARButton
            sessionInit={{
              requiredFeatures: ['hit-test'],
              optionalFeatures: ['dom-overlay']
            }}
            style={{
              background: '#ea580c',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SimpleARTour;