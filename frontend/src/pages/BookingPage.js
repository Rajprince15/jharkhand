import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { bookingsAPI, providersAPI, destinationsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import LanguageToggle from '../components/LanguageToggle';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Extract data from navigation state
  const { selectedProvider, destination, fromProvider } = location.state || {};
  const [selectedPackage, setSelectedPackage] = useState('heritage');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providers, setProviders] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
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
        
        // Log specific Netarhat provider data
        const netarhatProvider = providersData.find(p => 
          p.name.toLowerCase().includes('netarhat') || 
          p.location.toLowerCase().includes('netarhat') ||
          p.category === 'Adventure'
        );
        console.log('Netarhat/Adventure provider found:', netarhatProvider);
        
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
  }, [toast]);

  // Create packages dynamically based on fetched providers with REAL PROVIDER PRICES
  const packages = providers.length > 0 && destinations.length > 0 ? [
    {
      id: 'heritage',
      name: t('heritageExplorer'),
      get price() {
        const provider = providers.find(p => p.category === 'Heritage' || p.category === 'heritage') || providers[0];
        return provider ? provider.price : 0;
      },
      provider_id: providers.find(p => p.category === 'Heritage' || p.category === 'heritage')?.id || providers[0]?.id,
      destination_id: destinations.find(d => d.name?.toLowerCase().includes('ranchi'))?.id || destinations[0]?.id,
      features: [
        t('visitRanchiDeoghar'),
        t('baidyanathTemple'),
        t('rockGardenTagoreHill'),
        t('acAccommodation'),
        t('allMealsIncluded'),
        t('professionalGuide')
      ]
    },
    {
      id: 'adventure',
      name: t('adventureSeeker'),
      get price() {
        const provider = providers.find(p => p.category === 'Adventure' || p.category === 'adventure') || providers[1];
        console.log('Adventure package provider found:', provider);
        return provider ? provider.price : 0;
      },
      provider_id: providers.find(p => p.category === 'Adventure' || p.category === 'adventure')?.id || providers[1]?.id,
      destination_id: destinations.find(d => d.name?.toLowerCase().includes('netarhat'))?.id || destinations[1]?.id,
      features: [
        t('netarhatBetla'),
        t('wildlifeSafari'),
        t('hundruDassamFalls'),
        t('trekkingCamping'),
        t('premiumAccommodation'),
        t('adventureEquipment')
      ]
    },
    {
      id: 'spiritual',
      name: t('spiritualJourney'),
      get price() {
        const provider = providers.find(p => p.category === 'Spiritual' || p.category === 'spiritual') || providers[2];
        return provider ? provider.price : 0;
      },
      provider_id: providers.find(p => p.category === 'Spiritual' || p.category === 'spiritual')?.id || providers[2]?.id,
      destination_id: destinations.find(d => d.name?.toLowerCase().includes('deoghar') || d.name?.toLowerCase().includes('parasnath'))?.id || destinations[2]?.id,
      features: [
        t('baidyanathJyotirlinga'),
        t('parasnathTemple'),
        t('rajrappaTemple'),
        t('jagannathTemple'),
        t('spiritualGuideIncluded'),
        t('prayerCeremonies')
      ]
    },
    {
      id: 'premium',
      name: t('premiumExperience'),
      get price() {
        const provider = providers.find(p => p.category === 'Wildlife' || p.category === 'Nature') || providers[3];
        return provider ? provider.price : 0;
      },
      provider_id: providers.find(p => p.category === 'Wildlife' || p.category === 'Nature')?.id || providers[3]?.id,
      destination_id: destinations.find(d => d.name?.toLowerCase().includes('betla') || d.name?.toLowerCase().includes('hazaribagh'))?.id || destinations[3]?.id,
      features: [
        t('completeJharkhandTour'),
        t('luxuryResortsHotels'),
        t('privateTransportation'),
        t('culturalPerformances'),
        t('photographySessions'),
        t('personalConcierge')
      ]
    }
  ] : [];

  const addons = [
    { id: 'pickup', name: t('airportPickupDrop'), price: 2000 },
    { id: 'insurance', name: t('travelInsurance'), price: 1500 },
    { id: 'photography', name: t('professionalPhotography'), price: 5000 },
    { id: 'meals', name: t('premiumMealsUpgrade'), price: 3000 }
  ];

  useEffect(() => {
    updatePrice();
  }, [selectedPackage, formData.travelers, formData.addons, providers, destinations]);

  // Initialize price when packages are loaded
  useEffect(() => {
    if (packages.length > 0) {
      updatePrice();
    }
  }, [packages]);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, departureDate: today }));
  }, []);

  const updatePrice = () => {
    const travelers = parseInt(formData.travelers) || 1;
    const selectedPackageData = getPackageData(selectedPackage);
    let newTotalPrice = selectedPackageData ? selectedPackageData.price * travelers : 0;
    
    // Add addon prices
    formData.addons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        newTotalPrice += addon.price * travelers;
      }
    });

    setTotalPrice(newTotalPrice);
  };

  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData.id);
    // Remove basePrice setter as we now use dynamic pricing
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

  const handleAddonChange = (addonId, checked) => {
    setFormData(prev => ({
      ...prev,
      addons: checked 
        ? [...prev.addons, addonId]
        : prev.addons.filter(id => id !== addonId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['fullName', 'email', 'phone', 'travelers', 'departureDate'];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        newErrors[field] = t('thisFieldRequired');
      }
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('validEmailAddress');
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = t('validPhoneNumber');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookTour = async () => {
    if (!validateForm()) {
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
      
      // Get selected package details
      const packageData = getPackageData(selectedPackage);
      console.log('Selected package data:', packageData);
      console.log('Available providers:', providers);
      console.log('Available destinations:', destinations);
      
      // Prepare booking data for API (matching backend BookingCreate model)
      const departureDate = new Date(formData.departureDate);
      const checkOutDate = new Date(departureDate);
      
      // Extract number of days from duration string (e.g., "5 Days / 4 Nights" -> 5)
      const durationDays = packageData.duration ? 
        parseInt(packageData.duration.match(/(\d+)\s*Days?/i)?.[1]) || 3 : 3;
      
      checkOutDate.setDate(checkOutDate.getDate() + durationDays);
      
      const bookingData = {
        provider_id: packageData.provider_id, // Now using correct provider IDs
        destination_id: packageData.destination_id, // Now using correct destination IDs
        booking_date: formData.departureDate, // YYYY-MM-DD format
        check_in: formData.departureDate, // Use departure date as check-in
        check_out: checkOutDate.toISOString().split('T')[0], // Calculate check-out date
        guests: parseInt(formData.travelers),
        rooms: Math.ceil(parseInt(formData.travelers) / 2), // Estimate rooms needed (2 guests per room)
        special_requests: formData.requirements || '', // Keep only actual requirements
        city_origin: formData.cityOrigin || '', // Separate field for city of origin
        calculated_price: null, // Don't send calculated price - let backend use real provider+destination prices
        addons: JSON.stringify(formData.addons), // Store selected addons as JSON
        // Personal information from booking form
        booking_full_name: formData.fullName,
        booking_email: formData.email,
        booking_phone: formData.phone,
        // Reference number for provider lookup
        reference_number: ref
      };

      console.log('Booking data being sent:', bookingData); // Debug log

      // Create booking via API
      const response = await bookingsAPI.create(bookingData);
      
      if (response) {
        setBookingRef(ref);
        
        // Navigate to payment page instead of showing success modal
        navigate(`/payment/${response.id}`, {
          state: {
            bookingData: {
              ...response,
              ...bookingData,
              id: response.id,
              reference_number: ref,
              package_name: packageData.name,
              package_type: selectedPackage,
              total_price: totalPrice, // Pass the frontend calculated total price
              calculated_price: totalPrice // Also pass as calculated_price for compatibility
            }
          }
        });
        
        toast({
          title: t('bookingSuccessful'),
          description: `${t('bookingCreatedWithRef')} ${ref}. Redirecting to payment...`,
        });
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: t('bookingFailed'),
        description: t('bookingErrorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  const getPackageData = (id) => packages.find(p => p.id === id);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Language Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      {/* Floating background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-5 h-5 bg-green-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-[20%] right-[10%] w-4 h-4 bg-green-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-[60%] left-[5%] w-6 h-6 bg-green-100 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute top-[80%] right-[20%] w-3 h-3 bg-green-200 rounded-full opacity-30 animate-bounce"></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20 mr-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              {t('bookYourJharkhandAdventure')}
            </h1>
            <p className="text-xl opacity-90">
              {t('discoverUntouchedBeauty')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-6xl mx-auto shadow-2xl border-0">
          <CardContent className="p-8">
            
            {/* Simple Selected Service Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center text-green-700 mb-8 relative">
                Selected Service
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
              </h2>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-green-700 mb-2">
                        {selectedProvider ? selectedProvider.service_name : getPackageData(selectedPackage)?.name}
                      </h3>
                      <p className="text-lg text-blue-600 font-medium mb-2">{getPackageData(selectedPackage)?.duration}</p>
                      <p className="text-gray-600 mb-3">
                        {selectedProvider 
                          ? `${selectedProvider.description} - ${selectedProvider.location}`
                          : "Experience the best of Jharkhand with our carefully curated package"
                        }
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="mr-4">🏞️ {selectedProvider ? 'Service Provider' : 'Premium Package'}</span>
                        <span className="mr-4">⭐ Highly Rated</span>
                        <span>📞 24/7 Support</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ₹{getPackageData(selectedPackage)?.price?.toLocaleString() || '0'}
                      </div>
                      <p className="text-sm text-gray-500">per person</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Form */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-green-700 border-b border-green-200 pb-2">
                  {t('bookingDetails')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fullName')} *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('enterFullName')}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('enterEmail')}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('phoneNumber')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('enterPhoneNumber')}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="travelers" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('numberOfTravelers')} *
                    </label>
                    <select
                      id="travelers"
                      value={formData.travelers}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.travelers ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? t('person') : t('people')}</option>
                      ))}
                    </select>
                    {errors.travelers && <p className="text-red-500 text-sm mt-1">{errors.travelers}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('departureDate')} *
                    </label>
                    <input
                      type="date"
                      id="departureDate"
                      value={formData.departureDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.departureDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.departureDate && <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="cityOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('cityOfOrigin')}
                    </label>
                    <input
                      type="text"
                      id="cityOrigin"
                      value={formData.cityOrigin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={t('enterCityOrigin')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('specialRequirements')}
                  </label>
                  <textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t('specialRequirementsPlaceholder')}
                  />
                </div>

                {/* Add-ons */}
                <div>
                  <h4 className="text-lg font-semibold text-green-700 mb-4">{t('selectAddOns')}</h4>
                  <div className="space-y-3">
                    {addons.map((addon) => (
                      <label key={addon.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.addons.includes(addon.id)}
                          onChange={(e) => handleAddonChange(addon.id, e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="flex-1">{addon.name}</span>
                        <span className="font-semibold text-green-600">+₹{addon.price.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">
                        {selectedProvider ? selectedProvider.service_name : getPackageData(selectedPackage)?.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {getPackageData(selectedPackage)?.duration}
                      </p>
                      <div className="flex justify-between items-center">
                        <span>{t('basePrice')}</span>
                        <span className="font-semibold">₹{getPackageData(selectedPackage)?.price?.toLocaleString() || '0'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{t('travelers')}:</span>
                        <span>{formData.travelers}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>{t('packageCost')}:</span>
                        <span>₹{((getPackageData(selectedPackage)?.price || 0) * parseInt(formData.travelers || 1)).toLocaleString()}</span>
                      </div>

                      {formData.addons.length > 0 && (
                        <div className="border-t pt-2">
                          <h5 className="font-medium text-gray-700 mb-2">{t('addOns')}:</h5>
                          {formData.addons.map(addonId => {
                            const addon = addons.find(a => a.id === addonId);
                            return addon ? (
                              <div key={addonId} className="flex justify-between text-sm">
                                <span>{addon.name}</span>
                                <span>₹{addon.price.toLocaleString()}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}

                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-bold text-green-700">
                          <span>{t('totalAmount')}:</span>
                          <span>₹{totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleBookTour}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting ? t('processing') : t('bookNow')}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      {t('securePaymentGuaranteed')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-white">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-700">{t('bookingSuccessful')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">{t('yourBookingReference')}</p>
                <p className="text-xl font-bold text-green-700">{bookingRef}</p>
              </div>
              
              <p className="text-sm text-gray-600">
                {t('confirmationEmailSent')}
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    closeModal();
                    navigate('/bookings');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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