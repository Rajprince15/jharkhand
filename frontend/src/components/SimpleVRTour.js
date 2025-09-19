import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, VRButton, Controllers, Hands } from '@react-three/xr';
import { Text, Sphere, Box, OrbitControls } from '@react-three/drei';
import { Button } from './ui/button';
import { Headphones, X, ArrowLeft, ArrowRight } from 'lucide-react';
import * as THREE from 'three';

// Simple VR Scene
const VRScene = ({ destination, destinations, currentIndex, onNavigate }) => {
  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      
      {/* Sky */}
      <Sphere args={[50]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#87CEEB" 
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Destination Info */}
      <group position={[0, 2, -5]}>
        <Box args={[4, 2, 0.1]}>
          <meshStandardMaterial color="#ffffff" />
        </Box>
        
        <Text
          position={[0, 0.5, 0.1]}
          fontSize={0.3}
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
        >
          {destination?.name || 'Jharkhand Tourism'}
        </Text>
        
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.15}
          color="#6b7280"
          anchorX="center"
          anchorY="middle"
        >
          {destination?.location || 'Beautiful Destination'}
        </Text>
        
        <Text
          position={[0, -0.5, 0.1]}
          fontSize={0.2}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          ⭐ {destination?.rating || '4.5'} | {destination?.category || 'Tourism'}
        </Text>
      </group>

      {/* Interactive Spheres */}
      <mesh position={[-3, 0, -3]} onClick={() => onNavigate('prev')}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>
      
      <mesh position={[0, 0, -3]} onClick={() => onNavigate('exit')}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#EF4444" />
      </mesh>
      
      <mesh position={[3, 0, -3]} onClick={() => onNavigate('next')}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>

      {/* Labels */}
      <Text position={[-3, -0.8, -3]} fontSize={0.2} color="white" anchorX="center">
        Previous
      </Text>
      <Text position={[0, -0.8, -3]} fontSize={0.2} color="white" anchorX="center">
        Exit VR
      </Text>
      <Text position={[3, -0.8, -3]} fontSize={0.2} color="white" anchorX="center">
        Next
      </Text>

      {/* Counter */}
      <Text
        position={[0, -2, -5]}
        fontSize={0.25}
        color="white"
        anchorX="center"
      >
        {currentIndex + 1} / {destinations.length || 1}
      </Text>
    </group>
  );
};

const SimpleVRTour = ({ destinations = [], selectedDestination, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkVRSupport = async () => {
      if ('xr' in navigator && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsVRSupported(supported);
        } catch (err) {
          setError('VR not supported on this device');
        }
      } else {
        setError('WebXR not available in this browser');
      }
    };
    
    checkVRSupport();
  }, []);

  useEffect(() => {
    if (selectedDestination && destinations.length > 0) {
      const index = destinations.findIndex(d => d.id === selectedDestination.id);
      if (index >= 0) setCurrentIndex(index);
    }
  }, [selectedDestination, destinations]);

  const handleNavigate = (direction) => {
    if (direction === 'next') {
      setCurrentIndex(prev => prev >= destinations.length - 1 ? 0 : prev + 1);
    } else if (direction === 'prev') {
      setCurrentIndex(prev => prev <= 0 ? destinations.length - 1 : prev - 1);
    } else if (direction === 'exit') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentDestination = destinations[currentIndex] || {
    name: 'Jharkhand Tourism',
    location: 'Beautiful State',
    rating: 4.5,
    category: 'Tourism'
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-md">
          <Headphones className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-2xl font-semibold mb-4">VR Not Available</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-2 text-sm text-gray-400 mb-8">
            <p>• Use Chrome or Edge browser</p>
            <p>• Connect a VR headset</p>
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
    <div className="fixed inset-0 z-50 bg-black">
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
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
          VR Tour - {currentDestination.name}
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-4 bg-black bg-opacity-70 p-3 rounded-lg">
          <Button onClick={() => handleNavigate('prev')} size="sm" variant="outline">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm">
            {currentIndex + 1} / {destinations.length || 1}
          </span>
          <Button onClick={() => handleNavigate('next')} size="sm" variant="outline">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg">
          <h4 className="font-semibold mb-2">VR Tourism Experience</h4>
          <p className="text-sm">
            Use VR controllers to point and click. Look around to explore 360°. 
            Click spheres to navigate between destinations.
          </p>
        </div>
      </div>

      {/* VR Canvas */}
      <Canvas camera={{ position: [0, 1.6, 0] }}>
        <XR>
          <Controllers />
          <Hands />
          <VRScene
            destination={currentDestination}
            destinations={destinations}
            currentIndex={currentIndex}
            onNavigate={handleNavigate}
          />
          <OrbitControls enablePan={false} enableZoom={true} />
        </XR>
      </Canvas>

      {/* VR Button */}
      {isVRSupported && (
        <div className="absolute bottom-4 right-4 z-10">
          <VRButton
            style={{
              background: '#2563eb',
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

export default SimpleVRTour;