from pydantic import BaseModel, Field
from typing import List, Optional

class AccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    account_type: str = Field(..., pattern='^(ASSET|LIABILITY|INCOME|EXPENSE|EQUITY)$')
    parent_guid: Optional[str] = None
    placeholder: bool = False
    code: Optional[str] = None

class AccountResponse(BaseModel):
    guid: str
    name: str
    account_type: str
    parent_guid: Optional[str]
    placeholder: bool
    code: Optional[str]
    
    class Config:
        from_attributes = True

class AccountTreeResponse(AccountResponse):
    children: List['AccountTreeResponse'] = []
    
    class Config:
        from_attributes = True

# Update forward references
AccountTreeResponse.model_rebuild()
