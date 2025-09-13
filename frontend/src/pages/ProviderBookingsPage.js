import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, User, Phone, Mail, ArrowLeft, Eye, Check, X } from 'lucide-react';

const ProviderBookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'provider') {
      navigate('/provider-dashboard');
      return;
    }
    
    // Mock bookings data for provider
    const mockBookings = [
      {
        id: '1',
        serviceName: 'Ranchi City Tour',
        customerName: 'Priya Sharma',
        customerEmail: 'priya@example.com',
        customerPhone: '+91 9876543210',
        bookingDate: '2025-03-15',
        createdAt: '2025-02-20',
        status: 'confirmed',
        price: 3000,
        guests: 2,
        specialRequests: 'Vegetarian lunch preferred'
      },
      {
        id: '2',
        serviceName: 'Netarhat Trek',
        customerName: 'Rajesh Kumar',
        customerEmail: 'rajesh@example.com',
        customerPhone: '+91 9876543211',
        bookingDate: '2025-03-20',
        createdAt: '2025-02-22',
        status: 'pending',
        price: 2500,
        guests: 4,
        specialRequests: 'Need camping equipment'
      },
      {
        id: '3',
        serviceName: 'Betla Safari',
        customerName: 'Sunita Devi',
        customerEmail: 'sunita@example.com',
        customerPhone: '+91 9876543212',
        bookingDate: '2025-02-28',
        createdAt: '2025-02-15',
        status: 'completed',
        price: 4000,
        guests: 3,
        specialRequests: 'Early morning safari preferred'
      },
      {
        id: '4',
        serviceName: 'Ranchi City Tour',
        customerName: 'Amit Singh',
        customerEmail: 'amit@example.com',
        customerPhone: '+91 9876543213',
        bookingDate: '2025-04-10',
        createdAt: '2025-02-25',
        status: 'cancelled',
        price: 3000,
        guests: 1,
        specialRequests: 'None'
      }
    ];
    
    setBookings(mockBookings);
    setLoading(false);
  }, [user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
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
                            {booking.serviceName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
                            <span>{booking.guests} guests</span>
                          </div>
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
                            <div>Special Requests: {booking.specialRequests}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      <div className="flex flex-col space-y-2">
                        <Button variant="outline" size="sm">
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
    </div>
  );
};

export default ProviderBookingsPage;