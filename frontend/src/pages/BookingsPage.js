import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, MapPin, User, Clock, ArrowLeft, Star } from 'lucide-react';
import { bookingsAPI } from '../services/api';
import ReviewModal from '../components/ReviewModal';

const BookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    booking: null,
    type: 'provider' // can be 'provider' or 'destination'
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    booking: null
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
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
          destination_id: booking.destination_id,
          provider: booking.provider_name || 'Unknown Provider',
          provider_id: booking.provider_id,
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
          hasReviewed: booking.has_reviewed || false // Track if user has already reviewed
        }));
        
        setBookings(transformedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Set empty array on error instead of showing mock data
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

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

  const openReviewModal = (booking, type) => {
    setReviewModal({
      isOpen: true,
      booking: booking,
      type: type
    });
  };

  const closeReviewModal = () => {
    setReviewModal({
      isOpen: false,
      booking: null,
      type: 'provider'
    });
  };

  const openDetailsModal = (booking) => {
    setDetailsModal({
      isOpen: true,
      booking: booking
    });
  };

  const closeDetailsModal = () => {
    setDetailsModal({
      isOpen: false,
      booking: null
    });
  };

  const handleReviewSubmitted = () => {
    // Refresh bookings after review submission
    closeReviewModal();
    // Could add a flag to mark as reviewed in the UI
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
                              Travelers: {booking.guests} 
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full md:w-auto"
                          onClick={() => openDetailsModal(booking)}
                        >
                          View Details
                        </Button>
                        {booking.status === 'pending' && (
                          <Button variant="outline" size="sm" className="w-full md:w-auto text-red-600 border-red-300">
                            Cancel Booking
                          </Button>
                        )}
                        {booking.status === 'completed' && !booking.hasReviewed && (
                          <div className="flex flex-col space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full md:w-auto text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => openReviewModal(booking, 'provider')}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Review Service
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full md:w-auto text-blue-600 border-blue-300 hover:bg-blue-50"
                              onClick={() => openReviewModal(booking, 'destination')}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Review Destination
                            </Button>
                          </div>
                        )}
                        {booking.status === 'completed' && booking.hasReviewed && (
                          <p className="text-sm text-gray-500 italic">Review submitted</p>
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
      
      {/* Booking Details Modal */}
      {detailsModal.isOpen && detailsModal.booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {detailsModal.booking.packageName || detailsModal.booking.destination}
                  </h2>
                  <p className="text-gray-600 mt-1">Booking Details</p>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Booking Image */}
              <div className="mb-6">
                <img
                  src={detailsModal.booking.image}
                  alt={detailsModal.booking.destination}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>

              {/* Booking Information Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Trip Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking ID:</span>
                        <span className="font-medium">#{detailsModal.booking.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destination:</span>
                        <span className="font-medium">{detailsModal.booking.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Provider:</span>
                        <span className="font-medium">{detailsModal.booking.provider}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(detailsModal.booking.status)}`}>
                          {detailsModal.booking.status.charAt(0).toUpperCase() + detailsModal.booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Travel Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in Date:</span>
                        <span className="font-medium">{new Date(detailsModal.booking.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium">{detailsModal.booking.guests} person(s)</span>
                      </div>
                     
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Add-ons & Services</h3>
                    <div className="space-y-2">
                      {detailsModal.booking.addons && detailsModal.booking.addons.length > 0 ? (
                        detailsModal.booking.addons.map((addon, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            <span className="capitalize">{addon}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No add-ons selected</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-600">₹{detailsModal.booking.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {detailsModal.booking.specialRequests && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {detailsModal.booking.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-3">
                <Button variant="outline" onClick={closeDetailsModal}>
                  Close
                </Button>
                {detailsModal.booking.status === 'pending' && (
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    Cancel Booking
                  </Button>
                )}
                
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {reviewModal.isOpen && reviewModal.booking && (
        <ReviewModal
          isOpen={reviewModal.isOpen}
          onClose={closeReviewModal}
          item={{
            [reviewModal.type === 'destination' ? 'destination_id' : 'provider_id']: 
              reviewModal.type === 'destination' ? reviewModal.booking.destination_id : reviewModal.booking.provider_id,
            [reviewModal.type === 'destination' ? 'destination_name' : 'provider_name']: 
              reviewModal.type === 'destination' ? reviewModal.booking.destination : reviewModal.booking.provider
          }}
          itemType={reviewModal.type}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default BookingsPage;