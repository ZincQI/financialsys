from pydantic import BaseModel, Field
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
