import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Star, Users, IndianRupee, MapPin, Phone, Loader2, Edit, Eye, MessageCircle, Award } from 'lucide-react';
import { providerManagementAPI, reviewsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';

const ViewServicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [serviceReviews, setServiceReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedService, setExpandedService] = useState(null);

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
    if (user?.role === 'provider') {
      fetchServicesAndReviews();
    }
  }, [user]);

  const fetchServicesAndReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch user's services
      const servicesData = await providerManagementAPI.getUserProviders();
      setServices(servicesData);
      
      // Fetch reviews for each service
      const reviewsData = {};
      for (const service of servicesData) {
        try {
          const reviews = await reviewsAPI.getAll(null, service.id, 10);
          reviewsData[service.id] = reviews;
        } catch (error) {
          console.error(`Error fetching reviews for service ${service.id}:`, error);
          reviewsData[service.id] = [];
        }
      }
      setServiceReviews(reviewsData);
      
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services and reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceReviews = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
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
      {[...Array(8)].map((_, i) => (
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

  if (!user || user.role !== 'provider') {
    navigate('/login');
    return null;
  }

  const renderStars = (rating, size = "default") => {
    const starSize = size === "large" ? "h-6 w-6" : "h-4 w-4";
    
    return (
      <motion.div 
        className="flex items-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {[1, 2, 3, 4, 5].map((star, index) => (
          <motion.div
            key={star}
            initial={{ rotate: 0 }}
            animate={{ rotate: star <= rating ? [0, 15, 0] : 0 }}
            transition={{ 
              delay: index * 0.1,
              duration: 0.5,
              repeat: star <= rating ? Infinity : 0,
              repeatDelay: 3
            }}
          >
            <Star
              className={`${starSize} ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </motion.div>
        ))}
        <span className={`ml-2 font-medium ${size === "large" ? "text-lg" : "text-sm"} text-amber-700`}>
          ({rating})
        </span>
      </motion.div>
    );
  };

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
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/provider-dashboard">
                <motion.div
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" className="border-green-300 text-green-100 hover:bg-green-700/30 backdrop-blur-sm shadow-lg">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </motion.div>
              </Link>
              <div>
                <motion.h1 
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold bg-gradient-to-r from-green-200 via-emerald-100 to-blue-200 bg-clip-text text-transparent"
                >
                  🌿 My Services & Reviews 📋
                </motion.h1>
                <motion.p 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-green-200 mt-1 text-lg"
                >
                  Manage your services and view customer feedback 🌱
                </motion.p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
            >
              <Award className="h-12 w-12 text-amber-300" />
            </motion.div>
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
                Loading your services & reviews... 🌿
              </motion.p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <AnimatedCard className="text-center py-20">
            <Card className="bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-200 border-2 border-amber-300 shadow-2xl">
              <CardContent className="p-12">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                >
                  <MapPin className="h-20 w-20 text-amber-600 mx-auto mb-6" />
                </motion.div>
                <h2 className="text-2xl font-bold text-amber-900 mb-4">No Services Found 🏞️</h2>
                <p className="text-amber-800 mb-8 text-lg">You haven't created any services yet. Start by adding your first service to begin receiving bookings and reviews!</p>
                <Link to="/create-service">
                  <Button className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800 text-white shadow-lg px-8 py-3 text-lg">
                    Create Your First Service 🚀
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedCard>
        ) : (
          <div className="space-y-8">
            {services.map((service, index) => {
              const reviews = serviceReviews[service.id] || [];
              const averageRating = reviews.length > 0 
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                : 0;

              return (
                <AnimatedCard key={service.id} delay={index} hoverEffect="lift">
                  <Card className="bg-gradient-to-br from-white via-green-50 to-emerald-50 border-2 border-green-200 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
                    
                    <CardHeader className="bg-gradient-to-r from-green-100 via-emerald-100 to-green-200 border-b-2 border-green-300 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.2 }}
                          >
                            <CardTitle className="text-2xl font-bold text-green-900 mb-2 flex items-center">
                              <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                                className="mr-3"
                              >
                                🏞️
                              </motion.div>
                              {service.service_name}
                            </CardTitle>
                            <p className="text-green-800 text-lg mb-3">{service.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm">
                              <motion.div 
                                className="flex items-center text-green-700"
                                whileHover={{ scale: 1.05 }}
                              >
                                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                                <span className="font-medium">{service.destination_name}</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center text-green-700"
                                whileHover={{ scale: 1.05 }}
                              >
                                <Users className="h-5 w-5 mr-2 text-green-600" />
                                <span className="font-medium">{service.category}</span>
                              </motion.div>
                              <motion.div 
                                className="flex items-center text-amber-700 font-bold"
                                whileHover={{ scale: 1.05 }}
                              >
                                <IndianRupee className="h-5 w-5 mr-1 text-amber-600" />
                                <span className="text-lg">{service.price}</span>
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="text-center bg-white rounded-xl p-4 border-2 border-green-300 shadow-lg"
                          >
                            <div className="text-2xl font-bold text-green-900 mb-1">
                              {averageRating.toFixed(1)}
                            </div>
                            {renderStars(Math.round(averageRating), "default")}
                            <div className="text-xs text-green-600 mt-1 font-medium">
                              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                            </div>
                          </motion.div>
                          
                          <div className="flex space-x-3">
                            <Link to={`/edit-service/${service.id}`}>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </motion.div>
                            </Link>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleServiceReviews(service.id)}
                                className="border-green-400 text-green-700 hover:bg-green-100 shadow-md"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {expandedService === service.id ? 'Hide' : 'View'} Reviews ({reviews.length})
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <AnimatePresence>
                        {expandedService === service.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-8 bg-gradient-to-br from-green-25 via-emerald-25 to-blue-25 border-t-2 border-green-200">
                              {/* Enhanced Reviews Section */}
                              <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <h4 className="font-bold text-xl text-green-900 mb-6 flex items-center">
                                  <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                    className="mr-3"
                                  >
                                    <MessageCircle className="h-6 w-6 text-green-600" />
                                  </motion.div>
                                  Customer Reviews 💬
                                </h4>
                                
                                {reviews.length === 0 ? (
                                  <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl border-2 border-amber-200"
                                  >
                                    <motion.div
                                      animate={{ 
                                        rotate: [0, 5, -5, 0],
                                        y: [0, -5, 0]
                                      }}
                                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                                    >
                                      <Star className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                                    </motion.div>
                                    <p className="text-amber-800 text-lg font-medium mb-2">No reviews yet 🌟</p>
                                    <p className="text-amber-700">Reviews will appear here when customers rate your service</p>
                                  </motion.div>
                                ) : (
                                  <div className="space-y-6">
                                    {reviews.map((review, reviewIndex) => (
                                      <motion.div
                                        key={review.id}
                                        initial={{ x: -30, opacity: 0, scale: 0.95 }}
                                        animate={{ x: 0, opacity: 1, scale: 1 }}
                                        transition={{ 
                                          delay: reviewIndex * 0.1,
                                          type: "spring",
                                          stiffness: 200
                                        }}
                                        whileHover={{ 
                                          scale: 1.02,
                                          rotateY: 2,
                                          boxShadow: "0 15px 30px -5px rgba(0,0,0,0.15)"
                                        }}
                                        className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg transform-gpu"
                                      >
                                        <div className="flex items-start justify-between mb-4">
                                          <div>
                                            <motion.div
                                              initial={{ y: -10, opacity: 0 }}
                                              animate={{ y: 0, opacity: 1 }}
                                              transition={{ delay: reviewIndex * 0.1 + 0.2 }}
                                            >
                                              <p className="font-bold text-lg text-green-900 flex items-center">
                                                <motion.div
                                                  animate={{ rotate: [0, 15, 0] }}
                                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                                                  className="mr-2"
                                                >
                                                  👤
                                                </motion.div>
                                                {review.user_name}
                                              </p>
                                              <div className="mt-2">
                                                {renderStars(review.rating, "default")}
                                              </div>
                                            </motion.div>
                                          </div>
                                          <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: reviewIndex * 0.1 + 0.3, type: "spring" }}
                                            className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium"
                                          >
                                            {new Date(review.created_at).toLocaleDateString()}
                                          </motion.span>
                                        </div>
                                        
                                        <motion.div
                                          initial={{ y: 10, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          transition={{ delay: reviewIndex * 0.1 + 0.4 }}
                                          className="bg-gradient-to-r from-green-25 to-emerald-25 p-4 rounded-lg border border-green-200"
                                        >
                                          <p className="text-green-800 leading-relaxed italic">
                                            "{review.comment}"
                                          </p>
                                        </motion.div>
                                        
                                        {/* Floating decoration */}
                                        <motion.div
                                          animate={{ 
                                            rotate: [0, 360],
                                            scale: [0.8, 1.2, 0.8]
                                          }}
                                          transition={{ 
                                            duration: 8, 
                                            repeat: Infinity,
                                            repeatDelay: Math.random() * 5
                                          }}
                                          className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full opacity-30"
                                        />
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewServicesPage;