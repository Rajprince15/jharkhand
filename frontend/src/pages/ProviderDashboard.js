import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, IndianRupee, Calendar, LogOut, Plus, Loader2, Activity, TrendingUp, Eye, RefreshCw, Clock, Star, MapPin, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { bookingsAPI, providerManagementAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import CountUp from 'react-countup';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    monthlyRevenue: 0,
    activeServices: 0,
    pendingBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    monthlyGrowth: [],
    revenueGrowth: [],
    bookingStatusDistribution: {},
    recentActivity: []
  });

  // Color scheme: white, green, brown (matching admin)
  const colors = {
    primary: '#22c55e', // green-500
    secondary: '#a3a3a3', // neutral-400
    accent: '#92400e', // amber-800 (brown)
    background: '#ffffff', // white
    surface: '#f8fafc', // slate-50
    text: '#1f2937' // gray-800
  };

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchDashboardData();
      
      // Auto-refresh every 2 minutes
      const interval = setInterval(fetchDashboardData, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsData, servicesData] = await Promise.all([
        bookingsAPI.getProviderBookings(),
        providerManagementAPI.getUserProviders()
      ]);
      
      setBookings(bookingsData);
      setServices(servicesData);
      
      // Calculate comprehensive stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = bookingsData.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
      
      const monthlyRevenue = monthlyBookings
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + (booking.total_price || 0), 0);
      
      const completedBookings = bookingsData.filter(booking => booking.status === 'completed').length;
      const pendingBookings = bookingsData.filter(booking => booking.status === 'pending').length;
      
      // Calculate booking status distribution
      const statusCounts = bookingsData.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {});
      
      // Generate mock growth data (in real app, this would come from backend)
      const monthlyGrowth = Array.from({ length: 6 }, (_, i) => ({
        month: new Date(currentYear, currentMonth - 5 + i, 1).toLocaleDateString('en-US', { month: 'short' }),
        bookings: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 50000) + 10000
      }));
      
      setStats({
        totalBookings: bookingsData.length,
        monthlyRevenue: monthlyRevenue,
        activeServices: servicesData.filter(service => service.is_active).length,
        pendingBookings: pendingBookings,
        completedBookings: completedBookings,
        averageRating: 4.8, // This would come from reviews API
        monthlyGrowth: monthlyGrowth,
        revenueGrowth: monthlyGrowth,
        bookingStatusDistribution: statusCounts,
        recentActivity: bookingsData.slice(0, 5)
      });
      
      setLastUpdated(new Date());
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
  }, [toast]);

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

  // 3D Animation components (matching admin)
  const AnimatedCard = ({ children, delay = 0, className = "" }) => {
    const cardSpring = useSpring({
      from: { transform: 'perspective(1000px) rotateX(30deg) translateY(50px)', opacity: 0 },
      to: { transform: 'perspective(1000px) rotateX(0deg) translateY(0px)', opacity: 1 },
      delay: delay * 100,
      config: { tension: 280, friction: 60 }
    });

    return (
      <animated.div 
        style={cardSpring}
        className={`transform-gpu hover:scale-105 transition-all duration-300 ${className}`}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'perspective(1000px) rotateY(5deg) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) scale(1)';
        }}
      >
        {children}
      </animated.div>
    );
  };

  // Booking details modal handler
  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetailsModal(true);
  };

  // Chart data processing
  const pieChartData = Object.entries(stats.bookingStatusDistribution).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: status === 'completed' ? colors.primary : 
           status === 'pending' ? '#fbbf24' : 
           status === 'cancelled' ? '#ef4444' : colors.accent
  }));

  if (!user || user.role !== 'provider') {
    navigate('/login');
    return null;
  }

  const recentBookings = bookings.slice(0, 5);

  const statsData = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      gradient: 'from-green-400 to-green-600',
      textColor: 'text-white'
    },
    {
      title: 'This Month Revenue',
      value: stats.monthlyRevenue,
      icon: IndianRupee,
      gradient: 'from-amber-700 to-amber-900',
      textColor: 'text-white',
      isRevenue: true
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: Users,
      gradient: 'from-green-500 to-green-700',
      textColor: 'text-white'
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Activity,
      gradient: 'from-amber-600 to-amber-800',
      textColor: 'text-white'
    },
    {
      title: 'Completed Bookings',
      value: stats.completedBookings,
      icon: CheckCircle,
      gradient: 'from-green-600 to-green-800',
      textColor: 'text-white'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating,
      icon: Star,
      gradient: 'from-amber-500 to-amber-700',
      textColor: 'text-white',
      isRating: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-amber-50">
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
              Provider Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={fetchDashboardData} 
              variant="outline" 
              className="border-green-300 text-green-700 hover:bg-green-50"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/">
              <Button variant="outline" className="hover:bg-gray-50">Home</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="hover:bg-gray-50">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {/* 3D Animated Stats Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {statsData.map((stat, index) => (
                <AnimatedCard key={index} delay={index}>
                  <Card className={`bg-gradient-to-br ${stat.gradient} ${stat.textColor} shadow-xl border-0 overflow-hidden relative`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium opacity-90">{stat.title}</p>
                          <div className="text-3xl font-bold">
                            {stat.isRevenue ? (
                              <span>₹<CountUp end={stat.value} duration={2} separator="," /></span>
                            ) : stat.isRating ? (
                              <span><CountUp end={stat.value} duration={2} decimals={1} /> ⭐</span>
                            ) : (
                              <CountUp end={stat.value} duration={2} />
                            )}
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <stat.icon className="h-8 w-8 opacity-80" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </motion.div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <AnimatedCard delay={6}>
                <Card className="bg-white shadow-xl border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-green-900 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Booking Growth Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stats.monthlyGrowth}>
                        <defs>
                          <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="bookings" 
                          stroke={colors.primary} 
                          fillOpacity={1} 
                          fill="url(#bookingGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={7}>
                <Card className="bg-white shadow-xl border-amber-100">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
                    <CardTitle className="text-amber-900 flex items-center">
                      <IndianRupee className="h-5 w-5 mr-2" />
                      Revenue Growth Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.revenueGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={colors.accent} 
                          strokeWidth={3}
                          dot={{ fill: colors.accent, strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* Status Distribution Chart */}
            <AnimatedCard delay={8}>
              <Card className="bg-white shadow-xl mb-8">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-green-600" />
                    Booking Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* Quick Actions */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              <AnimatedCard delay={9}>
                <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-green-900">Manage Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 mb-4">Add or update your tourism services</p>
                    <div className="flex space-x-4">
                      <Link to="/add-service">
                        <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Service
                        </Button>
                      </Link>
                      <Link to="/view-services">
                        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                          View Services & Reviews
                        </Button>
                      </Link>
                    </div>
                    {services.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          You have {services.length} service(s) listed, {stats.activeServices} active
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={10}>
                <Card className="bg-gradient-to-br from-amber-100 to-amber-200 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-700 mb-4">View and manage your bookings</p>
                    <Link to="/provider-bookings">
                      <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white w-full">
                        View All Bookings
                      </Button>
                    </Link>
                    {stats.pendingBookings > 0 && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-800">
                          You have {stats.pendingBookings} pending booking(s) that need attention
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </motion.div>

            {/* Recent Activity */}
            <AnimatedCard delay={11}>
              <Card className="bg-white shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-amber-50">
                  <CardTitle className="text-gray-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking, index) => (
                        <motion.div
                          key={booking.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">New booking from {booking.user_name}</p>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewBookingDetails(booking)}
                              className="p-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
                                  className="text-red-600 hover:text-red-700"
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
                        </motion.div>
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
            </AnimatedCard>
          </AnimatePresence>
        )}

        {/* Booking Details Modal */}
        {showBookingDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
                <Button variant="outline" onClick={() => setShowBookingDetailsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Customer Name</label>
                    <p className="text-gray-900">{selectedBooking.user_name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Destination</label>
                    <p className="text-gray-900">{selectedBooking.destination_name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Booking Date</label>
                    <p className="text-gray-900">{new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Guests</label>
                    <p className="text-gray-900">{selectedBooking.guests}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Total Price</label>
                    <p className="text-gray-900 font-bold">₹{selectedBooking.total_price}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Status</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedBooking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
                
                {selectedBooking.special_requests && (
                  <div>
                    <label className="font-medium text-gray-700">Special Requests</label>
                    <p className="text-gray-900">{selectedBooking.special_requests}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, 'confirmed');
                          setShowBookingDetailsModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </Button>
                      <Button
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, 'cancelled');
                          setShowBookingDetailsModal(false);
                        }}
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline Booking
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;