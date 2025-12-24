from app import db
from app.models.base import BaseModel

class Account(BaseModel):
    __tablename__ = 'accounts'
    
    AccountType = db.Enum('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY', name='account_type')
    
    name = db.Column(db.String(100), nullable=False)
    account_type = db.Column(AccountType, nullable=False)
    parent_guid = db.Column(db.String(36), db.ForeignKey('accounts.guid', ondelete='SET NULL'), nullable=True)
    placeholder = db.Column(db.Boolean, default=False)
    code = db.Column(db.String(50), nullable=True)
    
    # Relationships
    parent = db.relationship('Account', remote_side='Account.guid', backref='children')
    splits = db.relationship('Split', back_populates='account', cascade='all, delete-orphan')
