from app import db
from app.models.base import BaseModel
from datetime import datetime

class Transaction(BaseModel):
    __tablename__ = 'transactions'
    
    post_date = db.Column(db.Date, nullable=False)
    enter_date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String(255), nullable=False)
    # currency_guid = db.Column(db.String(36), db.ForeignKey('commodities.guid'), nullable=True)
    
    # Relationships
    splits = db.relationship('Split', back_populates='transaction', cascade='all, delete-orphan')
