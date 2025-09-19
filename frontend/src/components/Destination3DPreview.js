import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Box, 
  Sphere, 
  Plane,
  Environment,
  Html,
  useTexture
} from '@react-three/drei';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';

// 3D Destination Scene Component
const DestinationScene = ({ destination, isAnimated, onInteraction }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && isAnimated) {
      groupRef.current.rotation.y += 0.01;
    }
  });

  // Create a 3D representation of the destination
  const getCategoryModel = (category) => {
    switch (category?.toLowerCase()) {
      case 'nature':
        return <NatureScene destination={destination} />;
      case 'wildlife':
        return <WildlifeScene destination={destination} />;
      case 'religious':
        return <ReligiousScene destination={destination} />;
      case 'city':
        return <CityScene destination={destination} />;
      case 'adventure':
        return <AdventureScene destination={destination} />;
      default:
        return <DefaultScene destination={destination} />;
    }
  };

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onInteraction}
    >
      {/* Main destination model */}
      {getCategoryModel(destination.category)}
      
      {/* Floating info panel */}
      {hovered && (
        <Html position={[0, 3, 0]} center>
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-xs pointer-events-none">
            <h3 className="font-semibold text-sm mb-1">{destination.name}</h3>
            <p className="text-xs text-gray-600 mb-1">{destination.location}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-600 font-semibold">
                ⭐ {destination.rating}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {destination.category}
              </span>
            </div>
          </div>
        </Html>
      )}

      {/* Ambient glow effect */}
      <Sphere args={[4, 16, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
      </Sphere>
    </group>
  );
};

