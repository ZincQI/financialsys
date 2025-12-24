from pydantic import BaseModel, Field, UUID4
from typing import List, Optional
from decimal import Decimal
from datetime import date

class SplitCreate(BaseModel):
    account_guid: str
    memo: Optional[str] = None
    amount: Decimal = Field(..., gt=Decimal('-99999999.99'), lt=Decimal('99999999.99'))

class TransactionCreate(BaseModel):
    post_date: date
    description: str = Field(..., min_length=1, max_length=255)
    splits: List[SplitCreate] = Field(..., min_items=2)

class SplitResponse(BaseModel):
    guid: str
    account_guid: str
    memo: Optional[str]
    amount: Decimal
    reconcile_state: str
    
    class Config:
        from_attributes = True

class TransactionResponse(BaseModel):
    guid: str
    post_date: date
    description: str
    splits: List[SplitResponse]
    
    class Config:
        from_attributes = True
