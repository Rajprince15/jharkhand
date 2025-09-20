import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
  Text, 
  Sphere, 
  Box, 
  Plane, 
  Html,
  Sky,
  Environment,
  OrbitControls,
  useTexture
} from '@react-three/drei';
import { TextureLoader } from 'three';
import { Button } from './ui/button';
import { Headphones, X, ArrowLeft, ArrowRight, Home, Eye, Map, Navigation } from 'lucide-react';
import * as THREE from 'three';

// 360° VR Destination Environment
const VR360Environment = ({ destination }) => {
  const meshRef = useRef();
  
  // Create a gradient texture for 360° environment (in real app, use actual 360° photos)
  const createEnvironmentTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Create gradient based on destination category
    const gradients = {
      nature: ['#87CEEB', '#228B22', '#90EE90'],
      wildlife: ['#FFA500', '#8B4513', '#228B22'],
      religious: ['#FFD700', '#FF6347', '#4169E1'],
      city: ['#4169E1', '#87CEEB', '#F0F8FF'],
      adventure: ['#FF4500', '#32CD32', '#87CEEB'],
      default: ['#87CEEB', '#98FB98', '#F0E68C']
    };
    
    const colors = gradients[destination.category?.toLowerCase()] || gradients.default;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return new THREE.CanvasTexture(canvas);
  };

  const texture = createEnvironmentTexture();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005; // Very slow rotation for immersion
    }
  });

  return (
    <Sphere ref={meshRef} args={[50, 60, 40]}>
      <meshBasicMaterial 
        map={texture} 
        side={THREE.BackSide}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
};

// VR Information Panel
const VRInfoPanel = ({ destination, position = [0, 2, -5] }) => {
  return (
    <group position={position}>
      {/* Panel Background */}
      <Plane args={[6, 4]}>
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.95}
        />
      </Plane>
      
      {/* Destination Name */}
      <Text
        position={[0, 1.2, 0.01]}
        fontSize={0.4}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.5}
      >
        {destination.name}
      </Text>

      {/* Location */}
      <Text
        position={[0, 0.6, 0.01]}
        fontSize={0.2}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.5}
      >
        📍 {destination.location}
      </Text>

      {/* Description */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.15}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.5}
      >
        {destination.description || `Experience the beauty of ${destination.name} in virtual reality. Explore this amazing ${destination.category} destination from the comfort of your home.`}
      </Text>

      {/* Rating and Category */}
      <Text
        position={[0, -0.8, 0.01]}
        fontSize={0.2}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        ⭐ {destination.rating} • {destination.category} • Jharkhand Tourism
      </Text>

      {/* Additional Info */}
      <Text
        position={[0, -1.4, 0.01]}
        fontSize={0.12}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.5}
      >
        Best time to visit: {destination.best_time || 'October - March'} | 
        Duration: {destination.duration || '2-3 hours'}
      </Text>
    </group>
  );
};

