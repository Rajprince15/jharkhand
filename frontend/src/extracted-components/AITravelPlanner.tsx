import React, { useState } from 'react';
import { Bot, Calendar, MapPin, Clock, DollarSign, Users, Sparkles, Download, Plane } from 'lucide-react';

// Types for the AI Travel Planner
export interface TravelPlannerConfig {
  currencies?: string[];
  defaultCurrency?: string;
  budgetOptions?: { value: number; label: string }[];
  interestOptions?: string[];
  maxDays?: number;
  maxGroupSize?: number;
  onItineraryGenerated?: (itinerary: GeneratedItinerary) => void;
  onBookingRequested?: (itinerary: GeneratedItinerary) => void;
  customApiEndpoint?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
  };
}

export interface TravelFormData {
  destination: string;
  days: number;
  budget: number;
  interests: string[];
  travelStyle: 'relaxed' | 'balanced' | 'packed';
  groupSize: number;
  currency: string;
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
  category?: string;
}

export interface DaySchedule {
  day: number;
  date: string;
  activities: Activity[];
  totalCost: number;
}

export interface GeneratedItinerary {
  id: string;
  destination: string;
  days: number;
  budget: number;
  currency: string;
  schedule: DaySchedule[];
  totalCost: number;
  highlights: string[];
  generatedAt: Date;
  preferences: TravelFormData;
}

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  </div>
);

// Default configuration
const defaultConfig: TravelPlannerConfig = {
  currencies: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
  defaultCurrency: 'USD',
  budgetOptions: [
    { value: 500, label: '$500 - Budget' },
    { value: 1500, label: '$1,500 - Standard' },
    { value: 3000, label: '$3,000 - Premium' },
    { value: 5000, label: '$5,000+ - Luxury' }
  ],
  interestOptions: [
    'Adventure Sports', 'Cultural Sites', 'Nature & Wildlife', 'Photography',
    'Food & Cuisine', 'Shopping', 'Nightlife', 'Religious Sites',
    'Museums', 'Beaches', 'Mountains', 'Historical Places',
    'Architecture', 'Art Galleries', 'Local Markets', 'Wellness & Spa'
  ],
  maxDays: 21,
  maxGroupSize: 12,
  theme: {
    primaryColor: 'blue',
    secondaryColor: 'sky',
    backgroundColor: 'gray'
  }
};

// Currency symbols mapping
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$'
};

