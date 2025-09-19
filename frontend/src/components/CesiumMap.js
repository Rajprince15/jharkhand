import React, { useEffect, useState } from 'react';
import { Viewer, Entity, BillboardGraphics, LabelGraphics, CameraFlyTo } from 'resium';
import { Cartesian3, Color, HeightReference, HorizontalOrigin, VerticalOrigin } from 'cesium';
import { Button } from './ui/button';
import { Eye, Globe, VrHeadset } from 'lucide-react';

const CesiumMap = ({ destinations, selectedDestination, onDestinationSelect, onEnterVR }) => {
  const [viewer, setViewer] = useState(null);
  const [isVRMode, setIsVRMode] = useState(false);

  // Jharkhand center coordinates
  const jharkhandCenter = Cartesian3.fromDegrees(85.2799, 23.6102, 100000);

  // Create 3D markers for destinations
  const renderDestinationMarkers = () => {
    return destinations.map((destination) => {
      const position = destination.coordinates 
        ? Cartesian3.fromDegrees(
            destination.coordinates.lng || destination.coordinates[1], 
            destination.coordinates.lat || destination.coordinates[0], 
            1000
          )
        : Cartesian3.fromDegrees(85.2799 + Math.random() * 2, 23.6102 + Math.random() * 2, 1000);

      const categoryColors = {
        city: Color.BLUE,
        nature: Color.GREEN,
        wildlife: Color.ORANGE,
        religious: Color.PURPLE,
        adventure: Color.RED,
        default: Color.GRAY
      };

      const color = categoryColors[destination.category?.toLowerCase()] || categoryColors.default;

      return (
        <Entity
          key={destination.id}
          position={position}
          onClick={() => onDestinationSelect(destination)}
        >
          <BillboardGraphics
            image="/api/placeholder/32/32" // Fallback marker
            width={32}
            height={32}
            heightReference={HeightReference.CLAMP_TO_GROUND}
            color={color}
            scale={selectedDestination?.id === destination.id ? 1.5 : 1.0}
          />
          <LabelGraphics
            text={destination.name}
            font="14pt sans-serif"
            fillColor={Color.WHITE}
            outlineColor={Color.BLACK}
            outlineWidth={2}
            style="FILL_AND_OUTLINE"
            pixelOffset={new Cartesian3(0, -50, 0)}
            horizontalOrigin={HorizontalOrigin.CENTER}
            verticalOrigin={VerticalOrigin.BOTTOM}
            heightReference={HeightReference.CLAMP_TO_GROUND}
          />
        </Entity>
      );
    });
  };

  const handleVRToggle = () => {
    if (viewer && viewer.scene.xrApi) {
      setIsVRMode(!isVRMode);
      if (!isVRMode) {
        viewer.scene.xrApi.requestSession('immersive-vr').then(() => {
          onEnterVR && onEnterVR();
        });
      } else {
        viewer.scene.xrApi.endSession();
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* VR Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <Button
          onClick={handleVRToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <VrHeadset className="h-4 w-4 mr-2" />
          {isVRMode ? 'Exit VR' : 'Enter VR'}
        </Button>
      </div>

      <Viewer
        full
        cesiumPath="/cesium"
        onReady={(viewer) => setViewer(viewer)}
        terrainProvider={undefined} // Use default terrain
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={true}
        navigationHelpButton={false}
        animation={false}
        timeline={false}
        fullscreenButton={true}
        vrButton={true}
      >
        {/* Fly to Jharkhand on load */}
        <CameraFlyTo 
          destination={jharkhandCenter}
          duration={3}
        />

        {/* Render destination markers */}
        {renderDestinationMarkers()}

        {/* Focus on selected destination */}
        {selectedDestination && selectedDestination.coordinates && (
          <CameraFlyTo
            destination={Cartesian3.fromDegrees(
              selectedDestination.coordinates.lng || selectedDestination.coordinates[1],
              selectedDestination.coordinates.lat || selectedDestination.coordinates[0],
              5000
            )}
            duration={2}
          />
        )}
      </Viewer>
    </div>
  );
};

export default CesiumMap;