// Nature Scene (mountains, trees, waterfalls)
const NatureScene = ({ destination }) => {
  return (
    <group>
      {/* Mountains */}
      <Box args={[3, 2, 1]} position={[-1, 0, -1]}>
        <meshStandardMaterial color="#8b7355" />
      </Box>
      <Box args={[2, 2.5, 1]} position={[1, 0.25, -1]}>
        <meshStandardMaterial color="#6b5b47" />
      </Box>
      
      {/* Trees */}
      <Box args={[0.2, 1.5, 0.2]} position={[-0.5, -0.25, 0]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Sphere args={[0.4, 8, 8]} position={[-0.5, 0.8, 0]}>
        <meshStandardMaterial color="#228b22" />
      </Sphere>
      
      <Box args={[0.2, 1.2, 0.2]} position={[0.8, -0.4, 0.5]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Sphere args={[0.3, 8, 8]} position={[0.8, 0.5, 0.5]}>
        <meshStandardMaterial color="#32cd32" />
      </Sphere>

      {/* Water/Lake */}
      <Plane args={[2, 1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 1]}>
        <meshStandardMaterial color="#4169e1" transparent opacity={0.7} />
      </Plane>
    </group>
  );
};

// Wildlife Scene (animals, forest)
const WildlifeScene = ({ destination }) => {
  return (
    <group>
      {/* Trees */}
      <Box args={[0.3, 2, 0.3]} position={[-1, 0, -1]}>
        <meshStandardMaterial color="#8b4513" />
      </Box>
      <Sphere args={[0.6, 8, 8]} position={[-1, 1.3, -1]}>
        <meshStandardMaterial color="#006400" />
      </Sphere>
      
      {/* Animal representations (abstract) */}
      <Sphere args={[0.3, 8, 8]} position={[1, -0.5, 0]}>
        <meshStandardMaterial color="#d2691e" />
      </Sphere>
      <Box args={[0.6, 0.2, 0.2]} position={[1.3, -0.5, 0]}>
        <meshStandardMaterial color="#d2691e" />
      </Box>
      
      {/* Ground */}
      <Plane args={[4, 4]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <meshStandardMaterial color="#228b22" />
      </Plane>
    </group>
  );
};

// Religious Scene (temple, spiritual symbols)
const ReligiousScene = ({ destination }) => {
  return (
    <group>
      {/* Temple base */}
      <Box args={[2, 0.5, 2]} position={[0, -0.75, 0]}>
        <meshStandardMaterial color="#daa520" />
      </Box>
      
      {/* Temple pillars */}
      <Box args={[0.2, 2, 0.2]} position={[-0.8, 0.25, -0.8]}>
        <meshStandardMaterial color="#cd853f" />
      </Box>
      <Box args={[0.2, 2, 0.2]} position={[0.8, 0.25, -0.8]}>
        <meshStandardMaterial color="#cd853f" />
      </Box>
      <Box args={[0.2, 2, 0.2]} position={[-0.8, 0.25, 0.8]}>
        <meshStandardMaterial color="#cd853f" />
      </Box>
      <Box args={[0.2, 2, 0.2]} position={[0.8, 0.25, 0.8]}>
        <meshStandardMaterial color="#cd853f" />
      </Box>
      
      {/* Dome */}
      <Sphere args={[1, 16, 16]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#ffd700" />
      </Sphere>
    </group>
  );
};

// City Scene (buildings, urban elements)
const CityScene = ({ destination }) => {
  return (
    <group>
      {/* Buildings */}
      <Box args={[0.8, 2, 0.8]} position={[-1, 0, -1]}>
        <meshStandardMaterial color="#708090" />
      </Box>
      <Box args={[0.6, 1.5, 0.6]} position={[0, -0.25, -1]}>
        <meshStandardMaterial color="#2f4f4f" />
      </Box>
      <Box args={[1, 2.5, 1]} position={[1, 0.25, 0]}>
        <meshStandardMaterial color="#696969" />
      </Box>
      
      {/* Road */}
      <Plane args={[4, 1]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 1]}>
        <meshStandardMaterial color="#2f2f2f" />
      </Plane>
    </group>
  );
};

// Adventure Scene (mountains, adventure elements)
const AdventureScene = ({ destination }) => {
  return (
    <group>
      {/* Mountain peaks */}
      <Box args={[2, 3, 1]} position={[0, 0.5, -1]}>
        <meshStandardMaterial color="#8b7d6b" />
      </Box>
      <Box args={[1.5, 2.5, 1]} position={[-1.5, 0.25, 0]}>
        <meshStandardMaterial color="#a0522d" />
      </Box>
      
      {/* Adventure equipment (rope, tent representation) */}
      <Box args={[0.5, 0.3, 0.5]} position={[1, -0.85, 0]}>
        <meshStandardMaterial color="#ff4500" />
      </Box>
      
      {/* Path */}
      <Plane args={[3, 0.5]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, -0.8, 0.5]}>
        <meshStandardMaterial color="#deb887" />
      </Plane>
    </group>
  );
};

// Default Scene
const DefaultScene = ({ destination }) => {
  return (
    <group>
      <Box args={[1.5, 1.5, 1.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#10b981" />
      </Box>
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        {destination.name}
      </Text>
    </group>
  );
};

const Destination3DPreview = ({ 
  destination, 
  className = "w-full h-64",
  showControls = true,
  onExpand = null 
}) => {
  const [isAnimated, setIsAnimated] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInteraction = () => {
    console.log('3D destination clicked:', destination.name);
  };

  const toggleAnimation = () => {
    setIsAnimated(!isAnimated);
  };

  const resetView = () => {
    // Reset camera position - this would be handled by OrbitControls ref
    console.log('Reset view');
  };

  const expandView = () => {
    if (onExpand) {
      onExpand(destination);
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className={`relative ${className} bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden`}>
      {/* Controls */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <Button
            onClick={toggleAnimation}
            size="sm"
            variant="outline"
            className="p-1 h-8 w-8 bg-white/90 hover:bg-white"
          >
            {isAnimated ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button
            onClick={resetView}
            size="sm"
            variant="outline"
            className="p-1 h-8 w-8 bg-white/90 hover:bg-white"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            onClick={expandView}
            size="sm"
            variant="outline"
            className="p-1 h-8 w-8 bg-white/90 hover:bg-white"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Destination Info Overlay */}
      <div className="absolute bottom-2 left-2 z-10 bg-black/70 text-white p-2 rounded text-sm">
        <div className="font-semibold">{destination.name}</div>
        <div className="text-xs text-gray-300">{destination.category}</div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [5, 3, 5], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          
          {/* Environment */}
          <Environment preset="sunset" />
          
          {/* Destination Scene */}
          <DestinationScene
            destination={destination}
            isAnimated={isAnimated}
            onInteraction={handleInteraction}
          />
          
          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            maxDistance={10}
            minDistance={3}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] relative">
            <Button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 z-60"
              variant="outline"
            >
              ✕
            </Button>
            <div className="w-full h-full">
              <Destination3DPreview
                destination={destination}
                className="w-full h-full"
                showControls={true}
                onExpand={null}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Destination3DPreview;