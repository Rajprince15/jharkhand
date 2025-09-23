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
    destinationsVisited: 0,
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
      
      // Calculate destinations visited from completed bookings
      const destinationsVisited = new Set((bookingsData || [])
        .filter(booking => booking.status === 'completed')
        .map(booking => booking.destination_id)).size;
      
      setStats({
        totalBookings: (bookingsData || []).length,
        totalSpent: totalSpent,
        wishlistCount: wishlistData.items ? wishlistData.items.length : 0,
        activeTrips: activeTrips,
        completedTrips: completedTrips,
        destinationsVisited: destinationsVisited,
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



  if (!user || user.role !== 'tourist') {
    navigate('/login');
    return null;
  }

  const recentBookings = bookings.slice(0, 3);
  const recommendedDestinations = destinations.slice(0, 3);
  const recentWishlistItems = wishlist.slice(0, 3);

  const statsData = [
    {
      title: t('totalBookings'),
      value: stats.totalBookings,
      icon: Calendar,
      gradient: 'from-green-400 to-green-600',
      textColor: 'text-white'
    },
    {
      title: 'Total Spent',
      value: stats.totalSpent,
      icon: IndianRupee,
      gradient: 'from-amber-700 to-amber-900',
      textColor: 'text-white',
      isRevenue: true
    },
    {
      title: t('myWishlist'),
      value: stats.wishlistCount,
      icon: Heart,
      gradient: 'from-red-400 to-red-600',
      textColor: 'text-white'
    },
    {
      title: t('activeUsers'),
      value: stats.activeTrips,
      icon: MapPin,
      gradient: 'from-green-500 to-green-700',
      textColor: 'text-white'
    },
    {
      title: 'Completed Trips',
      value: stats.completedTrips,
      icon: CheckCircle,
      gradient: 'from-amber-600 to-amber-800',
      textColor: 'text-white'
    },
    {
      title: 'Destinations Visited',
      value: stats.destinationsVisited,
      icon: MapPin,
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
              {t('dashboard')}
            </h1>
            <p className="text-gray-600 mt-1">{t('welcomeBack')}, {user.name}</p>
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
            <LanguageToggle variant="outline" />
            <Link to="/">
              <Button variant="outline" className="hover:bg-gray-50">{t('home')}</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="hover:bg-gray-50">
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
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
              <p className="text-gray-600">{t('loading')}</p>
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





            {/* Quick Actions */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <AnimatedCard delay={9}>
                <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                    >
                      <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-green-900">{t('exploreDestinations')}</h3>
                    <p className="text-green-700 mb-4">Discover amazing places in Jharkhand</p>
                    <Link to="/destinations">
                      <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                        {t('destinations')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={10}>
                <Card className="bg-gradient-to-br from-red-100 to-red-200 border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-red-900">{t('myWishlist')}</h3>
                    <p className="text-red-700 mb-4">{t('favoriteDestinations')}</p>
                    <Link to="/wishlist">
                      <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                        {t('viewDetails')} ({stats.wishlistCount})
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={11}>
                <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <Compass className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-blue-900">{t('aiPlanner')}</h3>
                    <p className="text-blue-700 mb-4">Get personalized travel itineraries</p>
                    <Link to="/ai-planner">
                      <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                        {t('planYourTrip')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>

              <AnimatedCard delay={12}>
                <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Briefcase className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2 text-purple-900">{t('myBookings')}</h3>
                    <p className="text-purple-700 mb-4">View your travel bookings</p>
                    <Link to="/bookings">
                      <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                        {t('viewDetails')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Bookings */}
              <AnimatedCard delay={13}>
                <Card className="bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <CardTitle className="text-green-900 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {t('recentActivity')}
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
                            className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleViewBookingDetails(booking)}
                          >
                            <div>
                              <p className="font-medium">{booking.destination_name}</p>
                              <p className="text-sm text-gray-600">
                                {booking.provider_name} • {new Date(booking.booking_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">₹{booking.total_price}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
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
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-gray-500">{t('noBookingsFound')}</p>
                        <Link to="/destinations">
                          <Button className="mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white">
                            Book Your First Trip
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* My Wishlist */}
              <AnimatedCard delay={14}>
                <Card className="bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                    <CardTitle className="text-red-900 flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      {t('myWishlist')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentWishlistItems.length > 0 ? (
                      <div className="space-y-4">
                        {recentWishlistItems.map((item, index) => (
                          <motion.div 
                            key={item.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-4 p-3 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm">{item.rating}</span>
                                </div>
                                <span className="text-sm font-medium text-green-600">₹{item.price}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div className="text-center pt-4">
                          <Link to="/wishlist">
                            <Button size="sm" className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                              {t('viewAll')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-gray-500">{t('wishlistEmpty')}</p>
                        <Link to="/destinations">
                          <Button className="mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white">
                            {t('exploreDestinations')}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>

              {/* Recommended Destinations */}
              <AnimatedCard delay={15}>
                <Card className="bg-white shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
                    <CardTitle className="text-amber-900 flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Recommended for You
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recommendedDestinations.length > 0 ? (
                      <div className="space-y-4">
                        {recommendedDestinations.map((destination, index) => (
                          <motion.div
                            key={destination.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-4 p-3 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <img
                              src={destination.image_url}
                              alt={destination.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{destination.name}</h4>
                              <p className="text-sm text-gray-600 line-clamp-1">{destination.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm">{destination.rating}</span>
                                </div>
                                <span className="text-sm font-medium text-green-600">Contact Your Service Provider For Pricing</span>
                              </div>
                            </div>
                            <Link to={`/destination/${destination.id}`}>
                              <Button size="sm" className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
                                {t('viewDetails')}
                              </Button>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        </motion.div>
                        <p className="text-gray-500">{t('loading')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimatedCard>
            </div>
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
                    <label className="font-medium text-gray-700">Destination</label>
                    <p className="text-gray-900">{selectedBooking.destination_name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Provider</label>
                    <p className="text-gray-900">{selectedBooking.provider_name}</p>
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
                  <Link to="/bookings">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      View All Bookings
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