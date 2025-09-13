import React from 'react';
import { AITravelPlanner, TravelPlannerConfig } from './AITravelPlanner';

// Example 1: Basic Usage
export const BasicExample: React.FC = () => {
  return (
    <div>
      <h1>Simple AI Travel Planner</h1>
      <AITravelPlanner />
    </div>
  );
};

// Example 2: Tourism Website Integration
export const TourismWebsiteExample: React.FC = () => {
  const config: Partial<TravelPlannerConfig> = {
    defaultCurrency: 'USD',
    budgetOptions: [
      { value: 800, label: '$800 - Budget Explorer' },
      { value: 2000, label: '$2,000 - Comfort Traveler' },
      { value: 4000, label: '$4,000 - Luxury Experience' },
      { value: 8000, label: '$8,000+ - Ultimate Luxury' }
    ],
    theme: {
      primaryColor: 'sky',
      secondaryColor: 'blue'
    },
    onItineraryGenerated: (itinerary) => {
      console.log('New itinerary generated:', itinerary);
      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'itinerary_generated', {
          destination: itinerary.destination,
          days: itinerary.days,
          budget: itinerary.budget
        });
      }
    },
    onBookingRequested: (itinerary) => {
      // Redirect to booking page with itinerary data
      const encodedItinerary = encodeURIComponent(JSON.stringify(itinerary));
      window.location.href = `/booking?itinerary=${encodedItinerary}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Discover Your Perfect Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let AI create your dream vacation with personalized recommendations
          </p>
        </div>
        <AITravelPlanner config={config} />
      </div>
    </div>
  );
};

// Example 3: European Travel Agency
export const EuropeanTravelAgencyExample: React.FC = () => {
  const config: Partial<TravelPlannerConfig> = {
    currencies: ['EUR', 'GBP', 'CHF'],
    defaultCurrency: 'EUR',
    budgetOptions: [
      { value: 600, label: '€600 - Backpacker' },
      { value: 1500, label: '€1,500 - Standard' },
      { value: 3000, label: '€3,000 - Premium' },
      { value: 6000, label: '€6,000+ - Luxury' }
    ],
    interestOptions: [
      'Historical Sites', 'Art Museums', 'Architecture', 'Food & Wine',
      'Music & Theater', 'Fashion & Shopping', 'Castles & Palaces',
      'Local Markets', 'River Cruises', 'Mountain Hiking', 'Beach Resorts'
    ],
    maxDays: 14,
    theme: {
      primaryColor: 'emerald',
      secondaryColor: 'green'
    },
    customApiEndpoint: 'https://api.example-travel-agency.com/ai-planner',
    onItineraryGenerated: (itinerary) => {
      // Save to agency CRM
      console.log('Saving to CRM:', itinerary);
    },
    onBookingRequested: (itinerary) => {
      // Create booking lead
      console.log('Creating booking lead for:', itinerary);
    }
  };

  return (
    <div className="bg-emerald-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-4">
            European Adventures Await
          </h1>
          <p className="text-lg text-emerald-700">
            Discover Europe's hidden gems with AI-powered planning
          </p>
        </div>
        <AITravelPlanner config={config} />
      </div>
    </div>
  );
};

// Example 4: Adventure Travel Specialist
export const AdventureTravelExample: React.FC = () => {
  const config: Partial<TravelPlannerConfig> = {
    defaultCurrency: 'USD',
    budgetOptions: [
      { value: 1200, label: '$1,200 - Base Adventure' },
      { value: 2500, label: '$2,500 - Full Adventure' },
      { value: 5000, label: '$5,000 - Extreme Adventure' },
      { value: 10000, label: '$10,000+ - Ultimate Expedition' }
    ],
    interestOptions: [
      'Mountain Climbing', 'White Water Rafting', 'Skydiving', 'Bungee Jumping',
      'Scuba Diving', 'Safari', 'Rock Climbing', 'Paragliding',
      'Zip Lining', 'Cave Exploration', 'Volcano Hiking', 'Glacier Walking'
    ],
    theme: {
      primaryColor: 'orange',
      secondaryColor: 'red'
    },
    onItineraryGenerated: (itinerary) => {
      // Track adventure preferences
      const adventureActivities = itinerary.schedule
        .flatMap(day => day.activities)
        .filter(activity => 
          ['Mountain', 'Adventure', 'Extreme', 'Climbing'].some(keyword => 
            activity.title.includes(keyword) || activity.description.includes(keyword)
          )
        );
      
      console.log('Adventure activities planned:', adventureActivities.length);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-100 to-red-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-900 mb-4">
            🏔️ Extreme Adventures Await
          </h1>
          <p className="text-lg text-orange-800">
            Plan your next adrenaline-pumping adventure with AI
          </p>
        </div>
        <AITravelPlanner config={config} />
      </div>
    </div>
  );
};

// Example 5: Budget Travel Focus
export const BudgetTravelExample: React.FC = () => {
  const config: Partial<TravelPlannerConfig> = {
    budgetOptions: [
      { value: 300, label: '$300 - Ultra Budget' },
      { value: 600, label: '$600 - Backpacker' },
      { value: 1000, label: '$1,000 - Budget Comfort' },
      { value: 1500, label: '$1,500 - Mid-Range' }
    ],
    maxDays: 10,
    maxGroupSize: 6,
    interestOptions: [
      'Hostels', 'Street Food', 'Free Walking Tours', 'Public Transport',
      'Local Markets', 'City Parks', 'Free Museums', 'Budget Airlines',
      'Camping', 'Hitchhiking', 'Couchsurfing', 'Work Exchange'
    ],
    theme: {
      primaryColor: 'green',
      secondaryColor: 'emerald'
    },
    onItineraryGenerated: (itinerary) => {
      // Calculate savings
      const averageDailyCost = itinerary.totalCost / itinerary.days;
      console.log(`Average daily cost: $${averageDailyCost.toFixed(2)}`);
      
      if (averageDailyCost < 50) {
        console.log('🎉 Ultra-budget achievement unlocked!');
      }
    }
  };

  return (
    <div className="bg-green-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-900 mb-4">
            💰 Smart Budget Travel
          </h1>
          <p className="text-lg text-green-800">
            Maximize your adventures while minimizing costs
          </p>
        </div>
        <AITravelPlanner config={config} />
      </div>
    </div>
  );
};

// Example 6: Corporate Travel Integration
export const CorporateTravelExample: React.FC = () => {
  const config: Partial<TravelPlannerConfig> = {
    currencies: ['USD', 'EUR', 'GBP', 'JPY'],
    budgetOptions: [
      { value: 2000, label: '$2,000 - Business Essential' },
      { value: 4000, label: '$4,000 - Business Plus' },
      { value: 8000, label: '$8,000 - Executive' },
      { value: 15000, label: '$15,000+ - VIP Executive' }
    ],
    interestOptions: [
      'Business Centers', 'Conference Venues', 'Executive Hotels',
      'Fine Dining', 'Business Lounges', 'Corporate Events',
      'Networking Events', 'Golf Courses', 'Spa & Wellness',
      'Quick Transfers', 'WiFi Availability', 'Meeting Rooms'
    ],
    maxDays: 7,
    theme: {
      primaryColor: 'slate',
      secondaryColor: 'gray'
    },
    onItineraryGenerated: (itinerary) => {
      // Corporate expense tracking
      const businessExpenses = itinerary.schedule
        .flatMap(day => day.activities)
        .filter(activity => 
          ['Business', 'Conference', 'Meeting', 'Hotel'].some(keyword => 
            activity.title.includes(keyword)
          )
        );
      
      console.log('Business-related activities:', businessExpenses.length);
    },
    onBookingRequested: (itinerary) => {
      // Integration with corporate booking system
      console.log('Submitting to corporate booking system:', itinerary);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            💼 Corporate Travel Planner
          </h1>
          <p className="text-lg text-slate-700">
            Efficient business travel planning with AI assistance
          </p>
        </div>
        <AITravelPlanner config={config} />
      </div>
    </div>
  );
};

// Example usage in a demo app
export const DemoApp: React.FC = () => {
  const [selectedExample, setSelectedExample] = React.useState('basic');

  const examples = {
    basic: { component: BasicExample, title: 'Basic Usage' },
    tourism: { component: TourismWebsiteExample, title: 'Tourism Website' },
    european: { component: EuropeanTravelAgencyExample, title: 'European Agency' },
    adventure: { component: AdventureTravelExample, title: 'Adventure Travel' },
    budget: { component: BudgetTravelExample, title: 'Budget Travel' },
    corporate: { component: CorporateTravelExample, title: 'Corporate Travel' }
  };

  const CurrentExample = examples[selectedExample as keyof typeof examples].component;

  return (
    <div>
      {/* Example Selector */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            AI Travel Planner Examples
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(examples).map(([key, { title }]) => (
              <button
                key={key}
                onClick={() => setSelectedExample(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedExample === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Example */}
      <CurrentExample />
    </div>
  );
};
