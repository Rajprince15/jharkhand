import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, MapPin, Star, TrendingUp, LogOut, Loader2, IndianRupee } from 'lucide-react';
import { adminAPI, destinationsAPI, providersAPI, reviewsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDestinations: 0,
    totalProviders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    monthlyBookings: 0
  });
  const [recentDestinations, setRecentDestinations] = useState([]);
  const [recentProviders, setRecentProviders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        adminStats,
        destinations,
        providers,
        users,
        reviews
      ] = await Promise.all([
        adminAPI.getStats(),
        destinationsAPI.getAll(null, 10),
        providersAPI.getAll(null, null, 10),
        adminAPI.getAllUsers(),
        reviewsAPI.getAll(null, null, 100)
      ]);

      // Calculate average rating from reviews
      const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

      setStats({
        totalUsers: users.length,
        totalDestinations: destinations.length,
        totalProviders: providers.length,
        totalBookings: adminStats.total_bookings || 0,
        totalRevenue: adminStats.total_revenue || 0,
        averageRating: parseFloat(averageRating),
        monthlyBookings: adminStats.monthly_bookings || 0
      });

      setRecentDestinations(destinations.slice(0, 5));
      setRecentProviders(providers.slice(0, 5));
      setRecentUsers(users.slice(0, 5));

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

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const statsData = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Destinations',
      value: stats.totalDestinations,
      icon: MapPin,
      color: 'text-green-600'
    },
    {
      title: 'Service Providers',
      value: stats.totalProviders,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-green-600'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating || '0.0',
      icon: Star,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="hover:bg-gray-50">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <Card key={index} className={`hover:shadow-lg transition-shadow duration-300 ${
                  index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                  index === 1 ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                  index === 2 ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' :
                  index === 3 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' :
                  index === 4 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' :
                  'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${
                          index === 0 ? 'text-blue-100' :
                          index === 1 ? 'text-green-100' :
                          index === 2 ? 'text-purple-100' :
                          index === 3 ? 'text-orange-100' :
                          index === 4 ? 'text-emerald-100' :
                          'text-yellow-100'
                        }`}>{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${
                        index === 0 ? 'text-blue-200' :
                        index === 1 ? 'text-green-200' :
                        index === 2 ? 'text-purple-200' :
                        index === 3 ? 'text-orange-200' :
                        index === 4 ? 'text-emerald-200' :
                        'text-yellow-200'
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-blue-900">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage registered users and their roles</p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => window.location.reload()}>
                    View All Users
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardTitle className="text-green-900">Content Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Manage destinations and provider listings</p>
                  <div className="space-y-2">
                    <Link to="/admin/destinations">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                        Manage Destinations
                      </Button>
                    </Link>
                    <Link to="/admin/services">
                      <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                        Manage Services
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                  <CardTitle className="text-orange-900">System Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">View detailed analytics and reports</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50" 
                    onClick={fetchDashboardData}
                  >
                    Refresh Data
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Destinations</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentDestinations.length > 0 ? (
                    <div className="space-y-4">
                      {recentDestinations.map((destination) => (
                        <div key={destination.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={destination.image_url}
                              alt={destination.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{destination.name}</p>
                              <p className="text-sm text-gray-600">{destination.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{destination.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No destinations found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentProviders.length > 0 ? (
                    <div className="space-y-4">
                      {recentProviders.map((provider) => (
                        <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={provider.image_url || '/placeholder-image.jpg'}
                              alt={provider.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-sm text-gray-600 capitalize">{provider.category}</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                provider.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {provider.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{provider.rating || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No providers found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                {recentUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Role</th>
                          <th className="text-left py-2">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="py-2 font-medium">{user.name}</td>
                            <td className="py-2 text-gray-600">{user.email}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'provider' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-2 text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users found</p>
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

export default AdminDashboard;