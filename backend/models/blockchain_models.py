from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

# ===========================================
# BLOCKCHAIN MODELS
# ===========================================

class WalletConnect(BaseModel):
    wallet_address: str
    signature: Optional[str] = None

class WalletResponse(BaseModel):
    user_id: str
    wallet_address: str
    is_verified: bool
    connected: bool

class CertificateCreate(BaseModel):
    booking_id: str
    destination_name: str
    certificate_type: str = "tour_completion"

class Certificate(BaseModel):
    id: str
    user_id: str
    booking_id: str
    certificate_type: str
    nft_token_id: Optional[int] = None
    contract_address: str
    transaction_hash: Optional[str] = None
    blockchain_network: str
    metadata_url: Optional[str] = None
    certificate_title: str
    certificate_description: Optional[str] = None
    destination_name: Optional[str] = None
    completion_date: Optional[date] = None
    issued_at: datetime
    is_minted: bool

class LoyaltyPointsBalance(BaseModel):
    user_id: str
    wallet_address: str
    points_balance: float
    total_earned: float

class LoyaltyTransaction(BaseModel):
    id: str
    user_id: str
    wallet_address: str
    transaction_type: str  # "earned", "redeemed", "transferred"
    points_amount: float
    booking_id: Optional[str] = None
    transaction_hash: Optional[str] = None
    blockchain_network: str
    created_at: datetime

class BlockchainBooking(BaseModel):
    id: str
    booking_id: str
    user_id: str
    booking_hash: str
    contract_address: str
    transaction_hash: Optional[str] = None
    blockchain_network: str
    verification_status: str  # "pending", "verified", "failed"
    verification_date: Optional[datetime] = None
    created_at: datetime

class BlockchainReview(BaseModel):
    id: str
    review_id: str
    user_id: str
    booking_id: str
    review_hash: str
    contract_address: str
    transaction_hash: Optional[str] = None
    blockchain_network: str
    authenticity_score: float
    is_verified: bool
    verification_date: Optional[datetime] = None
    created_at: datetime

class BlockchainStatus(BaseModel):
    network: str
    connected: bool
    block_number: Optional[int] = None
    gas_price: Optional[str] = None
    contract_addresses: dict

class GasCostEstimate(BaseModel):
    operation: str
    gas_limit: int
    gas_price: str
    total_cost_wei: str
    total_cost_eth: str
    total_cost_usd: Optional[str] = None