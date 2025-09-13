# How to Use the AI Travel Planner Component

## 🚀 Step-by-Step Usage Guide

### 1. **Copy the Component to Your Project**

```bash
# Copy the main component file
cp AITravelPlanner.tsx /path/to/your/project/src/components/

# Or if you want all files:
cp -r extracted-components/* /path/to/your/project/src/components/travel-planner/
```

### 2. **Install Required Dependencies**

```bash
npm install lucide-react

# Make sure you have these (usually already in React projects):
npm install react react-dom

# For TypeScript projects:
npm install -D @types/react @types/react-dom
```

### 3. **Setup Tailwind CSS (if not already configured)**

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add to your `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ... rest of config
}
```

Add to your main CSS file:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 📋 Usage Examples

### **Example 1: Basic Integration (Simplest)**

```tsx
// src/pages/TravelPlanner.tsx
import React from 'react';
import { AITravelPlanner } from '../components/AITravelPlanner';

export default function TravelPlannerPage() {
  return (
    <div>
      <h1>Plan Your Trip</h1>
      <AITravelPlanner />
    </div>
  );
}
```

### **Example 2: Tourism Website Integration**

```tsx
// src/pages/PlanYourTrip.tsx
import React from 'react';
import { AITravelPlanner, TravelPlannerConfig } from '../components/AITravelPlanner';

export default function PlanYourTrip() {
  const config: Partial<TravelPlannerConfig> = {
    // Customize for your tourism site
    defaultCurrency: 'USD',
    theme: {
      primaryColor: 'blue',
      secondaryColor: 'sky'
    },
    
    // Handle when user generates an itinerary
    onItineraryGenerated: (itinerary) => {
      console.log('User generated itinerary:', itinerary);
      
      // Track in Google Analytics
      if (window.gtag) {
        window.gtag('event', 'itinerary_generated', {
          destination: itinerary.destination,
          days: itinerary.days,
          budget: itinerary.budget
        });
      }
      
      // Save to your database
      fetch('/api/save-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itinerary)
      });
    },
    
    // Handle when user wants to book
    onBookingRequested: (itinerary) => {
      // Redirect to your booking page
      const bookingData = encodeURIComponent(JSON.stringify(itinerary));
      window.location.href = `/booking?itinerary=${bookingData}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg text-gray-600">
            Let AI create your personalized travel itinerary
          </p>
        </div>
        
        <AITravelPlanner config={config} />
      </div>
    </div>
  );
}
```

### **Example 3: Travel Agency with Custom API**

```tsx
// src/components/TravelAgencyPlanner.tsx
import React from 'react';
import { AITravelPlanner, TravelPlannerConfig } from './AITravelPlanner';

export default function TravelAgencyPlanner() {
  const config: Partial<TravelPlannerConfig> = {
    // Use your own AI API instead of mock data
    customApiEndpoint: 'https://your-api.com/generate-itinerary',
    
    // Custom currency and budget options
    currencies: ['USD', 'EUR', 'GBP'],
    defaultCurrency: 'USD',
    budgetOptions: [
      { value: 1000, label: '$1,000 - Economy Package' },
      { value: 3000, label: '$3,000 - Comfort Package' },
      { value: 6000, label: '$6,000 - Luxury Package' },
      { value: 12000, label: '$12,000+ - VIP Experience' }
    ],
    
    // Custom interests for your target market
    interestOptions: [
      'Beach Resorts', 'Mountain Adventures', 'City Tours', 'Cultural Heritage',
      'Wine Tasting', 'Safari', 'Cruise', 'Spa & Wellness', 'Golf',
      'Photography Tours', 'Food Tours', 'Art & Museums'
    ],
    
    // Custom theme matching your brand
    theme: {
      primaryColor: 'emerald',
      secondaryColor: 'green'
    },
    
    // Integration with your CRM
    onItineraryGenerated: (itinerary) => {
      // Save lead in your CRM
      fetch('/api/crm/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'itinerary_request',
          destination: itinerary.destination,
          budget: itinerary.budget,
          preferences: itinerary.preferences,
          generated_at: new Date().toISOString()
        })
      });
    },
    
    // Integration with your booking system
    onBookingRequested: (itinerary) => {
      // Create booking request
      fetch('/api/bookings/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary_id: itinerary.id,
          customer_requirements: itinerary.preferences,
          estimated_cost: itinerary.totalCost,
          status: 'quote_requested'
        })
      }).then(response => response.json())
        .then(booking => {
          // Redirect to booking details
          window.location.href = `/booking/${booking.id}`;
        });
    }
  };

  return <AITravelPlanner config={config} />;
}
```

### **Example 4: WordPress Integration**

```tsx
// For WordPress with React blocks
import React from 'react';
import { AITravelPlanner } from './AITravelPlanner';

