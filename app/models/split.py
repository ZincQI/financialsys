from app import db
from app.models.base import BaseModel
from decimal import Decimal

class Split(BaseModel):
    __tablename__ = 'splits'
    
    tx_guid = db.Column(db.String(36), db.ForeignKey('transactions.guid', ondelete='CASCADE'), nullable=False)
    account_guid = db.Column(db.String(36), db.ForeignKey('accounts.guid'), nullable=False)
    memo = db.Column(db.String(255), nullable=True)
    value_num = db.Column(db.BigInteger, nullable=False)
    value_denom = db.Column(db.BigInteger, nullable=False, default=100)
    reconcile_state = db.Column(db.CHAR(1), default='n')  # n=未对账, y=已对账
    
    # Relationships
    transaction = db.relationship('Transaction', back_populates='splits')
    account = db.relationship('Account', back_populates='splits')
    
    @property
    def amount(self):
        """将分子分母转换为Decimal金额"""
        return Decimal(self.value_num) / Decimal(self.value_denom)
    
    @amount.setter
    def amount(self, value):
        """将Decimal金额转换为分子分母"""
        from app.utils.math_utils import decimal_to_fraction
        num, denom = decimal_to_fraction(value)
        self.value_num = num
        self.value_denom = denom
