import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Check, X, Shield, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { bookingsAPI, providersAPI, destinationsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import LanguageToggle from '../components/LanguageToggle';
import WalletConnector from '../components/WalletConnector';
import BlockchainBookingStatus from '../components/BlockchainBookingStatus';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Extract data from navigation state
  const { selectedProvider: initialProvider, destination, fromProvider } = location.state || {};
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providers, setProviders] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [enableBlockchainVerification, setEnableBlockchainVerification] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    travelers: 1,
    departureDate: '',
    cityOrigin: '',
    requirements: '',
    addons: []
  });
  const [errors, setErrors] = useState({});

  // Fetch providers and destinations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [providersData, destinationsData] = await Promise.all([
          providersAPI.getAll(),
          destinationsAPI.getAll()
        ]);
        
        setProviders(providersData);
        setDestinations(destinationsData);
        console.log('Fetched providers:', providersData);
        console.log('Fetched destinations:', destinationsData);
        
        // If we came from provider selection, set the initial provider
        if (initialProvider) {
          setSelectedProvider(initialProvider);
        } else if (providersData.length > 0) {
          // Default to first provider
          setSelectedProvider(providersData[0]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load booking data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, initialProvider]);

  const addons = [
    { id: 'pickup', name: t('airportPickupDrop'), price: 2000 },
    { id: 'insurance', name: t('travelInsurance'), price: 1500 },
    { id: 'photography', name: t('professionalPhotography'), price: 5000 },
    { id: 'meals', name: t('premiumMealsUpgrade'), price: 3000 }
  ];

  useEffect(() => {
    updatePrice();
  }, [selectedProvider, formData.travelers, formData.addons]);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, departureDate: today }));
  }, []);

  const updatePrice = () => {
    const travelers = parseInt(formData.travelers) || 1;
    let newTotalPrice = selectedProvider ? selectedProvider.price * travelers : 0;
    
    // Add addon prices
    formData.addons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        newTotalPrice += addon.price * travelers;
      }
    });

    setTotalPrice(newTotalPrice);
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const handleAddonChange = (addonId) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.includes(addonId)
        ? prev.addons.filter(id => id !== addonId)
        : [...prev.addons, addonId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.departureDate) newErrors.departureDate = 'Departure date is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone format (basic validation)
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: t('authenticationRequired'),
        description: t('pleaseLoginToBook'),
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate booking reference
      const ref = 'JH' + Date.now().toString().substr(-6);
      
      console.log('Selected provider:', selectedProvider);
      console.log('Available destinations:', destinations);
      
      // Use the first destination as default or find appropriate one
      const selectedDestination = destinations.find(d => 
        d.name?.toLowerCase().includes(selectedProvider?.location?.toLowerCase()?.split(',')[0] || '')
      ) || destinations[0];
      
      // Prepare booking data for API (matching backend BookingCreate model)
      const departureDate = new Date(formData.departureDate);
      const checkOutDate = new Date(departureDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1); // Default 1 day trip
      
      const bookingData = {
        provider_id: selectedProvider.id,
        destination_id: selectedDestination?.id || destinations[0]?.id,
        booking_date: formData.departureDate,
        check_in: formData.departureDate,
        check_out: checkOutDate.toISOString().split('T')[0],
        guests: parseInt(formData.travelers),
        rooms: Math.ceil(parseInt(formData.travelers) / 2), // Estimate rooms needed
        calculated_price: null, // Let backend calculate from provider+destination prices
        special_requests: formData.requirements || '',
        city_origin: formData.cityOrigin || '',
        addons: JSON.stringify(formData.addons),
        booking_full_name: formData.fullName,
        booking_email: formData.email,
        booking_phone: formData.phone,
        reference_number: ref,
        // Add package info for compatibility
        package_type: selectedProvider?.category?.toLowerCase() || 'service',
        package_name: selectedProvider?.service_name || 'Custom Service',
        // 🔗 PHASE 6.1: Include blockchain verification request
        blockchain_verification: walletConnected && enableBlockchainVerification
      };

      console.log('Submitting booking data:', bookingData);
      
      const response = await bookingsAPI.create(bookingData);
      console.log('Booking created successfully:', response);

      // Store the created booking ID for blockchain verification
      setCreatedBookingId(response.id);

      // If blockchain verification is enabled, proceed with verification
      if (walletConnected && enableBlockchainVerification) {
        toast({
          title: t('bookingSuccessful'),
          description: `${t('bookingCreatedWithRef')} ${ref}. Blockchain verification will begin automatically.`,
        });
      }

      // Navigate to payment page
      navigate(`/payment/${response.id}`, {
        state: {
          bookingData: {
            ...response,
            ...bookingData,
            id: response.id,
            reference_number: ref,
            package_name: selectedProvider?.service_name || 'Custom Service',
            package_type: selectedProvider?.category?.toLowerCase() || 'service',
            total_price: totalPrice, // Pass the frontend calculated total price
            calculated_price: totalPrice, // Also pass as calculated_price for compatibility
            blockchain_verification_enabled: walletConnected && enableBlockchainVerification
          }
        }
      });
      
      toast({
        title: t('bookingSuccessful'),
        description: `${t('bookingCreatedWithRef')} ${ref}. Redirecting to payment...`,
      });

    } catch (error) {
      console.error('Booking submission error:', error);
      toast({
        title: 'Booking Failed',
        description: error.response?.data?.detail || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  const handleWalletConnectionChange = (connected, address) => {
    setWalletConnected(connected);
    setWalletAddress(address);
  };

  const handleVerificationComplete = (verificationData) => {
    console.log('Blockchain verification completed:', verificationData);
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking options...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if no providers found
  if (providers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No providers available at the moment. Please try again later.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4 hover:bg-green-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-green-700">{t('bookService')}</h1>
              <p className="text-gray-600">{t('fillDetailsToBook')}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Wallet Connection Section */}
          <div className="mb-8">
            <WalletConnector onConnectionChange={handleWalletConnectionChange} />
          </div>

          {/* Blockchain Features Card */}
          {walletConnected && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-blue-900">
                    Blockchain Verification Available
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start">
                      <input
                        id="blockchain-verification"
                        type="checkbox"
                        checked={enableBlockchainVerification}
                        onChange={(e) => setEnableBlockchainVerification(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <label htmlFor="blockchain-verification" className="text-sm font-medium text-blue-900">
                          Enable blockchain verification for this booking
                        </label>
                        <p className="text-sm text-blue-700 mt-1">
                          Secure your booking with immutable blockchain verification, 
                          enabling certificate minting and loyalty points.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Benefits</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Immutable booking record</li>
                      <li>• Digital certificate eligibility</li>
                      <li>• Enhanced security</li>
                      <li>• Loyalty point verification</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show blockchain status for created booking */}
          {createdBookingId && walletConnected && enableBlockchainVerification && (
            <div className="mb-8">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Booking Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BlockchainBookingStatus 
                    bookingId={createdBookingId} 
                    onVerificationComplete={handleVerificationComplete}
                  />
                </CardContent>
              </Card>
            </div>
          )}
          {/* Service Selection Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-8 relative">
              Select Service Provider
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
            </h2>
            
            

            {/* Selected Service Display */}
            {selectedProvider && (
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-green-700 mb-2">
                        {selectedProvider.service_name}
                      </h3>
                      <p className="text-lg text-blue-600 font-medium mb-2">
                        {selectedProvider.name}
                      </p>
                      <p className="text-gray-600 mb-3">
                        {selectedProvider.description} - {selectedProvider.location}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">🏞️ {selectedProvider.category}</span>
                        <span className="mr-4">⭐ {selectedProvider.rating}/5.0</span>
                        <span>📞 {selectedProvider.contact}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ₹{selectedProvider.price.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500">per person</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Form */}
            <div className="space-y-6">
              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">{t('personalInformation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('fullName')} *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('enterFullName')}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('email')} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('enterEmail')}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('phone')} *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={t('enterPhone')}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">{t('tripDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('numberOfTravelers')}
                      </label>
                      <select
                        id="travelers"
                        value={formData.travelers}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('departureDate')} *
                      </label>
                      <input
                        type="date"
                        id="departureDate"
                        value={formData.departureDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.departureDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.departureDate && <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cityOrigin" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('cityOfOrigin')}
                    </label>
                    <input
                      type="text"
                      id="cityOrigin"
                      value={formData.cityOrigin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={t('enterCityOrigin')}
                    />
                  </div>

                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('specialRequirements')}
                    </label>
                    <textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={t('enterSpecialRequirements')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons */}
              <Card className="bg-white border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">{t('addOns')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={addon.id}
                            checked={formData.addons.includes(addon.id)}
                            onChange={() => handleAddonChange(addon.id)}
                            className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor={addon.id} className="text-sm font-medium text-gray-700">
                            {addon.name}
                          </label>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          +₹{addon.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:sticky lg:top-8">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-green-700">
                    {t('bookingSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProvider && (
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">
                        {selectedProvider.service_name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedProvider.name}
                      </p>
                      <div className="flex justify-between items-center">
                        <span>{t('basePrice')}</span>
                        <span className="font-semibold">₹{selectedProvider.price.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('travelers')}:</span>
                      <span>{formData.travelers}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>{t('serviceCost')}:</span>
                      <span>₹{((selectedProvider?.price || 0) * parseInt(formData.travelers || 1)).toLocaleString()}</span>
                    </div>

                    {formData.addons.length > 0 && (
                      <div className="border-t pt-2">
                        <h5 className="font-medium text-gray-700 mb-2">{t('addOns')}:</h5>
                        {formData.addons.map(addonId => {
                          const addon = addons.find(a => a.id === addonId);
                          return addon ? (
                            <div key={addonId} className="flex justify-between text-sm">
                              <span>{addon.name}</span>
                              <span>₹{(addon.price * parseInt(formData.travelers || 1)).toLocaleString()}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="border-t pt-2 flex justify-between text-lg font-bold text-green-700">
                      <span>{t('totalAmount')}:</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting || !selectedProvider}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? 'Processing...' : t('bookNow')}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-2">
                    {t('securePaymentGuaranteed')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">{t('bookingConfirmed')}</h2>
                <p className="text-gray-600 mb-4">{t('bookingSuccessMessage')}</p>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">{t('bookingReference')}:</p>
                  <p className="text-lg font-bold text-green-700">{bookingRef}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => navigate('/bookings')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {t('viewBookings')}
                </Button>
                <Button 
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1"
                >
                  {t('close')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BookingPage;