import qrcode
import io
import base64
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional
import os

class PaymentService:
    def __init__(self):
        # UPI details - using the provided UPI ID
        self.upi_id = "7827358132@ybl"
        self.merchant_name = "Jharkhand Tourism"
        self.qr_expiry_minutes = 30
    
    def generate_upi_qr_code(self, amount: float, transaction_ref: str, customer_name: str = "") -> Dict:
        """Generate UPI QR code for payment"""
        try:
            # Create UPI payment URL
            upi_url = f"upi://pay?pa={self.upi_id}&pn={self.merchant_name}&am={amount}&cu=INR&tn=Booking Payment {transaction_ref}"
            
            if customer_name:
                upi_url += f" for {customer_name}"
            
            # Add transaction reference
            upi_url += f"&tr={transaction_ref}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(upi_url)
            qr.make(fit=True)
            
            # Create QR code image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            img_buffer = io.BytesIO()
            img.save(img_buffer, format='PNG')
            img_buffer.seek(0)
            qr_code_base64 = base64.b64encode(img_buffer.getvalue()).decode()
            
            return {
                "qr_code_base64": f"data:image/png;base64,{qr_code_base64}",
                "upi_url": upi_url,
                "upi_id": self.upi_id,
                "merchant_name": self.merchant_name,
                "amount": amount,
                "transaction_reference": transaction_ref,
                "expires_at": datetime.utcnow() + timedelta(minutes=self.qr_expiry_minutes)
            }
            
        except Exception as e:
            raise Exception(f"Failed to generate UPI QR code: {str(e)}")
    
    def validate_transaction_id(self, transaction_id: str) -> bool:
        """Basic validation for UPI transaction ID format"""
        if not transaction_id or len(transaction_id) < 8:
            return False
        
        # Common UPI transaction ID patterns
        # Most UPI transaction IDs are 12-16 characters long and alphanumeric
        if len(transaction_id) >= 8 and len(transaction_id) <= 30:
            return transaction_id.replace(" ", "").isalnum()
        
        return False
    
    def generate_payment_reference(self) -> str:
        """Generate unique payment reference"""
        return f"PAY_{datetime.utcnow().strftime('%Y%m%d')}_{str(uuid.uuid4())[:8].upper()}"
    
    def calculate_payment_expiry(self) -> datetime:
        """Calculate payment expiry time"""
        return datetime.utcnow() + timedelta(minutes=self.qr_expiry_minutes)
    
    def is_payment_expired(self, created_at: datetime) -> bool:
        """Check if payment has expired"""
        expiry_time = created_at + timedelta(minutes=self.qr_expiry_minutes)
        return datetime.utcnow() > expiry_time
    
    def format_amount_for_upi(self, amount: float) -> str:
        """Format amount for UPI (2 decimal places)"""
        return f"{amount:.2f}"
    
    def get_payment_instructions(self) -> Dict:
        """Get payment instructions for customers"""
        return {
            "title": "UPI Payment Instructions",
            "steps": [
                "1. Scan the QR code with any UPI app (PhonePe, Paytm, GPay, etc.)",
                "2. Verify the payment amount and merchant details",
                "3. Complete the payment using your UPI PIN",
                "4. Note down the transaction ID from your payment app",
                "5. Enter the transaction ID in the form below for verification",
                "6. Our team will verify your payment within 24 hours"
            ],
            "supported_apps": [
                "PhonePe", "Google Pay", "Paytm", "BHIM", "Amazon Pay", 
                "MobiKwik", "Freecharge", "Bank UPI Apps"
            ],
            "payment_timeout": f"{self.qr_expiry_minutes} minutes",
            "merchant_upi_id": self.upi_id,
            "support_contact": "For payment issues, contact: support@jharkhandtourism.com"
        }