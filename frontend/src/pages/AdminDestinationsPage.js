import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, Search, Filter, MapPin, Star, IndianRupee, 
  Plus, Edit, Trash2, Loader2, AlertTriangle, Eye, X
} from 'lucide-react';
import { destinationsAPI, adminAPI, regionsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const AdminDestinationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [destinations, setDestinations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view', 'delete'
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image_url: '',
    price: '',
    category: '',
    region: '',
    highlights: []
  });

  const categories = ['Nature', 'Cultural', 'Adventure', 'Religious', 'Historical'];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [destinationsData, regionsData] = await Promise.all([
        destinationsAPI.getAll(),
        regionsAPI.getAll()
      ]);
      
      setDestinations(destinationsData);
      setRegions(regionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load destinations data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  // Filter destinations
  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || destination.category === categoryFilter;
    const matchesRegion = regionFilter === 'all' || destination.region === regionFilter;

    return matchesSearch && matchesCategory && matchesRegion;
  });

  const handleOpenModal = (mode, destination = null) => {
    setModalMode(mode);
    setSelectedDestination(destination);
    
    if (mode === 'create') {
      setFormData({
        name: '',
        location: '',
        description: '',
        image_url: '',
        price: '',
        category: '',
        region: '',
        highlights: []
      });
    } else if (destination) {
      setFormData({
        name: destination.name || '',
        location: destination.location || '',
        description: destination.description || '',
        image_url: destination.image_url || '',
        price: destination.price?.toString() || '',
        category: destination.category || '',
        region: destination.region || '',
        highlights: destination.highlights || []
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDestination(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      image_url: '',
      price: '',
      category: '',
      region: '',
      highlights: []
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formLoading) return;

    try {
      setFormLoading(true);
      
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        highlights: Array.isArray(formData.highlights) ? formData.highlights : 
                   formData.highlights.split(',').map(h => h.trim()).filter(h => h)
      };

      if (modalMode === 'create') {
        await adminAPI.createDestination(submitData);
        toast({
          title: "Success",
          description: "Destination created successfully",
        });
      } else if (modalMode === 'edit') {
        await adminAPI.updateDestination(selectedDestination.id, submitData);
        toast({
          title: "Success",
          description: "Destination updated successfully",
        });
      }

      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving destination:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save destination",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDestination || formLoading) return;

    try {
      setFormLoading(true);
      await adminAPI.deleteDestination(selectedDestination.id);
      toast({
        title: "Success",
        description: "Destination deleted successfully",
      });
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete destination",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin-dashboard">
                <Button variant="outline" size="sm" className="hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Destinations</h1>
                <p className="text-gray-600 mt-1">Create, update, and manage tourism destinations</p>
              </div>
            </div>
            <Button 
              onClick={() => handleOpenModal('create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Destination
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Destinations</p>
                  <p className="text-3xl font-bold">{destinations.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Categories</p>
                  <p className="text-3xl font-bold">{categories.length}</p>
                </div>
                <Filter className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Regions</p>
                  <p className="text-3xl font-bold">{regions.length}</p>
                </div>
                <MapPin className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Avg Rating</p>
                  <p className="text-3xl font-bold">
                    {destinations.length > 0 
                      ? (destinations.reduce((sum, d) => sum + (d.rating || 0), 0) / destinations.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                </div>
                <Star className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Destinations
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, location, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Filter
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region Filter
                </label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Regions</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.name.toLowerCase()}>{region.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destinations List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading destinations...</p>
            </div>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Destinations Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' || regionFilter !== 'all' 
                ? 'No destinations match your current filters.' 
                : 'No destinations available. Create your first destination!'}
            </p>
            <Button 
              onClick={() => handleOpenModal('create')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Destination
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative">
                  <img
                    src={destination.image_url}
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-medium">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      destination.category === 'Nature' ? 'bg-green-100 text-green-800' :
                      destination.category === 'Cultural' ? 'bg-blue-100 text-blue-800' :
                      destination.category === 'Adventure' ? 'bg-red-100 text-red-800' :
                      destination.category === 'Religious' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {destination.category}
                    </span>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900">{destination.name}</CardTitle>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{destination.location}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{destination.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    {renderStars(destination.rating)}
                    <div className="flex items-center text-lg font-bold text-green-600">
                      <IndianRupee className="h-4 w-4" />
                      {destination.price}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {destination.region} Region
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal('view', destination)}
                        className="hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal('edit', destination)}
                        className="hover:bg-green-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenModal('delete', destination)}
                        className="hover:bg-red-50 text-red-600"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' && 'Create New Destination'}
                {modalMode === 'edit' && 'Edit Destination'}
                {modalMode === 'view' && 'Destination Details'}
                {modalMode === 'delete' && 'Delete Destination'}
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              {modalMode === 'delete' ? (
                <div className="text-center">
                  <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
                  <p className="text-gray-600 mb-6">
                    This will permanently delete "{selectedDestination?.name}". This action cannot be undone.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={formLoading}
                    >
                      {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Delete
                    </Button>
                  </div>
                </div>
              ) : modalMode === 'view' ? (
                <div className="space-y-4">
                  <img 
                    src={selectedDestination?.image_url} 
                    alt={selectedDestination?.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-gray-900">{selectedDestination?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-gray-900">{selectedDestination?.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Category</label>
                      <p className="mt-1 text-gray-900">{selectedDestination?.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Region</label>
                      <p className="mt-1 text-gray-900">{selectedDestination?.region}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Price</label>
                      <p className="mt-1 text-gray-900">₹{selectedDestination?.price}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Rating</label>
                      <div className="mt-1">{renderStars(selectedDestination?.rating)}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900">{selectedDestination?.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Highlights</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedDestination?.highlights?.map((highlight, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      required
                      rows="3"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                    <input
                      type="url"
                      required
                      value={formData.image_url}
                      onChange={(e) => handleInputChange('image_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                      <select
                        required
                        value={formData.region}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Region</option>
                        {regions.map(region => (
                          <option key={region.id} value={region.name.toLowerCase()}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highlights (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(formData.highlights) ? formData.highlights.join(', ') : formData.highlights}
                      onChange={(e) => handleInputChange('highlights', e.target.value)}
                      placeholder="e.g., Scenic views, Historical significance, Adventure activities"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <Button type="button" variant="outline" onClick={handleCloseModal}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={formLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {modalMode === 'create' ? 'Create Destination' : 'Update Destination'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDestinationsPage;