import React, { useRef, useEffect, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Navigation, ZoomIn, ZoomOut, Layers, RotateCcw } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map3D = ({ destinations = [], isOpen, onClose }) => {
  const mapRef = useRef();
  const [viewState, setViewState] = useState({
    longitude: 85.3096,
    latitude: 23.3441,
    zoom: 10,
    pitch: 60,
    bearing: 0
  });
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/satellite-streets-v12');
  const [is3DMode, setIs3DMode] = useState(true);

  // You'll need to add your Mapbox token here
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjaXF0YnZwZXkwMDB0ZmltYnU5djU2YjliIn0.8qvwKoAaFRGWYyZKREi0NQ'; // Replace with your actual token

  const destinationPoints = destinations.map((dest, index) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [dest.longitude || 85.3096 + (index * 0.1), dest.latitude || 23.3441 + (index * 0.1)]
    },
    properties: {
      id: dest.id,
      name: dest.name,
      description: dest.description,
      category: dest.category
    }
  }));

  const geojsonData = {
    type: 'FeatureCollection',
    features: destinationPoints
  };

  const layerStyle = {
    id: 'destinations',
    type: 'circle',
    paint: {
      'circle-radius': 8,
      'circle-color': '#10b981',
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2
    }
  };

  const toggle3D = () => {
    setIs3DMode(!is3DMode);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: is3DMode ? 0 : 60,
        duration: 1000
      });
    }
  };

  const resetView = () => {
    setViewState({
      longitude: 85.3096,
      latitude: 23.3441,
      zoom: 10,
      pitch: 60,
      bearing: 0
    });
  };

  const changeMapStyle = () => {
    const styles = [
      'mapbox://styles/mapbox/satellite-streets-v12',
      'mapbox://styles/mapbox/streets-v12',
      'mapbox://styles/mapbox/outdoors-v12',
      'mapbox://styles/mapbox/light-v11'
    ];
    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setMapStyle(styles[nextIndex]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapStyle}
          terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        >
          <Source id="destinations-source" type="geojson" data={geojsonData}>
            <Layer {...layerStyle} />
          </Source>
        </Map>

        {/* Controls */}
        <div className="absolute top-4 left-4 space-y-2">
          <Card className="bg-black bg-opacity-80 text-white border-green-400">
            <CardContent className="p-3">
              <h3 className="font-semibold mb-2">3D Map Controls</h3>
              <div className="space-y-2">
                <Button
                  onClick={toggle3D}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent text-white border-green-400 hover:bg-green-600"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  {is3DMode ? '2D View' : '3D View'}
                </Button>
                <Button
                  onClick={changeMapStyle}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent text-white border-green-400 hover:bg-green-600"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Change Style
                </Button>
                <Button
                  onClick={resetView}
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent text-white border-green-400 hover:bg-green-600"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Destination Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-black bg-opacity-80 text-white border-green-400">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Jharkhand Tourism 3D Map</h3>
                  <p className="text-sm text-gray-300">
                    {destinations.length} destinations • Interactive 3D terrain
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => mapRef.current?.zoomIn()}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-white border-green-400"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => mapRef.current?.zoomOut()}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-white border-green-400"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-black bg-opacity-70 text-white border-gray-600 hover:bg-gray-800"
        >
          <X className="h-4 w-4" />
          Close
        </Button>
      </div>
    </div>
  );
};

export default Map3D;