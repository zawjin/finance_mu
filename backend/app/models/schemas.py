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
    target_account_id: Optional[str] = None  # Reserve account _id if credited/settled (e.g. Card Payment)
    is_settled: bool = True  # Tracks if card transactions are paid off
    metadata: Optional[dict] = {} # For tagging (e.g. is_investment: True)

class YearlyExpenseItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    amount: float
    category: str # "Term Insurance", "Medical Insurance", "Temple", etc.
    sub_category: Optional[str] = "General"
    due_month: str # "January", "February", etc. OR date. Let's just use string
    description: str = ""
    funding_source: Optional[str] = None # Which account/investment pays for this
    last_paid_year: Optional[int] = None
    last_paid_period: Optional[str] = None # Tracks the year this was last paid
    status: str = "ACTIVE" # ACTIVE, DISABLED
    frequency: str = "YEARLY" # YEARLY, MONTHLY

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
    recentPurchase: Optional[float] = None # For top-ups
    recentPurchaseQty: Optional[float] = None # Units added
    last_updated: Optional[str] = None # ISO Format YYYY-MM-DD
    purchases: List[WithdrawalItem] = [] # Historical top-ups
    status: str = "ACTIVE" # ACTIVE, COLLECTED, ARCHIVED

class CategorySchema(BaseModel):
    name: str
    type: str = "spending" # "spending", "yearly", "monthly", "asset_class"
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
    due_date: Optional[str] = None # Day of Month (1-31)
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

class PrivateLendingItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    borrower: str                          # Person / entity who borrowed
    principal: float                       # Original loan amount (₹)
    interest_rate: float = 0.065          # Annual rate as decimal (0.065 = 6.5%)
    start_date: str                        # "YYYY-MM-DD" — when money was deployed
    due_date: Optional[str] = None        # Expected return date (None = open-ended)
    status: str = "ACTIVE"               # ACTIVE | SETTLED | PARTIAL
    settled_amount: Optional[float] = 0.0 # Amount actually recovered
    settled_date: Optional[str] = None   # Date of settlement
    settled_interest: Optional[float] = 0.0 # Locked interest amount at settlement
    payment_source_id: Optional[str] = None # ID of the account used for payment
    linked_spending_id: Optional[str] = None # Reference to the auto-generated spending record
    linked_investment_id: Optional[str] = None # Reference to the auto-generated investment log
    description: str = ""                 # Notes / context

    category: str = "PERSONAL"           # PERSONAL | BUSINESS | FAMILY
    interest_type: str = "SIMPLE"        # SIMPLE | COMPOUND
    fixed_valuation: Optional[float] = None # Manual override for live valuation
    card_number: Optional[str] = "1"      # Reference number or multiplier
    payments: List[dict] = []             # List of {term_number, amount, date, source_id, source_name, comment}

class CardItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    account_name: str
    description: str
    credit_limit: Optional[float] = 0.0
    last_updated: str
    payments: List[dict] = [] # List of {term_number, amount, date, source_id, source_name}

class HealthHabit(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    duration: int = 0
    type: str = "Daily" # Daily, Weekly, Monthly, Yearly
    frequency_days: Optional[List[str]] = [] # Days of week e.g. ["Monday", "Tuesday"]
    status: str = "ACTIVE" # ACTIVE, ARCHIVED

class HealthLog(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    habit_id: str
    date: str # YYYY-MM-DD
    completed: bool = True

# --- AUTH & RBAC SCHEMAS ---

class PermissionSchema(BaseModel):
    module_name: str
    can_view: bool = False
    can_create: bool = False
    can_edit: bool = False
    can_delete: bool = False

class RoleSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    role_name: str
    permissions: List[PermissionSchema] = []

class UserSchema(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    username: str
    password: Optional[str] = None # Only for input
    mobile: Optional[str] = None
    role_id: Optional[str] = None
    status: str = "ACTIVE" # ACTIVE, DISABLED

class UserResponse(BaseModel):
    id: str = Field(None, alias="_id")
    username: str
    mobile: Optional[str] = None
    role: Optional[RoleSchema] = None
    status: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
