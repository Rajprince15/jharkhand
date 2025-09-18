import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Star, Users, IndianRupee, MapPin, Phone, Loader2, Edit, Eye } from 'lucide-react';
import { providerManagementAPI, reviewsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const ViewServicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [serviceReviews, setServiceReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedService, setExpandedService] = useState(null);

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

  if (!user || user.role !== 'provider') {
    navigate('/login');
    return null;
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/provider-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Services & Reviews</h1>
                <p className="text-gray-600">Manage your services and view customer feedback</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link to="/add-service">
                <Button className="bg-green-600 hover:bg-green-700">
                  Add New Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your services...</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
            <p className="text-gray-600 mb-4">You haven't added any services yet. Get started by creating your first service offering.</p>
            <Link to="/add-service">
              <Button className="bg-green-600 hover:bg-green-700">
                Add Your First Service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {services.map((service) => {
              const reviews = serviceReviews[service.id] || [];
              const averageRating = reviews.length > 0 
                ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                : service.rating || 0;
              
              return (
                <Card key={service.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2">
                          {service.name}
                        </CardTitle>
                        <p className="text-lg font-medium text-green-600 mb-2">
                          {service.service_name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {service.category}
                          </span>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {service.location}
                          </div>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1" />
                            ₹{service.price}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {service.contact}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {renderStars(parseFloat(averageRating.toFixed(1)))}
                        <span className="text-sm text-gray-500">
                          Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleServiceReviews(service.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {expandedService === service.id ? 'Hide' : 'View'} Reviews ({reviews.length})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/edit-service/${service.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Service
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Service Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          service.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Reviews Section */}
                    {expandedService === service.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-4">Customer Reviews</h4>
                        {reviews.length === 0 ? (
                          <div className="text-center py-8">
                            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No reviews yet</p>
                            <p className="text-sm text-gray-400">Reviews will appear here when customers rate your service</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-medium text-gray-900">{review.user_name}</p>
                                    {renderStars(review.rating)}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewServicesPage;