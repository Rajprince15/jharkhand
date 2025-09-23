import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Heart, Calendar, LogOut, Star, Loader2, RefreshCw, Clock, IndianRupee, CheckCircle, XCircle, AlertCircle, X, Compass, Briefcase } from 'lucide-react';
import { destinationsAPI, bookingsAPI, wishlistAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import LanguageToggle from '../components/LanguageToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import CountUp from 'react-countup';


const TouristDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    wishlistCount: 0,
    activeTrips: 0,
    completedTrips: 0,
    recentActivity: []
  });

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
    if (user?.role === 'tourist') {
      fetchDashboardData();
      
      // Auto-refresh every 3 minutes
      const interval = setInterval(fetchDashboardData, 180000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch data separately to handle partial failures gracefully
      let destinationsData = [];
      let bookingsData = [];
      let wishlistData = { items: [] };
      
      // Fetch destinations with error handling
      try {
        destinationsData = await destinationsAPI.getAll(null, null, 6); // Get 6 destinations for recommendations  
      } catch (error) {
        console.error('Failed to load destinations:', error);
        toast({
          title: "Warning",
          description: "Failed to load destinations. Some features may be limited.",
          variant: "destructive",
        });
      }
      
      // Fetch bookings with error handling
      try {
        bookingsData = await bookingsAPI.getUserBookings();
      } catch (error) {
        console.error('Failed to load bookings:', error);
        toast({
          title: "Warning", 
          description: "Failed to load bookings. Please try refreshing.",
          variant: "destructive",
        });
      }
      
      // Fetch wishlist with error handling
      try {
        wishlistData = await wishlistAPI.getAll();
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        toast({
          title: "Warning",
          description: "Failed to load wishlist. Some features may be limited.",
          variant: "destructive",
        });
      }
      
      // Update state with whatever data we successfully fetched
      setDestinations(destinationsData || []);
      setBookings(bookingsData || []);
      setWishlist(wishlistData.items || []);

      // Calculate comprehensive stats
      const totalSpent = (bookingsData || [])
        .filter(booking => booking.status === 'completed')
        .reduce((sum, booking) => sum + (booking.total_price || 0), 0);
      
      const activeTrips = (bookingsData || []).filter(booking => ['pending', 'confirmed'].includes(booking.status)).length;
      const completedTrips = (bookingsData || []).filter(booking => booking.status === 'completed').length;
      
      setStats({
        totalBookings: (bookingsData || []).length,
        totalSpent: totalSpent,
        wishlistCount: wishlistData.items ? wishlistData.items.length : 0,
        activeTrips: activeTrips,
        completedTrips: completedTrips,
        recentActivity: (bookingsData || []).slice(0, 5)
      });
      
      setLastUpdated(new Date());
      
      // Show success message for manual refresh
      if (!loading) {
        toast({
          title: "Success",
          description: "Dashboard data refreshed successfully!",
          variant: "default",
        });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: t('errorOccurred'),
        description: "Failed to refresh dashboard. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t, loading]);

  const handleLogout = () => {
    logout();
    navigate('/');
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
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-400 rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );

  // Booking details modal handler
  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetailsModal(true);
  };

  if (!user || user.role !== 'tourist') {
    navigate('/login');
    return null;
  }

  const recentBookings = bookings.slice(0, 3);
  const recommendedDestinations = destinations.slice(0, 3);
  const recentWishlistItems = wishlist.slice(0, 3);

  // Reorganized stats data (removed Active Users and Destinations Visited)
  const statsData = [
    {
      title: t('totalBookings'),
      value: stats.totalBookings,
      icon: Calendar,
      gradient: 'from-green-500 via-green-600 to-emerald-700',
      textColor: 'text-white',
      hoverEffect: 'lift'
    },
    {
      title: 'Total Spent',
      value: stats.totalSpent,
      icon: IndianRupee,
      gradient: 'from-amber-600 via-amber-700 to-amber-900',
      textColor: 'text-white',
      isRevenue: true,
      hoverEffect: 'tilt'
    },
    {
      title: t('myWishlist'),
      value: stats.wishlistCount,
      icon: Heart,
      gradient: 'from-red-500 via-pink-600 to-red-700',
      textColor: 'text-white',
      hoverEffect: 'float'
    },
    {
      title: 'Completed Trips',
      value: stats.completedTrips,
      icon: CheckCircle,
      gradient: 'from-emerald-500 via-green-600 to-green-700',
      textColor: 'text-white',
      hoverEffect: 'lift'
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
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-blue-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center relative z-10">
          <div>
            <motion.h1 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold bg-gradient-to-r from-green-200 via-emerald-100 to-blue-200 bg-clip-text text-transparent"
            >
              🌿 {t('dashboard')} 🏔️
            </motion.h1>
            <motion.p 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-green-100 mt-2 text-lg"
            >
              {t('welcomeBack')}, {user.name}! 🌱
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
            <Button 
              onClick={fetchDashboardData} 
              variant="outline" 
              className="border-green-300 text-green-100 hover:bg-green-700/30 backdrop-blur-sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <LanguageToggle variant="outline" />
            <Link to="/">
              <Button variant="outline" className="border-blue-300 text-blue-100 hover:bg-blue-700/30 backdrop-blur-sm">{t('home')}</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="border-red-300 text-red-100 hover:bg-red-700/30 backdrop-blur-sm">
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
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
                {t('loading')} your nature dashboard... 🌿
              </motion.p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {/* Enhanced 3D Animated Stats Grid - Reorganized 2x2 layout */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12"
            >
              {statsData.map((stat, index) => (
                <AnimatedCard key={index} delay={index} hoverEffect={stat.hoverEffect}>
                  <Card className={`bg-gradient-to-br ${stat.gradient} ${stat.textColor} shadow-2xl border-0 overflow-hidden relative transform-gpu`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <motion.p 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.2 + 0.5 }}
                            className="text-sm font-semibold opacity-90 mb-2"
                          >
                            {stat.title}
                          </motion.p>
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.2 + 0.7, type: "spring", stiffness: 200 }}
                            className="text-4xl font-bold"
                          >
                            {stat.isRevenue ? (
                              <span>₹<CountUp end={stat.value} duration={3} separator="," /></span>
                            ) : (
                              <CountUp end={stat.value} duration={3} />
                            )}
                          </motion.div>
                        </div>
                        <motion.div
                          animate={{ 
                            rotate: [0, 8, -8, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 4, 
                            repeat: Infinity, 
                            repeatDelay: 2,
                            ease: "easeInOut"
                          }}
                          className="relative"
                        >
                          <stat.icon className="h-12 w-12 opacity-80" />
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
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </motion.div>

            {/* Enhanced Quick Actions with nature theme */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
            >
              <AnimatedCard delay={5} hoverEffect="float">
                <Card className="bg-gradient-to-br from-green-100 via-emerald-100 to-green-200 border-2 border-green-300 shadow-2xl hover:shadow-green-500/25 transition-all cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent"></div>
                  <CardContent className="p-8 text-center relative z-10">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        y: [0, -5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <MapPin className="h-16 w-16 text-green-700 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3 text-green-900">{t('exploreDestinations')}</h3>
                    <p className="text-green-800 mb-6">Discover amazing places in Jharkhand 🏞️</p>
                    <Link to="/destinations">
                      <Button className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white shadow-lg">
                        {t('destinations')} 🌲
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={6} hoverEffect="lift">
                <Card className="bg-gradient-to-br from-red-100 via-pink-100 to-red-200 border-2 border-red-300 shadow-2xl hover:shadow-red-500/25 transition-all cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent"></div>
                  <CardContent className="p-8 text-center relative z-10">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Heart className="h-16 w-16 text-red-700 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3 text-red-900">{t('myWishlist')}</h3>
                    <p className="text-red-800 mb-6">{t('favoriteDestinations')} ❤️</p>
                    <Link to="/wishlist">
                      <Button className="bg-gradient-to-r from-red-600 via-pink-600 to-red-700 hover:from-red-700 hover:via-pink-700 hover:to-red-800 text-white shadow-lg">
                        {t('viewDetails')} ({stats.wishlistCount}) 💕
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={7} hoverEffect="tilt">
                <Card className="bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 border-2 border-blue-300 shadow-2xl hover:shadow-blue-500/25 transition-all cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
                  <CardContent className="p-8 text-center relative z-10">
                    <motion.div
                      animate={{ 
                        rotate: [0, 15, -15, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 5, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Compass className="h-16 w-16 text-blue-700 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3 text-blue-900">{t('aiPlanner')}</h3>
                    <p className="text-blue-800 mb-6">Get personalized travel itineraries 🧭</p>
                    <Link to="/ai-planner">
                      <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white shadow-lg">
                        {t('planYourTrip')} ✨
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={8} hoverEffect="float">
                <Card className="bg-gradient-to-br from-purple-100 via-violet-100 to-purple-200 border-2 border-purple-300 shadow-2xl hover:shadow-purple-500/25 transition-all cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent"></div>
                  <CardContent className="p-8 text-center relative z-10">
                    <motion.div
                      animate={{ 
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Briefcase className="h-16 w-16 text-purple-700 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3 text-purple-900">{t('myBookings')}</h3>
                    <p className="text-purple-800 mb-6">View your travel bookings 🎒</p>
                    <Link to="/bookings">
                      <Button className="bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 text-white shadow-lg">
                        {t('viewDetails')} 📋
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </motion.div>

            {/* Enhanced content sections with nature theme */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Bookings */}
              <AnimatedCard delay={9} hoverEffect="lift">
                <Card className="bg-white shadow-2xl border-2 border-green-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-100 via-emerald-100 to-green-200 border-b-2 border-green-300">
                    <CardTitle className="text-green-900 flex items-center text-xl">
                      <Calendar className="h-6 w-6 mr-3" />
                      {t('recentActivity')} 🌱
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {recentBookings.length > 0 ? (
                      <div className="space-y-6">
                        {recentBookings.map((booking, index) => (
                          <motion.div 
                            key={booking.id} 
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 + 1 }}
                            className="flex items-center justify-between p-4 border-2 border-green-100 rounded-xl hover:shadow-lg hover:border-green-300 transition-all cursor-pointer bg-gradient-to-r from-green-50/50 to-transparent"
                            onClick={() => handleViewBookingDetails(booking)}
                          >
                            <div>
                              <p className="font-semibold text-green-900">{booking.destination_name}</p>
                              <p className="text-sm text-green-700">
                                {booking.provider_name} • {new Date(booking.booking_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-amber-700 font-medium">₹{booking.total_price}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-2 rounded-full text-xs font-bold ${
                                booking.status === 'confirmed' ? 'bg-green-200 text-green-900' :
                                booking.status === 'pending' ? 'bg-yellow-200 text-yellow-900' :
                                booking.status === 'completed' ? 'bg-blue-200 text-blue-900' :
                                'bg-red-200 text-red-900'
                              }`}>
                                {booking.status === 'confirmed' ? t('confirmed') :
                                 booking.status === 'pending' ? t('pending') :
                                 booking.status === 'cancelled' ? t('cancelled') :
                                 booking.status}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <Calendar className="h-16 w-16 text-green-400 mx-auto mb-6" />
                        </motion.div>
                        <p className="text-green-600 text-lg mb-4">{t('noBookingsFound')} 🌿</p>
                        <Link to="/destinations">
                          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
                            Book Your First Trip 🏞️
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* My Wishlist */}
              <AnimatedCard delay={10} hoverEffect="float">
                <Card className="bg-white shadow-2xl border-2 border-red-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-red-100 via-pink-100 to-red-200 border-b-2 border-red-300">
                    <CardTitle className="text-red-900 flex items-center text-xl">
                      <Heart className="h-6 w-6 mr-3" />
                      {t('myWishlist')} ❤️
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {recentWishlistItems.length > 0 ? (
                      <div className="space-y-6">
                        {recentWishlistItems.map((item, index) => (
                          <motion.div 
                            key={item.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 + 1.2 }}
                            className="flex items-center space-x-4 p-4 border-2 border-red-100 rounded-xl hover:shadow-lg hover:border-red-300 transition-all bg-gradient-to-r from-red-50/50 to-transparent"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl border-2 border-red-200"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-red-900">{item.name}</h4>
                              <p className="text-sm text-red-700 line-clamp-1">{item.description}</p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium text-yellow-700">{item.rating}</span>
                                </div>
                                <span className="text-sm font-bold text-green-700">₹{item.price}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div className="text-center pt-6">
                          <Link to="/wishlist">
                            <Button size="sm" className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
                              {t('viewAll')} 💖
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Heart className="h-16 w-16 text-red-400 mx-auto mb-6" />
                        </motion.div>
                        <p className="text-red-600 text-lg mb-4">{t('wishlistEmpty')} 💔</p>
                        <Link to="/destinations">
                          <Button className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
                            {t('exploreDestinations')} 🏔️
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* Recommended Destinations */}
              <AnimatedCard delay={11} hoverEffect="tilt">
                <Card className="bg-white shadow-2xl border-2 border-amber-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-b-2 border-amber-300">
                    <CardTitle className="text-amber-900 flex items-center text-xl">
                      <Star className="h-6 w-6 mr-3" />
                      Recommended for You ⭐
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {recommendedDestinations.length > 0 ? (
                      <div className="space-y-6">
                        {recommendedDestinations.map((destination, index) => (
                          <motion.div
                            key={destination.id}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 + 1.4 }}
                            className="flex items-center space-x-4 p-4 border-2 border-amber-100 rounded-xl hover:shadow-lg hover:border-amber-300 transition-all bg-gradient-to-r from-amber-50/50 to-transparent"
                          >
                            <img
                              src={destination.image_url}
                              alt={destination.name}
                              className="w-20 h-20 object-cover rounded-xl border-2 border-amber-200"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-amber-900">{destination.name}</h4>
                              <p className="text-sm text-amber-700 line-clamp-1">{destination.description}</p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="text-sm font-medium text-yellow-700">{destination.rating}</span>
                                </div>
                                <span className="text-xs font-medium text-green-700">Contact Provider</span>
                              </div>
                            </div>
                            <Link to={`/destination/${destination.id}`}>
                              <Button size="sm" className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg">
                                {t('viewDetails')} 🌟
                              </Button>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                          transition={{ duration: 5, repeat: Infinity }}
                        >
                          <MapPin className="h-16 w-16 text-amber-400 mx-auto mb-6" />
                        </motion.div>
                        <p className="text-amber-600 text-lg">{t('loading')} 🗺️</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>
          </AnimatePresence>
        )}

        {/* Enhanced Booking Details Modal */}
        {showBookingDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
              className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto shadow-2xl border-2 border-green-200"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent">
                  🌿 Booking Details
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBookingDetailsModal(false)}
                  className="border-green-300 hover:bg-green-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-semibold text-green-800">Destination</label>
                    <p className="text-green-900 text-lg">{selectedBooking.destination_name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-green-800">Provider</label>
                    <p className="text-green-900 text-lg">{selectedBooking.provider_name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-green-800">Booking Date</label>
                    <p className="text-green-900 text-lg">{new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-green-800">Guests</label>
                    <p className="text-green-900 text-lg">{selectedBooking.guests}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-green-800">Total Price</label>
                    <p className="text-green-900 text-2xl font-bold">₹{selectedBooking.total_price}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="font-semibold text-green-800">Status</label>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      selectedBooking.status === 'confirmed' ? 'bg-green-200 text-green-900' :
                      selectedBooking.status === 'pending' ? 'bg-yellow-200 text-yellow-900' :
                      selectedBooking.status === 'completed' ? 'bg-blue-200 text-blue-900' :
                      'bg-red-200 text-red-900'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
                
                {selectedBooking.special_requests && (
                  <div className="space-y-2">
                    <label className="font-semibold text-green-800">Special Requests</label>
                    <p className="text-green-900 bg-green-50 p-4 rounded-lg border border-green-200">{selectedBooking.special_requests}</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4 pt-6">
                  <Link to="/bookings">
                    <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-6">
                      View All Bookings 📋
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristDashboard;