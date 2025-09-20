import React, { useState } from 'react';
import { Button } from './ui/button';
import { Headphones, Camera } from 'lucide-react';
import AdvancedARExperience from './AdvancedARExperience';
import AdvancedVRExperience from './AdvancedVRExperience';

const WebXRLauncher = ({ 
  destinations = [], 
  selectedDestination,
  onDestinationSelect,
  className = "",
  size = "sm",
  variant = "default" 
}) => {
  const [showVRTour, setShowVRTour] = useState(false);
  const [showARTour, setShowARTour] = useState(false);

  return (
    <>
      <div className={`flex space-x-2 ${className}`}>
        <Button
          onClick={() => setShowVRTour(true)}
          variant={variant}
          size={size}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Headphones className="h-4 w-4 mr-2" />
          VR Tour
        </Button>
        
        <Button
          onClick={() => setShowARTour(true)}
          variant={variant}
          size={size}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Camera className="h-4 w-4 mr-2" />
          AR View
        </Button>
      </div>

      <AdvancedVRExperience
        destinations={destinations}
        selectedDestination={selectedDestination}
        isOpen={showVRTour}
        onClose={() => setShowVRTour(false)}
        onDestinationSelect={onDestinationSelect}
      />
      
      <AdvancedARExperience
        destinations={destinations}
        isOpen={showARTour}
        onClose={() => setShowARTour(false)}
        onDestinationSelect={onDestinationSelect}
      />
    </>
  );
};

export default WebXRLauncher;