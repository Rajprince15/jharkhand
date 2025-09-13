import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { destinationsAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, MapPin, IndianRupee, Filter, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../hooks/use-toast';

const DestinationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationsAPI.getAll();
      setDestinations(data);
      setFilteredDestinations(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(d => d.category))];
      setCategories([t('all'), ...uniqueCategories]);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: "Error",
        description: "Failed to load destinations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === t('all') || category === 'All') {
      setFilteredDestinations(destinations);
    } else {
      setFilteredDestinations(destinations.filter(d => d.category === category));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading destinations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('Where Nature Meets Tradition – Explore Jharkhand')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('exploreMostBeautiful')}
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => handleCategoryFilter(category)}
                className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Destinations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination) => (
              <Card
                key={destination.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={destination.image_url}
                    alt={destination.name}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 text-white">
                      {destination.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">{destination.rating}</span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                    {destination.name}
                  </h3>

                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{destination.location}</span>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {destination.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {destination.highlights.slice(0, 3).map((highlight, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600 font-bold">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span>{destination.price.toLocaleString('en-IN')}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/booking')}
                    >
                      {t('bookNow')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DestinationsPage;