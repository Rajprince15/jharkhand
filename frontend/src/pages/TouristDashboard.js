import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Heart, Calendar, LogOut, Star } from 'lucide-react';
import { destinations } from '../data/mock';

const TouristDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'tourist') {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tourist Dashboard</h1>
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
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Explore Destinations</h3>
              <p className="text-gray-600 mb-4">Discover amazing places in Jharkhand</p>
              <Link to="/destinations">
                <Button className="bg-green-600 hover:bg-green-700">Browse</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Wishlist</h3>
              <p className="text-gray-600 mb-4">Save your favorite destinations</p>
              <Link to="/wishlist\">
                <Button variant="outline\">View Wishlist</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">My Bookings</h3>
              <p className="text-gray-600 mb-4">View your travel bookings</p>
               <Link to="/bookings\">
                <Button variant="outline\">View Bookings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.slice(0, 3).map((destination) => (
                <div key={destination.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <img
                    src={destination.image_url}
                    alt={destination.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-semibold mb-2">{destination.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{destination.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{destination.rating}</span>
                    </div>
                    <Link to={`/destination/${destination.id}`}>
                      <Button size="sm\" variant="outline\">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TouristDashboard;