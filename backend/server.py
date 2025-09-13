from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import aiomysql
import bcrypt
from jose import jwt, JWTError
import json
import uuid
from pathlib import Path
from services.deepseek_service import DeepseekService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3001)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'Prince1504'),
    'db': os.getenv('DB_NAME', 'jharkhand_tourism'),
    'autocommit': True
}

# JWT configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
JWT_EXPIRE_MINUTES = int(os.getenv('JWT_EXPIRE_MINUTES', 1440))

# Create the main app
app = FastAPI(title="Jharkhand Tourism API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Initialize Deepseek service
deepseek_service = DeepseekService()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection pool
db_pool = None

async def init_db():
    global db_pool
    db_pool = await aiomysql.create_pool(**DB_CONFIG)

async def get_db():
    if not db_pool:
        await init_db()
    return db_pool

# Pydantic models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    role: str = "tourist"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    name: str
    email: str
    role: str
    phone: str
    created_at: datetime

class Destination(BaseModel):
    id: str
    name: str
    location: str
    description: str
    image_url: str
    rating: float
    price: float
    category: str
    highlights: List[str]
    created_at: datetime

class Provider(BaseModel):
    id: str
    user_id: str
    name: str
    category: str
    service_name: str
    description: str
    price: float
    rating: float
    location: str
    contact: str
    image_url: str
    is_active: bool
    created_at: datetime

class Review(BaseModel):
    id: str
    user_id: str
    destination_id: Optional[str] = None
    provider_id: Optional[str] = None
    rating: int
    comment: str
    created_at: datetime

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                user_data = await cur.fetchone()
                if user_data is None:
                    raise HTTPException(status_code=401, detail="User not found")
                return user_data
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Jharkhand Tourism API is running!"}

@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    try:
        # Block admin role registration for security
        if user_data.role == "admin":
            raise HTTPException(status_code=403, detail="Admin registration is not allowed through public registration")
        
        # Ensure only valid roles are allowed
        if user_data.role not in ["tourist", "provider"]:
            raise HTTPException(status_code=400, detail="Invalid role. Only 'tourist' and 'provider' roles are allowed")
        
        pool = await get_db()
        user_id = str(uuid.uuid4())
        hashed_password = hash_password(user_data.password)
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Check if user already exists
                await cur.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
                if await cur.fetchone():
                    raise HTTPException(status_code=400, detail="Email already registered")
                
                # Insert new user
                await cur.execute("""
                    INSERT INTO users (id, name, email, password, role, phone)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (user_id, user_data.name, user_data.email, hashed_password, user_data.role, user_data.phone))
                
                # Create access token
                access_token = create_access_token(data={"sub": user_id})
                
                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": user_id,
                        "name": user_data.name,
                        "email": user_data.email,
                        "role": user_data.role,
                        "phone": user_data.phone
                    }
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login")
async def login_user(user_credentials: UserLogin):
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM users WHERE email = %s", (user_credentials.email,))
                user_data = await cur.fetchone()
                
                if not user_data or not verify_password(user_credentials.password, user_data['password']):
                    raise HTTPException(status_code=401, detail="Invalid credentials")
                
                # Create access token
                access_token = create_access_token(data={"sub": user_data['id']})
                
                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": user_data['id'],
                        "name": user_data['name'],
                        "email": user_data['email'],
                        "role": user_data['role'],
                        "phone": user_data['phone']
                    }
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user['id'],
        "name": current_user['name'],
        "email": current_user['email'],
        "role": current_user['role'],
        "phone": current_user['phone']
    }

@api_router.get("/destinations")
async def get_destinations(category: Optional[str] = None, limit: int = 50):
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                if category:
                    await cur.execute("SELECT * FROM destinations WHERE category = %s LIMIT %s", (category, limit))
                else:
                    await cur.execute("SELECT * FROM destinations LIMIT %s", (limit,))
                
                destinations = await cur.fetchall()
                
                # Parse JSON highlights
                for dest in destinations:
                    if dest['highlights']:
                        dest['highlights'] = json.loads(dest['highlights'])
                    else:
                        dest['highlights'] = []
                
                return destinations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/destinations/{destination_id}")
async def get_destination_detail(destination_id: str):
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM destinations WHERE id = %s", (destination_id,))
                destination = await cur.fetchone()
                
                if not destination:
                    raise HTTPException(status_code=404, detail="Destination not found")
                
                # Parse JSON highlights
                if destination['highlights']:
                    destination['highlights'] = json.loads(destination['highlights'])
                else:
                    destination['highlights'] = []
                
                return destination
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/providers")
async def get_providers(category: Optional[str] = None, location: Optional[str] = None, limit: int = 50):
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = "SELECT * FROM providers WHERE is_active = 1"
                params = []
                
                if category:
                    query += " AND category = %s"
                    params.append(category)
                
                if location:
                    query += " AND location LIKE %s"
                    params.append(f"%{location}%")
                
                query += " LIMIT %s"
                params.append(limit)
                
                await cur.execute(query, params)
                providers = await cur.fetchall()
                
                return providers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/reviews")
async def get_reviews(destination_id: Optional[str] = None, provider_id: Optional[str] = None, limit: int = 20):
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                query = """
                    SELECT r.*, u.name as user_name 
                    FROM reviews r 
                    JOIN users u ON r.user_id = u.id
                """
                params = []
                
                conditions = []
                if destination_id:
                    conditions.append("r.destination_id = %s")
                    params.append(destination_id)
                
                if provider_id:
                    conditions.append("r.provider_id = %s")
                    params.append(provider_id)
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
                
                query += " ORDER BY r.created_at DESC LIMIT %s"
                params.append(limit)
                
                await cur.execute(query, params)
                reviews = await cur.fetchall()
                
                return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/planner")
async def generate_itinerary(
    request_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Generate AI-powered travel itinerary using Deepseek"""
    try:
        # Extract user preferences from request
        preferences = {
            "destinations": request_data.get("destinations", ["Ranchi"]),
            "budget": request_data.get("budget", 15000),
            "days": request_data.get("days", 3),
            "interests": request_data.get("interests", ["Sightseeing"]),
            "travel_style": request_data.get("travel_style", "balanced"),
            "group_size": request_data.get("group_size", 2)
        }
        
        # Generate itinerary using Deepseek
        itinerary = deepseek_service.generate_itinerary(preferences)
        
        # Optionally save to database
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO itineraries (id, user_id, destination, days, budget, content, preferences, generated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    itinerary["id"],
                    current_user["id"],
                    itinerary["destination"],
                    itinerary["days"],
                    itinerary["budget"],
                    itinerary["content"],
                    json.dumps(itinerary["preferences"]),
                    itinerary["generated_at"]
                ))
        
        return itinerary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating itinerary: {str(e)}")

@api_router.post("/chatbot")
async def chatbot_message(
    request_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Handle chatbot conversation using Deepseek"""
    try:
        user_message = request_data.get("message", "")
        session_id = request_data.get("session_id", str(uuid.uuid4()))
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Get conversation history (optional)
        pool = await get_db()
        conversation_history = []
        
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Get recent conversation history
                await cur.execute("""
                    SELECT message, response, created_at 
                    FROM chat_logs 
                    WHERE user_id = %s AND session_id = %s 
                    ORDER BY created_at DESC 
                    LIMIT 5
                """, (current_user["id"], session_id))
                
                history = await cur.fetchall()
                for chat in reversed(history):
                    conversation_history.extend([
                        {"role": "user", "content": chat["message"]},
                        {"role": "assistant", "content": chat["response"]}
                    ])
        
        # Generate response using Deepseek
        response = deepseek_service.chat_response(user_message, conversation_history)
        
        # Save conversation to database
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO chat_logs (id, user_id, session_id, message, response, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    str(uuid.uuid4()),
                    current_user["id"],
                    session_id,
                    user_message,
                    response["message"],
                    datetime.utcnow()
                ))
        
        return {
            "response": response["message"],
            "session_id": session_id,
            "timestamp": response["timestamp"],
            "model": response["model"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")

@api_router.get("/chatbot/history/{session_id}")
async def get_chat_history(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get chat history for a session"""
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT message, response, created_at 
                    FROM chat_logs 
                    WHERE user_id = %s AND session_id = %s 
                    ORDER BY created_at ASC
                """, (current_user["id"], session_id))
                
                history = await cur.fetchall()
                
                # Format for frontend
                formatted_history = []
                for chat in history:
                    formatted_history.extend([
                        {
                            "id": f"user_{chat['created_at'].timestamp()}",
                            "text": chat["message"],
                            "sender": "user",
                            "timestamp": chat["created_at"].isoformat()
                        },
                        {
                            "id": f"bot_{chat['created_at'].timestamp()}",
                            "text": chat["response"],
                            "sender": "bot",
                            "timestamp": chat["created_at"].isoformat()
                        }
                    ])
                
                return formatted_history
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Booking Management API
class BookingCreate(BaseModel):
    provider_id: str = Field(..., min_length=1, description="Provider ID is required")
    destination_id: str = Field(..., min_length=1, description="Destination ID is required")
    booking_date: str = Field(..., description="Booking date in YYYY-MM-DD format")
    check_in: str = Field(..., description="Check-in date in YYYY-MM-DD format") 
    check_out: str = Field(..., description="Check-out date in YYYY-MM-DD format")
    guests: int = Field(default=1, ge=1, le=20, description="Number of guests (1-20)")
    rooms: int = Field(default=1, ge=1, le=10, description="Number of rooms (1-10)")
    special_requests: Optional[str] = Field(None, max_length=500, description="Special requests")
    
    @field_validator('booking_date', 'check_in', 'check_out')
    @classmethod
    def validate_date_format(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
    
    @model_validator(mode='after')
    def validate_dates(self):
        try:
            booking_date = datetime.strptime(self.booking_date, '%Y-%m-%d')
            check_in = datetime.strptime(self.check_in, '%Y-%m-%d')  
            check_out = datetime.strptime(self.check_out, '%Y-%m-%d')
            
            if check_in >= check_out:
                raise ValueError('Check-out date must be after check-in date')
            
            if booking_date < datetime.now().replace(hour=0, minute=0, second=0, microsecond=0):
                raise ValueError('Booking date cannot be in the past')
                
        except ValueError as e:
            if 'does not match format' in str(e):
                raise ValueError('Invalid date format. Use YYYY-MM-DD format')
            raise e
            
        return self

@api_router.post("/bookings")
async def create_booking(
    booking_data: BookingCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new booking"""
    try:
        pool = await get_db()
        booking_id = str(uuid.uuid4())
        
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Get provider and destination details
                await cur.execute("SELECT name, price FROM providers WHERE id = %s", (booking_data.provider_id,))
                provider = await cur.fetchone()
                if not provider:
                    raise HTTPException(status_code=404, detail="Provider not found")
                
                await cur.execute("SELECT name, price FROM destinations WHERE id = %s", (booking_data.destination_id,))
                destination = await cur.fetchone()
                if not destination:
                    raise HTTPException(status_code=404, detail="Destination not found")
                
                # Calculate total price
                total_price = (provider['price'] + destination['price']) * booking_data.guests
                
                # Create booking
                await cur.execute("""
                    INSERT INTO bookings (id, user_id, provider_id, destination_id, user_name, 
                                        provider_name, destination_name, booking_date, check_in, 
                                        check_out, guests, rooms, total_price, special_requests, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    booking_id, current_user['id'], booking_data.provider_id, booking_data.destination_id,
                    current_user['name'], provider['name'], destination['name'], booking_data.booking_date,
                    booking_data.check_in, booking_data.check_out, booking_data.guests, booking_data.rooms,
                    total_price, booking_data.special_requests, 'pending'
                ))
                
                return {
                    "id": booking_id,
                    "status": "pending",
                    "total_price": total_price,
                    "message": "Booking created successfully"
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/bookings")
async def get_user_bookings(current_user: dict = Depends(get_current_user)):
    """Get all bookings for current user"""
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT * FROM bookings WHERE user_id = %s ORDER BY created_at DESC
                """, (current_user['id'],))
                bookings = await cur.fetchall()
                return bookings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/provider/bookings")
async def get_provider_bookings(current_user: dict = Depends(get_current_user)):
    """Get all bookings for current provider"""
    try:
        if current_user['role'] != 'provider':
            raise HTTPException(status_code=403, detail="Access denied")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT b.* FROM bookings b 
                    JOIN providers p ON b.provider_id = p.id 
                    WHERE p.user_id = %s ORDER BY b.created_at DESC
                """, (current_user['id'],))
                bookings = await cur.fetchall()
                return bookings
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update booking status"""
    try:
        new_status = status_data.get('status')
        if new_status not in ['confirmed', 'cancelled', 'completed']:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Check if user has permission to update this booking
                if current_user['role'] == 'provider':
                    await cur.execute("""
                        SELECT b.id FROM bookings b 
                        JOIN providers p ON b.provider_id = p.id 
                        WHERE b.id = %s AND p.user_id = %s
                    """, (booking_id, current_user['id']))
                elif current_user['role'] == 'admin':
                    await cur.execute("SELECT id FROM bookings WHERE id = %s", (booking_id,))
                else:
                    await cur.execute("SELECT id FROM bookings WHERE id = %s AND user_id = %s", 
                                    (booking_id, current_user['id']))
                
                if not await cur.fetchone():
                    raise HTTPException(status_code=404, detail="Booking not found or access denied")
                
                await cur.execute("UPDATE bookings SET status = %s WHERE id = %s", (new_status, booking_id))
                return {"message": "Booking status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Wishlist API
class WishlistItemCreate(BaseModel):
    destination_id: str

@api_router.get("/wishlist")
async def get_user_wishlist(current_user: dict = Depends(get_current_user)):
    """Get all wishlist items for current user"""
    try:
        if current_user['role'] != 'tourist':
            raise HTTPException(status_code=403, detail="Only tourists can access wishlist")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("""
                    SELECT w.id, w.user_id, w.destination_id, w.created_at,
                           d.name, d.location, d.description, d.image_url, 
                           d.rating, d.price, d.category, d.highlights
                    FROM wishlist w
                    JOIN destinations d ON w.destination_id = d.id
                    WHERE w.user_id = %s
                    ORDER BY w.created_at DESC
                """, (current_user['id'],))
                wishlist_items = await cur.fetchall()
                
                # Format the response
                formatted_items = []
                for item in wishlist_items:
                    # Parse highlights JSON if it exists
                    highlights = []
                    if item['highlights']:
                        try:
                            highlights = json.loads(item['highlights'])
                        except:
                            highlights = []
                    
                    formatted_items.append({
                        'id': item['id'],
                        'user_id': item['user_id'],
                        'destination_id': item['destination_id'],
                        'created_at': item['created_at'],
                        'destination': {
                            'id': item['destination_id'],
                            'name': item['name'],
                            'location': item['location'],
                            'description': item['description'],
                            'image_url': item['image_url'],
                            'rating': float(item['rating']) if item['rating'] else 0,
                            'price': float(item['price']),
                            'category': item['category'],
                            'highlights': highlights
                        }
                    })
                
                return {
                    'items': formatted_items,
                    'total_count': len(formatted_items)
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/wishlist")
async def add_to_wishlist(
    wishlist_item: WishlistItemCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add destination to user's wishlist"""
    try:
        if current_user['role'] != 'tourist':
            raise HTTPException(status_code=403, detail="Only tourists can manage wishlist")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Check if destination exists
                await cur.execute("SELECT id FROM destinations WHERE id = %s", (wishlist_item.destination_id,))
                if not await cur.fetchone():
                    raise HTTPException(status_code=404, detail="Destination not found")
                
                # Check if already in wishlist
                await cur.execute("""
                    SELECT id FROM wishlist WHERE user_id = %s AND destination_id = %s
                """, (current_user['id'], wishlist_item.destination_id))
                
                if await cur.fetchone():
                    raise HTTPException(status_code=400, detail="Destination already in wishlist")
                
                # Add to wishlist
                wishlist_id = str(uuid.uuid4())
                await cur.execute("""
                    INSERT INTO wishlist (id, user_id, destination_id)
                    VALUES (%s, %s, %s)
                """, (wishlist_id, current_user['id'], wishlist_item.destination_id))
                
                return {"message": "Destination added to wishlist successfully", "id": wishlist_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/wishlist/{destination_id}")
async def remove_from_wishlist(
    destination_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove destination from user's wishlist"""
    try:
        if current_user['role'] != 'tourist':
            raise HTTPException(status_code=403, detail="Only tourists can manage wishlist")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Check if item exists in wishlist
                await cur.execute("""
                    SELECT id FROM wishlist WHERE user_id = %s AND destination_id = %s
                """, (current_user['id'], destination_id))
                
                if not await cur.fetchone():
                    raise HTTPException(status_code=404, detail="Destination not found in wishlist")
                
                # Remove from wishlist
                await cur.execute("""
                    DELETE FROM wishlist WHERE user_id = %s AND destination_id = %s
                """, (current_user['id'], destination_id))
                
                return {"message": "Destination removed from wishlist successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/wishlist/check/{destination_id}")
async def check_wishlist_status(
    destination_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if destination is in user's wishlist"""
    try:
        if current_user['role'] != 'tourist':
            return {"is_wishlisted": False}
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT id FROM wishlist WHERE user_id = %s AND destination_id = %s
                """, (current_user['id'], destination_id))
                
                is_wishlisted = await cur.fetchone() is not None
                return {"is_wishlisted": is_wishlisted}
    except Exception as e:
        return {"is_wishlisted": False}

# Provider Management API
class ProviderCreate(BaseModel):
    name: str
    category: str
    service_name: str
    description: str
    price: float
    location: str
    contact: str
    image_url: Optional[str] = None

@api_router.post("/providers")
async def create_provider(
    provider_data: ProviderCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new provider service"""
    try:
        if current_user['role'] != 'provider':
            raise HTTPException(status_code=403, detail="Only providers can create services")
        
        pool = await get_db()
        provider_id = str(uuid.uuid4())
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO providers (id, user_id, name, category, service_name, description, 
                                         price, location, contact, image_url, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    provider_id, current_user['id'], provider_data.name, provider_data.category,
                    provider_data.service_name, provider_data.description, provider_data.price,
                    provider_data.location, provider_data.contact, provider_data.image_url, True
                ))
                
                return {
                    "id": provider_id,
                    "message": "Provider service created successfully"
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/user/providers")
async def get_user_providers(current_user: dict = Depends(get_current_user)):
    """Get all providers for current user"""
    try:
        if current_user['role'] != 'provider':
            raise HTTPException(status_code=403, detail="Access denied")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM providers WHERE user_id = %s", (current_user['id'],))
                providers = await cur.fetchall()
                return providers
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/providers/{provider_id}")
async def update_provider(
    provider_id: str,
    provider_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update provider service"""
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Check ownership
                await cur.execute("SELECT user_id FROM providers WHERE id = %s", (provider_id,))
                provider = await cur.fetchone()
                if not provider or provider[0] != current_user['id']:
                    raise HTTPException(status_code=404, detail="Provider not found or access denied")
                
                # Update provider
                update_fields = []
                update_values = []
                for field, value in provider_data.items():
                    if field in ['name', 'category', 'service_name', 'description', 'price', 'location', 'contact', 'image_url']:
                        update_fields.append(f"{field} = %s")
                        update_values.append(value)
                
                if update_fields:
                    update_values.append(provider_id)
                    query = f"UPDATE providers SET {', '.join(update_fields)} WHERE id = %s"
                    await cur.execute(query, update_values)
                
                return {"message": "Provider updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Reviews API
class ReviewCreate(BaseModel):
    destination_id: Optional[str] = None
    provider_id: Optional[str] = None
    rating: int
    comment: str

@api_router.post("/reviews")
async def create_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new review"""
    try:
        if not review_data.destination_id and not review_data.provider_id:
            raise HTTPException(status_code=400, detail="Either destination_id or provider_id is required")
        
        if review_data.rating < 1 or review_data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        pool = await get_db()
        review_id = str(uuid.uuid4())
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    INSERT INTO reviews (id, user_id, destination_id, provider_id, rating, comment)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    review_id, current_user['id'], review_data.destination_id,
                    review_data.provider_id, review_data.rating, review_data.comment
                ))
                
                # Update average rating
                if review_data.destination_id:
                    await cur.execute("""
                        UPDATE destinations SET rating = (
                            SELECT AVG(rating) FROM reviews WHERE destination_id = %s
                        ) WHERE id = %s
                    """, (review_data.destination_id, review_data.destination_id))
                
                if review_data.provider_id:
                    await cur.execute("""
                        UPDATE providers SET rating = (
                            SELECT AVG(rating) FROM reviews WHERE provider_id = %s
                        ) WHERE id = %s
                    """, (review_data.provider_id, review_data.provider_id))
                
                return {
                    "id": review_id,
                    "message": "Review created successfully"
                }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin API
@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get admin dashboard statistics"""
    try:
        if current_user['role'] != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                # Get various statistics
                stats = {}
                
                await cur.execute("SELECT COUNT(*) as total FROM users")
                stats['total_users'] = (await cur.fetchone())['total']
                
                await cur.execute("SELECT COUNT(*) as total FROM destinations")
                stats['total_destinations'] = (await cur.fetchone())['total']
                
                await cur.execute("SELECT COUNT(*) as total FROM providers")
                stats['total_providers'] = (await cur.fetchone())['total']
                
                await cur.execute("SELECT COUNT(*) as total FROM bookings")
                stats['total_bookings'] = (await cur.fetchone())['total']
                
                await cur.execute("SELECT SUM(total_price) as revenue FROM bookings WHERE status = 'completed'")
                revenue_result = await cur.fetchone()
                stats['total_revenue'] = float(revenue_result['revenue']) if revenue_result['revenue'] else 0
                
                await cur.execute("""
                    SELECT status, COUNT(*) as count FROM bookings GROUP BY status
                """)
                booking_stats = await cur.fetchall()
                stats['booking_by_status'] = {stat['status']: stat['count'] for stat in booking_stats}
                
                return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """Get all users for admin"""
    try:
        if current_user['role'] != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC")
                users = await cur.fetchall()
                return users
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/bookings")
async def get_all_bookings(current_user: dict = Depends(get_current_user)):
    """Get all bookings for admin"""
    try:
        if current_user['role'] != 'admin':
            raise HTTPException(status_code=403, detail="Admin access required")
        
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute("SELECT * FROM bookings ORDER BY created_at DESC")
                bookings = await cur.fetchall()
                return bookings
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    await init_db()
    await create_missing_tables()
    print("Database connection initialized and tables created")

async def create_missing_tables():
    """Create missing tables if they don't exist"""
    try:
        pool = await get_db()
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Create chat_logs table
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS chat_logs (
                        id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        session_id VARCHAR(255),
                        message TEXT NOT NULL,
                        response TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        INDEX idx_chat_logs_user_session (user_id, session_id),
                        INDEX idx_chat_logs_created (created_at)
                    )
                """)
                
                # Update itineraries table structure if needed
                await cur.execute("""
                    CREATE TABLE IF NOT EXISTS itineraries (
                        id VARCHAR(255) PRIMARY KEY,
                        user_id VARCHAR(255),
                        destination VARCHAR(255) NOT NULL,
                        days INT NOT NULL,
                        budget DECIMAL(10,2) NOT NULL,
                        content TEXT,
                        preferences JSON,
                        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    )
                """)
                
                print("Missing tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {str(e)}")

@app.on_event("shutdown")  
async def shutdown_event():
    global db_pool
    if db_pool:
        db_pool.close()
        await db_pool.wait_closed()
    print("Database connection closed")