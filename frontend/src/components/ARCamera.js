import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Camera, X, MapPin, Navigation, Info, Star, Phone, Clock } from 'lucide-react';

const ARCamera = ({ destinations, isOpen, onClose }) => {
  const [isARActive, setIsARActive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [cameraStream, setCameraStream] = useState(null);
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const videoRef = useRef();
  const canvasRef = useRef();

  // Mock coordinates for Jharkhand destinations (in real app, these would come from database)
  const destinationCoordinates = {
    'Ranchi': { lat: 23.3441, lng: 85.3096 },
    'Netarhat': { lat: 23.4667, lng: 84.2667 },
    'Deoghar': { lat: 24.4839, lng: 86.6997 },
    'Betla National Park': { lat: 23.8833, lng: 84.1833 },
    'Hazaribagh': { lat: 23.9999, lng: 85.3594 },
    'Dassam Falls': { lat: 23.2556, lng: 85.4806 },
    'Hundru Falls': { lat: 23.4167, lng: 85.5833 },
    'Jagannath Temple': { lat: 23.3441, lng: 85.3096 },
    'Dalma Wildlife Sanctuary': { lat: 22.8411, lng: 86.1464 }
  };

  useEffect(() => {
    if (isOpen) {
      startAR();
      getUserLocation();
    } else {
      stopAR();
    }

    return () => {
      stopAR();
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOrientation = (event) => {
      setDeviceOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      });
    };

    if (isARActive && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isARActive]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          findNearbyDestinations(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use Ranchi as default location for demo
          const defaultLocation = { lat: 23.3441, lng: 85.3096 };
          setUserLocation(defaultLocation);
          findNearbyDestinations(defaultLocation);
        }
      );
    }
  };

  const findNearbyDestinations = (userLoc) => {
    const nearby = [];
    
    Object.entries(destinationCoordinates).forEach(([name, coords]) => {
      const distance = calculateDistance(userLoc.lat, userLoc.lng, coords.lat, coords.lng);
      const bearing = calculateBearing(userLoc.lat, userLoc.lng, coords.lat, coords.lng);
      
      if (distance <= 100) { // Within 100km
        const destination = destinations?.find(d => d.name === name);
        nearby.push({
          name,
          ...coords,
          distance: distance.toFixed(1),
          bearing,
          destination
        });
      }
    });

    setNearbyDestinations(nearby.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)));
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  const startAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      setIsARActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopAR = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsARActive(false);
  };

  const getDestinationInView = () => {
    // Simulate AR detection based on device orientation
    const currentHeading = deviceOrientation.alpha;
    
    return nearbyDestinations.filter(dest => {
      const angleDiff = Math.abs(currentHeading - dest.bearing);
      return angleDiff < 30 || angleDiff > 330; // 60-degree field of view
    });
  };

  const renderAROverlay = () => {
    const destinationsInView = getDestinationInView();
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {destinationsInView.map((dest, index) => {
          const horizontalOffset = ((dest.bearing - deviceOrientation.alpha + 360) % 360);
          const xPosition = (horizontalOffset / 360) * 100;
          
          return (
            <div
              key={dest.name}
              className="absolute transform -translate-x-1/2 pointer-events-auto"
              style={{
                left: `${xPosition}%`,
                top: `${30 + index * 15}%`
              }}
            >
              <Card className="bg-black bg-opacity-80 text-white border-green-400 max-w-xs">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{dest.name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-300 mb-2">
                        <Navigation className="h-3 w-3" />
                        <span>{dest.distance} km away</span>
                        {dest.destination?.rating && (
                          <>
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span>{dest.destination.rating}</span>
                          </>
                        )}
                      </div>
                      {dest.destination && (
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                          {dest.destination.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                        >
                          <Info className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1 border-green-400 text-green-400"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
        
        {/* Compass */}
        <div className="absolute top-4 right-4">
          <Card className="bg-black bg-opacity-80 text-white border-green-400">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Navigation 
                  className="h-5 w-5 text-green-400 transform transition-transform"
                  style={{ transform: `rotate(${deviceOrientation.alpha}deg)` }}
                />
                <div className="text-xs">
                  <div className="font-semibold">Heading</div>
                  <div>{Math.round(deviceOrientation.alpha)}°</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AR Instructions */}
        <div className="absolute bottom-20 left-4 right-4">
          <Card className="bg-black bg-opacity-80 text-white border-green-400">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Camera className="h-4 w-4 text-green-400" />
                <span className="text-sm font-semibold">AR Tourism Guide</span>
              </div>
              <p className="text-xs text-gray-300">
                Point your camera towards tourist destinations to see information overlays. 
                Move your device to explore different directions.
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Real-time</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{nearbyDestinations.length} nearby</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* AR Camera View */}
      <div className="relative w-full h-full">
        {isARActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            {renderAROverlay()}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <Card className="bg-gray-800 text-white">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Initializing AR Camera</h3>
                <p className="text-gray-400 mb-4">
                  Please allow camera access to use AR features
                </p>
                <Button onClick={startAR} className="bg-green-600 hover:bg-green-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Start AR
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 text-white border-gray-600 hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
          Close AR
        </Button>
      </div>
    </div>
  );
};

export default ARCamera;