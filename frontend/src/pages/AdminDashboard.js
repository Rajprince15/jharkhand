import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, MapPin, Star, TrendingUp, LogOut, Loader2, IndianRupee, Calendar, Clock, Eye, RefreshCw, X, Ban, Trash2, ToggleLeft, ToggleRight, Home, Settings, Edit3, UserX, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
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
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  // Service management states
  const [selectedService, setSelectedService] = useState(null);
  const [serviceAction, setServiceAction] = useState('');
  const [confirmationLoading, setConfirmationLoading] = useState(false);

  // User management states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAction, setUserAction] = useState('');
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Enhanced Nature Color Palette - Forest Green Theme
  const colors = {
    primary: '#16a34a', // forest-green-600
    secondary: '#059669', // emerald-600
    accent: '#92400e', // amber-800 (earth brown)
    deepForest: '#14532d', // green-900
    earthBrown: '#451a03', // amber-900
    naturalBlue: '#1e40af', // blue-700
    lightGreen: '#dcfce7', // green-100
    lightBrown: '#fef3c7', // amber-100
    lightBlue: '#dbeafe', // blue-100
    background: '#ffffff',
    surface: '#f0fdf4', // green-50
    text: '#1f2937'
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

  // Enhanced User Management Functions
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

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    setUserAction(action);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserEditModal(true);
  };

  const confirmUserAction = async () => {
    if (!selectedUser || !userAction) return;

    try {
      setConfirmationLoading(true);
      
      if (userAction === 'ban') {
        await adminAPI.banUser(selectedUser.id);
        toast({
          title: "Success",
          description: `User ${selectedUser.name} has been banned`,
        });
      } else if (userAction === 'delete') {
        await adminAPI.deleteUser(selectedUser.id);
        toast({
          title: "Success",
          description: `User ${selectedUser.name} has been deleted`,
        });
      }

      // Refresh users list
      await handleViewAllUsers();
      setSelectedUser(null);
      setUserAction('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${userAction} user`,
        variant: "destructive",
      });
    } finally {
      setConfirmationLoading(false);
    }
  };

  // Service Management Functions
  const handleViewAllServices = async () => {
    try {
      const services = await providersAPI.getAll();
      setAllServices(services);
      setShowServicesModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    }
  };

  const handleServiceAction = (service, action) => {
    setSelectedService(service);
    setServiceAction(action);
  };

  const confirmServiceAction = async () => {
    if (!selectedService || !serviceAction) return;

    try {
      setConfirmationLoading(true);
      
      if (serviceAction === 'toggle') {
        await providersAPI.toggleAdminStatus(selectedService.id);
        toast({
          title: "Success",
          description: `Service ${selectedService.is_active ? 'deactivated' : 'activated'} successfully`,
        });
      } else if (serviceAction === 'delete') {
        await providersAPI.delete(selectedService.id);
        toast({
          title: "Success",
          description: "Service deleted successfully",
        });
      }

      // Refresh services list
      await handleViewAllServices();
      setSelectedService(null);
      setServiceAction('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${serviceAction} service`,
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

  // Enhanced 3D Animation components with nature theme
  const AnimatedCard = ({ children, delay = 0, className = "", hoverEffect = "default" }) => {
    const cardSpring = useSpring({
      from: { 
        transform: 'perspective(1200px) rotateX(45deg) rotateY(-10deg) translateY(100px) translateZ(-50px)', 
        opacity: 0,
        filter: 'blur(10px)'
      },
      to: { 
        transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)', 
        opacity: 1,
        filter: 'blur(0px)'
      },
      delay: delay * 150,
      config: { tension: 200, friction: 25, mass: 0.8 }
    });

    const getHoverTransform = () => {
      switch(hoverEffect) {
        case "lift":
          return 'perspective(1200px) rotateX(-5deg) translateY(-15px) translateZ(30px) scale(1.05)';
        case "tilt":
          return 'perspective(1200px) rotateY(8deg) rotateX(2deg) scale(1.03)';
        case "float":
          return 'perspective(1200px) translateY(-20px) translateZ(40px) scale(1.08)';
        default:
          return 'perspective(1200px) rotateY(5deg) rotateX(2deg) scale(1.05)';
      }
    };

    return (
      <animated.div 
        style={cardSpring}
        className={`transform-gpu transition-all duration-500 ease-out ${className}`}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = getHoverTransform();
          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(34, 197, 94, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1)';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {children}
      </animated.div>
    );
  };

  // Enhanced particle animation for background
  const ParticleBackground = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400 rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 25 + 35,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );

  // Chart data processing with enhanced colors
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
           status === 'pending' ? '#f59e0b' : 
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

  // Reorganized stats data (removed Active Providers card)
  const statsData = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-green-500 via-emerald-600 to-green-700',
      textColor: 'text-white',
      hoverEffect: 'lift'
    },
    {
      title: 'Total Destinations',
      value: stats.totalDestinations,
      icon: MapPin,
      gradient: 'from-amber-600 via-amber-700 to-amber-900',
      textColor: 'text-white',
      hoverEffect: 'tilt'
    },
    {
      title: 'Service Providers',
      value: stats.totalProviders,
      icon: Users,
      gradient: 'from-emerald-500 via-green-600 to-emerald-700',
      textColor: 'text-white',
      hoverEffect: 'float'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: TrendingUp,
      gradient: 'from-blue-600 via-indigo-600 to-blue-800',
      textColor: 'text-white',
      hoverEffect: 'lift'
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      icon: IndianRupee,
      gradient: 'from-green-600 via-emerald-700 to-green-800',
      textColor: 'text-white',
      isRevenue: true,
      hoverEffect: 'tilt'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 relative">
      <ParticleBackground />
      
      {/* Enhanced Header with nature theme */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-r from-green-800 via-emerald-700 to-blue-800 shadow-2xl border-b-4 border-amber-400 backdrop-blur-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 to-blue-900/30"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center relative z-10">
          <div>
            <motion.h1 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-green-200 via-emerald-100 to-blue-200 bg-clip-text text-transparent"
            >
              🌲 Admin Dashboard 🏔️
            </motion.h1>
            <motion.p 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-green-100 mt-2 text-lg"
            >
              Welcome back, {user.name}! 🌿
            </motion.p>
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center space-x-3 mt-3"
            >
              <Clock className="h-5 w-5 text-amber-300" />
              <span className="text-green-200 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-emerald-400 rounded-full"
              />
            </motion.div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" className="border-blue-300 text-blue-100 hover:bg-blue-700/30 backdrop-blur-sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button 
              onClick={fetchDashboardData} 
              variant="outline" 
              className="border-green-300 text-green-100 hover:bg-green-700/30 backdrop-blur-sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleLogout} variant="outline" className="border-red-300 text-red-100 hover:bg-red-700/30 backdrop-blur-sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Loader2 className="h-16 w-16 text-green-600 mx-auto mb-6" />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="w-16 h-16 border-4 border-emerald-300 border-t-transparent rounded-full" />
                </motion.div>
              </motion.div>
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-green-700 text-lg font-medium"
              >
                Loading admin dashboard... 🌿
              </motion.p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {/* Enhanced 3D Animated Stats Grid - Reorganized layout */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12"
            >
              {statsData.map((stat, index) => (
                <AnimatedCard key={index} delay={index} hoverEffect={stat.hoverEffect}>
                  <Card className={`bg-gradient-to-br ${stat.gradient} ${stat.textColor} shadow-2xl border-0 overflow-hidden relative transform-gpu`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-6 translate-x-6"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="text-center">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.2 + 0.7, type: "spring", stiffness: 200 }}
                          className="relative mb-4"
                        >
                          <stat.icon className="h-10 w-10 opacity-80 mx-auto" />
                          <motion.div
                            animate={{ scale: [0, 1.5, 0] }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              repeatDelay: 3 
                            }}
                            className="absolute inset-0 bg-white/20 rounded-full"
                          />
                        </motion.div>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: index * 0.2 + 0.5 }}
                          className="text-xs font-semibold opacity-90 mb-2"
                        >
                          {stat.title}
                        </motion.p>
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.2 + 0.9, type: "spring", stiffness: 200 }}
                          className="text-2xl font-bold"
                        >
                          {stat.isRevenue ? (
                            <span>₹<CountUp end={stat.value} duration={3} separator="," /></span>
                          ) : (
                            <CountUp end={stat.value} duration={3} />
                          )}
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </motion.div>

            {/* Enhanced Growth Charts with nature colors */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
              <AnimatedCard delay={6} hoverEffect="lift">
                <Card className="bg-white shadow-2xl border-2 border-green-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-100 via-emerald-100 to-green-200 border-b-2 border-green-300">
                    <CardTitle className="text-green-900 flex items-center text-xl">
                      <TrendingUp className="h-6 w-6 mr-3" />
                      User Growth Over Time 📈
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={processChartData(stats.userGrowth, 'new_users')}>
                        <defs>
                          <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                            <stop offset="50%" stopColor={colors.secondary} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                        <XAxis dataKey="month" stroke={colors.deepForest} fontSize={12} />
                        <YAxis stroke={colors.deepForest} fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '2px solid #16a34a', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="new_users" 
                          stroke={colors.primary} 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#userGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={7} hoverEffect="tilt">
                <Card className="bg-white shadow-2xl border-2 border-amber-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-b-2 border-amber-300">
                    <CardTitle className="text-amber-900 flex items-center text-xl">
                      <IndianRupee className="h-6 w-6 mr-3" />
                      Revenue Growth Over Time 💰
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={processChartData(stats.monthlyRevenue, 'revenue')}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                        <XAxis dataKey="month" stroke={colors.earthBrown} fontSize={12} />
                        <YAxis stroke={colors.earthBrown} fontSize={12} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '2px solid #d97706', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={colors.accent} 
                          strokeWidth={4}
                          dot={{ fill: colors.accent, strokeWidth: 3, r: 8 }}
                          activeDot={{ r: 12, stroke: colors.accent, strokeWidth: 4, fill: 'white' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* Enhanced Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <AnimatedCard delay={8} hoverEffect="float">
                <Card className="bg-white shadow-2xl border-2 border-blue-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-200 border-b-2 border-blue-300">
                    <CardTitle className="text-blue-900 flex items-center text-xl">
                      <Eye className="h-6 w-6 mr-3" />
                      Booking Status Distribution 📊
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
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

              <AnimatedCard delay={9} hoverEffect="lift">
                <Card className="bg-white shadow-2xl border-2 border-emerald-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-200 border-b-2 border-emerald-300">
                    <CardTitle className="text-emerald-900 flex items-center text-xl">
                      <MapPin className="h-6 w-6 mr-3" />
                      Revenue by Destination 🗺️
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.revenueByDestination} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                        <XAxis type="number" tickFormatter={(value) => `₹${value.toLocaleString()}`} fontSize={12} />
                        <YAxis dataKey="destination_name" type="category" width={100} fontSize={12} />
                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                        <Bar 
                          dataKey="revenue" 
                          fill={colors.primary} 
                          radius={[0, 8, 8, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>

            {/* Enhanced Recent Bookings */}
            <AnimatedCard delay={10} hoverEffect="tilt">
              <Card className="bg-white shadow-2xl border-2 border-green-200 overflow-hidden mb-12">
                <CardHeader className="bg-gradient-to-r from-green-100 via-emerald-100 to-green-200 border-b-2 border-green-300">
                  <CardTitle className="text-green-900 flex items-center text-xl">
                    <Calendar className="h-6 w-6 mr-3" />
                    Recent Bookings 📅
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {stats.recentBookings.length > 0 ? (
                    <div className="space-y-6">
                      {stats.recentBookings.map((booking, index) => (
                        <motion.div
                          key={booking.id}
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 1 }}
                          className="flex items-center justify-between p-6 border-2 border-green-100 rounded-xl hover:shadow-lg hover:border-green-300 transition-all bg-gradient-to-r from-green-50/50 to-transparent"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-semibold text-green-900 text-lg">{booking.customer_name}</p>
                                <p className="text-sm text-green-700">{booking.destination_name}</p>
                                <p className="text-xs text-green-600">{booking.package_type} • {booking.guests} guests</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-700">₹{booking.total_price.toLocaleString()}</p>
                              <p className="text-sm text-green-500">{new Date(booking.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                              booking.status === 'completed' ? 'bg-green-200 text-green-900' :
                              booking.status === 'pending' ? 'bg-yellow-200 text-yellow-900' :
                              booking.status === 'cancelled' ? 'bg-red-200 text-red-900' :
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewBookingDetails(booking)}
                                className="p-3 border-green-300 hover:bg-green-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="p-3 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
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
                    <div className="text-center py-12">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Calendar className="h-16 w-16 text-green-400 mx-auto mb-6" />
                      </motion.div>
                      <p className="text-green-600 text-lg">No recent bookings found 📝</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>

            {/* Enhanced Management Actions with REORGANIZED structure */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {/* Enhanced User Management */}
              <AnimatedCard delay={11} hoverEffect="float">
                <Card className="bg-gradient-to-br from-green-100 via-emerald-100 to-green-200 border-2 border-green-300 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-green-900 text-xl flex items-center">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                        className="mr-3"
                      >
                        👥
                      </motion.div>
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 p-6">
                    <p className="text-green-800 mb-6">Manage users with edit, ban & delete options</p>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white shadow-lg"
                      onClick={handleViewAllUsers}
                    >
                      Manage Users ✨
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* NEW: Service Management (replaced Provider Management) */}
              <AnimatedCard delay={12} hoverEffect="lift">
                <Card className="bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 border-2 border-blue-300 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-blue-900 text-xl flex items-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
                        className="mr-3"
                      >
                        🛎️
                      </motion.div>
                      Service Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 p-6">
                    <p className="text-blue-800 mb-6">Manage services with edit, toggle & delete options</p>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white shadow-lg"
                      onClick={handleViewAllServices}
                    >
                      Manage Services 🚀
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* Content Management (only destinations now) */}
              <AnimatedCard delay={13} hoverEffect="tilt">
                <Card className="bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-200 border-2 border-amber-300 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-amber-900 text-xl flex items-center">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="mr-3"
                      >
                        🏔️
                      </motion.div>
                      Destination Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 p-6">
                    <p className="text-amber-800 mb-6">Manage destinations and locations</p>
                    <Link to="/admin/destinations">
                      <Button className="w-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 text-white shadow-lg">
                        Manage Destinations 🗺️
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* System Analytics */}
              <AnimatedCard delay={14} hoverEffect="float">
                <Card className="bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-200 border-2 border-emerald-300 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent"></div>
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-emerald-900 text-xl flex items-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                        className="mr-3"
                      >
                        📊
                      </motion.div>
                      System Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 p-6">
                    <p className="text-emerald-800 mb-6">View detailed analytics and reports</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-emerald-400 text-emerald-800 hover:bg-emerald-100 shadow-md" 
                      onClick={fetchDashboardData}
                    >
                      Advanced Analytics 📈
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Enhanced Users Management Modal with better visual format */}
        {showUsersModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-2xl p-8 max-w-6xl w-full mx-4 max-h-[80vh] overflow-auto shadow-2xl border-2 border-green-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent">
                  👥 Enhanced User Management
                </h2>
                <Button variant="outline" onClick={() => setShowUsersModal(false)} className="border-green-300 hover:bg-green-100">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white via-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    {/* User Avatar & Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-green-900 text-lg">{user.name}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.role === 'admin' ? 'bg-purple-200 text-purple-800' :
                            user.role === 'provider' ? 'bg-blue-200 text-blue-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-600 mb-1">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-green-700">
                        <span className="font-medium">Email:</span>
                        <span className="ml-2 truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-green-700">
                        <span className="font-medium">Joined:</span>
                        <span className="ml-2">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                        className="flex-1 text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user, 'ban')}
                        className="flex-1 text-orange-600 hover:text-orange-700 border-orange-300 hover:bg-orange-50"
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Ban
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user, 'delete')}
                        className="flex-1 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Enhanced Service Management Modal */}
        {showServicesModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl p-8 max-w-7xl w-full mx-4 max-h-[80vh] overflow-auto shadow-2xl border-2 border-blue-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                  🛎️ Enhanced Service Management
                </h2>
                <Button variant="outline" onClick={() => setShowServicesModal(false)} className="border-blue-300 hover:bg-blue-100">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    {/* Service Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-900 text-lg mb-1">{service.service_name}</h3>
                        <p className="text-sm text-blue-700">{service.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        service.is_active 
                          ? 'bg-green-200 text-green-900' 
                          : 'bg-red-200 text-red-900'
                      }`}>
                        {service.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>

                    {/* Service Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700 font-medium">Category:</span>
                        <span className="text-blue-800">{service.category}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700 font-medium">Price:</span>
                        <span className="text-blue-800 font-bold">₹{service.price}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700 font-medium">Contact:</span>
                        <span className="text-blue-800">{service.contact}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link to={`/edit-service/${service.id}`} className="flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-blue-600 hover:text-blue-700 border-blue-300 hover:bg-blue-50"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleServiceAction(service, 'toggle')}
                        className={`flex-1 ${service.is_active ? 'text-orange-600 hover:text-orange-700 border-orange-300 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50'}`}
                      >
                        {service.is_active ? <ToggleRight className="h-3 w-3 mr-1" /> : <ToggleLeft className="h-3 w-3 mr-1" />}
                        {service.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleServiceAction(service, 'delete')}
                        className="flex-1 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* User Action Confirmation Modal */}
        {selectedUser && userAction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              className="bg-gradient-to-br from-white via-amber-50 to-yellow-50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-amber-200"
            >
              <div className="text-center">
                <div className="mb-6">
                  {userAction === 'ban' ? (
                    <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5, repeat: 2 }}>
                      <UserX className="h-20 w-20 text-orange-500 mx-auto" />
                    </motion.div>
                  ) : (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
                      <Trash2 className="h-20 w-20 text-red-500 mx-auto" />
                    </motion.div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-4 text-amber-900">
                  {userAction === 'ban' ? 'Ban User?' : 'Delete User?'}
                </h3>
                <p className="text-amber-700 mb-8">
                  {userAction === 'ban' 
                    ? `Are you sure you want to ban "${selectedUser.name}"? They will lose access to the platform.`
                    : `This will permanently delete "${selectedUser.name}". This action cannot be undone.`
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedUser(null);
                      setUserAction('');
                    }}
                    className="border-gray-400 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmUserAction}
                    disabled={confirmationLoading}
                    className={userAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
                  >
                    {confirmationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {userAction === 'ban' ? 'Ban User' : 'Delete User'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Service Action Confirmation Modal */}
        {selectedService && serviceAction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-blue-200"
            >
              <div className="text-center">
                <div className="mb-6">
                  {serviceAction === 'toggle' ? (
                    selectedService.is_active ? (
                      <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                        <ToggleRight className="h-20 w-20 text-red-500 mx-auto" />
                      </motion.div>
                    ) : (
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                        <ToggleLeft className="h-20 w-20 text-green-500 mx-auto" />
                      </motion.div>
                    )
                  ) : (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
                      <Trash2 className="h-20 w-20 text-red-500 mx-auto" />
                    </motion.div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-4 text-blue-900">
                  {serviceAction === 'toggle' 
                    ? `${selectedService.is_active ? 'Deactivate' : 'Activate'} Service?`
                    : 'Delete Service?'
                  }
                </h3>
                <p className="text-blue-700 mb-8">
                  {serviceAction === 'toggle' 
                    ? `${selectedService.is_active ? 'Users will no longer be able to see or book this service.' : 'Service will become visible to users again.'}`
                    : `This will permanently delete "${selectedService.service_name}". This action cannot be undone.`
                  }
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedService(null);
                      setServiceAction('');
                    }}
                    className="border-gray-400 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmServiceAction}
                    disabled={confirmationLoading}
                    className={serviceAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : serviceAction === 'toggle' && selectedService.is_active ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {confirmationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {serviceAction === 'toggle' 
                      ? (selectedService.is_active ? 'Deactivate' : 'Activate')
                      : 'Delete'
                    }
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Enhanced Booking Details Modal with nature theme */}
        {showBookingDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              className="bg-gradient-to-br from-white via-emerald-50 to-green-50 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto shadow-2xl border-2 border-emerald-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent">
                  📋 Booking Details
                </h2>
                <Button variant="outline" onClick={() => setShowBookingDetailsModal(false)} className="border-emerald-300 hover:bg-emerald-100">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Customer Name</label>
                    <p className="text-emerald-900 text-lg">{selectedBooking.customer_name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Email</label>
                    <p className="text-emerald-900 text-lg">{selectedBooking.customer_email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Destination</label>
                    <p className="text-emerald-900 text-lg">{selectedBooking.destination_name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Package Type</label>
                    <p className="text-emerald-900 text-lg">{selectedBooking.package_type}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Guests</label>
                    <p className="text-emerald-900 text-lg">{selectedBooking.guests}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Total Price</label>
                    <p className="text-emerald-900 text-2xl font-bold">₹{selectedBooking.total_price.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Status</label>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      selectedBooking.status === 'completed' ? 'bg-green-200 text-green-900' :
                      selectedBooking.status === 'pending' ? 'bg-yellow-200 text-yellow-900' :
                      selectedBooking.status === 'cancelled' ? 'bg-red-200 text-red-900' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Booking Date</label>
                    <p className="text-emerald-900 text-lg">{new Date(selectedBooking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedBooking.special_requests && (
                  <div className="space-y-2">
                    <label className="font-semibold text-emerald-800">Special Requests</label>
                    <p className="text-emerald-900 bg-emerald-50 p-4 rounded-lg border border-emerald-200">{selectedBooking.special_requests}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4 pt-6">
                  {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                    <Button
                      onClick={() => {
                        handleCancelBooking(selectedBooking.id);
                        setShowBookingDetailsModal(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg px-6"
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