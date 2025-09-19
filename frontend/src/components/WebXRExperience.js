import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { Text, Sphere, Box, Html, Plane } from '@react-three/drei';
import { Vector3, TextureLoader } from 'three';
import * as THREE from 'three';

const WebXRExperience = ({ 
  destinations, 
  selectedDestination, 
  userLocation, 
  mode, 
  onSessionEnd 
}) => {
  const { isPresenting, session } = useXR();
  const [models, setModels] = useState([]);
  const [currentTour, setCurrentTour] = useState(null);
  const [tourTexture, setTourTexture] = useState(null);
  const groupRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    if (selectedDestination?.webxrContent) {
      loadWebXRContent(selectedDestination.webxrContent);
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (session) {
      const handleSessionEnd = () => {
        console.log('XR session ended');
        onSessionEnd();
      };
      
      session.addEventListener('end', handleSessionEnd);
      return () => session.removeEventListener('end', handleSessionEnd);
    }
  }, [session, onSessionEnd]);

  const loadWebXRContent = (content) => {
    const loadedModels = content.map(item => ({
      id: item.id,
      type: item.content_type,
      position: [item.position_x, item.position_y, item.position_z],
      rotation: [item.rotation_x, item.rotation_y, item.rotation_z],
      scale: item.scale,
      modelUrl: item.model_url,
      textureUrl: item.texture_url,
      sceneData: item.scene_data ? JSON.parse(item.scene_data) : null
    }));
    
    setModels(loadedModels);
    
    // Load 360 tour if available
    const tourModel = loadedModels.find(m => m.sceneData?.type === '360_tour');
    if (tourModel && tourModel.textureUrl) {
      setCurrentTour(tourModel);
      loadTourTexture(tourModel.textureUrl);
    }
  };

  const loadTourTexture = (textureUrl) => {
    const loader = new TextureLoader();
    loader.load(
      textureUrl,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        setTourTexture(texture);
      },
      undefined,
      (error) => {
        console.error('Failed to load tour texture:', error);
      }
    );
  };

  const handleModelClick = (model) => {
    if (model.type === '360_tour' || model.sceneData?.type === '360_tour') {
      setCurrentTour(model);
      if (model.textureUrl) {
        loadTourTexture(model.textureUrl);
      }
    }
  };

  // AR-specific content positioning
  const ARContent = () => (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {models.map((model) => (
        <group
          key={model.id}
          position={model.position}
          rotation={model.rotation}
          scale={[model.scale, model.scale, model.scale]}
          onClick={() => handleModelClick(model)}
        >
          {model.type === 'ar_marker' && (
            <>
              {/* AR Marker Visual */}
              <Box args={[0.3, 0.3, 0.1]} position={[0, 0, 0]}>
                <meshStandardMaterial 
                  color="#4F46E5" 
                  transparent 
                  opacity={0.8}
                  emissive="#4F46E5"
                  emissiveIntensity={0.2}
                />
              </Box>
              
              {/* Floating Info Panel */}
              <group position={[0, 0.5, 0]}>
                <Plane args={[1.5, 0.8]} position={[0, 0, 0.01]}>
                  <meshBasicMaterial 
                    color="white" 
                    transparent 
                    opacity={0.9}
                  />
                </Plane>
                
                <Text
                  position={[0, 0.2, 0.02]}
                  fontSize={0.12}
                  color="#1F2937"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={1.3}
                  font="/fonts/Inter-Bold.woff"
                >
                  {model.sceneData?.title || selectedDestination?.name || 'Tourist Destination'}
                </Text>
                
                <Text
                  position={[0, 0, 0.02]}
                  fontSize={0.08}
                  color="#6B7280"
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={1.3}
                >
                  {model.sceneData?.category || 'Tourism'}
                </Text>
                
                {model.sceneData?.rating && (
                  <Text
                    position={[0, -0.2, 0.02]}
                    fontSize={0.1}
                    color="#F59E0B"
                    anchorX="center"
                    anchorY="middle"
                  >
                    ★ {model.sceneData.rating}
                  </Text>
                )}
              </group>
              
              {/* Pulsing Animation */}
              <Sphere args={[0.4]} position={[0, 0, 0]}>
                <meshBasicMaterial 
                  color="#3B82F6" 
                  transparent 
                  opacity={0.2}
                  wireframe
                />
              </Sphere>
            </>
          )}
        </group>
      ))}
      
      {/* Ground plane for better AR tracking */}
      <Plane 
        args={[10, 10]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
        visible={false}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>
    </group>
  );

  // VR-specific content for immersive tours
  const VRContent = () => (
    <group>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 2, 0]} intensity={0.6} />
      
      {/* 360-degree tour environment */}
      {currentTour && tourTexture ? (
        <Sphere args={[50]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            map={tourTexture} 
            side={THREE.BackSide}
          />
        </Sphere>
      ) : (
        // Fallback skybox
        <Sphere args={[50]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            color="#87CEEB" 
            side={THREE.BackSide}
          />
        </Sphere>
      )}
      
      {/* Interactive hotspots */}
      {models.filter(m => m.type === 'vr_scene' || m.sceneData?.type === '360_tour').map((hotspot) => (
        <group
          key={hotspot.id}
          position={[
            Math.sin(hotspot.id * 1.5) * 8,
            1,
            Math.cos(hotspot.id * 1.5) * 8
          ]}
          onClick={() => handleModelClick(hotspot)}
        >
          <Sphere args={[0.3]}>
            <meshStandardMaterial 
              color="#F59E0B" 
              emissive="#F59E0B" 
              emissiveIntensity={0.3}
            />
          </Sphere>
          
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            billboard
          >
            Click to explore
          </Text>
        </group>
      ))}
      
      {/* Destination information panel */}
      {selectedDestination && (
        <group position={[0, 2, -3]}>
          <Plane args={[4, 2]} position={[0, 0, 0.01]}>
            <meshBasicMaterial 
              color="white" 
              transparent 
              opacity={0.9}
            />
          </Plane>
          
          <Text
            position={[0, 0.5, 0.02]}
            fontSize={0.3}
            color="#1F2937"
            anchorX="center"
            anchorY="middle"
            maxWidth={3.5}
            font="/fonts/Inter-Bold.woff"
          >
            {selectedDestination.name}
          </Text>
          
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.15}
            color="#6B7280"
            anchorX="center"
            anchorY="middle"
            maxWidth={3.5}
          >
            {selectedDestination.description}
          </Text>
          
          <group position={[0, -0.5, 0.02]}>
            <Text
              position={[-1, 0, 0]}
              fontSize={0.2}
              color="#F59E0B"
              anchorX="center"
              anchorY="middle"
            >
              ★ {selectedDestination.rating}
            </Text>
            
            <Text
              position={[1, 0, 0]}
              fontSize={0.15}
              color="#3B82F6"
              anchorX="center"
              anchorY="middle"
            >
              {selectedDestination.category}
            </Text>
          </group>
        </group>
      )}
      
      {/* Floor grid for reference */}
      <group position={[0, -0.1, 0]}>
        {Array.from({ length: 21 }, (_, i) => (
          <group key={i}>
            <Plane args={[20, 0.05]} position={[0, 0, i - 10]} rotation={[-Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="#E5E7EB" transparent opacity={0.3} />
            </Plane>
            <Plane args={[0.05, 20]} position={[i - 10, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color="#E5E7EB" transparent opacity={0.3} />
            </Plane>
          </group>
        ))}
      </group>
    </group>
  );

  // Mixed content for both AR and VR
  const MixedContent = () => {
    if (isPresenting) {
      return session?.mode === 'immersive-ar' ? <ARContent /> : <VRContent />;
    }
    
    // Preview mode when not in XR
    return (
      <group>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        {/* Preview scene */}
        <Sphere args={[20]} position={[0, 0, 0]}>
          <meshBasicMaterial 
            color="#F3F4F6" 
            side={THREE.BackSide}
            transparent
            opacity={0.1}
          />
        </Sphere>
        
        {selectedDestination ? (
          <group>
            <Text
              position={[0, 1, -2]}
              fontSize={0.5}
              color="#1F2937"
              anchorX="center"
              anchorY="middle"
              maxWidth={8}
            >
              {selectedDestination.name}
            </Text>
            
            <Text
              position={[0, 0, -2]}
              fontSize={0.2}
              color="#6B7280"
              anchorX="center"
              anchorY="middle"
              maxWidth={8}
            >
              Select AR or VR mode to start immersive experience
            </Text>
            
            <Box args={[1, 1, 1]} position={[0, -0.5, -2]}>
              <meshStandardMaterial color="#3B82F6" />
            </Box>
          </group>
        ) : (
          <Text
            position={[0, 0, -2]}
            fontSize={0.3}
            color="#6B7280"
            anchorX="center"
            anchorY="middle"
            maxWidth={8}
          >
            Select a destination to begin your AR/VR experience
          </Text>
        )}
      </group>
    );
  };

  // Add floating animation effect
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return <MixedContent />;
};

export default WebXRExperience;