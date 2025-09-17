import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { providersAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, MapPin, Phone, IndianRupee, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';

const ProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    min_price: '',
    max_price: '',
    min_rating: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const filterParams = {};
      
      if (filters.category) filterParams.category = filters.category;
      if (filters.location) filterParams.location = filters.location;
      if (filters.min_price) filterParams.min_price = parseFloat(filters.min_price);
      if (filters.max_price) filterParams.max_price = parseFloat(filters.max_price);
      if (filters.min_rating) filterParams.min_rating = parseFloat(filters.min_rating);
      if (searchQuery) filterParams.location = searchQuery; // Use location search for general search
      
      const data = await providersAPI.getAll(filterParams);
      setProviders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Failed to load providers. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      min_price: '',
      max_price: '',
      min_rating: ''
    });
    setSearchQuery('');
  };

  const handleBookProvider = (provider) => {
    toast({
      title: "Booking",
      description: `Booking functionality for ${provider.name} will be implemented soon.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading providers...</p>
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
              Local Service Providers
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with experienced local guides, transport services, and activity providers 
              to make your Jharkhand experience authentic and memorable.
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Filter Providers</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>

              <Select value={filters.min_rating} onValueChange={(value) => handleFilterChange('min_rating', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  <SelectItem value="3.0">3.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {providers.length} provider{providers.length !== 1 ? 's' : ''} found
              </p>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchProviders} className="mt-2" size="sm">
                Retry
              </Button>
            </div>
          )}

          {providers.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No providers found matching your criteria.</p>
              <Button onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((provider) => (
              <Card 
                key={provider.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={provider.image_url || 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={provider.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-600 text-white capitalize">
                      {provider.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">
                      {provider.avg_rating ? parseFloat(provider.avg_rating).toFixed(1) : provider.rating}
                    </span>
                    {provider.review_count > 0 && (
                      <span className="text-white text-xs">({provider.review_count})</span>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {provider.name}
                  </h3>
                  
                  <p className="text-lg font-semibold text-green-600 mb-2">
                    {provider.service_name}
                  </p>
                  
                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{provider.location}</span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 text-sm">
                    {provider.description}
                  </p>
                  
                  <div className="flex items-center text-muted-foreground mb-4">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{provider.contact}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600 font-bold">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span>{parseFloat(provider.price).toLocaleString('en-IN')}</span>
                    </div>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700" 
                      size="sm"
                      onClick={() => handleBookProvider(provider)}
                    >
                      Book Now
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

export default ProvidersPage;