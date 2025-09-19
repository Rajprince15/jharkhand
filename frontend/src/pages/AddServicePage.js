import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Search, Filter, Users, MapPin, IndianRupee, Star, Loader2, Phone, Eye, AlertTriangle, ToggleLeft, ToggleRight, Trash2, Home, X } from 'lucide-react';
import { providersAPI, destinationsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const AdminServicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  
  // Provider management states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [actionType, setActionType] = useState(''); // 'toggle' or 'delete'
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesData, destinationsData] = await Promise.all([
        providersAPI.getAll(),
        destinationsAPI.getAll()
      ]);
      
      setServices(servicesData);
      setDestinations(destinationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load services data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Provider management functions
  const handleProviderAction = (provider, action) => {
    setSelectedProvider(provider);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmProviderAction = async () => {
    if (!selectedProvider || !actionType) return;

    try {
      setActionLoading(true);
      
      if (actionType === 'toggle') {
        await providersAPI.update(selectedProvider.id, {
          ...selectedProvider,
          is_active: !selectedProvider.is_active
        });
        toast({
          title: "Success",
          description: `Provider ${selectedProvider.is_active ? 'deactivated' : 'activated'} successfully`,
        });
      } else if (actionType === 'delete') {
        await providersAPI.delete(selectedProvider.id);
        toast({
          title: "Success",
          description: "Provider deleted successfully",
        });
      }

      // Refresh services list
      await fetchData();
      closeConfirmModal();
      
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${actionType} provider`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedProvider(null);
    setActionType('');
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  // Filter services based on search and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.is_active) ||
                         (statusFilter === 'inactive' && !service.is_active);
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    
    const matchesDestination = destinationFilter === 'all' || service.destination_id === destinationFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesDestination;
  });

  const categories = [...new Set(services.map(service => service.category))];
  const activeServices = services.filter(s => s.is_active).length;
  const inactiveServices = services.filter(s => !s.is_active).length;

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({numRating.toFixed(1)})</span>
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
              <Link to="/admin-dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
                <p className="text-gray-600">Manage all tourism service providers and their status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-2xl font-bold text-green-600">{activeServices}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactive Services</p>
                  <p className="text-2xl font-bold text-red-600">{inactiveServices}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Services
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, service, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Filter
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Filter
                </label>
                <select
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Destinations</option>
                  {destinations.map(dest => (
                    <option key={dest.id} value={dest.id}>
                      {dest.location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading services...</p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || destinationFilter !== 'all' 
                ? 'No services match your current filters.' 
                : 'No services available in the system.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-xl text-gray-900">
                          {service.name}
                        </CardTitle>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          service.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-blue-600 mb-3">
                        {service.service_name}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          {service.category}
                        </span>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {service.location || 'Location not set'}
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
                      {renderStars(service.rating)}
                      <p className="text-sm text-gray-500">
                        Provider ID: {service.id}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Service Description</h4>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                  
                  {service.destination_name && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Associated Destination</h4>
                      <p className="text-gray-600">{service.destination_name}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>User ID: {service.user_id}</p>
                      <p>Created: {service.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProviderAction(service, 'toggle')}
                        className={service.is_active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                      >
                        {service.is_active ? <ToggleRight className="h-4 w-4 mr-1" /> : <ToggleLeft className="h-4 w-4 mr-1" />}
                        {service.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleProviderAction(service, 'delete')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                {actionType === 'toggle' ? (
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
                {actionType === 'toggle' 
                  ? `${selectedProvider.is_active ? 'Deactivate' : 'Activate'} Provider?`
                  : 'Delete Provider?'
                }
              </h3>
              <p className="text-gray-600 mb-6">
                {actionType === 'toggle' 
                  ? `Are you sure you want to ${selectedProvider.is_active ? 'deactivate' : 'activate'} "${selectedProvider.name}"?`
                  : `This will permanently delete "${selectedProvider.name}". This action cannot be undone.`
                }
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={closeConfirmModal}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmProviderAction}
                  disabled={actionLoading}
                  className={actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {actionType === 'toggle' 
                    ? (selectedProvider.is_active ? 'Deactivate' : 'Activate')
                    : 'Delete'
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;