import React, { useState, useEffect, useRef } from 'react';
import { Pannellum } from 'pannellum-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { VrHeadset, X, RotateCcw, ZoomIn, ZoomOut, Info, Navigation } from 'lucide-react';

const VRTour = ({ destination, isOpen, onClose }) => {
  const [isVRMode, setIsVRMode] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [tourInfo, setTourInfo] = useState(null);
  const pannellumRef = useRef();

  // 360° panoramic images for Jharkhand destinations
  const getVRScenes = (destinationName) => {
    const vrScenes = {
      'Ranchi': [
        {
          id: 'ranchi-main',
          title: 'Ranchi City Center',
          panorama: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4000&h=2000&fit=crop',
          description: 'Experience the bustling heart of Jharkhand\'s capital city with modern amenities and traditional charm.',
          hotspots: [
            { pitch: 2, yaw: 117, type: 'info', text: 'Ranchi Railway Station - Gateway to Jharkhand' },
            { pitch: -3, yaw: -50, type: 'info', text: 'Shopping Complex - Local Markets and Malls' }
          ]
        },
        {
          id: 'ranchi-park',
          title: 'Rock Garden Ranchi',
          panorama: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=4000&h=2000&fit=crop',
          description: 'Beautiful rock formations and landscaped gardens perfect for family visits.',
          hotspots: [
            { pitch: 5, yaw: 0, type: 'info', text: 'Natural Rock Formations - Unique geological features' },
            { pitch: -10, yaw: 90, type: 'info', text: 'Garden Walkways - Perfect for morning walks' }
          ]
        }
      ],
      'Netarhat': [
        {
          id: 'netarhat-sunrise',
          title: 'Netarhat Sunrise Point',
          panorama: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4000&h=2000&fit=crop',
          description: 'Witness breathtaking sunrises from the Queen of Chotanagpur Plateau.',
          hotspots: [
            { pitch: 10, yaw: 80, type: 'info', text: 'Sunrise Point - Best viewed at 5:30 AM' },
            { pitch: 0, yaw: -120, type: 'info', text: 'Valley View - Endless green hills' }
          ]
        },
        {
          id: 'netarhat-forest',
          title: 'Netarhat Forest',
          panorama: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=4000&h=2000&fit=crop',
          description: 'Dense forest cover with diverse flora and fauna.',
          hotspots: [
            { pitch: 0, yaw: 0, type: 'info', text: 'Dense Forest - Home to various wildlife species' },
            { pitch: -5, yaw: 45, type: 'info', text: 'Nature Trail - Trekking paths through the forest' }
          ]
        }
      ],
      'Deoghar': [
        {
          id: 'deoghar-temple',
          title: 'Baba Baidyanath Temple',
          panorama: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=4000&h=2000&fit=crop',
          description: 'One of the twelve Jyotirlingas, this sacred temple attracts millions of devotees.',
          hotspots: [
            { pitch: 15, yaw: 0, type: 'info', text: 'Main Temple - Sacred Jyotirlinga shrine' },
            { pitch: 0, yaw: 90, type: 'info', text: 'Temple Complex - Multiple shrines and prayer halls' }
          ]
        }
      ],
      'Betla National Park': [
        {
          id: 'betla-safari',
          title: 'Betla Wildlife Safari',
          panorama: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=4000&h=2000&fit=crop',
          description: 'Experience the wilderness of Jharkhand with elephants, tigers, and diverse wildlife.',
          hotspots: [
            { pitch: -5, yaw: -30, type: 'info', text: 'Wildlife Spotting Zone - Tigers, elephants, deer' },
            { pitch: 0, yaw: 60, type: 'info', text: 'Forest Canopy - Dense Sal and bamboo forests' }
          ]
        }
      ]
    };

    return vrScenes[destinationName] || [
      {
        id: 'default',
        title: `Virtual Tour of ${destinationName}`,
        panorama: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4000&h=2000&fit=crop',
        description: `Explore the beautiful landscapes and attractions of ${destinationName}.`,
        hotspots: [
          { pitch: 0, yaw: 0, type: 'info', text: `Welcome to ${destinationName}` }
        ]
      }
    ];
  };

  const scenes = destination ? getVRScenes(destination.name) : [];

  useEffect(() => {
    if (destination && scenes.length > 0) {
      setTourInfo({
        name: destination.name,
        location: destination.location,
        description: destination.description,
        totalScenes: scenes.length
      });
    }
  }, [destination, scenes]);

  const handleVRToggle = () => {
    setIsVRMode(!isVRMode);
    if (pannellumRef.current) {
      if (!isVRMode) {
        // Enter VR mode
        pannellumRef.current.getViewer().setGyroEnabled(true);
      } else {
        // Exit VR mode
        pannellumRef.current.getViewer().setGyroEnabled(false);
      }
    }
  };

  const nextScene = () => {
    setCurrentScene((prev) => (prev + 1) % scenes.length);
  };

  const prevScene = () => {
    setCurrentScene((prev) => (prev - 1 + scenes.length) % scenes.length);
  };

  const handleHotSpotClick = (evt, args) => {
    console.log('Hotspot clicked:', args.text);
    // You can add more interactive functionality here
  };

  if (!isOpen || !destination || scenes.length === 0) return null;

  const currentSceneData = scenes[currentScene];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="w-full h-full max-w-7xl mx-auto relative">
        {/* VR Tour Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
          <Card className="bg-black bg-opacity-70 text-white border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <VrHeadset className="h-6 w-6 text-green-400" />
                <div>
                  <h2 className="text-lg font-bold">{currentSceneData.title}</h2>
                  <p className="text-sm text-gray-300">
                    {tourInfo?.name} • Scene {currentScene + 1} of {scenes.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="bg-black bg-opacity-70 text-white border-gray-600 hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* VR Panorama View */}
        <div className="w-full h-full">
          <Pannellum
            ref={pannellumRef}
            width="100%"
            height="100%"
            image={currentSceneData.panorama}
            pitch={10}
            yaw={180}
            hfov={110}
            autoLoad
            autoRotate={-2}
            showZoomCtrl={false}
            showFullscreenCtrl={false}
            showControls={false}
            onLoad={() => {
              console.log('VR scene loaded');
            }}
            hotspotDebug={false}
          >
            {currentSceneData.hotspots?.map((hotspot, index) => (
              <Pannellum.Hotspot
                key={index}
                type="info"
                pitch={hotspot.pitch}
                yaw={hotspot.yaw}
                text={hotspot.text}
                handleClick={handleHotSpotClick}
              />
            ))}
          </Pannellum>
        </div>

        {/* VR Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="bg-black bg-opacity-70 text-white border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                {/* Scene Navigation */}
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={prevScene}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-white border-gray-600 hover:bg-gray-800"
                    disabled={scenes.length <= 1}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Prev
                  </Button>
                  <Button
                    onClick={nextScene}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-white border-gray-600 hover:bg-gray-800"
                    disabled={scenes.length <= 1}
                  >
                    Next
                    <Navigation className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* VR Mode Toggle */}
                <Button
                  onClick={handleVRToggle}
                  variant={isVRMode ? "default" : "outline"}
                  size="sm"
                  className={isVRMode 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-transparent text-white border-gray-600 hover:bg-gray-800"
                  }
                >
                  <VrHeadset className="h-4 w-4 mr-2" />
                  {isVRMode ? 'Exit VR' : 'VR Mode'}
                </Button>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-1">
                  <Button
                    onClick={() => pannellumRef.current?.getViewer().setHfov(
                      Math.max(50, pannellumRef.current.getViewer().getHfov() - 10)
                    )}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-white border-gray-600 hover:bg-gray-800"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => pannellumRef.current?.getViewer().setHfov(
                      Math.min(120, pannellumRef.current.getViewer().getHfov() + 10)
                    )}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-white border-gray-600 hover:bg-gray-800"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scene Description */}
        <div className="absolute bottom-20 left-4 z-10">
          <Card className="bg-black bg-opacity-70 text-white border-gray-600 max-w-md">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">{currentSceneData.title}</h3>
                  <p className="text-xs text-gray-300">{currentSceneData.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VRTour;