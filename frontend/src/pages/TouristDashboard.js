import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Heart, Calendar, LogOut, Star, Loader2 } from 'lucide-react';
import { destinationsAPI, bookingsAPI, wishlistAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import LanguageToggle from '../components/LanguageToggle';

const TouristDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [destinations, setDestinations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'tourist') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [destinationsData, bookingsData, wishlistData] = await Promise.all([
        destinationsAPI.getAll(null, 6), // Get 6 destinations for recommendations  
        bookingsAPI.getUserBookings(),
        wishlistAPI.getAll()
      ]);
      
      setDestinations(destinationsData);
      setBookings(bookingsData);
      setWishlist(wishlistData.items || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: t('errorOccurred'),
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

  if (!user || user.role !== 'tourist') {
    navigate('/login');
    return null;
  }

  const recentBookings = bookings.slice(0, 3);
  const recommendedDestinations = destinations.slice(0, 3);
  const recentWishlistItems = wishlist.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
            <p className="text-gray-600">{t('welcomeBack')}, {user.name}</p>
          </div>
          <div className="flex space-x-4">
            <LanguageToggle variant="outline" />
            <Link to="/">
              <Button variant="outline">{t('home')}</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t('totalBookings')}</p>
                      <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t('activeUsers')}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length}
                      </p>
                    </div>
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t('myWishlist')}</p>
                      <p className="text-3xl font-bold text-gray-900">{wishlist.length}</p>
                    </div>
                    <Heart className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('exploreDestinations')}</h3>
                  <p className="text-gray-600 mb-4">Discover amazing places in Jharkhand</p>
                  <Link to="/destinations">
                    <Button className="bg-green-600 hover:bg-green-700">{t('destinations')}</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('myWishlist')}</h3>
                  <p className="text-gray-600 mb-4">{t('favoriteDestinations')}</p>
                  <Link to="/wishlist">
                    <Button variant="outline">{t('viewDetails')} ({wishlist.length})</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('aiPlanner')}</h3>
                  <p className="text-gray-600 mb-4">Get personalized travel itineraries</p>
                  <Link to="/ai-planner">
                    <Button variant="outline">{t('planYourTrip')}</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('myBookings')}</h3>
                  <p className="text-gray-600 mb-4">View your travel bookings</p>
                  <Link to="/bookings">
                    <Button variant="outline">{t('viewDetails')}</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('recentActivity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">{t('noBookingsFound')}</p>
                      <Link to="/destinations">
                        <Button className="mt-4">Book Your First Trip</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* My Wishlist */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('myWishlist')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentWishlistItems.length > 0 ? (
                    <div className="space-y-4">
                      {recentWishlistItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:shadow-md transition-shadow">
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
                        </div>
                      ))}
                      <div className="text-center pt-4">
                        <Link to="/wishlist">
                          <Button size="sm" variant="outline">{t('viewAll')}</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">{t('wishlistEmpty')}</p>
                      <Link to="/destinations">
                        <Button className="mt-4">{t('exploreDestinations')}</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended Destinations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended for You</CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendedDestinations.length > 0 ? (
                    <div className="space-y-4">
                      {recommendedDestinations.map((destination) => (
                        <div key={destination.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:shadow-md transition-shadow">
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
                              <span className="text-sm font-medium text-green-600">₹{destination.price}</span>
                            </div>
                          </div>
                          <Link to={`/destination/${destination.id}`}>
                            <Button size="sm" variant="outline">{t('viewDetails')}</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">{t('loading')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TouristDashboard;