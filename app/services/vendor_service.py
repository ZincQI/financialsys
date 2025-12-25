from app.models import Vendor, PurchaseOrder, OrderEntry
from app import db
from datetime import datetime
import uuid

class VendorService:
    def get_all_vendors(self):
        """获取所有供应商"""
        vendors = Vendor.query.all()
        return [{
            "id": vendor.vendor_guid,
            "name": vendor.name,
            "code": vendor.vendor_code,
            "contact": vendor.contact_person,
            "phone": vendor.phone,
            "email": vendor.email,
            "address": vendor.address,
            "category": vendor.category,
            "rating": vendor.rating,
            "totalTransactions": self._get_total_transactions(vendor.vendor_guid),
            "totalAmount": self._get_total_amount(vendor.vendor_guid),
            "status": vendor.status,
            "description": vendor.description
        } for vendor in vendors]
    
    def get_vendor_by_guid(self, vendor_guid):
        """根据GUID获取供应商详情"""
        vendor = Vendor.query.filter_by(vendor_guid=vendor_guid).first()
        if not vendor:
            return None
        
        return {
            "id": vendor.vendor_guid,
            "name": vendor.name,
            "code": vendor.vendor_code,
            "contact": vendor.contact_person,
            "phone": vendor.phone,
            "email": vendor.email,
            "address": vendor.address,
            "category": vendor.category,
            "rating": vendor.rating,
            "totalTransactions": self._get_total_transactions(vendor.vendor_guid),
            "totalAmount": self._get_total_amount(vendor.vendor_guid),
            "status": vendor.status,
            "description": vendor.description
        }
    
    def create_vendor(self, vendor_data):
        """创建新供应商"""
        # Generate vendor code
        sequence = Vendor.query.count() + 1
        vendor_code = f"SUP-{sequence:03d}"
        
        vendor = Vendor(
            vendor_guid=str(uuid.uuid4()),
            vendor_code=vendor_code,
            name=vendor_data.get("name", ""),
            contact_person=vendor_data.get("contact", ""),
            phone=vendor_data.get("phone", ""),
            email=vendor_data.get("email", ""),
            address=vendor_data.get("address", ""),
            category=vendor_data.get("category", ""),
            rating=vendor_data.get("rating", 0),
            status=vendor_data.get("status", "active"),
            description=vendor_data.get("description", "")
        )
        
        db.session.add(vendor)
        db.session.commit()
        
        return {
            "id": vendor.vendor_guid,
            "name": vendor.name,
            "code": vendor.vendor_code,
            "contact": vendor.contact_person,
            "phone": vendor.phone,
            "email": vendor.email,
            "address": vendor.address,
            "category": vendor.category,
            "rating": vendor.rating,
            "totalTransactions": 0,
            "totalAmount": 0,
            "status": vendor.status,
            "description": vendor.description
        }
    
    def update_vendor(self, vendor_guid, vendor_data):
        """更新供应商信息"""
        vendor = Vendor.query.filter_by(vendor_guid=vendor_guid).first()
        if not vendor:
            return None
        
        # Update vendor fields
        vendor.name = vendor_data.get("name", vendor.name)
        vendor.contact_person = vendor_data.get("contact", vendor.contact_person)
        vendor.phone = vendor_data.get("phone", vendor.phone)
        vendor.email = vendor_data.get("email", vendor.email)
        vendor.address = vendor_data.get("address", vendor.address)
        vendor.category = vendor_data.get("category", vendor.category)
        vendor.rating = vendor_data.get("rating", vendor.rating)
        vendor.status = vendor_data.get("status", vendor.status)
        vendor.description = vendor_data.get("description", vendor.description)
        vendor.updated_at = datetime.now()
        
        db.session.commit()
        
        return {
            "id": vendor.vendor_guid,
            "name": vendor.name,
            "code": vendor.vendor_code,
            "contact": vendor.contact_person,
            "phone": vendor.phone,
            "email": vendor.email,
            "address": vendor.address,
            "category": vendor.category,
            "rating": vendor.rating,
            "totalTransactions": self._get_total_transactions(vendor.vendor_guid),
            "totalAmount": self._get_total_amount(vendor.vendor_guid),
            "status": vendor.status,
            "description": vendor.description
        }
    
    def _get_total_transactions(self, vendor_guid):
        """获取供应商交易笔数"""
        return PurchaseOrder.query.filter_by(vendor_guid=vendor_guid).count()
    
    def _get_total_amount(self, vendor_guid):
        """获取供应商交易总金额"""
        orders = PurchaseOrder.query.filter_by(vendor_guid=vendor_guid).all()
        return sum(order.total_amount for order in orders)
    
    def get_transaction_history(self, vendor_guid):
        """获取供应商交易历史"""
        orders = PurchaseOrder.query.filter_by(vendor_guid=vendor_guid).all()
        history = []
        
        for order in orders:
            items = ", ".join([item.item_description for item in order.items[:3]])
            if len(order.items) > 3:
                items += f" 等共 {len(order.items)} 项"
            
            history.append({
                "id": order.po_guid,
                "date": order.order_date.strftime("%Y-%m-%d"),
                "orderNumber": order.po_number,
                "amount": order.total_amount,
                "status": order.status,
                "items": items
            })
        
        return history
