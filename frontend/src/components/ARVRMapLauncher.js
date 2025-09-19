import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Camera, 
  Headphones, 
  Globe, 
  Map, 
  Eye,
  Zap,
  Navigation,
  Compass
} from 'lucide-react';
import AdvancedARExperience from './AdvancedARExperience';
import AdvancedVRExperience from './AdvancedVRExperience';
import Interactive3DMap from './Interactive3DMap';

const ARVRMapLauncher = ({ 
  destinations = [], 
  selectedDestination,
  onDestinationSelect,
  className = "",
  size = "sm",
  layout = "horizontal" // "horizontal", "vertical", "grid"
}) => {
  const [activeMode, setActiveMode] = useState(null);
  const [capabilities, setCapabilities] = useState({
    ar: false,
    vr: false,
    webgl: false
  });

  // Check device capabilities
  useEffect(() => {
    const checkCapabilities = async () => {
      const caps = {
        ar: false,
        vr: false,
        webgl: !!window.WebGLRenderingContext
      };

      // Check WebXR support
      if ('xr' in navigator && navigator.xr) {
        try {
          caps.ar = await navigator.xr.isSessionSupported('immersive-ar');
          caps.vr = await navigator.xr.isSessionSupported('immersive-vr');
        } catch (err) {
          console.warn('WebXR capability check failed:', err);
        }
      }

      setCapabilities(caps);
    };

    checkCapabilities();
  }, []);

  const handleModeSelect = (mode) => {
    setActiveMode(mode);
  };

  const handleClose = () => {
    setActiveMode(null);
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col space-y-2';
      case 'grid':
        return 'grid grid-cols-2 gap-2';
      default:
        return 'flex space-x-2';
    }
  };

  const getButtonVariant = (mode) => {
    return activeMode === mode ? 'default' : 'outline';
  };

  return (
    <>
      <div className={`${getLayoutClasses()} ${className}`}>
        {/* AR Experience Button */}
        <Button
          onClick={() => handleModeSelect('ar')}
          variant={getButtonVariant('ar')}
          size={size}
          className={`${
            activeMode === 'ar' 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'border-orange-600 text-orange-600 hover:bg-orange-50'
          } relative`}
          disabled={!capabilities.webgl}
        >
          <Camera className="h-4 w-4 mr-2" />
          AR View
          {capabilities.ar && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </Button>

        {/* VR Experience Button */}
        <Button
          onClick={() => handleModeSelect('vr')}
          variant={getButtonVariant('vr')}
          size={size}
          className={`${
            activeMode === 'vr' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'border-blue-600 text-blue-600 hover:bg-blue-50'
          } relative`}
          disabled={!capabilities.webgl}
        >
          <Headphones className="h-4 w-4 mr-2" />
          VR Tour
          {capabilities.vr && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </Button>

        {/* 3D Map Button */}
        <Button
          onClick={() => handleModeSelect('3d')}
          variant={getButtonVariant('3d')}
          size={size}
          className={`${
            activeMode === '3d' 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'border-purple-600 text-purple-600 hover:bg-purple-50'
          }`}
          disabled={!capabilities.webgl}
        >
          <Globe className="h-4 w-4 mr-2" />
          3D Map
        </Button>

        {/* Quick Actions */}
        {layout === 'grid' && (
          <Button
            onClick={() => handleModeSelect('navigation')}
            variant="outline"
            size={size}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Navigate
          </Button>
        )}
      </div>

      {/* Capability Status */}
      {layout === 'vertical' && (
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${capabilities.ar ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>AR {capabilities.ar ? 'Ready' : 'Limited'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${capabilities.vr ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>VR {capabilities.vr ? 'Ready' : 'Limited'}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${capabilities.webgl ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>3D {capabilities.webgl ? 'Ready' : 'Error'}</span>
            </div>
          </div>
        </div>
      )}

      {/* AR Experience Modal */}
      <AdvancedARExperience
        destinations={destinations}
        isOpen={activeMode === 'ar'}
        onClose={handleClose}
        onDestinationSelect={onDestinationSelect}
      />

      {/* VR Experience Modal */}
      <AdvancedVRExperience
        destinations={destinations}
        selectedDestination={selectedDestination}
        isOpen={activeMode === 'vr'}
        onClose={handleClose}
        onDestinationSelect={onDestinationSelect}
      />

      {/* 3D Map Modal */}
      <Interactive3DMap
        destinations={destinations}
        selectedDestination={selectedDestination}
        isOpen={activeMode === '3d'}
        onClose={handleClose}
        onDestinationSelect={onDestinationSelect}
      />

      {/* Device Info Panel */}
      {!capabilities.webgl && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <div className="flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            <span>WebGL not supported. 3D features unavailable.</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ARVRMapLauncher;