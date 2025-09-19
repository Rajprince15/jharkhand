import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, useGLTF, Html } from '@react-three/drei';
import { XR, ARButton } from '@react-three/xr';
import { Button } from './ui/button';
import { Camera, MapPin, Eye, EyeOff } from 'lucide-react';

// 3D Destination Model Component
const DestinationModel = ({ destination, position = [0, 0, 0] }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <boxGeometry args={[1, 1.5, 1]} />
        <meshStandardMaterial 
          color={hovered ? '#4ade80' : '#10b981'} 
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* 3D Text Label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {destination.name}
      </Text>

      {/* Information Panel */}
      {hovered && (
        <Html position={[0, -1, 0]} center>
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-xs">
            <img 
              src={destination.image_url} 
              alt={destination.name}
              className="w-full h-20 object-cover rounded mb-2"
            />
            <h3 className="font-semibold text-sm">{destination.name}</h3>
            <p className="text-xs text-gray-600 mb-2">{destination.location}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="text-xs">{destination.category}</span>
              </div>
              {destination.rating && (
                <span className="text-xs font-semibold text-green-600">
                  ⭐ {destination.rating}
                </span>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Environment Lighting
const Lighting = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
    </>
  );
};

// AR Scene Content
const ARScene = ({ destinations, selectedDestination }) => {
  const displayDestinations = selectedDestination ? [selectedDestination] : destinations.slice(0, 5);

  return (
    <>
      <Lighting />
      
      {/* Ground plane for AR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#4ade80" transparent opacity={0.3} />
      </mesh>

      {/* Render destination models in AR */}
      {displayDestinations.map((destination, index) => (
        <DestinationModel
          key={destination.id}
          destination={destination}
          position={[
            (index - 2) * 2, // Spread destinations horizontally
            0,
            -3 - index * 0.5 // Place in front of user with depth variation
          ]}
        />
      ))}

      {/* Welcome Text */}
      <Text
        position={[0, 3, -5]}
        fontSize={0.5}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#ffffff"
      >
        Welcome to Jharkhand Tourism AR
      </Text>
    </>
  );
};

const ARExperience = ({ destinations = [], selectedDestination, isARActive, onARToggle }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check AR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsSupported(supported);
      }).catch((err) => {
        setError('AR not supported on this device');
        console.error('AR support check failed:', err);
      });
    } else {
      setError('WebXR not supported in this browser');
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center p-6">
          <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">AR Not Available</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Try accessing from a mobile device with AR support
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* AR Toggle Button */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          onClick={onARToggle}
          className={`${
            isARActive 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
          size="sm"
        >
          {isARActive ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {isARActive ? 'Exit AR' : 'Enter AR'}
        </Button>
      </div>

      {/* AR Status Indicator */}
      {isARActive && (
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            AR Active
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isARActive && (
        <div className="absolute bottom-4 left-4 right-4 z-50">
          <div className="bg-black bg-opacity-70 text-white p-4 rounded-lg">
            <h4 className="font-semibold mb-2">AR Experience</h4>
            <p className="text-sm">
              Point your camera at a flat surface and tap "Enter AR" to see 3D destinations in your environment.
            </p>
          </div>
        </div>
      )}

      {/* 3D Canvas with XR */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: isARActive ? 'transparent' : '#1a1a1a' }}
      >
        <XR>
          <Suspense fallback={null}>
            <ARScene 
              destinations={destinations} 
              selectedDestination={selectedDestination}
            />
          </Suspense>
          <OrbitControls enablePan={false} enableZoom={false} enableRotate={!isARActive} />
        </XR>
      </Canvas>

      {/* AR Button for WebXR */}
      {isSupported && (
        <div className="absolute bottom-4 right-4 z-50">
          <ARButton
            sessionInit={{
              requiredFeatures: ['hit-test'],
              optionalFeatures: ['dom-overlay'],
            }}
            style={{
              background: '#10b981',
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

export default ARExperience;