// WordPress Gutenberg block component
export function TravelPlannerBlock({ attributes }) {
  const config = {
    theme: {
      primaryColor: attributes.primaryColor || 'blue'
    },
    defaultCurrency: attributes.currency || 'USD',
    
    onBookingRequested: (itinerary) => {
      // WordPress-specific handling
      const bookingUrl = `/wp-admin/admin.php?page=travel-bookings&action=new&itinerary=${encodeURIComponent(JSON.stringify(itinerary))}`;
      window.location.href = bookingUrl;
    }
  };

  return (
    <div className="wp-travel-planner-block">
      <AITravelPlanner config={config} />
    </div>
  );
}
```

### **Example 5: Next.js Integration**

```tsx
// pages/plan-trip.tsx (Next.js Pages Router)
import React from 'react';
import { AITravelPlanner } from '../components/AITravelPlanner';
import { GetServerSideProps } from 'next';

interface Props {
  userPreferences?: any;
}

export default function PlanTripPage({ userPreferences }: Props) {
  const config = {
    // Pre-fill with user data if logged in
    onItineraryGenerated: async (itinerary) => {
      // Save to your Next.js API
      await fetch('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itinerary)
      });
    },
    
    onBookingRequested: (itinerary) => {
      // Use Next.js router
      import('next/router').then(({ default: router }) => {
        router.push({
          pathname: '/booking',
          query: { itinerary: JSON.stringify(itinerary) }
        });
      });
    }
  };

  return (
    <div>
      <h1>Plan Your Next Adventure</h1>
      <AITravelPlanner config={config} />
    </div>
  );
}

// Optional: Pre-load user preferences
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get user preferences from your database
  return {
    props: {
      userPreferences: {} // Your user data
    }
  };
};
```

```tsx
// app/plan-trip/page.tsx (Next.js App Router)
'use client';

import React from 'react';
import { AITravelPlanner } from '../../components/AITravelPlanner';

export default function PlanTripPage() {
  return <AITravelPlanner />;
}
```

## 🔧 **API Integration Guide**

### **Option 1: Using Your Own AI API**

Create your API endpoint that receives this format:

```typescript
// API Request Format
interface AIRequest {
  destination: string;
  days: number;
  budget: number;
  interests: string[];
  travelStyle: 'relaxed' | 'balanced' | 'packed';
  groupSize: number;
  currency: string;
}

// API Response Format
interface AIResponse {
  id: string;
  destination: string;
  days: number;
  budget: number;
  currency: string;
  schedule: DaySchedule[];
  totalCost: number;
  highlights: string[];
  generatedAt: string;
  preferences: AIRequest;
}
```

Example API endpoint (Node.js/Express):

```javascript
// /api/generate-itinerary
app.post('/api/generate-itinerary', async (req, res) => {
  const { destination, days, budget, interests, travelStyle, groupSize, currency } = req.body;
  
  try {
    // Call your AI service (OpenAI, Claude, etc.)
    const aiResponse = await callAIService({
      prompt: `Create a ${days}-day travel itinerary for ${destination} with a budget of ${currency} ${budget}. 
               Interests: ${interests.join(', ')}. 
               Travel style: ${travelStyle}. 
               Group size: ${groupSize} people.`,
    });
    
    // Format the response to match expected structure
    const itinerary = {
      id: generateUniqueId(),
      destination,
      days,
      budget,
      currency,
      schedule: parseAIResponse(aiResponse),
      totalCost: calculateTotalCost(aiResponse),
      highlights: extractHighlights(aiResponse),
      generatedAt: new Date().toISOString(),
      preferences: req.body
    };
    
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate itinerary' });
  }
});
```

### **Option 2: Using Mock Data (for Development)**

The component works out of the box with realistic mock data. Perfect for:
- Development and testing
- Demos and prototypes
- When you don't have an AI service yet

## 📱 **Real-World Integration Examples**

### **Hotel Website**

```tsx
// Help guests plan their stay
const hotelConfig = {
  defaultCurrency: 'USD',
  maxDays: 7, // Limit for hotel stays
  interestOptions: [
    'Hotel Amenities', 'Local Restaurants', 'Nearby Attractions',
    'Shopping Centers', 'Spa Services', 'Conference Facilities'
  ],
  onBookingRequested: (itinerary) => {
    // Direct to hotel booking with planned activities
    window.location.href = `/hotel-booking?activities=${encodeURIComponent(JSON.stringify(itinerary.schedule))}`;
  }
};

