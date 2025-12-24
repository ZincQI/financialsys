from app import db
from app.models.base import BaseModel
from decimal import Decimal

class OrderEntry(BaseModel):
    __tablename__ = 'order_entries'
    
    order_guid = db.Column(db.String(36), db.ForeignKey('purchase_orders.guid', ondelete='CASCADE'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.DECIMAL(10, 2), nullable=False)
    price = db.Column(db.DECIMAL(10, 2), nullable=False)
    i_acct_guid = db.Column(db.String(36), db.ForeignKey('accounts.guid'), nullable=False)  # 预设支出科目
    
    # Relationships
    order = db.relationship('PurchaseOrder', back_populates='entries')
    account = db.relationship('Account')
