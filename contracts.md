# Jharkhand Tourism Platform - Backend Integration Contracts

## API Contracts

### Authentication Endpoints
- `POST /api/auth/login` - User login (tourists, providers, admin)
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Destinations Endpoints
- `GET /api/destinations` - Get all destinations with filters
- `GET /api/destinations/:id` - Get destination details
- `POST /api/destinations` - Create new destination (admin only)
- `PUT /api/destinations/:id` - Update destination (admin only)
- `DELETE /api/destinations/:id` - Delete destination (admin only)

### Providers Endpoints
- `GET /api/providers` - Get all service providers with filters
- `GET /api/providers/:id` - Get provider details
- `POST /api/providers` - Create provider profile (provider role)
- `PUT /api/providers/:id` - Update provider profile
- `DELETE /api/providers/:id` - Delete provider (admin only)

### Bookings Endpoints
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Reviews Endpoints
- `GET /api/reviews` - Get reviews for destination/provider
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Chatbot Endpoints
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/history/:sessionId` - Get chat history

## Mock Data Integration Plan

### Frontend Mock Data (Currently Used)
1. **destinations** - Replace with API calls to `/api/destinations`
2. **providers** - Replace with API calls to `/api/providers` 
3. **testimonials** - Replace with API calls to `/api/reviews`
4. **mockUsers** - Replace with proper authentication flow
5. **chatbotResponses** - Replace with DeepSeek AI integration

### Database Schema Integration
- User authentication will use existing MySQL schema
- Destinations data will be seeded from mock data
- Providers data will be seeded from mock data
- Reviews will replace testimonials

## Frontend & Backend Integration Steps

### Step 1: Replace Mock Authentication
- Remove mockUsers dependency
- Implement JWT token-based authentication
- Update AuthContext to use actual API endpoints
- Handle token refresh and storage

### Step 2: Replace Mock Destinations
- Update FeaturedDestinations component to fetch from API
- Update DestinationsPage to use API with filters
- Implement pagination for large datasets
- Add loading states and error handling

### Step 3: Replace Mock Providers
- Update ProvidersPage to fetch from API
- Implement booking functionality
- Add provider dashboard CRUD operations

### Step 4: Implement Interactive Map
- Add Leaflet map integration
- Display destinations with coordinates
- Show popup details on marker hover/click
- Filter destinations on map view

### Step 5: Implement Chatbot Integration
- Replace mock responses with DeepSeek API
- Implement session management
- Store chat history in database
- Add context-aware responses about Jharkhand

### Step 6: Add Booking System
- Implement booking creation and management
- Add payment integration (if required)
- Email notifications for bookings
- Booking status tracking

## Environment Variables Required
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Prince1504
DB_NAME=jharkhand_tourism
DB_PORT=3001
JWT_SECRET=your_jwt_secret_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## Additional Features to Implement
1. **Interactive Map** - Leaflet integration with Jharkhand boundaries
2. **Video Integration** - YouTube video player for destination videos
3. **Review System** - Replace testimonials with dynamic reviews
4. **Admin Dashboard** - Full CRUD operations for all entities
5. **Provider Dashboard** - Service management and booking tracking
6. **Tourist Dashboard** - Booking history and preferences
7. **Search Functionality** - Global search across destinations and providers
8. **Notifications** - Real-time notifications for bookings and updates

## Error Handling Strategy
- Implement global error boundary in React
- Add API error handling with user-friendly messages
- Implement retry logic for failed requests
- Add loading states for all async operations

## Performance Optimization
- Implement image lazy loading
- Add API response caching
- Optimize bundle size with code splitting
- Add service worker for offline functionality