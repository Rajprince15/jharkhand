import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, DollarSign, Calendar, LogOut, Plus, Loader2, Activity } from 'lucide-react';
import { bookingsAPI, providerManagementAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    monthlyRevenue: 0,
    activeServices: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsData, servicesData] = await Promise.all([
        bookingsAPI.getProviderBookings(),
        providerManagementAPI.getUserProviders()
      ]);
      
      setBookings(bookingsData);
      setServices(servicesData);
      
      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = bookingsData.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyBookings
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + (booking.total_price || 0), 0);
      
      const pendingBookings = bookingsData.filter(booking => booking.status === 'pending').length;
      
      setStats({
        totalBookings: bookingsData.length,
        monthlyRevenue: monthlyRevenue,
        activeServices: servicesData.filter(service => service.is_active).length,
        pendingBookings: pendingBookings
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await bookingsAPI.updateStatus(bookingId, status);
      await fetchDashboardData(); // Refresh data
      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  if (!user || user.role !== 'provider') {
    navigate('/login');
    return null;
  }

  const recentBookings = bookings.slice(0, 5);

  const statsData = [
    { title: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'text-blue-600' },
    { title: 'This Month Revenue', value: `₹${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { title: 'Active Services', value: stats.activeServices, icon: Users, color: 'text-purple-600' },
    { title: 'Pending Bookings', value: stats.pendingBookings, icon: Activity, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/">
              <Button variant="outline">Home</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Add or update your tourism services</p>
                  <div className="flex space-x-4">
                    <Link to="/add-service">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Service
                      </Button>
                    </Link>
                    <Link to="/view-services">
                      <Button variant="outline">
                        View Services & Reviews
                      </Button>
                    </Link>
                  </div>
                  {services.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        You have {services.length} service(s) listed
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">View and manage your bookings</p>
                  <Link to="/provider-bookings">
                    <Button variant="outline">View All Bookings</Button>
                  </Link>
                  {stats.pendingBookings > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-800">
                        You have {stats.pendingBookings} pending booking(s) that need attention
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">New booking from {booking.user_name}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {booking.destination_name} • {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.guests} guest(s) • ₹{booking.total_price}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
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
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Bookings will appear here when customers book your services
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;