// VR Interactive Hotspot
const VRHotspot = ({ position, label, color = "#10b981", onClick, icon = "🎯" }) => {
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
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Floating Label */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {icon} {label}
      </Text>

      {/* Pulsing Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={hovered ? 0.6 : 0.3}
        />
      </mesh>
    </group>
  );
};

// VR 3D Map Component
const VR3DMap = ({ destinations, currentIndex, onDestinationSelect }) => {
  const mapRef = useRef();

  useFrame((state) => {
    if (mapRef.current) {
      mapRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group position={[0, -2, -8]} ref={mapRef}>
      {/* 3D Map Base */}
      <Box args={[4, 0.2, 3]}>
        <meshStandardMaterial color="#2d5016" />
      </Box>
      
      {/* Map Title */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="black"
      >
        🗺️ Jharkhand Tourism Map
      </Text>

      {/* Destination Markers on 3D Map */}
      {destinations.slice(0, 6).map((destination, index) => {
        const x = (index % 3) * 1.2 - 1.2;
        const z = Math.floor(index / 3) * 1 - 0.5;
        const isSelected = index === currentIndex;
        
        return (
          <group key={destination.id} position={[x, 0.3, z]}>
            <Box 
              args={[0.2, 0.5, 0.2]}
              onClick={() => onDestinationSelect(index)}
            >
              <meshStandardMaterial 
                color={isSelected ? "#fbbf24" : "#10b981"}
                emissive={isSelected ? "#f59e0b" : "#065f46"}
                emissiveIntensity={0.2}
              />
            </Box>
            
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              maxWidth={1}
            >
              {destination.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// Main VR Scene
const VRScene = ({ destinations, currentIndex, onNavigate, onDestinationSelect, onDirections, onBookTour, on360View }) => {
  const currentDestination = destinations[currentIndex] || {
    name: 'Jharkhand Tourism',
    location: 'Beautiful State of India',
    category: 'Tourism',
    rating: '4.5',
    description: 'Explore the natural beauty and rich culture of Jharkhand'
  };

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} />

      {/* 360° Environment */}
      <VR360Environment destination={currentDestination} />

      {/* Sky Environment */}
      <Sky sunPosition={[100, 20, 100]} />

      {/* Destination Info Panel */}
      <VRInfoPanel destination={currentDestination} />

      {/* Navigation Hotspots */}
      <VRHotspot 
        position={[-4, 0, -6]} 
        label="Previous"
        color="#6b7280"
        icon="⬅️"
        onClick={() => onNavigate('prev')}
      />
      
      <VRHotspot 
        position={[0, 0, -6]} 
        label="Home"
        color="#ef4444"
        icon="🏠"
        onClick={() => onNavigate('home')}
      />
      
      <VRHotspot 
        position={[4, 0, -6]} 
        label="Next"
        color="#6b7280"
        icon="➡️"
        onClick={() => onNavigate('next')}
      />

      {/* Interactive 3D Map */}
      <VR3DMap 
        destinations={destinations}
        currentIndex={currentIndex}
        onDestinationSelect={onDestinationSelect}
      />

      {/* VR Experience Indicators */}
      <VRHotspot 
        position={[-6, 2, -8]} 
        label="360° View"
        color="#3b82f6"
        icon="🔄"
        onClick={() => on360View && on360View()}
      />
      
      <VRHotspot 
        position={[6, 2, -8]} 
        label="Book Tour"
        color="#f59e0b"
        icon="🎫"
        onClick={() => onBookTour && onBookTour(currentDestination)}
      />

      {/* Directions Hotspot */}
      <VRHotspot 
        position={[0, 3, -10]} 
        label="Get Directions"
        color="#10b981"
        icon="🧭"
        onClick={() => onDirections && onDirections(currentDestination)}
      />

      {/* Counter Display */}
      <Text
        position={[0, -4, -5]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {currentIndex + 1} / {destinations.length} - {currentDestination.name}
      </Text>
    </group>
  );
};

const AdvancedVRExperience = ({ 
  destinations = [], 
  selectedDestination, 
  isOpen, 
  onClose,
  onDestinationSelect 
}) => {
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);
  const [error, setError] = useState(null);

  // Check VR support
  useEffect(() => {
    const checkVRSupport = async () => {
      if ('xr' in navigator && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsVRSupported(supported);
        } catch (err) {
          console.warn('WebXR VR not supported:', err);
        }
      }
    };

    checkVRSupport();
  }, []);

  // Set starting destination
  useEffect(() => {
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
      onClose();
    }
  };

  const handleDestinationSelect = (index) => {
    setCurrentDestinationIndex(index);
    if (onDestinationSelect && destinations[index]) {
      onDestinationSelect(destinations[index]);
    }
  };

  const handleDirections = (destination) => {
    if (destination && destination.coordinates) {
      const lat = destination.coordinates.lat || destination.coordinates[0];
      const lng = destination.coordinates.lng || destination.coordinates[1];
      // Open Google Maps directions
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      alert('Location coordinates not available for directions');
    }
  };

  const handleBookTour = (destination) => {
    // Navigate to booking page for this destination
    if (destination) {
      const bookingUrl = `/booking?destination=${encodeURIComponent(destination.name)}`;
      window.open(bookingUrl, '_blank');
    }
  };

  const handle360View = () => {
    alert('360° View activated - Look around to explore the full environment!');
  };

  if (!isOpen) return null;

  const currentDestination = destinations[currentDestinationIndex] || {
    name: 'Jharkhand Tourism',
    location: 'Beautiful State',
    category: 'Tourism',
    rating: '4.5'
  };

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

      {/* VR Status */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          VR Tour - {currentDestination.name}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-4 bg-black bg-opacity-70 p-3 rounded-lg">
          <Button onClick={() => handleNavigate('prev')} size="sm" variant="outline">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm">
            {currentDestinationIndex + 1} / {destinations.length || 1}
          </span>
          <Button onClick={() => handleNavigate('next')} size="sm" variant="outline">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => handleDirections(currentDestination)} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
            title="Get directions to this destination"
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <Button onClick={onClose} size="sm" className="bg-green-600 hover:bg-green-700">
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* VR Controls */}
      <div className="absolute bottom-20 right-4 z-10">
        <div className="flex flex-col space-y-2">
          {isVRSupported && (
            <Button
              onClick={() => setIsVRActive(!isVRActive)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <Headphones className="h-4 w-4 mr-2" />
              {isVRActive ? 'Exit WebXR' : 'WebXR VR'}
            </Button>
          )}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Map className="h-4 w-4 mr-2" />
            3D Map
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 max-w-xs z-10">
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <Eye className="h-4 w-4 mr-2 text-blue-400" />
            VR Tourism Experience
          </h4>
          <div className="text-xs space-y-1">
            <p>🔄 360° immersive destination views</p>
            <p>🎯 Click hotspots to interact</p>
            <p>🗺️ Use 3D map to jump to destinations</p>
            <p>🎮 VR controllers supported</p>
          </div>
        </div>
      </div>

      {/* VR Canvas */}
      <Canvas 
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <VRScene
            destinations={destinations}
            currentIndex={currentDestinationIndex}
            onNavigate={handleNavigate}
            onDestinationSelect={handleDestinationSelect}
            onDirections={handleDirections}
            onBookTour={handleBookTour}
            on360View={handle360View}
          />
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            enableRotate={!isVRActive}
            maxDistance={20}
            minDistance={0.1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AdvancedVRExperience;