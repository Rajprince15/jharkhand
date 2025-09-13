# AI Travel Planner Component

A standalone, reusable React component for AI-powered travel itinerary generation that can be easily integrated into any website.

## Features

- 🤖 **AI-Powered Planning**: Generates personalized itineraries based on user preferences
- 🌍 **Multi-Currency Support**: Works with USD, EUR, GBP, INR, CAD, AUD
- 🎨 **Customizable Theming**: Configurable colors and styling
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔧 **Flexible Configuration**: Highly customizable for different use cases
- 📊 **Export Functionality**: Download itineraries as JSON files
- 🎯 **Interest-Based Recommendations**: Tailored activities based on user interests

## Quick Start

### Basic Usage

```tsx
import { AITravelPlanner } from './AITravelPlanner';

function App() {
  return (
    <div>
      <AITravelPlanner />
    </div>
  );
}
```

### With Custom Configuration

```tsx
import { AITravelPlanner, TravelPlannerConfig } from './AITravelPlanner';

const config: Partial<TravelPlannerConfig> = {
  defaultCurrency: 'EUR',
  budgetOptions: [
    { value: 800, label: '€800 - Budget' },
    { value: 2000, label: '€2,000 - Standard' },
    { value: 4000, label: '€4,000 - Premium' }
  ],
  theme: {
    primaryColor: 'green',
    secondaryColor: 'emerald'
  },
  onItineraryGenerated: (itinerary) => {
    console.log('New itinerary generated:', itinerary);
  },
  onBookingRequested: (itinerary) => {
    // Handle booking logic
    window.location.href = `/booking?itinerary=${itinerary.id}`;
  }
};

function App() {
  return <AITravelPlanner config={config} />;
}
```

## Configuration Options

### TravelPlannerConfig Interface

```tsx
interface TravelPlannerConfig {
  // Currency settings
  currencies?: string[];
  defaultCurrency?: string;
  
  // Budget options
  budgetOptions?: { value: number; label: string }[];
  
  // Available interests for users to select
  interestOptions?: string[];
  
  // Limits
  maxDays?: number;
  maxGroupSize?: number;
  
  // Callbacks
  onItineraryGenerated?: (itinerary: GeneratedItinerary) => void;
  onBookingRequested?: (itinerary: GeneratedItinerary) => void;
  
  // API integration
  customApiEndpoint?: string;
  
  // Theming
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
  };
}
```

### Default Configuration

```tsx
const defaultConfig = {
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
```

## API Integration

### Using Custom API Endpoint

You can integrate with your own AI service by providing a `customApiEndpoint`:

```tsx
const config = {
  customApiEndpoint: 'https://your-api.com/generate-itinerary',
  onItineraryGenerated: (itinerary) => {
    // Handle the generated itinerary
  }
};
```

**Expected API Request Format:**
```json
{
  "destination": "Paris",
  "days": 5,
  "budget": 2000,
  "interests": ["Art Galleries", "Food & Cuisine"],
  "travelStyle": "balanced",
  "groupSize": 2,
  "currency": "EUR"
}
```

**Expected API Response Format:**
```json
{
  "id": "unique-id",
  "destination": "Paris",
  "days": 5,
  "budget": 2000,
  "currency": "EUR",
  "schedule": [...],
  "totalCost": 1800,
  "highlights": [...],
  "generatedAt": "2024-01-01T00:00:00Z",
  "preferences": {...}
}
```

## Styling & Theming

### Tailwind CSS Classes

The component uses Tailwind CSS for styling. Make sure you have Tailwind CSS installed and configured in your project.

### Custom Theme Colors

You can customize the color scheme by modifying the theme configuration:

```tsx
const config = {
  theme: {
    primaryColor: 'purple',    // purple-500, purple-600, etc.
    secondaryColor: 'pink',    // pink-500, pink-600, etc.
    backgroundColor: 'slate'   // slate-50, slate-100, etc.
  }
};
```

### Supported Colors

Any valid Tailwind CSS color can be used:
- `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`
- `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`
- `fuchsia`, `pink`, `rose`, `gray`, `slate`, `zinc`, `neutral`, `stone`

## Data Types

### GeneratedItinerary

```tsx
interface GeneratedItinerary {
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
```

### DaySchedule

```tsx
interface DaySchedule {
  day: number;
  date: string;
  activities: Activity[];
  totalCost: number;
}
```

### Activity

```tsx
interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
  category?: string;
}
```

## Event Handlers

### onItineraryGenerated

Called when a new itinerary is successfully generated:

```tsx
const handleItineraryGenerated = (itinerary: GeneratedItinerary) => {
  // Save to localStorage
  localStorage.setItem('lastItinerary', JSON.stringify(itinerary));
  
  // Send analytics
  analytics.track('Itinerary Generated', {
    destination: itinerary.destination,
    days: itinerary.days,
    budget: itinerary.budget
  });
};
```

### onBookingRequested

Called when user clicks the "Book This Trip" button:

```tsx
const handleBookingRequest = (itinerary: GeneratedItinerary) => {
  // Redirect to booking page
  router.push(`/booking?itinerary=${encodeURIComponent(JSON.stringify(itinerary))}`);
  
  // Or open booking modal
  setBookingModal({ open: true, itinerary });
};
```

## Installation Requirements

### Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "lucide-react": "^0.344.0"
}
```

### Dev Dependencies

```json
{
  "tailwindcss": "^3.4.0",
  "typescript": "^5.0.0",
  "@types/react": "^18.0.0"
}
```

## Examples

### Tourism Website Integration

```tsx
import { AITravelPlanner } from './components/AITravelPlanner';

function TourismPage() {
  const config = {
    defaultCurrency: 'USD',
    onBookingRequested: (itinerary) => {
      // Integrate with your booking system
      bookingService.createBooking(itinerary);
    },
    theme: {
      primaryColor: 'sky',
      secondaryColor: 'blue'
    }
  };

  return (
    <div>
      <h1>Plan Your Dream Vacation</h1>
      <AITravelPlanner config={config} />
    </div>
  );
}
```

### Travel Agency Integration

```tsx
const agencyConfig = {
  customApiEndpoint: 'https://api.travelagency.com/ai-planner',
  currencies: ['USD', 'EUR'],
  budgetOptions: [
    { value: 1000, label: '$1,000 - Economy' },
    { value: 3000, label: '$3,000 - Business' },
    { value: 8000, label: '$8,000+ - Luxury' }
  ],
  onItineraryGenerated: (itinerary) => {
    // Save to CRM
    crmService.saveItinerary(itinerary);
  },
  onBookingRequested: (itinerary) => {
    // Create lead in CRM
    crmService.createLead(itinerary);
  }
};

<AITravelPlanner config={agencyConfig} />
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This component is extracted from an open-source tourism platform and can be freely used and modified for any purpose.
