# Artisan Backend Integration Guide

## 🎯 Overview
This guide explains how to integrate the artisan marketplace functionality into your existing server.py file.

## 📋 Step 1: Update server.py Imports

Add these imports to the top of your `server.py` file after the existing imports:

```python
from fastapi import Query
from models.marketplace_models_updated import (
    HandicraftCreate, HandicraftUpdate, Handicraft,
    CulturalEventCreate, CulturalEventUpdate, CulturalEvent,
    HandicraftCategory, EventType, OrderStatus, PaymentStatus
)
```

## 📋 Step 2: Update Role Validation

✅ **ALREADY DONE**: The artisan role has been added to the registration endpoint validation.

Current code in server.py should be:
```python
if user_data.role not in ["tourist", "provider", "artisan"]:
    raise HTTPException(status_code=400, detail="Invalid role. Only 'tourist', 'provider', and 'artisan' roles are allowed")
```

## 📋 Step 3: Add Marketplace Endpoints

Copy all the endpoints from `/app/backend/server_marketplace_extension.py` and paste them into your `server.py` file **BEFORE** this line:

```python
app.include_router(api_router)
```

The endpoints include:

### 🏠 Artisan Dashboard
- `GET /api/artisans/dashboard` - Get dashboard overview with stats

### 🎨 Handicrafts Management  
- `GET /api/artisans/handicrafts` - List artisan's handicrafts
- `POST /api/artisans/handicrafts` - Create new handicraft
- `PUT /api/artisans/handicrafts/{id}` - Update handicraft
- `DELETE /api/artisans/handicrafts/{id}` - Delete handicraft

### 🎭 Events Management
- `GET /api/artisans/events` - List artisan's events  
- `POST /api/artisans/events` - Create new cultural event

### 📦 Orders Management
- `GET /api/artisans/orders` - List artisan's orders
- `PUT /api/artisans/orders/{id}/status` - Update order status

### 📊 Analytics
- `GET /api/artisans/analytics` - Get sales analytics (week/month/year)

### 🛒 Public Marketplace (for tourists)
- `GET /api/marketplace/handicrafts` - Browse handicrafts
- `GET /api/marketplace/events` - Browse cultural events

## 📋 Step 4: Database Models

Ensure these models exist in `/app/backend/models/marketplace_models_updated.py`:

### Required Models:
- `HandicraftCreate` - For creating handicrafts
- `HandicraftUpdate` - For updating handicrafts  
- `CulturalEventCreate` - For creating events
- `CulturalEventUpdate` - For updating events

### Required Enums:
- `HandicraftCategory` - pottery, textiles, jewelry, etc.
- `EventType` - festival, workshop, performance, etc.
- `OrderStatus` - pending, confirmed, preparing, shipped, delivered, etc.
- `PaymentStatus` - pending, paid, failed, refunded

## 🧪 Step 5: Testing Instructions

### Backend Testing Commands:

```bash
# 1. Install dependencies
cd /app/backend
pip install -r requirements.txt

# 2. Start the backend server
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Test artisan registration
curl -X POST "http://localhost:8001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Artisan",
    "email": "artisan@example.com", 
    "password": "password123",
    "phone": "+91-9876543210",
    "role": "artisan"
  }'

# 4. Test artisan login
curl -X POST "http://localhost:8001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artisan@example.com",
    "password": "password123"
  }'

# 5. Test artisan dashboard (replace {token} with actual token)
curl -X GET "http://localhost:8001/api/artisans/dashboard" \
  -H "Authorization: Bearer {token}"

# 6. Test handicraft creation  
curl -X POST "http://localhost:8001/api/artisans/handicrafts" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Traditional Pottery Vase",
    "category": "pottery",
    "description": "Handmade clay vase with traditional tribal patterns",
    "price": 1500.00,
    "stock_quantity": 10,
    "materials": "Clay, Natural pigments",
    "origin_village": "Ranchi",
    "cultural_significance": "Traditional tribal art form"
  }'

# 7. Test marketplace browsing (public endpoint)
curl -X GET "http://localhost:8001/api/marketplace/handicrafts?category=pottery&limit=5"

# 8. Test event creation
curl -X POST "http://localhost:8001/api/artisans/events" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tribal Art Workshop",
    "description": "Learn traditional tribal art techniques",
    "event_type": "workshop", 
    "location": "Ranchi Cultural Center",
    "start_date": "2024-12-15T10:00:00",
    "end_date": "2024-12-15T16:00:00",
    "price": 500.00,
    "max_participants": 20
  }'
```

### Expected API Responses:

#### Registration Success:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "artisan-uuid",
    "name": "John Artisan", 
    "email": "artisan@example.com",
    "role": "artisan"
  }
}
```

#### Dashboard Response:
```json
{
  "success": true,
  "data": {
    "handicrafts_stats": {
      "total_products": 5,
      "active_products": 4,
      "low_stock_items": 1,
      "avg_rating": 4.5,
      "total_reviews": 12
    },
    "events_stats": {
      "total_events": 3,
      "upcoming_events": 2,
      "ongoing_events": 1
    },
    "orders_stats": {
      "total_orders": 15,
      "total_revenue": 12500.00,
      "pending_orders": 3,
      "completed_orders": 10
    }
  }
}
```

## 🔧 Troubleshooting

### Common Issues:

1. **Import Errors**: Ensure `models/marketplace_models_updated.py` exists and contains all required classes

2. **Database Errors**: Verify that marketplace tables exist in database:
   - `handicrafts`
   - `cultural_events` 
   - `handicraft_orders`
   - `event_bookings`

3. **Authentication Errors**: Make sure JWT token is included in Authorization header

4. **Permission Errors**: Verify user has 'artisan' role in database

### Database Verification:
```sql
-- Check if tables exist
SHOW TABLES LIKE '%handicraft%';
SHOW TABLES LIKE '%cultural_event%';

-- Check artisan role in users table  
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Verify sample artisan users
SELECT id, name, email, role FROM users WHERE role = 'artisan';
```

## 🎉 Success Indicators

✅ Artisan registration works with role='artisan'  
✅ Artisan login returns valid JWT token  
✅ Dashboard endpoint returns stats without errors  
✅ Handicraft creation works  
✅ Event creation works  
✅ Public marketplace endpoints return data  
✅ Orders management endpoints work  
✅ Analytics endpoints return data  

## 🚀 Next Steps

After backend testing is complete:
1. Test with frontend integration
2. Add more sample data 
3. Test complete user workflows
4. Implement additional features like notifications

## 📞 Support

If you encounter any issues during integration:
1. Check server logs for detailed error messages
2. Verify all imports and dependencies
3. Confirm database schema matches expected structure
4. Test individual endpoints one by one