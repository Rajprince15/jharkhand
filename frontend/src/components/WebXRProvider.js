import React, { createContext, useContext, useState, useEffect } from 'react';

const WebXRContext = createContext();

export const useWebXR = () => {
  const context = useContext(WebXRContext);
  if (!context) {
    throw new Error('useWebXR must be used within a WebXRProvider');
  }
  return context;
};

export const WebXRProvider = ({ children }) => {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkWebXRSupport = async () => {
      if ('xr' in navigator) {
        try {
          // Check VR support
          const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsVRSupported(vrSupported);

          // Check AR support
          const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
          setIsARSupported(arSupported);
        } catch (err) {
          console.error('WebXR support check failed:', err);
          setError('WebXR not supported on this device');
        }
      } else {
        setError('WebXR not available in this browser');
      }
    };

    checkWebXRSupport();
  }, []);

  const value = {
    isVRSupported,
    isARSupported,
    isVRActive,
    isARActive,
    error,
    setIsVRActive,
    setIsARActive,
    setError
  };

  return (
    <WebXRContext.Provider value={value}>
      {children}
    </WebXRContext.Provider>
  );
};