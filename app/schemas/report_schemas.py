from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal

class ReportAccount(BaseModel):
    guid: str
    name: str
    account_type: str
    balance: Decimal
    children: List['ReportAccount'] = []

# Update forward references
ReportAccount.model_rebuild()

class BalanceSheetResponse(BaseModel):
    assets: List[ReportAccount]
    liabilities: List[ReportAccount]
    equity: List[ReportAccount]
    total_assets: Decimal
    total_liabilities: Decimal
    total_equity: Decimal

class IncomeStatementResponse(BaseModel):
    income: List[ReportAccount]
    expenses: List[ReportAccount]
    total_income: Decimal
    total_expenses: Decimal
    net_income: Decimal