<AITravelPlanner config={hotelConfig} />
```

### **Corporate Travel Portal**

```tsx
const corporateConfig = {
  currencies: ['USD', 'EUR', 'GBP'],
  budgetOptions: [
    { value: 2000, label: '$2,000 - Standard Business' },
    { value: 5000, label: '$5,000 - Executive' },
    { value: 10000, label: '$10,000+ - C-Level' }
  ],
  interestOptions: [
    'Business Centers', 'Conference Venues', 'Executive Hotels',
    'Airport Transfers', 'Meeting Rooms', 'Corporate Dining'
  ],
  onItineraryGenerated: (itinerary) => {
    // Submit to corporate approval workflow
    submitToApprovalWorkflow(itinerary);
  }
};
```

## 🎨 **Styling Customization**

### **Match Your Brand Colors**

```tsx
const customTheme = {
  theme: {
    primaryColor: 'purple',   // Your brand primary
    secondaryColor: 'pink',   // Your brand secondary
    backgroundColor: 'slate' // Background theme
  }
};
```

### **Override CSS Classes**

```css
/* In your CSS file */
.ai-travel-planner {
  --primary-color: #your-color;
}

.ai-travel-planner .form-input {
  border-radius: 12px; /* Custom styling */
}
```

## 📊 **Analytics Integration**

```tsx
const analyticsConfig = {
  onItineraryGenerated: (itinerary) => {
    // Google Analytics 4
    gtag('event', 'generate_itinerary', {
      destination: itinerary.destination,
      trip_duration: itinerary.days,
      budget_range: getBudgetRange(itinerary.budget),
      interests: itinerary.preferences.interests.join(',')
    });
    
    // Facebook Pixel
    fbq('track', 'Lead', {
      content_name: 'Travel Itinerary',
      content_category: 'Travel Planning',
      value: itinerary.budget,
      currency: itinerary.currency
    });
    
    // Custom analytics
    analytics.track('Itinerary Generated', {
      userId: getCurrentUserId(),
      destination: itinerary.destination,
      planningDate: new Date(),
      conversionValue: itinerary.budget
    });
  }
};
```

## 🔒 **Security Considerations**

```tsx
// Sanitize user inputs before sending to AI
const secureConfig = {
  customApiEndpoint: '/api/generate-itinerary',
  onItineraryGenerated: (itinerary) => {
    // Validate itinerary data before processing
    if (validateItinerary(itinerary)) {
      processItinerary(itinerary);
    }
  }
};

function validateItinerary(itinerary) {
  // Add your validation logic
  return itinerary.destination.length < 100 &&
         itinerary.budget > 0 &&
         itinerary.days <= 30;
}
```

## 🚀 **Quick Start Checklist**

✅ **Step 1:** Copy `AITravelPlanner.tsx` to your project  
✅ **Step 2:** Install `lucide-react` dependency  
✅ **Step 3:** Ensure Tailwind CSS is configured  
✅ **Step 4:** Import and use the component  
✅ **Step 5:** Customize config for your needs  
✅ **Step 6:** Test the basic functionality  
✅ **Step 7:** Add your custom API endpoint (optional)  
✅ **Step 8:** Integrate with your booking system  
✅ **Step 9:** Add analytics tracking  
✅ **Step 10:** Deploy and monitor usage  

That's it! Your AI Travel Planner is now ready to help users plan amazing trips on your website. 🎉
