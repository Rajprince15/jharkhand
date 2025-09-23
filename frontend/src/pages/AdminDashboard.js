import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, MapPin, Star, TrendingUp, LogOut, Loader2, IndianRupee, Calendar, Clock, Eye, RefreshCw, X, Ban, Trash2, ToggleLeft, ToggleRight, Home } from 'lucide-react';
import { adminAPI, destinationsAPI, providersAPI, reviewsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import CountUp from 'react-countup';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDestinations: 0,
    totalProviders: 0,
    activeProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: [],
    userGrowth: [],
    bookingGrowth: [],
    recentBookings: [],
    bookingByStatus: {},
    revenueByDestination: []
  });

  const [recentDestinations, setRecentDestinations] = useState([]);
  const [recentProviders, setRecentProviders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  // Modal states
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  // Provider management states
  const [showProviderManageModal, setShowProviderManageModal] = useState(false);
  const [allProviders, setAllProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerAction, setProviderAction] = useState('');
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  // Color scheme: white, green, brown
  const colors = {
    primary: '#22c55e', // green-500
    secondary: '#a3a3a3', // neutral-400
    accent: '#92400e', // amber-800 (brown)
    background: '#ffffff', // white
    surface: '#f8fafc', // slate-50
    text: '#1f2937' // gray-800
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
      
      // Auto-refresh every 1 minute
      const interval = setInterval(fetchDashboardData, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      
      setStats({
        totalUsers: data.total_users || 0,
        totalDestinations: data.total_destinations || 0,
        totalProviders: data.total_providers || 0,
        activeProviders: data.active_providers || 0,
        totalBookings: data.total_bookings || 0,
        totalRevenue: data.total_revenue || 0,
        monthlyRevenue: data.monthly_revenue || [],
        userGrowth: data.user_growth || [],
        bookingGrowth: data.booking_growth || [],
        recentBookings: data.recent_bookings || [],
        bookingByStatus: data.booking_by_status || {},
        revenueByDestination: data.revenue_by_destination || []
      });
      
      setLastUpdated(new Date());
      
      // Show success message for manual refresh
      toast({
        title: "Success",
        description: "Dashboard data refreshed successfully!",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh dashboard. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // User Management Functions
  const handleViewAllUsers = async () => {
    try {
      const users = await adminAPI.getAllUsers();
      setAllUsers(users);
      setShowUsersModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await adminAPI.banUser(userId);
      toast({
        title: "Success",
        description: "User has been banned",
      });
      handleViewAllUsers(); // Refresh users list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      toast({
        title: "Success",
        description: "User has been deleted",
      });
      handleViewAllUsers(); // Refresh users list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Provider Management Functions
  const handleViewAllProviders = async () => {
    try {
      const providers = await providersAPI.getAll();
      setAllProviders(providers);
      setShowProviderManageModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load providers",
        variant: "destructive",
      });
    }
  };

  const handleProviderAction = (provider, action) => {
    setSelectedProvider(provider);
    setProviderAction(action);
  };

  const confirmProviderAction = async () => {
    if (!selectedProvider || !providerAction) return;

    try {
      setConfirmationLoading(true);
      
      if (providerAction === 'toggle') {
        await providersAPI.update(selectedProvider.id, {
          ...selectedProvider,
          is_active: !selectedProvider.is_active
        });
        toast({
          title: "Success",
          description: `Provider ${selectedProvider.is_active ? 'deactivated' : 'activated'} successfully`,
        });
      } else if (providerAction === 'delete') {
        await providersAPI.delete(selectedProvider.id);
        toast({
          title: "Success",
          description: "Provider deleted successfully",
        });
      }

      // Refresh providers list
      await handleViewAllProviders();
      setSelectedProvider(null);
      setProviderAction('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${providerAction} provider`,
        variant: "destructive",
      });
    } finally {
      setConfirmationLoading(false);
    }
  };

  // Booking Management Functions
  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetailsModal(true);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await adminAPI.cancelBooking(bookingId);
      toast({
        title: "Success",
        description: "Booking has been cancelled",
      });
      fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  // 3D Animation components
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

  // Chart data processing
  const processChartData = (data, key) => {
    return data.map(item => ({
      month: new Date(`${item.month}-01`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: item[key] || 0,
      [key]: item[key] || 0
    }));
  };

  const pieChartData = Object.entries(stats.bookingByStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: status === 'completed' ? colors.primary : 
           status === 'pending' ? '#fbbf24' : 
           status === 'cancelled' ? '#ef4444' : colors.accent
  }));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const statsData = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-green-400 to-green-600',
      textColor: 'text-white'
    },
    {
      title: 'Total Destinations',
      value: stats.totalDestinations,
      icon: MapPin,
      gradient: 'from-amber-700 to-amber-900',
      textColor: 'text-white'
    },
    {
      title: 'Service Providers',
      value: stats.totalProviders,
      icon: Users,
      gradient: 'from-green-500 to-green-700',
      textColor: 'text-white'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: TrendingUp,
      gradient: 'from-amber-600 to-amber-800',
      textColor: 'text-white'
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      icon: IndianRupee,
      gradient: 'from-green-600 to-green-800',
      textColor: 'text-white',
      isRevenue: true
    },
    {
      title: 'Active Providers',
      value: stats.activeProviders,
      icon: Star,
      gradient: 'from-amber-500 to-amber-700',
      textColor: 'text-white'
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
              Admin Dashboard
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
            <Link to="/">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button 
              onClick={fetchDashboardData} 
              variant="outline" 
              className="border-green-300 text-green-700 hover:bg-green-50"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
              <p className="text-gray-600">Loading dashboard data...</p>
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

            {/* Growth Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              <AnimatedCard delay={6}>
                <Card className="bg-white shadow-xl border-green-100">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-green-900 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      User Growth Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={processChartData(stats.userGrowth, 'new_users')}>
                        <defs>
                          <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
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
                          dataKey="new_users" 
                          stroke={colors.primary} 
                          fillOpacity={1} 
                          fill="url(#userGradient)" 
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
                      <LineChart data={processChartData(stats.monthlyRevenue, 'revenue')}>
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

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AnimatedCard delay={8}>
                <Card className="bg-white shadow-xl">
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

              <AnimatedCard delay={9}>
                <Card className="bg-white shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-amber-600" />
                      Revenue by Destination
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.revenueByDestination} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                        <YAxis dataKey="destination_name" type="category" width={100} />
                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill={colors.primary} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* Recent Bookings */}
            <AnimatedCard delay={10}>
              <Card className="bg-white shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-50 to-amber-50">
                  <CardTitle className="text-gray-800 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentBookings.map((booking, index) => (
                        <motion.div
                          key={booking.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-medium">{booking.customer_name}</p>
                                <p className="text-sm text-gray-600">{booking.destination_name}</p>
                                <p className="text-xs text-gray-500">{booking.package_type} • {booking.guests} guests</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">₹{booking.total_price.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewBookingDetails(booking)}
                                className="p-2"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="p-2 text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No recent bookings found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* Management Actions */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
            >
              <AnimatedCard delay={11}>
                <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-green-900">User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 mb-4">Manage registered users and their roles</p>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      onClick={handleViewAllUsers}
                    >
                      View All Users
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={12}>
                <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Provider Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700 mb-4">Manage service providers and their status</p>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      onClick={handleViewAllProviders}
                    >
                      Manage Providers
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={13}>
                <Card className="bg-gradient-to-br from-amber-100 to-amber-200 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-amber-900">Content Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-700 mb-4">Manage destinations and provider listings</p>
                    <div className="space-y-2">
                      <Link to="/admin/destinations">
                        <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
                          Manage Destinations
                        </Button>
                      </Link>
                      <Link to="/admin/services">
                        <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                          Manage Services
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={14}>
                <Card className="bg-gradient-to-br from-green-100 to-amber-100 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-gray-800">System Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">View detailed analytics and reports</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-green-300 text-green-700 hover:bg-green-50" 
                      onClick={fetchDashboardData}
                    >
                      Advanced Analytics
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Users Management Modal */}
        {showUsersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
                <Button variant="outline" onClick={() => setShowUsersModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">Role: {user.role} • Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBanUser(user.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Ban
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Provider Management Modal */}
        {showProviderManageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[80vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Manage Providers</h2>
                <Button variant="outline" onClick={() => setShowProviderManageModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {allProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{provider.name}</p>
                          <p className="text-sm text-gray-600">{provider.service_name}</p>
                          <p className="text-xs text-gray-500">
                            {provider.category} • ₹{provider.price} • {provider.contact}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          provider.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {provider.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProviderAction(provider, 'toggle')}
                        className={provider.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {provider.is_active ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                        {provider.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProviderAction(provider, 'delete')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Provider Action Confirmation Modal */}
        {selectedProvider && providerAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="mb-4">
                  {providerAction === 'toggle' ? (
                    selectedProvider.is_active ? (
                      <ToggleRight className="h-16 w-16 text-red-500 mx-auto" />
                    ) : (
                      <ToggleLeft className="h-16 w-16 text-green-500 mx-auto" />
                    )
                  ) : (
                    <Trash2 className="h-16 w-16 text-red-500 mx-auto" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {providerAction === 'toggle' 
                    ? `${selectedProvider.is_active ? 'Deactivate' : 'Activate'} Provider?`
                    : 'Delete Provider?'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {providerAction === 'toggle' 
                    ? `Are you sure you want to ${selectedProvider.is_active ? 'deactivate' : 'activate'} "${selectedProvider.name}"?`
                    : `This will permanently delete "${selectedProvider.name}". This action cannot be undone.`
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedProvider(null);
                      setProviderAction('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmProviderAction}
                    disabled={confirmationLoading}
                    className={providerAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    {confirmationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {providerAction === 'toggle' 
                      ? (selectedProvider.is_active ? 'Deactivate' : 'Activate')
                      : 'Delete'
                    }
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
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
                    <p className="text-gray-900">{selectedBooking.customer_name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedBooking.customer_email}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Destination</label>
                    <p className="text-gray-900">{selectedBooking.destination_name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Package Type</label>
                    <p className="text-gray-900">{selectedBooking.package_type}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Guests</label>
                    <p className="text-gray-900">{selectedBooking.guests}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Total Price</label>
                    <p className="text-gray-900 font-bold">₹{selectedBooking.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Status</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedBooking.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Booking Date</label>
                    <p className="text-gray-900">{new Date(selectedBooking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedBooking.special_requests && (
                  <div>
                    <label className="font-medium text-gray-700">Special Requests</label>
                    <p className="text-gray-900">{selectedBooking.special_requests}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 pt-4">
                  {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                    <Button
                      onClick={() => {
                        handleCancelBooking(selectedBooking.id);
                        setShowBookingDetailsModal(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
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

export default AdminDashboard;