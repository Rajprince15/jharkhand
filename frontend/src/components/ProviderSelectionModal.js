import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { 
  Star, 
  MapPin, 
  IndianRupee, 
  Users, 
  Filter, 
  Phone,
  Clock,
  Award,
  MessageCircle,
  X 
} from 'lucide-react';
import { providersAPI, reviewsAPI, bookingsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ProviderSelectionModal = ({ destination, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [reviews, setReviews] = useState({});
  const [filters, setFilters] = useState({
    category: '',
    min_price: '',
    max_price: '',
    min_rating: ''
  });
  
  const [bookingData, setBookingData] = useState({
    booking_date: '',
    check_in: '',
    check_out: '',
    guests: 2,
    rooms: 1,
    special_requests: ''
  });

  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (isOpen && destination) {
      fetchProviders();
    }
  }, [isOpen, destination]);

  useEffect(() => {
    applyFilters();
  }, [providers, filters]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await providersAPI.getAll({ 
        destination_id: destination.id,
        limit: 50 
      });
      setProviders(data);
      
      // Fetch reviews for each provider
      const reviewsData = {};
      for (const provider of data) {
        try {
          const providerReviews = await reviewsAPI.getAll(null, provider.id, 5);
          reviewsData[provider.id] = providerReviews;
        } catch (error) {
          console.error(`Error fetching reviews for provider ${provider.id}:`, error);
          reviewsData[provider.id] = [];
        }
      }
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load service providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...providers];
    
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    if (filters.min_price) {
      filtered = filtered.filter(p => parseFloat(p.price) >= parseFloat(filters.min_price));
    }
    
    if (filters.max_price) {
      filtered = filtered.filter(p => parseFloat(p.price) <= parseFloat(filters.max_price));
    }
    
    if (filters.min_rating) {
      filtered = filtered.filter(p => {
        const rating = p.avg_rating || p.rating;
        return parseFloat(rating) >= parseFloat(filters.min_rating);
      });
    }
    
    // Sort by rating descending
    filtered.sort((a, b) => {
      const ratingA = parseFloat(a.avg_rating || a.rating);
      const ratingB = parseFloat(b.avg_rating || b.rating);
      return ratingB - ratingA;
    });
    
    setFilteredProviders(filtered);
  };

  const handleProviderSelect = (provider) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book a service provider",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    setSelectedProvider(provider);
    setShowBookingForm(true);
    
    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    setBookingData(prev => ({
      ...prev,
      booking_date: tomorrow.toISOString().split('T')[0],
      check_in: tomorrow.toISOString().split('T')[0],
      check_out: dayAfter.toISOString().split('T')[0]
    }));
  };

  const handleBookingSubmit = async () => {
    try {
      setBookingLoading(true);
      
      const bookingPayload = {
        provider_id: selectedProvider.id,
        destination_id: destination.id,
        booking_date: bookingData.booking_date,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests: parseInt(bookingData.guests),
        rooms: parseInt(bookingData.rooms),
        special_requests: bookingData.special_requests,
        package_type: 'custom',
        package_name: `${selectedProvider.service_name} - ${destination.name}`,
        calculated_price: parseFloat(selectedProvider.price),
        addons: JSON.stringify([])
      };
      
      await bookingsAPI.create(bookingPayload);
      
      toast({
        title: "Booking Successful!",
        description: `Your booking with ${selectedProvider.name} has been confirmed.`,
      });
      
      onClose();
      setShowBookingForm(false);
      setSelectedProvider(null);
      
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.response?.data?.detail || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      min_price: '',
      max_price: '',
      min_rating: ''
    });
  };

  if (!destination) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {showBookingForm ? `Book ${selectedProvider?.name}` : `Service Providers for ${destination.name}`}
          </DialogTitle>
        </DialogHeader>

        {showBookingForm ? (
          // Booking Form
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProvider.name}</h3>
                  <p className="text-green-600 font-medium">{selectedProvider.service_name}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm">{selectedProvider.avg_rating || selectedProvider.rating}</span>
                    <span className="text-sm text-gray-500 ml-2">{selectedProvider.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-600 font-bold text-xl">
                    <IndianRupee className="h-5 w-5 mr-1" />
                    <span>{parseFloat(selectedProvider.price).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Booking Date</label>
                <Input
                  type="date"
                  value={bookingData.booking_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingData(prev => ({ ...prev, booking_date: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Guests</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={bookingData.guests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, guests: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Check-in Date</label>
                <Input
                  type="date"
                  value={bookingData.check_in}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingData(prev => ({ ...prev, check_in: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Check-out Date</label>
                <Input
                  type="date"
                  value={bookingData.check_out}
                  min={bookingData.check_in}
                  onChange={(e) => setBookingData(prev => ({ ...prev, check_out: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Special Requests</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows="3"
                placeholder="Any special requirements or notes..."
                value={bookingData.special_requests}
                onChange={(e) => setBookingData(prev => ({ ...prev, special_requests: e.target.value }))}
              />
            </div>

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedProvider(null);
                }}
              >
                Back to Providers
              </Button>
              <Button 
                onClick={handleBookingSubmit}
                disabled={bookingLoading || !bookingData.booking_date || !bookingData.check_in || !bookingData.check_out}
                className="bg-green-600 hover:bg-green-700"
              >
                {bookingLoading ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        ) : (
          // Provider Selection
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Filter Providers</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
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

                <div className="flex gap-1">
                  <Input
                    type="number"
                    placeholder="Min ₹"
                    value={filters.min_price}
                    onChange={(e) => setFilters(prev => ({ ...prev, min_price: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max ₹"
                    value={filters.max_price}
                    onChange={(e) => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                  />
                </div>

                <Select value={filters.min_rating} onValueChange={(value) => setFilters(prev => ({ ...prev, min_rating: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Min Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.5">3.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters} size="sm">
                  Clear
                </Button>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Providers List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading providers...</p>
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No providers found for your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProviders.map((provider) => (
                  <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          <p className="text-green-600 font-medium">{provider.service_name}</p>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-600">{provider.location}</span>
                          </div>
                        </div>
                        <Badge className="capitalize">{provider.category}</Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{provider.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium">
                            {provider.avg_rating ? parseFloat(provider.avg_rating).toFixed(1) : provider.rating}
                          </span>
                          {provider.review_count > 0 && (
                            <span className="text-xs text-gray-500 ml-1">({provider.review_count} reviews)</span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-green-600 font-bold">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span>{parseFloat(provider.price).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      
                      {/* Reviews Preview */}
                      {reviews[provider.id] && reviews[provider.id].length > 0 && (
                        <div className="bg-gray-50 p-2 rounded mb-3">
                          <div className="flex items-center mb-1">
                            <MessageCircle className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs font-medium">Recent Review:</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            "{reviews[provider.id][0].comment}" - {reviews[provider.id][0].user_name}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{provider.contact}</span>
                      </div>
                      
                      <Button 
                        onClick={() => handleProviderSelect(provider)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        Select Provider
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProviderSelectionModal;