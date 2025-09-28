from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from enum import Enum
import uuid

# Enums for type safety
class HandicraftCategory(str, Enum):
    POTTERY = "pottery"
    TEXTILES = "textiles"
    JEWELRY = "jewelry"
    WOODCRAFT = "woodcraft"
    METALWORK = "metalwork"
    PAINTINGS = "paintings"
    SCULPTURES = "sculptures"
    BASKETS = "baskets"
    OTHER = "other"

class EventType(str, Enum):
    FESTIVAL = "festival"
    WORKSHOP = "workshop"
    PERFORMANCE = "performance"
    EXHIBITION = "exhibition"
    TOUR = "tour"
    CEREMONY = "ceremony"
    OTHER = "other"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class ShippingMethod(str, Enum):
    STANDARD = "standard"
    EXPRESS = "express"
    PICKUP = "pickup"

# Handicraft Models
class HandicraftCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: HandicraftCategory
    description: str = Field(..., min_length=10)
    price: float = Field(..., gt=0)
    discount_price: Optional[float] = Field(None, gt=0)
    stock_quantity: int = Field(..., ge=0)
    images: Optional[List[str]] = []
    materials: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[float] = Field(None, gt=0)
    origin_village: Optional[str] = None
    cultural_significance: Optional[str] = None
    care_instructions: Optional[str] = None
    tags: Optional[List[str]] = []

    @validator('discount_price')
    def validate_discount_price(cls, v, values):
        if v is not None and 'price' in values and v >= values['price']:
            raise ValueError('Discount price must be less than regular price')
        return v

class HandicraftUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[HandicraftCategory] = None
    description: Optional[str] = Field(None, min_length=10)
    price: Optional[float] = Field(None, gt=0)
    discount_price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    images: Optional[List[str]] = None
    materials: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[float] = Field(None, gt=0)
    origin_village: Optional[str] = None
    cultural_significance: Optional[str] = None
    care_instructions: Optional[str] = None
    is_available: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None

class Handicraft(BaseModel):
    id: str
    seller_id: str
    seller_name: Optional[str] = None  # Populated via JOIN
    name: str
    category: str
    description: str
    price: float
    discount_price: Optional[float] = None
    stock_quantity: int
    rating: float = 0.0
    total_reviews: int = 0
    images: List[str] = []
    materials: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[float] = None
    origin_village: Optional[str] = None
    cultural_significance: Optional[str] = None
    care_instructions: Optional[str] = None
    is_available: bool = True
    is_featured: bool = False
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

# Handicraft Order Models
class ShippingAddress(BaseModel):
    full_name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=10, max_length=15)
    address_line_1: str = Field(..., min_length=1)
    address_line_2: Optional[str] = None
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    postal_code: str = Field(..., min_length=1)
    landmark: Optional[str] = None

class HandicraftOrderCreate(BaseModel):
    handicraft_id: str
    quantity: int = Field(..., ge=1, le=10)
    shipping_address: ShippingAddress
    shipping_method: ShippingMethod = ShippingMethod.STANDARD
    buyer_notes: Optional[str] = None

class HandicraftOrder(BaseModel):
    id: str
    user_id: str
    handicraft_id: str
    handicraft_name: Optional[str] = None
    seller_id: str
    seller_name: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float
    status: str
    payment_status: str
    shipping_address: Dict[str, Any]
    shipping_method: str
    estimated_delivery: Optional[date] = None
    tracking_id: Optional[str] = None
    buyer_notes: Optional[str] = None
    seller_notes: Optional[str] = None
    order_date: datetime
    confirmed_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class HandicraftOrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    estimated_delivery: Optional[date] = None
    tracking_id: Optional[str] = None
    seller_notes: Optional[str] = None

# Event Models
class CulturalEventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    event_type: EventType
    location: str = Field(..., min_length=1)
    venue_details: Optional[str] = None
    start_date: datetime
    end_date: datetime
    price: float = Field(0.0, ge=0)
    max_participants: Optional[int] = Field(None, gt=0)
    images: Optional[List[str]] = []
    cultural_significance: Optional[str] = None
    what_to_expect: Optional[str] = None
    what_to_bring: Optional[str] = None
    age_restrictions: Optional[str] = None
    languages: str = "Hindi, English"
    contact_info: Optional[Dict[str, Any]] = {}
    cancellation_policy: Optional[str] = None
    tags: Optional[List[str]] = []

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class CulturalEventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    event_type: Optional[EventType] = None
    location: Optional[str] = Field(None, min_length=1)
    venue_details: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    price: Optional[float] = Field(None, ge=0)
    max_participants: Optional[int] = Field(None, gt=0)
    images: Optional[List[str]] = None
    cultural_significance: Optional[str] = None
    what_to_expect: Optional[str] = None
    what_to_bring: Optional[str] = None
    age_restrictions: Optional[str] = None
    languages: Optional[str] = None
    contact_info: Optional[Dict[str, Any]] = None
    cancellation_policy: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None

