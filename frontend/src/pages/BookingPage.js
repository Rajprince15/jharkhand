import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { bookingsAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';
import LanguageToggle from '../components/LanguageToggle';

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Get provider and destination data from navigation state
  const { selectedProvider, destination, fromProvider } = location.state || {};
  
  const [selectedPackage, setSelectedPackage] = useState('heritage');
  const [basePrice, setBasePrice] = useState(selectedProvider ? parseFloat(selectedProvider.price) : 15999);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [totalPrice, setTotalPrice] = useState(selectedProvider ? parseFloat(selectedProvider.price) : 15999);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // FIXED: Updated with correct provider IDs from your database
  const packages = [
    {
      id: 'heritage',
      name: t('heritageExplorer'),
      price: 15999,
      duration: `5 ${t('days')} / 4 ${t('nights')}`,
      provider_id: 'prov_ranchi_guide_1', // Corrected: Ranchi Heritage Tours
      destination_id: '1', // Ranchi
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
      price: 22999,
      duration: `7 ${t('days')} / 6 ${t('nights')}`,
      provider_id: 'prov_netarhat_guide_1', // Corrected: Netarhat Hill Adventures
      destination_id: '2', // Netarhat
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
      price: 18999,
      duration: `6 ${t('days')} / 5 ${t('nights')}`,
      provider_id: 'prov_parasnath_guide_1', // Corrected: Parasnath Pilgrimage Services
      destination_id: '4', // Parasnath Hill
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
      price: 35999,
      duration: `10 ${t('days')} / 9 ${t('nights')}`,
      provider_id: 'prov_betla_safari_1', // Corrected: Betla Wildlife Safaris
      destination_id: '3', // Betla National Park
      features: [
        t('completeJharkhandTour'),
        t('luxuryResortsHotels'),
        t('privateTransportation'),
        t('culturalPerformances'),
        t('photographySessions'),
        t('personalConcierge')
      ]
    }
  ];

  const addons = [
    { id: 'pickup', name: t('airportPickupDrop'), price: 2000 },
    { id: 'insurance', name: t('travelInsurance'), price: 1500 },
    { id: 'photography', name: t('professionalPhotography'), price: 5000 },
    { id: 'meals', name: t('premiumMealsUpgrade'), price: 3000 }
  ];

  useEffect(() => {
    updatePrice();
  }, [selectedPackage, formData.travelers, formData.addons]);

  useEffect(() => {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, departureDate: today }));
  }, []);

  const updatePrice = () => {
    const travelers = parseInt(formData.travelers) || 1;
    let newTotalPrice = basePrice * travelers;
    
    // Add addon prices
    formData.addons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        newTotalPrice += addon.price;
      }
    });

    setTotalPrice(newTotalPrice);
  };

  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData.id);
    setBasePrice(packageData.price);
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
      
      // Prepare booking data for API
      const departureDate = new Date(formData.departureDate);
      const checkOutDate = new Date(departureDate);
      checkOutDate.setDate(checkOutDate.getDate() + 2); // Default 2 days
      
      let bookingData;
      
      if (fromProvider && selectedProvider && destination) {
        // Booking from provider selection
        bookingData = {
          provider_id: selectedProvider.id,
          destination_id: destination.id,
          booking_date: formData.departureDate,
          check_in: formData.departureDate,
          check_out: checkOutDate.toISOString().split('T')[0],
          guests: parseInt(formData.travelers),
          rooms: Math.ceil(parseInt(formData.travelers) / 2),
          special_requests: `${formData.requirements || ''}${formData.requirements && formData.cityOrigin ? '\n' : ''}${formData.cityOrigin ? 'Origin: ' + formData.cityOrigin : ''}${formData.addons.length > 0 ? '\nAdd-ons: ' + formData.addons.join(', ') : ''}`.trim(),
          package_type: 'custom',
          package_name: `${selectedProvider.service_name} - ${destination.name}`,
          calculated_price: totalPrice,
          addons: JSON.stringify(formData.addons)
        };
      } else {
        // Package booking (existing functionality)
        const packageData = getPackageData(selectedPackage);
        const durationDays = packageData.duration ? 
          parseInt(packageData.duration.match(/(\d+)\s*Days?/i)?.[1]) || 3 : 3;
        
        checkOutDate.setDate(checkOutDate.getDate() + durationDays - 2);
        
        bookingData = {
          provider_id: packageData.provider_id,
          destination_id: packageData.destination_id,
          booking_date: formData.departureDate,
          check_in: formData.departureDate,
          check_out: checkOutDate.toISOString().split('T')[0],
          guests: parseInt(formData.travelers),
          rooms: Math.ceil(parseInt(formData.travelers) / 2),
          special_requests: `${formData.requirements || ''}${formData.requirements && formData.cityOrigin ? '\n' : ''}${formData.cityOrigin ? 'Origin: ' + formData.cityOrigin : ''}${formData.addons.length > 0 ? '\nAdd-ons: ' + formData.addons.join(', ') : ''}`.trim(),
          package_type: selectedPackage,
          package_name: packageData.name,
          calculated_price: totalPrice,
          addons: JSON.stringify(formData.addons)
        };
      }

      console.log('Booking data being sent:', bookingData);

      // Create booking via API
      const response = await bookingsAPI.create(bookingData);
      
      if (response) {
        setBookingRef(ref);
        setShowSuccessModal(true);
        
        toast({
          title: t('bookingSuccessful'),
          description: `${t('bookingCreatedWithRef')} ${ref}`,
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
              {fromProvider && selectedProvider 
                ? `Book ${selectedProvider.service_name}`
                : t('bookYourJharkhandAdventure')
              }
            </h1>
            <p className="text-xl opacity-90">
              {fromProvider && destination 
                ? `Experience ${destination.name} with ${selectedProvider?.name}`
                : t('discoverUntouchedBeauty')
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-6xl mx-auto shadow-2xl border-0">
          <CardContent className="p-8">
            
            {/* Provider/Service Summary - Show if coming from provider selection */}
            {fromProvider && selectedProvider && destination && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-center text-green-700 mb-8 relative">
                  Selected Service
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
                </h2>
                
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-blue-700 mb-2">{selectedProvider.name}</h3>
                        <p className="text-lg text-green-600 font-medium mb-2">{selectedProvider.service_name}</p>
                        <p className="text-gray-600 mb-3">{selectedProvider.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-4">📍 {selectedProvider.location}</span>
                          <span className="mr-4">⭐ {selectedProvider.avg_rating || selectedProvider.rating}</span>
                          <span>📞 {selectedProvider.contact}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ₹{parseFloat(selectedProvider.price).toLocaleString('en-IN')}
                        </div>
                        <p className="text-sm text-gray-500">per person</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Package Selection - Show if not coming from provider */}
            {!fromProvider && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-center text-green-700 mb-8 relative">
                  {t('chooseYourAdventure')}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {packages.map((pkg) => (
                    <Card 
                      key={pkg.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                        selectedPackage === pkg.id 
                          ? 'ring-2 ring-green-500 bg-green-50' 
                          : 'hover:shadow-green-100'
                      }`}
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-green-700">{pkg.name}</CardTitle>
                          <span className="text-xl font-bold text-orange-500">₹{pkg.price.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600">{pkg.duration}</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-sm">
                              <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Form */}
            <Card className="bg-gradient-to-br from-gray-50 to-white shadow-inner">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-green-700">{t('bookingDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      {t('fullName')} *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.fullName ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder={t('enterFullName')}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder={t('enterEmail')}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      {t('phoneNumber')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder={t('enterPhoneNumber')}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      {t('numberOfTravelers')} *
                    </label>
                    <input
                      type="number"
                      id="travelers"
                      min="1"
                      max="20"
                      value={formData.travelers}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.travelers ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.travelers && <p className="text-red-500 text-xs mt-1">{errors.travelers}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      {t('departureDate')} *
                    </label>
                    <input
                      type="date"
                      id="departureDate"
                      value={formData.departureDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.departureDate ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.departureDate && <p className="text-red-500 text-xs mt-1">{errors.departureDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      {t('cityOfOrigin')}
                    </label>
                    <input
                      type="text"
                      id="cityOrigin"
                      value={formData.cityOrigin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={t('enterCityOrigin')}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    {t('specialRequirements')}
                  </label>
                  <textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                    placeholder={t('specialRequirementsPlaceholder')}
                  />
                </div>

                {/* Add-on Services */}
                <Card className="bg-gradient-to-br from-green-50 to-white">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-700">{t('selectAddOns')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addons.map((addon) => (
                        <div key={addon.id} className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <input
                            type="checkbox"
                            id={addon.id}
                            checked={formData.addons.includes(addon.id)}
                            onChange={(e) => handleAddonChange(addon.id, e.target.checked)}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 mr-3"
                          />
                          <label htmlFor={addon.id} className="text-sm cursor-pointer">
                            {addon.name} (₹{addon.price.toLocaleString()})
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Price Summary */}
                <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold mb-2">₹{totalPrice.toLocaleString()}</div>
                    <div className="text-green-100">
                      {fromProvider && selectedProvider 
                        ? `${selectedProvider.service_name} for ${formData.travelers} ${formData.travelers > 1 ? 'persons' : 'person'}`
                        : `${getPackageData(selectedPackage)?.name} ${t('packageFor')} ${formData.travelers} ${formData.travelers > 1 ? t('persons') : t('person')}`
                      }
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleBookTour}
                  disabled={isSubmitting}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? t('processing') : t('bookNow')}
                </Button>
              </CardContent>
            </Card>
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
                    navigate('/dashboard');
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