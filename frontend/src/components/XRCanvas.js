import React from 'react';
import { Canvas } from '@react-three/fiber';
import { XR } from '@react-three/xr';

const XRCanvas = ({ children, camera, style, gl, ...props }) => {
  // Ensure XR is properly configured
  const glConfig = {
    ...gl,
    xr: { enabled: true }
  };

  return (
    <Canvas
      camera={camera}
      style={style}
      gl={glConfig}
      {...props}
    >
      <XR>
        {children}
      </XR>
    </Canvas>
  );
};

export default XRCanvas;