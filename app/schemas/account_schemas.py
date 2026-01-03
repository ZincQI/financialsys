from pydantic import BaseModel, Field
from typing import Optional

class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    account_type: str = Field(..., pattern='^(ASSET|LIABILITY|INCOME|EXPENSE|EQUITY)$')
    parent_guid: Optional[str] = None
    placeholder: bool = False
    code: Optional[str] = None
