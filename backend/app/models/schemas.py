from pydantic import BaseModel, Field
from typing import List, Optional

class SpendingItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    date: str # ISO Format YYYY-MM-DD
    amount: float
    category: str
    sub_category: str
    description: str # The 'Details' field
    recovered: float = 0 # Offset amount received against this spending
    recovery_description: str = "" # Specific details about the recovery/adjustment
    payment_method: Optional[str] = None  # CASH, BANK, WALLET, GIFT, UPI, CARD, OTHER
    payment_source_id: Optional[str] = None  # Reserve account _id if debited
    is_settled: bool = True  # Tracks if card transactions are paid off

class WithdrawalItem(BaseModel):
    amount: float
    date: str # ISO Format YYYY-MM-DD
    description: str = ""
    quantity: Optional[float] = None # For Stocks/MFs: Units exited

class InvestmentItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    type: str # Gold, Property, Cash, etc.
    name: str # The asset title
    value: float
    date: str
    details: str # Historical or metadata
    sub_category: str = "-" # Optional sub-category node
    quantity: Optional[float] = None
    buy_price: Optional[float] = None
    current_price: Optional[float] = None
    ticker: Optional[str] = None
    withdrawals: List[WithdrawalItem] = []
    payment_method: Optional[str] = None  # CASH, BANK, WALLET, GIFT, UPI, CARD, OTHER
    payment_source_id: Optional[str] = None  # Reserve account _id if debited

class CategorySchema(BaseModel):
    name: str
    sub_categories: List[str] = []
    icon: Optional[str] = "Package"
    color: Optional[str] = "#0071e3"

class DebtItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    person: str
    amount: float
    direction: str # "OWED_TO_ME" or "I_OWE"
    date: str
    dueDate: Optional[str] = None
    status: str = "ACTIVE" # ACTIVE, SETTLED, PARTIAL
    description: str = ""
    category: str = "PERSONAL" # PERSONAL, BANK, etc.

class ReserveItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    account_name: str
    account_type: str # BANK, WALLET, CASH, CREDIT_CARD
    balance: float
    credit_limit: Optional[float] = 0.0 # Only for CREDIT_CARD
    last_updated: str
    description: str = ""

class CardBillSettlement(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    card_id: str
    card_name: str
    source_id: str
    source_name: str
    amount: float
    date: str
