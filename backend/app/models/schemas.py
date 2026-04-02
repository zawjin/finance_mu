from pydantic import BaseModel, Field
from typing import List, Optional

class SpendingItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    date: str # ISO Format YYYY-MM-DD
    amount: float
    category: str
    sub_category: str
    description: str # The 'Details' field

class InvestmentItem(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    type: str # Gold, Property, Cash, etc.
    name: str # The asset title
    value: float
    date: str
    details: str # Historical or metadata

class CategorySchema(BaseModel):
    name: str
    sub_categories: List[str] = []
    icon: Optional[str] = "Package"
    color: Optional[str] = "#0071e3"
