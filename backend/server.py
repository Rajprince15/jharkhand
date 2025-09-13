from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field, EmailStr
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

# Include the router in the main app
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("Database connection initialized")

@app.on_event("shutdown")  
async def shutdown_event():
    global db_pool
    if db_pool:
        db_pool.close()
        await db_pool.wait_closed()
    print("Database connection closed")