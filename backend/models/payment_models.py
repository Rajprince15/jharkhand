from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed" 
    FAILED = "failed"
    CANCELLED = "cancelled"
    VERIFICATION_REQUIRED = "verification_required"

class PaymentMethod(str, Enum):
    UPI = "upi"
    CARD = "card"
    NET_BANKING = "net_banking"
    WALLET = "wallet"

class PaymentCreate(BaseModel):
    booking_id: str = Field(..., min_length=1, description="Booking ID for payment")
    amount: float = Field(..., gt=0, description="Payment amount")
    payment_method: PaymentMethod = Field(default=PaymentMethod.UPI)
    upi_id: Optional[str] = Field(None, description="UPI ID for payment")
    transaction_reference: Optional[str] = Field(None, description="Internal transaction reference")

class PaymentVerification(BaseModel):
    payment_id: str = Field(..., min_length=1, description="Payment ID")
    transaction_id: str = Field(..., min_length=1, description="UPI/Bank transaction ID")
    amount: float = Field(..., gt=0, description="Transaction amount")
    transaction_screenshot: Optional[str] = Field(None, description="Screenshot URL/base64")
    customer_note: Optional[str] = Field(None, max_length=500, description="Customer note")

class PaymentStatusUpdate(BaseModel):
    status: PaymentStatus
    admin_note: Optional[str] = Field(None, max_length=500, description="Admin verification note")
    verified_amount: Optional[float] = Field(None, gt=0, description="Admin verified amount")

class UPIQRRequest(BaseModel):
    booking_id: str = Field(..., min_length=1, description="Booking ID")
    amount: float = Field(..., gt=0, description="Payment amount")
    customer_name: str = Field(..., min_length=1, description="Customer name")
    customer_phone: str = Field(..., min_length=10, description="Customer phone")

class PaymentResponse(BaseModel):
    id: str
    booking_id: str
    amount: float
    status: PaymentStatus
    payment_method: PaymentMethod
    upi_qr_code: Optional[str] = None
    upi_payment_url: Optional[str] = None
    transaction_reference: str
    created_at: datetime
    expires_at: Optional[datetime] = None

class AdminPaymentApproval(BaseModel):
    payment_id: str = Field(..., min_length=1, description="Payment ID")
    action: str = Field(..., pattern="^(approve|reject)$", description="approve or reject")
    admin_note: Optional[str] = Field(None, max_length=500, description="Admin note")
    verified_amount: Optional[float] = Field(None, gt=0, description="Verified amount if different")