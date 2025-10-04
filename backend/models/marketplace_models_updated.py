from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date, time
from enum import Enum
import uuid
from decimal import Decimal

# Enums for type safety - keeping compatible with existing role system
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

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REFUNDED = "refunded"

class NotificationType(str, Enum):
    NEW_ORDER = "new_order"
    ORDER_UPDATE = "order_update"
    REVIEW_RECEIVED = "review_received"
    EVENT_BOOKING = "event_booking"
    PAYMENT_RECEIVED = "payment_received"
    INVENTORY_LOW = "inventory_low"
    NEW_MESSAGE = "new_message"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Handicraft Models
class HandicraftBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: HandicraftCategory
    description: str = Field(..., min_length=10)
    price: float = Field(..., gt=0)
    discount_price: Optional[float] = Field(None, gt=0)
    stock_quantity: int = Field(..., ge=0)
    images: Optional[List[str]] = Field(default_factory=list)
    materials: Optional[str] = Field(None, max_length=500)
    dimensions: Optional[str] = Field(None, max_length=200)
    weight: Optional[float] = Field(None, gt=0)
    origin_village: Optional[str] = Field(None, max_length=255)
    cultural_significance: Optional[str] = None
    care_instructions: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)
    is_featured: bool = False

    @validator('discount_price')
    def validate_discount_price(cls, v, values):
        if v is not None and 'price' in values and v >= values['price']:
            raise ValueError('Discount price must be less than regular price')
        return v

class HandicraftCreate(HandicraftBase):
    pass

class HandicraftUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[HandicraftCategory] = None
    description: Optional[str] = Field(None, min_length=10)
    price: Optional[float] = Field(None, gt=0)
    discount_price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    images: Optional[List[str]] = None
    materials: Optional[str] = Field(None, max_length=500)
    dimensions: Optional[str] = Field(None, max_length=200)
    weight: Optional[float] = Field(None, gt=0)
    origin_village: Optional[str] = Field(None, max_length=255)
    cultural_significance: Optional[str] = None
    care_instructions: Optional[str] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_available: Optional[bool] = None

class Handicraft(HandicraftBase):
    id: str
    seller_id: str
    rating: float = 0.0
    total_reviews: int = 0
    is_available: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Order Models
class ShippingAddress(BaseModel):
    full_name: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str = "India"
    phone: str

class HandicraftOrderCreate(BaseModel):
    handicraft_id: str
    quantity: int = Field(..., ge=1)
    shipping_address: ShippingAddress
    shipping_method: ShippingMethod = ShippingMethod.STANDARD
    buyer_notes: Optional[str] = None

class HandicraftOrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    estimated_delivery: Optional[date] = None
    tracking_id: Optional[str] = None
    seller_notes: Optional[str] = None

class HandicraftOrder(BaseModel):
    id: str
    user_id: str
    handicraft_id: str
    seller_id: str
    quantity: int
    unit_price: float
    total_price: float
    status: OrderStatus
    payment_status: PaymentStatus
    shipping_address: Dict[str, Any]
    shipping_method: ShippingMethod
    estimated_delivery: Optional[date]
    tracking_id: Optional[str]
    buyer_notes: Optional[str]
    seller_notes: Optional[str]
    order_date: datetime
    confirmed_at: Optional[datetime]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Review Models
class HandicraftReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    images: Optional[List[str]] = Field(default_factory=list)
    quality_rating: Optional[int] = Field(None, ge=1, le=5)
    delivery_rating: Optional[int] = Field(None, ge=1, le=5)
    seller_rating: Optional[int] = Field(None, ge=1, le=5)

class HandicraftReview(BaseModel):
    id: str
    user_id: str
    handicraft_id: str
    order_id: str
    rating: int
    review_text: Optional[str]
    images: Optional[List[str]]
    quality_rating: Optional[int]
    delivery_rating: Optional[int]
    seller_rating: Optional[int]
    is_verified: bool
    helpful_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Event Models
class CulturalEventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    event_type: EventType
    location: str = Field(..., min_length=1, max_length=255)
    venue_details: Optional[str] = None
    start_date: datetime
    end_date: datetime
    price: float = Field(..., ge=0)
    max_participants: Optional[int] = Field(None, gt=0)
    images: Optional[List[str]] = Field(default_factory=list)
    cultural_significance: Optional[str] = None
    what_to_expect: Optional[str] = None
    what_to_bring: Optional[str] = None
    age_restrictions: Optional[str] = None
    languages: str = "Hindi, English"
    contact_info: Optional[Dict[str, Any]] = None
    cancellation_policy: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)
    is_featured: bool = False

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('End date must be after start date')
        return v

class CulturalEventCreate(CulturalEventBase):
    pass

class CulturalEventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    event_type: Optional[EventType] = None
    location: Optional[str] = Field(None, min_length=1, max_length=255)
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
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

class CulturalEvent(CulturalEventBase):
    id: str
    organizer_id: str
    current_bookings: int = 0
    rating: float = 0.0
    total_reviews: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Event Booking Models
class ParticipantDetail(BaseModel):
    name: str
    age: Optional[int] = None
    contact: Optional[str] = None

class EventBookingCreate(BaseModel):
    event_id: str
    participants: int = Field(..., ge=1)
    participant_details: Optional[List[ParticipantDetail]] = None
    special_requirements: Optional[str] = None

class EventBookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    payment_status: Optional[PaymentStatus] = None
    attended: Optional[bool] = None

class EventBooking(BaseModel):
    id: str
    user_id: str
    event_id: str
    organizer_id: str
    participants: int
    total_price: float
    status: BookingStatus
    payment_status: PaymentStatus
    participant_details: Optional[List[Dict[str, Any]]]
    special_requirements: Optional[str]
    booking_date: datetime
    confirmed_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    attended: Optional[bool]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Event Review Models
class EventReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    experience_rating: Optional[int] = Field(None, ge=1, le=5)
    organization_rating: Optional[int] = Field(None, ge=1, le=5)
    value_rating: Optional[int] = Field(None, ge=1, le=5)
    images: Optional[List[str]] = Field(default_factory=list)

class EventReview(BaseModel):
    id: str
    user_id: str
    event_id: str
    booking_id: str
    rating: int
    review_text: Optional[str]
    experience_rating: Optional[int]
    organization_rating: Optional[int]
    value_rating: Optional[int]
    images: Optional[List[str]]
    is_verified: bool
    helpful_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Homestay Models (extends existing providers)
class HomestayUpdate(BaseModel):
    amenities: Optional[List[str]] = None
    house_rules: Optional[str] = None
    check_in_time: Optional[time] = None
    check_out_time: Optional[time] = None
    max_guests: Optional[int] = Field(None, gt=0)
    rooms_available: Optional[int] = Field(None, gt=0)
    cultural_activities: Optional[List[str]] = None
    meal_options: Optional[List[str]] = None
    family_type: Optional[str] = None
    marketplace_enabled: Optional[bool] = None

# Notification Models
class MarketplaceNotificationCreate(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    related_id: Optional[str] = None
    related_type: Optional[str] = None
    priority: NotificationPriority = NotificationPriority.MEDIUM
    action_url: Optional[str] = None
    expires_at: Optional[datetime] = None

class MarketplaceNotification(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    related_id: Optional[str]
    related_type: Optional[str]
    is_read: bool
    priority: NotificationPriority
    action_url: Optional[str]
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Search and Filter Models
class MarketplaceSearch(BaseModel):
    query: Optional[str] = None
    category: Optional[HandicraftCategory] = None
    event_type: Optional[EventType] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    location: Optional[str] = None
    is_featured: Optional[bool] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    tags: Optional[List[str]] = None
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = "created_at"
    sort_order: Optional[str] = Field("desc", pattern="^(asc|desc)$")

# Dashboard Stats Models
class MarketplaceStats(BaseModel):
    total_handicrafts: int
    active_events: int
    active_homestays: int
    pending_orders: int
    confirmed_bookings: int
    monthly_revenue: float
    active_sellers: int
    avg_handicraft_rating: float
    avg_event_rating: float

# Provider Dashboard Models
class ProviderMarketplaceStats(BaseModel):
    total_handicrafts: int
    total_events: int
    total_orders: int
    total_bookings: int
    monthly_sales: float
    average_rating: float
    total_reviews: int
    pending_orders: int
    low_stock_items: int

# Response Models
class MarketplaceResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int