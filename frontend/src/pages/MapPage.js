import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Star, ArrowLeft, Filter, Search, Map, Globe } from 'lucide-react';
import { destinations } from '../data/mock';
import { useTranslation } from '../hooks/useTranslation';
import AlternativeMapView from '../components/AlternativeMapView';
import ARVRMapLauncher from '../components/ARVRMapLauncher';
import CesiumMap from '../components/CesiumMap';
import { destinationsAPI } from '../services/api';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet - removed as we're not using raw Leaflet anymore

const MapPage = () => {
  const { t } = useTranslation();
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [apiDestinations, setApiDestinations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [mapMode, setMapMode] = useState('2D'); // '2D', '3D', 'VR', 'AR'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await destinationsAPI.getAll();
        const apiDests = response.data || [];
        setApiDestinations(apiDests);
        
        // Use API data if available, otherwise fall back to mock data
        const destinationsToUse = apiDests.length > 0 ? apiDests : destinations;
        setFilteredDestinations(destinationsToUse);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
        // Fall back to mock data
        setApiDestinations([]);
        setFilteredDestinations(destinations);
        setError('Using offline data');
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Use API destinations if available, otherwise use mock data
  const destinationsToUse = apiDestinations.length > 0 ? apiDestinations : destinations;
  
  // Jharkhand boundaries (approximate center coordinates)
  const jharkhandCenter = [23.6102, 85.2799];
  const mapBounds = [
    [21.9, 83.3], // Southwest corner
    [25.3, 87.5]  // Northeast corner
  ];

  // Add coordinates to destinations (use existing coordinates from data)
  const destinationsWithCoords = destinationsToUse.map(dest => ({
    ...dest,
    coordinates: dest.coordinates 
      ? (Array.isArray(dest.coordinates) 
          ? dest.coordinates 
          : [dest.coordinates.lat, dest.coordinates.lng]) 
      : getCoordinatesForDestination(dest.name)
  }));

  function getCoordinatesForDestination(name) {
    // Fallback coordinates for destinations without coordinates
    const coords = {
      'Dassam Falls': [23.2556, 85.4806],
      'Hundru Falls': [23.4167, 85.5833],
      'Jagannath Temple': [23.3441, 85.3096],
      'Hazaribagh Lake': [23.9959, 85.3594],
      'Dalma Wildlife Sanctuary': [22.8411, 86.1464],
    };
    
    // Return coordinates if found, otherwise return random coordinates within Jharkhand
    return coords[name] || [
      23.0 + Math.random() * 2.3,
      84.0 + Math.random() * 3.5
    ];
  }

  useEffect(() => {
    let filtered = destinationsWithCoords;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dest => dest.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchTerm) {
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDestinations(filtered);
  }, [selectedCategory, searchTerm, destinationsWithCoords.length]);

  const categories = ['all', ...new Set(destinationsToUse.map(dest => dest.category?.toLowerCase()).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToHome')}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('jharkhandTourismMap')}</h1>
                <p className="text-gray-600">{t('exploreTouristDestinations')}</p>
              </div>
            </div>
            
            {/* Map Mode Toggle Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setMapMode('2D')}
                variant={mapMode === '2D' ? 'default' : 'outline'}
                size="sm"
                className={mapMode === '2D' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Map className="h-4 w-4 mr-2" />
                2D Map
              </Button>
              
              <Button
                onClick={() => setMapMode('3D')}
                variant={mapMode === '3D' ? 'default' : 'outline'}
                size="sm"
                className={mapMode === '3D' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Globe className="h-4 w-4 mr-2" />
                3D Globe
              </Button>
              
              {/* AR/VR Launcher */}
              <ARVRMapLauncher
                destinations={filteredDestinations}
                selectedDestination={selectedDestination}
                onDestinationSelect={setSelectedDestination}
                layout="horizontal"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  {t('filters')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('searchDestinations')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={t('searchPlaces')}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('category')}
                  </label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="mr-2 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm capitalize">
                          {category === 'all' ? t('allCategories') : category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('mapLegend')}
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-xs">{t('cityAttractions')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs">{t('natureHills')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-xs">{t('wildlife')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-xs">{t('religiousSites')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-xs">{t('adventure')}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredDestinations.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('destinationsFound')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Destination Info */}
            {selectedDestination && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <img
                    src={selectedDestination.image_url}
                    alt={selectedDestination.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedDestination.name}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{selectedDestination.location}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm">{selectedDestination.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {selectedDestination.description}
                  </p>
                  <div className="space-y-2">
                    <Link to={`/destination/${selectedDestination.id}`}>
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        {t('viewDetails')}
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="w-full">
                      {t('getDirections')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="h-[600px] w-full rounded-lg overflow-hidden relative">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading destinations...</p>
                      </div>
                    </div>
                  )}

                  {/* Render different map types based on mode */}
                  {mapMode === '2D' && (
                    <AlternativeMapView
                      destinations={filteredDestinations}
                      selectedDestination={selectedDestination}
                      onDestinationSelect={setSelectedDestination}
                      center={jharkhandCenter}
                      zoom={8}
                      bounds={mapBounds}
                    />
                  )}

                  {/* 3D Cesium Globe */}
                  {mapMode === '3D' && (
                    <CesiumMap
                      destinations={filteredDestinations}
                      selectedDestination={selectedDestination}
                      onDestinationSelect={setSelectedDestination}
                      onEnterVR={() => setMapMode('VR')}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map Instructions */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t('howToUseMap')} - Advanced AR/VR Features
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="border-l-4 border-green-500 pl-3">
                    <h4 className="font-semibold text-green-700 mb-1">📱 Augmented Reality (AR)</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Point camera at surroundings to see destination markers</li>
                      <li>• Tap green markers to explore attractions</li>
                      <li>• Works best on mobile devices with camera</li>
                      <li>• Distance indicators help with navigation</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-semibold text-blue-700 mb-1">🥽 Virtual Reality (VR)</h4>
                    <ul className="text-xs space-y-1">
                      <li>• 360° immersive destination experiences</li>
                      <li>• Navigate between attractions using hotspots</li>
                      <li>• Interactive 3D map for destination selection</li>
                      <li>• VR headset compatible for full immersion</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-purple-500 pl-3">
                    <h4 className="font-semibold text-purple-700 mb-1">🌍 3D Interactive Map</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Terrain view with elevation data</li>
                      <li>• Click and drag to rotate the map</li>
                      <li>• Hover over markers for instant info</li>
                      <li>• Multiple viewing modes (terrain, wireframe)</li>
                    </ul>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 pl-3">
                    <h4 className="font-semibold text-orange-700 mb-1">🗺️ Enhanced 2D Map</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Multiple tile layers (Street, Satellite, Terrain)</li>
                      <li>• Integrated AR/VR launch buttons</li>
                      <li>• Click markers to view details</li>
                      <li>• Search and filter functionality</li>
                    </ul>
                  </div>
                </div>
                
                {/* Current Features Status */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{filteredDestinations.length}</div>
                      <div className="text-gray-600">AR/VR Ready Destinations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">3</div>
                      <div className="text-gray-600">Immersive Experience Modes</div>
                    </div>
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

export default MapPage;