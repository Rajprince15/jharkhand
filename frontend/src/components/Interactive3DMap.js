import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Text, 
  Box, 
  Sphere, 
  Plane, 
  Html,
  OrbitControls,
  useTexture 
} from '@react-three/drei';
import { Button } from './ui/button';
import { Globe, Eye, Layers, Zap } from 'lucide-react';
import * as THREE from 'three';

// 3D Terrain Component
const Terrain3D = ({ destinations }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(null);

  // Create heightmap-like terrain
  const createTerrainGeometry = () => {
    const geometry = new THREE.PlaneGeometry(20, 20, 50, 50);
    const vertices = geometry.attributes.position.array;

    // Create rolling hills effect
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      vertices[i + 2] = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2 + 
                       Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.5;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };

  const terrainGeometry = createTerrainGeometry();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <group>
      {/* Main Terrain */}
      <mesh 
        ref={meshRef}
        geometry={terrainGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3, 0]}
      >
        <meshStandardMaterial 
          color="#228B22"
          wireframe={false}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Water Bodies */}
      <Plane 
        args={[22, 22]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2.9, 0]}
      >
        <meshStandardMaterial 
          color="#4169E1" 
          transparent 
          opacity={0.6}
        />
      </Plane>

      {/* Grid Lines */}
      <Plane 
        args={[20, 20]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2.8, 0]}
      >
        <meshBasicMaterial 
          color="#ffffff" 
          wireframe 
          transparent 
          opacity={0.2}
        />
      </Plane>
    </group>
  );
};

// 3D Destination Marker
const Destination3DMarker = ({ destination, position, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const labelRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const scale = hovered || isSelected ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      meshRef.current.rotation.y = state.clock.elapsedTime;
      
      // Floating animation
      const floatY = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
      meshRef.current.position.y = floatY;
    }
  });

  const categoryColors = {
    nature: '#22c55e',
    wildlife: '#f97316', 
    religious: '#8b5cf6',
    city: '#3b82f6',
    adventure: '#ef4444',
    default: '#6b7280'
  };

  const color = categoryColors[destination.category?.toLowerCase()] || categoryColors.default;

  return (
    <group position={[position[0], position[1], position[2]]}>
      {/* Main Marker */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={hovered || isSelected ? color : '#000000'}
          emissiveIntensity={hovered || isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Marker Pillar */}
      <Box args={[0.1, 2, 0.1]} position={[0, -1, 0]}>
        <meshStandardMaterial color={color} />
      </Box>

      {/* Info Panel */}
      {(hovered || isSelected) && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-white p-3 rounded-lg shadow-lg min-w-48 max-w-xs border">
            <div className="flex items-start space-x-3">
              {destination.image_url && (
                <img 
                  src={destination.image_url} 
                  alt={destination.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">
                  {destination.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  📍 {destination.location}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {destination.category}
                  </span>
                  <span className="text-yellow-600 font-semibold">
                    ⭐ {destination.rating}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
              {destination.description}
            </p>
            <div className="mt-2 flex space-x-2">
              <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                View Details
              </button>
              <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                Book Tour
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Distance Label */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.15}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {destination.name}
      </Text>

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2.8, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

// 3D Map Scene
const Map3DScene = ({ destinations, selectedDestination, onDestinationClick, viewMode }) => {
  const { camera } = useThree();
  
  // Position destinations in 3D space based on their coordinates
  const getDestination3DPosition = (destination, index) => {
    // If destination has coordinates, use them
    if (destination.coordinates) {
      const coords = Array.isArray(destination.coordinates) 
        ? destination.coordinates 
        : [destination.coordinates.lat, destination.coordinates.lng];
      
      // Convert lat/lng to 3D position (simplified projection)
      const lat = coords[0] || 23.6;
      const lng = coords[1] || 85.3;
      
      // Center around Jharkhand (23.6102, 85.2799)
      const x = (lng - 85.2799) * 50; // Scale longitude
      const z = -(lat - 23.6102) * 50; // Scale latitude (negative for correct orientation)
      const y = Math.random() * 2; // Random height for visual variety
      
      return [x, y, z];
    }
    
    // Fallback: arrange in grid
    const gridSize = Math.ceil(Math.sqrt(destinations.length));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    return [
      (col - gridSize / 2) * 4,
      Math.random() * 2,
      (row - gridSize / 2) * 4
    ];
  };

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* 3D Terrain */}
      {viewMode === 'terrain' && <Terrain3D destinations={destinations} />}

      {/* Destination Markers */}
      {destinations.map((destination, index) => (
        <Destination3DMarker
          key={destination.id || index}
          destination={destination}
          position={getDestination3DPosition(destination, index)}
          isSelected={selectedDestination?.id === destination.id}
          onClick={() => onDestinationClick(destination)}
        />
      ))}

      {/* 3D Title */}
      <Text
        position={[0, 8, -5]}
        fontSize={1}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#ffffff"
      >
        Jharkhand Tourism 3D Map
      </Text>

      {/* Stats Panel */}
      <Html position={[0, 6, -5]} center>
        <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            Interactive 3D Map
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {destinations.length}
              </div>
              <div className="text-gray-600">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {destinations.filter(d => d.category === 'nature').length}
              </div>
              <div className="text-gray-600">Nature Spots</div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
};

const Interactive3DMap = ({ 
  destinations = [], 
  selectedDestination, 
  isOpen, 
  onClose, 
  onDestinationSelect 
}) => {
  const [viewMode, setViewMode] = useState('terrain'); // 'terrain', 'wireframe', 'markers'
  const [cameraPosition, setCameraPosition] = useState([0, 5, 10]);

  if (!isOpen) return null;

  const handleDestinationClick = (destination) => {
    onDestinationSelect && onDestinationSelect(destination);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-sky-400 to-sky-200">
      {/* Close Button */}
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-red-600 text-white hover:bg-red-700"
        size="sm"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* 3D Map Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-white bg-opacity-90 p-3 rounded-lg">
          <h3 className="font-semibold text-sm mb-2 flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            3D Map Controls
          </h3>
          <div className="space-y-2">
            <Button
              onClick={() => setViewMode('terrain')}
              size="sm"
              variant={viewMode === 'terrain' ? 'default' : 'outline'}
              className="w-full"
            >
              <Layers className="h-4 w-4 mr-2" />
              Terrain View
            </Button>
            <Button
              onClick={() => setViewMode('wireframe')}
              size="sm"
              variant={viewMode === 'wireframe' ? 'default' : 'outline'}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Wireframe
            </Button>
            <Button
              onClick={() => setCameraPosition([0, 15, 0])}
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Top View
            </Button>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white bg-opacity-90 p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Nature & Hills</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span>Wildlife</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>Religious Sites</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>City Attractions</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Adventure Sports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 max-w-xs">
        <div className="bg-white bg-opacity-90 p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">How to Use</h4>
          <div className="text-xs space-y-1 text-gray-700">
            <p>🖱️ Click and drag to rotate the map</p>
            <p>🔍 Scroll to zoom in/out</p>
            <p>📍 Click markers to view details</p>
            <p>🎯 Hover for quick info</p>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: cameraPosition, fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Map3DScene
          destinations={destinations}
          selectedDestination={selectedDestination}
          onDestinationClick={handleDestinationClick}
          viewMode={viewMode}
        />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxDistance={50}
          minDistance={2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
};

export default Interactive3DMap;