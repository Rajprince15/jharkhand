import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Users, IndianRupee, Sparkles } from 'lucide-react';
import { deepseekAPI } from '../services/deepseekApi';
import { useAuth } from '../contexts/AuthContext';

const AIPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destinations: [],
    duration: '',
    budget: '',
    groupSize: '',
    travelStyle: 'balanced',
    interests: []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [error, setError] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const travelStyles = [
    {
      id: 'relaxed',
      title: 'Relaxed',
      description: 'Fewer activities, more leisure time'
    },
    {
      id: 'balanced',
      title: 'Balanced',
      description: 'Mix of activities and relaxation'
    },
    {
      id: 'packed',
      title: 'Packed',
      description: 'Maximum activities and experiences'
    }
  ];

  const interestOptions = [
    'Adventure Sports',
    'Cultural Sites',
    'Nature & Wildlife',
    'Photography',
    'Food & Cuisine',
    'Shopping',
    'Nightlife',
    'Religious Sites',
    'Museums',
    'Beaches',
    'Mountains',
    'Historical Places'
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleDestinationChange = (destination) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.includes(destination)
        ? prev.destinations.filter(d => d !== destination)
        : [...prev.destinations, destination]
    }));
  };

  const jharkhandDestinations = [
    'Ranchi', 'Netarhat', 'Betla National Park', 'Parasnath Hill',
    'Deoghar', 'Hazaribagh', 'Jamshedpur', 'Dassam Falls',
    'Hundru Falls', 'Jonha Falls', 'Rajrappa Temple'
  ];

  const generateItinerary = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (formData.destinations.length === 0) {
      setError('Please select at least one destination');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Prepare preferences for Deepseek API
      const preferences = {
        destinations: formData.destinations,
        budget: parseInt(formData.budget?.replace(/[₹,]/g, '') || '15000'),
        days: parseInt(formData.duration?.split(' ')[0] || '3'),
        interests: formData.interests,
        travel_style: formData.travelStyle,
        group_size: parseInt(formData.groupSize?.split(' ')[0] || '2')
      };

      const result = await deepseekAPI.generateItinerary(preferences);
      setGeneratedPlan(result);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setError(error.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your AI Generated Itinerary
              </h1>
              <p className="text-lg text-muted-foreground">
                Personalized travel plan for {generatedPlan.destination}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Trip Summary */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold">Duration</p>
                        <p className="text-muted-foreground">{generatedPlan.days} days</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <IndianRupee className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-semibold">Total Budget</p>
                        <p className="text-muted-foreground">₹{generatedPlan.budget?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="font-semibold">Destination</p>
                        <p className="text-muted-foreground">{generatedPlan.destination}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Generated Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                    AI Generated Itinerary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {generatedPlan.content}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center mt-12">
                <Button 
                  onClick={() => setGeneratedPlan(null)}
                  variant="outline" 
                  className="mr-4"
                >
                  Generate New Plan
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  Download Itinerary
                </Button>
                <Button 
                  onClick={() => navigate('/booking')}
                  className="bg-orange-600 hover:bg-orange-700 ml-4"
                >
                  Book This Trip
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Travel Planner
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let our AI create a personalized itinerary based on your preferences, budget, and interests
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="space-y-8">
                {/* Destination Input */}
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Which destinations in Jharkhand would you like to visit?
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {jharkhandDestinations.map((destination) => (
                      <Badge
                        key={destination}
                        variant={formData.destinations.includes(destination) ? "default" : "outline"}
                        className={`cursor-pointer p-3 text-center justify-center ${
                          formData.destinations.includes(destination)
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleDestinationChange(destination)}
                      >
                        {destination}
                      </Badge>
                    ))}
                  </div>
                  {error && error.includes('destination') && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>

                {/* Duration, Budget, Group Size */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-base font-medium mb-2 block">Duration (days)</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="3 days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2 days">2 days</SelectItem>
                        <SelectItem value="3 days">3 days</SelectItem>
                        <SelectItem value="5 days">5 days</SelectItem>
                        <SelectItem value="7 days">7 days</SelectItem>
                        <SelectItem value="10 days">10 days</SelectItem>
                        <SelectItem value="14 days">14 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-2 block">Budget (₹)</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="₹25,000 - Standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="₹15,000 - Budget">₹15,000 - Budget</SelectItem>
                        <SelectItem value="₹25,000 - Standard">₹25,000 - Standard</SelectItem>
                        <SelectItem value="₹50,000 - Premium">₹50,000 - Premium</SelectItem>
                        <SelectItem value="₹75,000 - Luxury">₹75,000 - Luxury</SelectItem>
                        <SelectItem value="₹1,00,000+ - Ultra Luxury">₹1,00,000+ - Ultra Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-2 block">Group Size</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, groupSize: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="2 persons" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 person">1 person</SelectItem>
                        <SelectItem value="2 persons">2 persons</SelectItem>
                        <SelectItem value="3-4 persons">3-4 persons</SelectItem>
                        <SelectItem value="5-6 persons">5-6 persons</SelectItem>
                        <SelectItem value="7+ persons">7+ persons</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Travel Style */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Travel Style</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {travelStyles.map((style) => (
                      <div
                        key={style.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.travelStyle === style.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.id }))}
                      >
                        <h4 className="font-semibold mb-2">{style.title}</h4>
                        <p className="text-sm text-muted-foreground">{style.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">
                    Your Interests (select all that apply)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {interestOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className={`cursor-pointer p-3 text-center justify-center ${
                          formData.interests.includes(interest)
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && !error.includes('destination') && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <div className="text-center pt-6">
                  <Button
                    onClick={generateItinerary}
                    disabled={isGenerating || !user}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                        Generating Your Itinerary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate My Itinerary with AI
                      </>
                    )}
                  </Button>
                  {!isGenerating && user && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Powered by Deepseek AI - This will take about 30 seconds to create your personalized plan
                    </p>
                  )}
                  {!user && (
                    <p className="text-sm text-red-500 mt-3">
                      Please log in to use the AI Planner
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AIPlanner;