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
    
    # Relationships
    vendor = db.relationship('Vendor')
    entries = db.relationship('OrderEntry', back_populates='order', cascade='all, delete-orphan')
