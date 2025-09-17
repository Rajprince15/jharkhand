import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { regionsAPI } from '../services/api';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

const RegionsSection = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const data = await regionsAPI.getAll();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
      setError('Failed to load regions');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionClick = (regionId) => {
    navigate(`/destinations?region=${regionId}`);
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading regions...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Regions in Jharkhand
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From dense forests to spiritual destinations, let us introduce you to 
            the four main regions of Jharkhand, each with its unique charm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regions.map((region) => (
            <Card 
              key={region.id} 
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              onClick={() => handleRegionClick(region.id)}
            >
              <div className="relative">
                <img
                  src={region.image_url}
                  alt={region.name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{region.name}</h3>
                  <p className="text-gray-200 mb-4">{region.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {region.highlights.map((highlight, index) => (
                      <span key={index} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => navigate('/destinations')}
          >
            Explore All Regions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RegionsSection;