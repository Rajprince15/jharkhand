import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Star, ArrowLeft, Filter, Search } from 'lucide-react';
import { destinations } from '../data/mock';
import { useTranslation } from '../hooks/useTranslation';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for tourist places
const createCustomIcon = (category) => {
  const colors = {
    'city': '#3B82F6',
    'nature': '#10B981',
    'wildlife': '#F59E0B',
    'religious': '#8B5CF6',
    'adventure': '#EF4444',
    'default': '#6B7280'
  };
  
  const color = colors[category] || colors.default;
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MapPage = () => {
  const { t } = useTranslation();
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Jharkhand boundaries (approximate center coordinates)
  const jharkhandCenter = [23.6102, 85.2799];
  const mapBounds = [
    [21.9, 83.3], // Southwest corner
    [25.3, 87.5]  // Northeast corner
  ];

  // Add coordinates to destinations (use existing coordinates from mock data)
  const destinationsWithCoords = destinations.map(dest => ({
    ...dest,
    coordinates: dest.coordinates ? [dest.coordinates.lat, dest.coordinates.lng] : getCoordinatesForDestination(dest.name)
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
      filtered = filtered.filter(dest => dest.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDestinations(filtered);
  }, [selectedCategory, searchTerm]);

  const categories = ['all', ...new Set(destinations.map(dest => dest.category))];

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
                <div className="h-[600px] w-full rounded-lg overflow-hidden">
                  <MapContainer
                    center={jharkhandCenter}
                    zoom={8}
                    style={{ height: '100%', width: '100%' }}
                    bounds={mapBounds}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="Jharkhand Tourism Map"
                    />
                    
                    {filteredDestinations.map((destination) => (
                      <Marker
                        key={destination.id}
                        position={destination.coordinates}
                        icon={createCustomIcon(destination.category)}
                        eventHandlers={{
                          click: () => setSelectedDestination(destination),
                        }}
                      >
                        <Popup>
                          <div className="max-w-xs">
                            <img
                              src={destination.image_url}
                              alt={destination.name}
                              className="w-full h-20 object-cover rounded mb-2"
                            />
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {destination.name}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="text-xs">{destination.location}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                <span className="text-xs">{destination.rating}</span>
                              </div>
                              {destination.price && (
                                <span className="text-xs font-semibold text-green-600">
                                  ₹{destination.price}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                              {destination.description}
                            </p>
                            <Link to={`/destination/${destination.id}`}>
                              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                {t('viewDetails')}
                              </Button>
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>

            {/* Map Instructions */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('howToUseMap')}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{t('clickMarker')}</p>
                  <p>{t('useFilters')}</p>
                  <p>{t('zoomInOut')}</p>
                  <p>{t('clickViewDetails')}</p>
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