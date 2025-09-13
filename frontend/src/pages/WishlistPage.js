import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, MapPin, Star, ArrowLeft, Trash2 } from 'lucide-react';
import { destinations } from '../data/mock';
import { useTranslation } from '../hooks/useTranslation';

const WishlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Mock wishlist data - showing some destinations from mock data
    const mockWishlist = destinations.slice(0, 3).map(dest => ({
      ...dest,
      dateAdded: new Date().toISOString()
    }));
    
    setWishlist(mockWishlist);
    setLoading(false);
  }, [user, navigate]);

  const removeFromWishlist = (destinationId) => {
    setWishlist(wishlist.filter(item => item.id !== destinationId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingWishlist')}</p>
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
              <Link to="/tourist-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToDashboard')}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('myWishlist')}</h1>
                <p className="text-gray-600">{t('favoriteDestinations')}</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">{t('home')}</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {wishlist.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('wishlistEmpty')}</h3>
              <p className="text-gray-600 mb-6">{t('startAddingDestinations')}</p>
              <Link to="/destinations">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Heart className="h-4 w-4 mr-2" />
                  {t('discoverDestinations')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((destination) => (
              <Card key={destination.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={destination.image_url}
                    alt={destination.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white hover:bg-red-50 text-red-600 border-red-300"
                    onClick={() => removeFromWishlist(destination.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {destination.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{destination.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{destination.location}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {destination.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ₹{destination.price?.toLocaleString() || t('contactForPricing')}
                    </span>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline">
                        {t('viewDetails')}
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => navigate('/booking')}
                      >
                        {t('bookNow')}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      {t('addedOn')} {new Date(destination.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {wishlist.length > 0 && (
          <div className="mt-8 text-center">
            <Link to="/destinations">
              <Button variant="outline" className="mr-4">
                {t('addMoreDestinations')}
              </Button>
            </Link>
            <Button className="bg-green-600 hover:bg-green-700">
              {t('planTripFromWishlist')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;