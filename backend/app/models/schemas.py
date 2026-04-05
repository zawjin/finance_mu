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
