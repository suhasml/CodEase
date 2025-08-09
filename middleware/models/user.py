from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class CreateUserRequest(BaseModel):
    uid: str
    # email: str
    email: Optional[EmailStr] = None

class BetaSignupRequest(BaseModel):
    email: EmailStr

class UserStatusUpdate(BaseModel):
    status: str

class AdminUser(BaseModel):
    id: str
    email: str
    status: str
    credits: int
    created_at: datetime
    is_admin: bool

class UserFeaturesResponse(BaseModel):
    success: bool
    features: List[str]
    credits: int = 0
    unlimited_credits: bool = False
    is_admin: bool = False
    has_subscription: bool = False
    follow_ups_per_extension: int = 3
    has_debugging: bool = False
    has_testing: bool = False
    has_convert: bool = False
    error: Optional[str] = None

class TitleGenerater(BaseModel):
    title: str = Field(..., title="The title generated from the user's extension requirements.")

class DescriptionGenerator(BaseModel):
    description: str = Field(..., title="The description generated from the extension title and functionality.")

class HederaWalletRequest(BaseModel):
    hedera_wallet_id: str = Field(..., pattern=r'^\d+\.\d+\.\d+$', title="Hedera wallet ID in format 0.0.123456")

class HederaWalletResponse(BaseModel):
    success: bool
    hedera_wallet_id: Optional[str] = None
    message: str

class HederaTokenizationRecord(BaseModel):
    extension_id: str
    token_id: str
    token_name: str
    token_symbol: str
    creator_wallet: str
    hedera_transaction_id: str
    total_supply: int
    initial_price: float
    description: str
    logo_url: Optional[str] = None
    extension_link: str
    social_links: Optional[Dict[str, str]] = None
    created_at: datetime
    status: str  # 'pending', 'success', 'failed'