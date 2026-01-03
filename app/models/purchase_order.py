from app import db
from app.models.base import BaseModel
from datetime import datetime

class PurchaseOrder(BaseModel):
    __tablename__ = 'purchase_orders'
    
    OrderStatus = db.Enum('OPEN', 'APPROVED', name='order_status')
    
    id = db.Column(db.String(50), nullable=False)  # PO-2023xxxx
    vendor_guid = db.Column(db.String(36), db.ForeignKey('vendors.guid'), nullable=False)
    status = db.Column(OrderStatus, default='OPEN', nullable=False)
    date_opened = db.Column(db.DateTime, default=datetime.utcnow)
    credit_account_guid = db.Column(db.String(36), db.ForeignKey('accounts.guid'), nullable=True)  # 贷方科目（应付账款或银行存款等）
    
    # Relationships
    vendor = db.relationship('Vendor')
    credit_account = db.relationship('Account', foreign_keys=[credit_account_guid])
    entries = db.relationship('OrderEntry', back_populates='order', cascade='all, delete-orphan')
