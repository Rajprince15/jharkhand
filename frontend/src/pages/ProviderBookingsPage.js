import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, User, Phone, Mail, ArrowLeft, Eye, Check, X, Search } from 'lucide-react';
import { bookingsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ProviderBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    booking: null
  });

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/provider-dashboard');
      return;
    }
    
    fetchProviderBookings();
  }, [user, navigate]);

  const fetchProviderBookings = async () => {
    try {
      setLoading(true);
      // Fetch real bookings from API
      const response = await bookingsAPI.getProviderBookings();
      console.log('Fetched provider bookings:', response);
      
      // Transform database response to match frontend format
      const transformedBookings = response.map(booking => ({
        id: booking.id,
        serviceName: booking.provider_name || 'Unknown Service',
        customerName: booking.booking_full_name || booking.user_name || 'Unknown Customer',
        customerEmail: booking.booking_email || 'Not provided',
        customerPhone: booking.booking_phone || 'Not provided',
        bookingDate: booking.check_in || booking.booking_date,
        createdAt: booking.created_at,
        status: booking.status,
        price: booking.total_price,
        guests: booking.guests,
        rooms: booking.rooms,
        specialRequests: booking.special_requests || 'None',
        destinationName: booking.destination_name,
        packageType: booking.package_type,
        packageName: booking.package_name,
        addons: booking.addons ? JSON.parse(booking.addons) : [],
        cityOrigin: booking.city_origin,
        referenceNumber: booking.reference_number || booking.id.substring(0, 8)
      }));
      
      setBookings(transformedBookings);
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings data",
        variant: "destructive",
      });
      setBookings([]);
    } finally {
      setLoading(false);
    }
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

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      // Refresh the bookings data after updating
      await fetchProviderBookings();
      toast({
        title: "Success",
        description: `Booking ${newStatus} successfully`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const searchBookings = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reference number to search",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/provider/bookings/search?reference_number=${encodeURIComponent(searchTerm.trim())}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      if (data.bookings && data.bookings.length > 0) {
        const transformedBookings = data.bookings.map(booking => ({
          id: booking.id,
          serviceName: booking.provider_name || 'Unknown Service',
          customerName: booking.booking_full_name || booking.user_name || 'Unknown Customer',
          customerEmail: booking.booking_email || 'Not provided',
          customerPhone: booking.booking_phone || 'Not provided',
          bookingDate: booking.check_in || booking.booking_date,
          createdAt: booking.created_at,
          status: booking.status,
          price: booking.total_price,
          guests: booking.guests,
          rooms: booking.rooms,
          specialRequests: booking.special_requests || 'None',
          destinationName: booking.destination_name,
          packageType: booking.package_type,
          packageName: booking.package_name,
          addons: booking.addons ? JSON.parse(booking.addons) : [],
          cityOrigin: booking.city_origin,
          referenceNumber: booking.reference_number || booking.id.substring(0, 8)
        }));
        
        setBookings(transformedBookings);
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        setBookings([]);
        toast({
          title: "No Results",
          description: data.message || "No bookings found with this reference number",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error searching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to search bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchTerm('');
    fetchProviderBookings();
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

  const filteredBookings = bookings.filter(booking => 
    (filter === 'all' || booking.status === filter) &&
    (searchTerm === '' || 
     booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     booking.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
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
              <Link to="/provider-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
                <p className="text-gray-600">View and manage your service bookings</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by reference number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={searchBookings} className="bg-green-600 hover:bg-green-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button onClick={resetSearch} variant="outline">
                    View All
                  </Button>
                  <Button onClick={fetchProviderBookings} variant="outline">
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`pb-2 px-1 capitalize ${
                  filter === status
                    ? 'border-b-2 border-green-600 text-green-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {status === 'all' ? 'All Bookings' : status}
                <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {filter !== 'all' ? filter : ''} bookings found
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You don't have any bookings yet." 
                  : `No ${filter} bookings at the moment.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {booking.packageName || booking.serviceName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
                            <span>{booking.guests} guests</span>
                            
                          </div>
                          {booking.destinationName && (
                            <p className="text-sm text-gray-600">Destination: {booking.destinationName}</p>
                          )}
                          {booking.referenceNumber && (
                            <p className="text-sm text-gray-500">Reference: {booking.referenceNumber}</p>
                          )}
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              {booking.customerName}
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {booking.customerEmail}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              {booking.customerPhone}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Price: <span className="font-medium text-green-600">₹{booking.price.toLocaleString()}</span></div>
                            <div>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</div>
                            {booking.packageType && <div>Package: <span className="capitalize">{booking.packageType}</span></div>}
                            {booking.cityOrigin && <div>From: {booking.cityOrigin}</div>}
                            {booking.addons && booking.addons.length > 0 && (
                              <div>Add-ons: {booking.addons.join(', ')}</div>
                            )}
                            <div>Special Requests: {booking.specialRequests}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <div className="flex flex-col space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDetailsModal(booking)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Confirm
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {detailsModal.booking.packageName || detailsModal.booking.serviceName}
                  </h2>
                  <p className="text-gray-600 mt-1">Booking Details - Provider View</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Ref: {detailsModal.booking.referenceNumber}
                  </p>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(detailsModal.booking.status)}`}>
                  {detailsModal.booking.status.charAt(0).toUpperCase() + detailsModal.booking.status.slice(1)}
                </span>
              </div>

              {/* Booking Information Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Customer Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                    <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600 w-20">Name:</span>
                        <span className="font-medium">{detailsModal.booking.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600 w-20">Email:</span>
                        <span className="font-medium">{detailsModal.booking.customerEmail}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-600 w-20">Phone:</span>
                        <span className="font-medium">{detailsModal.booking.customerPhone}</span>
                      </div>
                      {detailsModal.booking.cityOrigin && (
                        <div className="flex items-center">
                          <span className="text-gray-600 w-20 ml-6">From:</span>
                          <span className="font-medium">{detailsModal.booking.cityOrigin}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Trip Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booking ID:</span>
                        <span className="font-medium">#{detailsModal.booking.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in Date:</span>
                        <span className="font-medium">{new Date(detailsModal.booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Booked on:</span>
                        <span className="font-medium">{new Date(detailsModal.booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium">{detailsModal.booking.guests} person(s)</span>
                      </div>
                      
                      {detailsModal.booking.destinationName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Destination:</span>
                          <span className="font-medium">{detailsModal.booking.destinationName}</span>
                        </div>
                      )}
                      {detailsModal.booking.packageType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Package Type:</span>
                          <span className="font-medium capitalize">{detailsModal.booking.packageType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Service & Payment Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Add-ons & Services</h3>
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
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-600">₹{detailsModal.booking.price.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Payment status: {detailsModal.booking.status === 'completed' ? 'Completed' : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {detailsModal.booking.specialRequests && detailsModal.booking.specialRequests !== 'None' && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Special Requests</h3>
                      <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                        {detailsModal.booking.specialRequests}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-between">
                
                
                <div className="flex space-x-3">
                  {detailsModal.booking.status === 'pending' && (
                    <>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          updateBookingStatus(detailsModal.booking.id, 'confirmed');
                          closeDetailsModal();
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => {
                          updateBookingStatus(detailsModal.booking.id, 'cancelled');
                          closeDetailsModal();
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline Booking
                      </Button>
                    </>
                  )}
                  
                  {detailsModal.booking.status === 'confirmed' && (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        updateBookingStatus(detailsModal.booking.id, 'completed');
                        closeDetailsModal();
                      }}
                    >
                      Mark as Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookingsPage;