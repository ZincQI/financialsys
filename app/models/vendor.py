from app import db
from app.models.base import BaseModel

class Vendor(BaseModel):
    __tablename__ = 'vendors'
    
    name = db.Column(db.String(100), nullable=False)
    id = db.Column(db.String(50), nullable=True)  # 编号
    address_phone = db.Column(db.String(255), nullable=True)
