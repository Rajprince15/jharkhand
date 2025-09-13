import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Check, X } from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState('heritage');
  const [basePrice, setBasePrice] = useState(15999);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [totalPrice, setTotalPrice] = useState(15999);
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

  const packages = [
    {
      id: 'heritage',
      name: 'Heritage Explorer',
      price: 15999,
      duration: '5 Days / 4 Nights',
      features: [
        'Visit Ranchi & Deoghar',
        'Baidyanath Temple darshan',
        'Rock Garden & Tagore Hill',
        'AC accommodation',
        'All meals included',
        'Professional guide'
      ]
    },
    {
      id: 'adventure',
      name: 'Adventure Seeker',
      price: 22999,
      duration: '7 Days / 6 Nights',
      features: [
        'Netarhat & Betla National Park',
        'Wildlife safari experience',
        'Hundru & Dassam Falls',
        'Trekking & camping',
        'Premium accommodation',
        'Adventure equipment'
      ]
    },
    {
      id: 'spiritual',
      name: 'Spiritual Journey',
      price: 18999,
      duration: '6 Days / 5 Nights',
      features: [
        'Baidyanath Jyotirlinga',
        'Parasnath Temple',
        'Rajrappa Temple',
        'Jagannath Temple',
        'Spiritual guide included',
        'Prayer ceremonies'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Experience',
      price: 35999,
      duration: '10 Days / 9 Nights',
      features: [
        'Complete Jharkhand tour',
        'Luxury resorts & hotels',
        'Private transportation',
        'Cultural performances',
        'Photography sessions',
        'Personal concierge'
      ]
    }
  ];

  const addons = [
    { id: 'pickup', name: 'Airport Pickup/Drop', price: 2000 },
    { id: 'insurance', name: 'Travel Insurance', price: 1500 },
    { id: 'photography', name: 'Professional Photography', price: 5000 },
    { id: 'meals', name: 'Premium Meals Upgrade', price: 3000 }
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
        newErrors[field] = 'This field is required';
      }
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookTour = () => {
    if (!validateForm()) {
      return;
    }

    // Generate booking reference
    const ref = 'JH' + Date.now().toString().substr(-6);
    setBookingRef(ref);

    // Show success modal
    setShowSuccessModal(true);

    // Here you would typically send the booking data to your server
    console.log('Booking Data:', {
      package: selectedPackage,
      ...formData,
      totalPrice: totalPrice,
      bookingRef: ref
    });
  };

  const closeModal = () => {
    setShowSuccessModal(false);
  };

  const getPackageData = (id) => packages.find(p => p.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
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
              Back
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              Book Your Jharkhand Adventure
            </h1>
            <p className="text-xl opacity-90">
              Discover the untouched beauty of the land of forests
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-6xl mx-auto shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Package Selection */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center text-green-700 mb-8 relative">
                Choose Your Adventure
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

            {/* Booking Form */}
            <Card className="bg-gradient-to-br from-gray-50 to-white shadow-inner">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-green-700">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.fullName ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="10-digit phone number"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      Number of Travelers *
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
                      Departure Date *
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
                      City of Origin
                    </label>
                    <input
                      type="text"
                      id="cityOrigin"
                      value={formData.cityOrigin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Delhi, Mumbai, etc."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Special Requirements
                  </label>
                  <textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                    placeholder="Dietary preferences, accessibility needs, etc."
                  />
                </div>

                {/* Add-on Services */}
                <Card className="bg-gradient-to-br from-green-50 to-white">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-700">Add-On Services</CardTitle>
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
                      {getPackageData(selectedPackage)?.name} package for {formData.travelers} person{formData.travelers > 1 ? 's' : ''}
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleBookTour}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Book Your Adventure Now
                </Button>
              </CardContent>
            </Card>

            {/* Testimonial */}
            <Card className="mt-12 text-center">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-green-700 mb-6">What Our Travelers Say</h3>
                <blockquote className="text-lg italic text-gray-700 max-w-2xl mx-auto mb-4">
                  "An absolutely magical experience! Jharkhand's natural beauty and rich culture exceeded all expectations. The team made everything seamless and memorable."
                </blockquote>
                <div className="text-green-600 font-semibold">- Priya Sharma, Delhi</div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
            <CardContent className="p-8 text-center">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-6xl text-green-500 mb-6">✅</div>
              <h2 className="text-2xl font-bold text-green-700 mb-4">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for choosing Explore Jharkhand! We'll contact you within 24 hours to confirm your booking details and arrange payment.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Booking Reference: <strong className="text-green-600">{bookingRef}</strong>
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={closeModal}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Continue Exploring
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    closeModal();
                    navigate('/');
                  }}
                  className="w-full"
                >
                  Back to Home
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