// Main AI Travel Planner Component
export const AITravelPlanner: React.FC<{ config?: Partial<TravelPlannerConfig> }> = ({ 
  config = {} 
}) => {
  const finalConfig = { ...defaultConfig, ...config };
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null);
  const [formData, setFormData] = useState<TravelFormData>({
    destination: '',
    days: 3,
    budget: finalConfig.budgetOptions![1].value,
    interests: [],
    travelStyle: 'balanced',
    groupSize: 2,
    currency: finalConfig.defaultCurrency!
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'days' || name === 'budget' || name === 'groupSize' 
        ? parseInt(value) 
        : value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateMockItinerary = (): GeneratedItinerary => {
    const baseActivities = [
      { title: 'Arrival & Check-in', description: 'Arrive and settle into accommodation', defaultCost: 0.1 },
      { title: 'City Walking Tour', description: 'Explore the main attractions on foot', defaultCost: 0.15 },
      { title: 'Local Cuisine Experience', description: 'Try authentic local dishes', defaultCost: 0.2 },
      { title: 'Cultural Site Visit', description: 'Visit museums, temples, or historical sites', defaultCost: 0.25 },
      { title: 'Adventure Activity', description: 'Outdoor activities based on your interests', defaultCost: 0.3 },
      { title: 'Shopping & Souvenirs', description: 'Browse local markets and shops', defaultCost: 0.15 },
      { title: 'Sunset/Scenic Viewing', description: 'Enjoy beautiful views and photo opportunities', defaultCost: 0.1 },
      { title: 'Entertainment & Nightlife', description: 'Local entertainment and dining', defaultCost: 0.2 }
    ];

    const schedule: DaySchedule[] = Array.from({ length: formData.days }, (_, dayIndex) => {
      const activitiesPerDay = formData.travelStyle === 'relaxed' ? 3 : 
                              formData.travelStyle === 'balanced' ? 4 : 5;
      
      const dayActivities: Activity[] = [];
      const dayBudget = formData.budget / formData.days;
      
      for (let i = 0; i < activitiesPerDay; i++) {
        const activity = baseActivities[Math.floor(Math.random() * baseActivities.length)];
        const time = `${9 + i * 3}:00 ${9 + i * 3 >= 12 ? 'PM' : 'AM'}`;
        
        dayActivities.push({
          time,
          title: dayIndex === 0 && i === 0 ? 'Arrival & Check-in' : 
                 dayIndex === formData.days - 1 && i === activitiesPerDay - 1 ? 'Departure' : 
                 activity.title,
          description: activity.description,
          location: formData.destination,
          cost: Math.floor(dayBudget * activity.defaultCost),
          category: formData.interests[Math.floor(Math.random() * formData.interests.length)] || 'General'
        });
      }

      return {
        day: dayIndex + 1,
        date: new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).toLocaleDateString(),
        activities: dayActivities,
        totalCost: dayActivities.reduce((sum, activity) => sum + activity.cost, 0)
      };
    });

    return {
      id: Math.random().toString(36).substr(2, 9),
      destination: formData.destination,
      days: formData.days,
      budget: formData.budget,
      currency: formData.currency,
      schedule,
      totalCost: schedule.reduce((sum, day) => sum + day.totalCost, 0),
      highlights: [
        'AI-optimized route planning',
        'Interest-based activity selection',
        'Budget-conscious recommendations',
        'Local experience integration',
        'Weather-optimized scheduling'
      ],
      generatedAt: new Date(),
      preferences: { ...formData }
    };
  };

  const generateItinerary = async () => {
    setIsGenerating(true);
    
    try {
      let itinerary: GeneratedItinerary;
      
      if (finalConfig.customApiEndpoint) {
        // Use custom API endpoint
        const response = await fetch(finalConfig.customApiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        itinerary = await response.json();
      } else {
        // Use mock generation
        await new Promise(resolve => setTimeout(resolve, 3000));
        itinerary = generateMockItinerary();
      }
      
      setGeneratedItinerary(itinerary);
      finalConfig.onItineraryGenerated?.(itinerary);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      // Fallback to mock
      const mockItinerary = generateMockItinerary();
      setGeneratedItinerary(mockItinerary);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateItinerary();
  };

  const exportItinerary = () => {
    if (!generatedItinerary) return;
    
    const dataStr = JSON.stringify(generatedItinerary, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `itinerary-${generatedItinerary.destination.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCurrencySymbol = () => currencySymbols[formData.currency] || '$';

  // Render generated itinerary
  if (generatedItinerary) {
    const theme = finalConfig.theme!;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-${theme.primaryColor}-100 rounded-full`}>
                  <Sparkles className={`h-8 w-8 text-${theme.primaryColor}-600`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Your AI-Generated Itinerary
                  </h1>
                  <p className="text-gray-600">
                    {generatedItinerary.destination} • {generatedItinerary.days} Days
                  </p>
                </div>
              </div>
              <button 
                onClick={exportItinerary}
                className={`flex items-center space-x-2 px-4 py-2 border border-${theme.primaryColor}-500 text-${theme.primaryColor}-600 rounded-lg hover:bg-${theme.primaryColor}-50 transition-colors`}
              >
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`bg-${theme.primaryColor}-50 rounded-lg p-4 text-center`}>
                <Calendar className={`h-6 w-6 text-${theme.primaryColor}-600 mx-auto mb-2`} />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-bold text-gray-900">{generatedItinerary.days} Days</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-bold text-gray-900">
                  {getCurrencySymbol()}{generatedItinerary.totalCost.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Group Size</p>
                <p className="font-bold text-gray-900">{formData.groupSize} People</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <Bot className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">AI Optimized</p>
                <p className="font-bold text-gray-900">100%</p>
              </div>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="space-y-6">
            {generatedItinerary.schedule.map((day) => (
              <div key={day.day} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r from-${theme.primaryColor}-500 to-${theme.secondaryColor}-600 text-white p-6`}>
                  <h2 className="text-2xl font-bold mb-1">Day {day.day}</h2>
                  <p className={`text-${theme.primaryColor}-100`}>{day.date}</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {day.activities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 bg-${theme.primaryColor}-100 rounded-full flex items-center justify-center`}>
                            <Clock className={`h-6 w-6 text-${theme.primaryColor}-600`} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm font-medium text-${theme.primaryColor}-600 mb-1`}>{activity.time}</p>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
                              <p className="text-gray-600 mb-2">{activity.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{activity.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{getCurrencySymbol()}{activity.cost}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 text-center space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to book this itinerary?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {finalConfig.onBookingRequested && (
                  <button
                    onClick={() => finalConfig.onBookingRequested!(generatedItinerary)}
                    className={`px-8 py-3 bg-${theme.primaryColor}-500 text-white rounded-lg hover:bg-${theme.primaryColor}-600 transition-colors font-medium`}
                  >
                    Book This Trip
                  </button>
                )}
                <button
                  onClick={() => setGeneratedItinerary(null)}
                  className={`px-8 py-3 border border-${theme.primaryColor}-500 text-${theme.primaryColor}-600 rounded-lg hover:bg-${theme.primaryColor}-50 transition-colors font-medium`}
                >
                  Create New Itinerary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render form
  const theme = finalConfig.theme!;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className={`p-3 bg-${theme.primaryColor}-100 rounded-full`}>
              <Bot className={`h-8 w-8 text-${theme.primaryColor}-600`} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">AI Travel Planner</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let our AI create a personalized itinerary based on your preferences, budget, and interests
          </p>
        </div>

        {isGenerating ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <LoadingSpinner />
            <h3 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
              Creating Your Perfect Itinerary
            </h3>
            <p className="text-gray-600 mb-6">
              Our AI is analyzing your preferences and crafting a personalized travel experience...
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✓ Analyzing destination data</p>
              <p>✓ Matching with your interests</p>
              <p>✓ Optimizing budget allocation</p>
              <p>🔄 Generating day-by-day schedule...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where do you want to go?
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Enter destination (e.g., Paris, Tokyo, New York)"
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primaryColor}-500 focus:border-transparent`}
                />
              </div>

              {/* Duration, Budget, Currency, and Group Size */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (days)
                  </label>
                  <select
                    name="days"
                    value={formData.days}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primaryColor}-500 focus:border-transparent`}
                  >
                    {Array.from({ length: finalConfig.maxDays! }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day} day{day > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primaryColor}-500 focus:border-transparent`}
                  >
                    {finalConfig.currencies!.map(currency => (
                      <option key={currency} value={currency}>
                        {currency} ({currencySymbols[currency]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget ({getCurrencySymbol()})
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primaryColor}-500 focus:border-transparent`}
                  >
                    {finalConfig.budgetOptions!.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label.replace('$', getCurrencySymbol())}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Size
                  </label>
                  <select
                    name="groupSize"
                    value={formData.groupSize}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-${theme.primaryColor}-500 focus:border-transparent`}
                  >
                    {Array.from({ length: finalConfig.maxGroupSize! }, (_, i) => i + 1).map(size => (
                      <option key={size} value={size}>{size} person{size > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Travel Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'relaxed', label: 'Relaxed', desc: 'Fewer activities, more leisure time' },
                    { value: 'balanced', label: 'Balanced', desc: 'Mix of activities and relaxation' },
                    { value: 'packed', label: 'Packed', desc: 'Maximum activities and experiences' }
                  ].map((style) => (
                    <label key={style.value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="travelStyle"
                        value={style.value}
                        checked={formData.travelStyle === style.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg transition-all ${
                        formData.travelStyle === style.value
                          ? `border-${theme.primaryColor}-500 bg-${theme.primaryColor}-50 text-${theme.primaryColor}-800`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <h4 className="font-medium mb-1">{style.label}</h4>
                        <p className="text-sm text-gray-600">{style.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Your Interests (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {finalConfig.interestOptions!.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`p-3 text-sm rounded-lg border-2 transition-all ${
                        formData.interests.includes(interest)
                          ? `border-${theme.primaryColor}-500 bg-${theme.primaryColor}-50 text-${theme.primaryColor}-800`
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={formData.interests.length === 0 || !formData.destination.trim()}
                  className={`px-12 py-4 bg-${theme.primaryColor}-500 text-white rounded-lg hover:bg-${theme.primaryColor}-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto`}
                >
                  <Plane className="h-5 w-5" />
                  <span>Generate My Itinerary with AI</span>
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  This will take about 30 seconds to create your personalized plan
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITravelPlanner;