class CulturalEvent(BaseModel):
    id: str
    organizer_id: str
    organizer_name: Optional[str] = None
    title: str
    description: str
    event_type: str
    location: str
    venue_details: Optional[str] = None
    start_date: datetime
    end_date: datetime
    price: float
    max_participants: Optional[int] = None
    current_bookings: int = 0
    images: List[str] = []
    cultural_significance: Optional[str] = None
    what_to_expect: Optional[str] = None
    what_to_bring: Optional[str] = None
    age_restrictions: Optional[str] = None
    languages: str
    contact_info: Dict[str, Any] = {}
    cancellation_policy: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    is_active: bool = True
    is_featured: bool = False
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

# Event Booking Models
class EventBookingCreate(BaseModel):
    event_id: str
    participants: int = Field(..., ge=1, le=20)
    participant_details: Optional[List[Dict[str, Any]]] = []
    special_requirements: Optional[str] = None

class EventBooking(BaseModel):
    id: str
    user_id: str
    event_id: str
    event_title: Optional[str] = None
    organizer_id: str
    organizer_name: Optional[str] = None
    participants: int
    total_price: float
    status: str
    payment_status: str
    participant_details: List[Dict[str, Any]] = []
    special_requirements: Optional[str] = None
    booking_date: datetime
    confirmed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    attended: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

class EventBookingUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    attended: Optional[bool] = None

# Review Models
class HandicraftReviewCreate(BaseModel):
    handicraft_id: str
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    quality_rating: Optional[int] = Field(None, ge=1, le=5)
    delivery_rating: Optional[int] = Field(None, ge=1, le=5)
    seller_rating: Optional[int] = Field(None, ge=1, le=5)
    images: Optional[List[str]] = []

class HandicraftReview(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    handicraft_id: str
    order_id: str
    rating: int
    review_text: Optional[str] = None
    quality_rating: Optional[int] = None
    delivery_rating: Optional[int] = None
    seller_rating: Optional[int] = None
    images: List[str] = []
    is_verified: bool = True
    helpful_count: int = 0
    created_at: datetime
    updated_at: datetime

class EventReviewCreate(BaseModel):
    event_id: str
    booking_id: str
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    experience_rating: Optional[int] = Field(None, ge=1, le=5)
    organization_rating: Optional[int] = Field(None, ge=1, le=5)
    value_rating: Optional[int] = Field(None, ge=1, le=5)
    images: Optional[List[str]] = []

class EventReview(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    event_id: str
    booking_id: str
    rating: int
    review_text: Optional[str] = None
    experience_rating: Optional[int] = None
    organization_rating: Optional[int] = None
    value_rating: Optional[int] = None
    images: List[str] = []
    is_verified: bool = True
    helpful_count: int = 0
    created_at: datetime
    updated_at: datetime

# Extended Homestay Models (building on existing Provider models)
class HomestayCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    service_name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    price: float = Field(..., gt=0)  # Per night price
    location: str = Field(..., min_length=1)
    contact: str = Field(..., min_length=10, max_length=20)
    destination_id: Optional[str] = None
    image_url: Optional[str] = None
    amenities: Optional[List[str]] = []
    house_rules: Optional[str] = None
    check_in_time: Optional[str] = "14:00"  # Will be converted to TIME in DB
    check_out_time: Optional[str] = "11:00"  # Will be converted to TIME in DB
    max_guests: int = Field(2, ge=1, le=20)
    rooms_available: int = Field(1, ge=1, le=10)
    cultural_activities: Optional[List[str]] = []
    meal_options: Optional[List[str]] = []
    family_type: Optional[str] = None

class HomestayUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    service_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    price: Optional[float] = Field(None, gt=0)
    location: Optional[str] = Field(None, min_length=1)
    contact: Optional[str] = Field(None, min_length=10, max_length=20)
    destination_id: Optional[str] = None
    image_url: Optional[str] = None
    amenities: Optional[List[str]] = None
    house_rules: Optional[str] = None
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    max_guests: Optional[int] = Field(None, ge=1, le=20)
    rooms_available: Optional[int] = Field(None, ge=1, le=10)
    cultural_activities: Optional[List[str]] = None
    meal_options: Optional[List[str]] = None
    family_type: Optional[str] = None
    is_active: Optional[bool] = None

class Homestay(BaseModel):
    id: str
    user_id: str
    host_name: str  # This is the 'name' field from providers
    service_name: str
    description: str
    price: float
    rating: float = 4.5
    location: str
    contact: str
    image_url: Optional[str] = None
    is_active: bool = True
    destination_id: Optional[str] = None
    destination_name: Optional[str] = None
    amenities: List[str] = []
    house_rules: Optional[str] = None
    check_in_time: str = "14:00"
    check_out_time: str = "11:00"
    max_guests: int = 2
    rooms_available: int = 1
    cultural_activities: List[str] = []
    meal_options: List[str] = []
    family_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Search and Filter Models
class MarketplaceSearch(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)

class MarketplaceStats(BaseModel):
    total_handicrafts: int = 0
    total_events: int = 0
    total_homestays: int = 0
    total_artisans: int = 0
    total_orders: int = 0
    featured_items_count: int = 0
    average_rating: float = 0.0