import React, { useState, useEffect, Suspense } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Camera, Headphones, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import WebXRExperience from '../components/WebXRExperience';
import WebXRFallback from '../components/WebXRFallback';
import DestinationService from '../services/DestinationService';

// Create XR store
const xrStore = createXRStore();

const ARVRPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isXRActive, setIsXRActive] = useState(false);
  const [webXRSupported, setWebXRSupported] = useState(false);
  const [arSupported, setARSupported] = useState(false);
  const [vrSupported, setVRSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState(searchParams.get('mode') || 'both');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const destinationId = searchParams.get('destination');

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    checkWebXRSupport();
    getUserLocation();
    loadDestinations();
  }, []);

  useEffect(() => {
    if (destinationId && destinations.length > 0) {
      const destination = destinations.find(d => d.id.toString() === destinationId);
      if (destination) {
        setSelectedDestination(destination);
        loadWebXRContent(destination);
      }
    }
  }, [destinationId, destinations]);

  const checkWebXRSupport = async () => {
    try {
      if (!navigator.xr) {
        setWebXRSupported(false);
        return;
      }

      const [arSupport, vrSupport] = await Promise.all([
        navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
        navigator.xr.isSessionSupported('immersive-vr').catch(() => false)
      ]);

      setARSupported(arSupport);
      setVRSupported(vrSupport);
      setWebXRSupported(arSupport || vrSupport);
    } catch (error) {
      console.error('Error checking WebXR support:', error);
      setWebXRSupported(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Use default location for India/Jharkhand
          setUserLocation({
            lat: 23.6102,
            lng: 85.2799
          });
        }
      );
    }
  };

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      const service = new DestinationService();
      const data = await service.getDestinations(userLocation);
      
      // Add mock WebXR content for destinations
      const enhancedData = data.map(dest => ({
        ...dest,
        hasWebXRContent: true,
        webxrContent: [
          {
            id: 1,
            content_type: 'ar_marker',
            position_x: 0,
            position_y: 1,
            position_z: -2,
            rotation_x: 0,
            rotation_y: 0,
            rotation_z: 0,
            scale: 1,
            model_url: null,
            texture_url: dest.image_url,
            scene_data: JSON.stringify({
              title: dest.name,
              description: dest.description,
              rating: dest.rating,
              category: dest.category
            })
          },
          {
            id: 2,
            content_type: 'vr_scene',
            position_x: 0,
            position_y: 0,
            position_z: 0,
            rotation_x: 0,
            rotation_y: 0,
            rotation_z: 0,
            scale: 1,
            model_url: null,
            texture_url: dest.image_url,
            scene_data: JSON.stringify({
              title: dest.name,
              description: dest.description,
              rating: dest.rating,
              category: dest.category,
              type: '360_tour'
            })
          }
        ]
      }));
      
      setDestinations(enhancedData);
    } catch (error) {
      console.error('Failed to load destinations:', error);
      setError('Failed to load destinations. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWebXRContent = async (destination) => {
    try {
      // In a real implementation, this would load from the API
      // For now, we use the mock data added above
      console.log('Loading WebXR content for:', destination.name);
    } catch (error) {
      console.error('Failed to load WebXR content:', error);
    }
  };

  const enterAR = async () => {
    if (!arSupported) {
      setError('AR is not supported on this device or browser');
      return;
    }

    try {
      await xrStore.enterAR();
      setIsXRActive(true);
      setError(null);
    } catch (error) {
      console.error('Failed to enter AR mode:', error);
      setError('Failed to start AR experience. Please ensure camera permissions are granted.');
    }
  };

  const enterVR = async () => {
    if (!vrSupported && !webXRSupported) {
      setError('VR is not supported on this device or browser');
      return;
    }

    try {
      await xrStore.enterVR();
      setIsXRActive(true);
      setError(null);
    } catch (error) {
      console.error('Failed to enter VR mode:', error);
      setError('Failed to start VR experience. Please try again.');
    }
  };

  const exitXR = () => {
    setIsXRActive(false);
    setError(null);
  };

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    loadWebXRContent(destination);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading AR/VR Experience</h3>
            <p className="text-gray-600">Preparing immersive content...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/map">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Map
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AR/VR Tourism Experience
                </h1>
                <p className="text-gray-600">Explore Jharkhand in Augmented and Virtual Reality</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              
              {webXRSupported ? (
                <div className="text-sm text-green-600 font-medium">WebXR Supported</div>
              ) : (
                <div className="text-sm text-orange-600 font-medium">Limited Support</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">AR/VR Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Mode
                  </label>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setMode('ar')}
                      variant={mode === 'ar' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      disabled={!arSupported}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Augmented Reality
                      {!arSupported && <span className="ml-2 text-xs">(Not supported)</span>}
                    </Button>
                    <Button
                      onClick={() => setMode('vr')}
                      variant={mode === 'vr' ? 'default' : 'outline'}
                      className="w-full justify-start"
                    >
                      <Headphones className="h-4 w-4 mr-2" />
                      Virtual Reality
                    </Button>
                    <Button
                      onClick={() => setMode('both')}
                      variant={mode === 'both' ? 'default' : 'outline'}
                      className="w-full justify-start"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Both AR & VR
                    </Button>
                  </div>
                </div>

                {/* Start Experience Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={enterAR}
                    disabled={!arSupported || isXRActive}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start AR Experience
                  </Button>
                  <Button
                    onClick={enterVR}
                    disabled={isXRActive}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Headphones className="h-4 w-4 mr-2" />
                    Start VR Tour
                  </Button>
                  {isXRActive && (
                    <Button
                      onClick={exitXR}
                      variant="outline"
                      className="w-full"
                    >
                      Exit XR Experience
                    </Button>
                  )}
                </div>

                {/* Instructions */}
                <div className="text-sm text-gray-600 space-y-2">
                  <h4 className="font-medium">Instructions:</h4>
                  <ul className="space-y-1">
                    <li>• Grant camera/sensor permissions for AR</li>
                    <li>• Use headphones for better VR audio</li>
                    <li>• Point device at destinations for AR markers</li>
                    <li>• Move around to explore in VR</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Destination Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {destinations.slice(0, 10).map((destination) => (
                    <div
                      key={destination.id}
                      onClick={() => handleDestinationSelect(destination)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDestination?.id === destination.id
                          ? 'bg-blue-100 border-blue-300 border'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={destination.image_url}
                          alt={destination.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{destination.name}</h4>
                          <p className="text-xs text-gray-600 truncate">{destination.location}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              AR/VR Ready
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AR/VR Experience Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px] w-full rounded-lg overflow-hidden bg-black relative">
                  <Canvas 
                    className="w-full h-full"
                    camera={{ position: [0, 1.6, 3], fov: 60 }}
                  >
                    <XR store={xrStore}>
                      <Suspense fallback={null}>
                        {webXRSupported ? (
                          <WebXRExperience
                            destinations={destinations}
                            selectedDestination={selectedDestination}
                            userLocation={userLocation}
                            mode={mode}
                            onSessionEnd={exitXR}
                          />
                        ) : (
                          <WebXRFallback
                            destination={selectedDestination}
                            mode={mode}
                          />
                        )}
                      </Suspense>
                    </XR>
                  </Canvas>
                  
                  {/* Overlay UI */}
                  <div className="absolute top-4 left-4 right-4">
                    {selectedDestination && (
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                        <h3 className="font-semibold text-lg">{selectedDestination.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{selectedDestination.location}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            ★ {selectedDestination.rating}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {selectedDestination.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!webXRSupported && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-white text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">WebXR Not Supported</h3>
                        <p className="text-sm max-w-md">
                          Your browser doesn't support WebXR. Try using Chrome or Edge browser 
                          for the full AR/VR experience.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experience Info */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">About AR/VR Tourism Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-medium mb-1">Augmented Reality (AR)</h4>
                    <p>Point your camera at real destinations to see virtual information overlays, reviews, and booking options.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Virtual Reality (VR)</h4>
                    <p>Take immersive virtual tours of destinations from anywhere. Experience 360° views and detailed previews.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARVRPage;