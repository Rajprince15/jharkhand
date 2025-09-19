import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, DefaultXRController, DefaultXRHand } from '@react-three/xr';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Eye, X, Info, AlertCircle } from 'lucide-react';

const WebXRSupport = ({ destinations = [], isOpen, onClose }) => {
  const [isXRSupported, setIsXRSupported] = useState(false);
  const [isXRSession, setIsXRSession] = useState(false);
  const [xrError, setXrError] = useState(null);

  useEffect(() => {
    // Check WebXR support
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        setIsXRSupported(supported);
      }).catch((error) => {
        console.error('WebXR support check failed:', error);
        setXrError('WebXR not supported on this device');
      });
    } else {
      setXrError('WebXR not available in this browser');
    }
  }, []);

  const startVRSession = async () => {
    try {
      setIsXRSession(true);
    } catch (error) {
      console.error('Failed to start VR session:', error);
      setXrError('Failed to start VR session. Please ensure you have a VR headset connected.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* WebXR VR Experience */}
      {isXRSupported && isXRSession ? (
        <Canvas>
          <XR>
            {/* VR Environment */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            
            {/* VR Controllers */}
            <DefaultXRController />
            <DefaultXRHand />
            
            {/* 3D Destinations in VR Space */}
            {destinations.map((destination, index) => {
              const angle = (index / destinations.length) * Math.PI * 2;
              const radius = 5;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              
              return (
                <mesh key={destination.id} position={[x, 1.6, z]}>
                  <boxGeometry args={[0.5, 0.8, 0.1]} />
                  <meshStandardMaterial color="#4ade80" />
                  {/* Add destination info as texture or 3D text */}
                </mesh>
              );
            })}
            
            {/* VR Environment - Sky */}
            <mesh>
              <sphereGeometry args={[50, 32, 32]} />
              <meshBasicMaterial 
                color="#87ceeb" 
                side={2} // DoubleSide
              />
            </mesh>
          </XR>
        </Canvas>
      ) : (
        // Fallback UI for non-VR or initialization
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-blue-900">
          <Card className="bg-black bg-opacity-80 text-white border-purple-400 max-w-md">
            <CardContent className="p-6 text-center">
              {xrError ? (
                <>
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-red-400">WebXR Not Available</h3>
                  <p className="text-gray-300 mb-4">
                    {xrError}
                  </p>
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <p>• Use a WebXR compatible browser (Chrome, Edge, Firefox Reality)</p>
                    <p>• Connect a VR headset (Oculus, HTC Vive, etc.)</p>
                    <p>• Ensure HTTPS connection for WebXR features</p>
                  </div>
                </>
              ) : isXRSupported ? (
                <>
                  <Eye className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">WebXR VR Ready</h3>
                  <p className="text-gray-300 mb-4">
                    Experience Jharkhand tourism in immersive virtual reality
                  </p>
                  <div className="space-y-2 text-sm text-gray-400 mb-6">
                    <p>✓ VR headset detected</p>
                    <p>✓ WebXR supported</p>
                    <p>✓ {destinations.length} destinations ready</p>
                  </div>
                  <Button
                    onClick={startVRSession}
                    className="bg-purple-600 hover:bg-purple-700 w-full mb-3"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Enter VR Experience
                  </Button>
                </>
              ) : (
                <>
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Checking VR Support</h3>
                  <p className="text-gray-300 mb-4">
                    Detecting VR capabilities...
                  </p>
                  <div className="animate-pulse bg-gray-700 h-2 rounded mb-4"></div>
                </>
              )}
              
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Close Button (always visible) */}
      <Button
        onClick={onClose}
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 text-white border-gray-600 hover:bg-gray-800"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* VR Instructions */}
      {isXRSession && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <Card className="bg-black bg-opacity-80 text-white border-purple-400">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-semibold">VR Controls</span>
              </div>
              <div className="space-y-1 text-xs text-gray-300">
                <p>🎮 Use VR controllers to point and select destinations</p>
                <p>👋 Hand tracking enabled for natural interactions</p>
                <p>🚶 Move around to explore different perspectives</p>
                <p>👆 Point at destination boxes for detailed information</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WebXRSupport;