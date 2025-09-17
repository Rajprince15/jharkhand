import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, MapPin, User, Clock, ArrowLeft, Star, MessageCircle } from 'lucide-react';
import { bookingsAPI, reviewsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import ReviewModal from '../components/ReviewModal';

const BookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eligibleReviews, setEligibleReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewItemType, setReviewItemType] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchBookings();
    fetchEligibleReviews();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Fetch real bookings from API
      const response = await bookingsAPI.getUserBookings();
      console.log('Fetched bookings:', response);
      
      // Transform database response to match frontend format
      const transformedBookings = response.map(booking => ({
        id: booking.id,
        destination: booking.destination_name || booking.package_name || 'Unknown Destination',
        provider: booking.provider_name || 'Unknown Provider',
        date: booking.check_in || booking.booking_date,
        status: booking.status,
        price: booking.total_price,
        packageType: booking.package_type,
        packageName: booking.package_name,
        addons: booking.addons ? JSON.parse(booking.addons) : [],
        guests: booking.guests,
        rooms: booking.rooms,
        specialRequests: booking.special_requests,
        image: getImageForPackage(booking.package_type || 'heritage'),
        destination_id: booking.destination_id,
        provider_id: booking.provider_id,
        booking_date: booking.booking_date
      }));
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Set empty array on error instead of showing mock data
      setBookings([]);
      toast({
        title: "Error",
        description: "Failed to load bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibleReviews = async () => {
    try {
      const response = await reviewsAPI.getEligibleReviews();
      setEligibleReviews(response.eligible_reviews || []);
    } catch (error) {
      console.error('Error fetching eligible reviews:', error);
    }
  };

  const handleReviewDestination = (booking) => {
    const eligibleItem = eligibleReviews.find(item => 
      item.destination_id === booking.destination_id && item.can_review_destination
    );
    
    if (!eligibleItem) {
      toast({
        title: "Review Not Available",
        description: "You can only review destinations after completing your booking.",
        variant: "destructive",
      });
      return;
    }

    setSelectedReviewItem(eligibleItem);
    setReviewItemType('destination');
    setShowReviewModal(true);
  };

  const handleReviewProvider = (booking) => {
    const eligibleItem = eligibleReviews.find(item => 
      item.provider_id === booking.provider_id && item.can_review_provider
    );
    
    if (!eligibleItem) {
      toast({
        title: "Review Not Available",
        description: "You can only review providers after completing your booking.",
        variant: "destructive",
      });
      return;
    }

    setSelectedReviewItem(eligibleItem);
    setReviewItemType('provider');
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    fetchEligibleReviews(); // Refresh eligible reviews
    toast({
      title: "Review Submitted",
      description: "Thank you for sharing your experience!",
    });
  };

  const canReviewDestination = (booking) => {
    return booking.status === 'completed' && eligibleReviews.some(item => 
      item.destination_id === booking.destination_id && item.can_review_destination
    );
  };

  const canReviewProvider = (booking) => {
    return booking.status === 'completed' && eligibleReviews.some(item => 
      item.provider_id === booking.provider_id && item.can_review_provider
    );
  };

  // Helper function to get appropriate image based on package type
  const getImageForPackage = (packageType) => {
    const packageImages = {
      heritage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      adventure: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      spiritual: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      premium: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    };
    return packageImages[packageType] || packageImages.heritage;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/tourist-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-600">Manage your travel bookings</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start planning your trip!</p>
              <Link to="/destinations">
                <Button className="bg-green-600 hover:bg-green-700">
                  Explore Destinations
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                      <img
                        src={booking.image}
                        alt={booking.destination}
                        className="w-full md:w-32 h-32 object-cover rounded-lg mb-4 md:mb-0"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {booking.packageName || booking.destination}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span className="text-sm">{booking.provider}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className={`text-sm px-2 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          {booking.packageType && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="text-sm capitalize">{booking.packageType} Package</span>
                            </div>
                          )}
                          {booking.guests && (
                            <div className="text-sm text-gray-600">
                              Travelers: {booking.guests} | Rooms: {booking.rooms}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                      <p className="text-2xl font-bold text-green-600 mb-4">
                        ₹{booking.price.toLocaleString()}
                      </p>
                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                          View Details
                        </Button>
                        {booking.status === 'pending' && (
                          <Button variant="outline" size="sm" className="w-full md:w-auto text-red-600 border-red-300">
                            Cancel Booking
                          </Button>
                        )}
                        {/* Review Buttons for Completed Bookings */}
                        {booking.status === 'completed' && (
                          <div className="space-y-2 mt-2">
                            {canReviewDestination(booking) && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full md:w-auto text-blue-600 border-blue-300 hover:bg-blue-50"
                                onClick={() => handleReviewDestination(booking)}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Review Destination
                              </Button>
                            )}
                            {canReviewProvider(booking) && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full md:w-auto text-green-600 border-green-300 hover:bg-green-50"
                                onClick={() => handleReviewProvider(booking)}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Review Provider
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        item={selectedReviewItem}
        itemType={reviewItemType}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default BookingsPage;