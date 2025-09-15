from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import date, datetime

class UserRole(str, Enum):
    tourist = "tourist"
    provider = "provider"
    admin = "admin"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.tourist
    phone: Optional[str] = None

class User(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None

class LoginData(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class DestinationCreate(BaseModel):
    name: str
    location: str
    description: str
    image_url: str
    price: float
    category: Optional[str] = None
    highlights: Optional[List[str]] = None

class Destination(BaseModel):
    id: str
    name: str
    location: str
    description: str
    image_url: str
    rating: float
    price: float
    category: Optional[str] = None
    highlights: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

class ProviderCategory(str, Enum):
    guide = "guide"
    transport = "transport"
    accommodation = "accommodation"
    activity = "activity"

class ProviderCreate(BaseModel):
    name: str
    category: ProviderCategory
    service_name: str
    description: str
    price: float
    location: str
    contact: str
    image_url: Optional[str] = None

class Provider(BaseModel):
    id: str
    user_id: str
    name: str
    category: ProviderCategory
    service_name: str
    description: str
    price: float
    rating: float
    location: str
    contact: str
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"

class BookingCreate(BaseModel):
    provider_id: str
    destination_id: str
    booking_date: date
    check_in: date
    check_out: date
    guests: int = 1
    rooms: int = 1
    special_requests: Optional[str] = None
    # New fields for package information
    package_type: Optional[str] = None  # heritage, adventure, spiritual, premium
    package_name: Optional[str] = None  # Full package name
    calculated_price: Optional[float] = None  # Frontend calculated price
    addons: Optional[str] = None  # JSON string of selected addons

class Booking(BaseModel):
    id: str
    user_id: str
    provider_id: str
    destination_id: str
    user_name: str
    provider_name: str
    destination_name: str
    booking_date: date
    check_in: date
    check_out: date
    guests: int
    rooms: int
    status: BookingStatus
    total_price: float
    special_requests: Optional[str] = None
    # New fields for package information
    package_type: Optional[str] = None
    package_name: Optional[str] = None
    addons: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class BookingStatusUpdate(BaseModel):
    status: BookingStatus

class ReviewCreate(BaseModel):
    destination_id: Optional[str] = None
    provider_id: Optional[str] = None
    rating: int
    comment: str

class Review(BaseModel):
    id: str
    user_id: str
    destination_id: Optional[str] = None
    provider_id: Optional[str] = None
    rating: int
    comment: str
    created_at: datetime

class PlannerRequest(BaseModel):
    destination: str
    days: int
    budget: float
    interests: List[str]
    travel_style: str
    group_size: int = 1

class ItineraryResponse(BaseModel):
    id: str
    user_id: str
    destination: str
    days: int
    budget: float
    interests: List[str]
    travel_style: str
    group_size: int
    schedule: dict
    created_at: datetime

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Wishlist Models
class WishlistItemCreate(BaseModel):
    destination_id: str

class WishlistItem(BaseModel):
    id: str
    user_id: str
    destination_id: str
    destination: Destination
    created_at: datetime

class WishlistResponse(BaseModel):
    items: List[WishlistItem]
    total_count: int