from app.models import PurchaseOrder, OrderEntry
from app import db
from app.models import Vendor
from datetime import datetime
import uuid

class PurchaseService:
    def get_all_orders(self):
        """获取所有采购订单"""
        orders = PurchaseOrder.query.all()
        return [{
            "id": order.po_guid,
            "orderNumber": order.po_number,
            "supplier": order.vendor.name if order.vendor else "",
            "amount": order.total_amount,
            "date": order.order_date.strftime("%Y-%m-%d"),
            "status": order.status,
            "items": [
                {
                    "name": item.item_description,
                    "quantity": item.quantity,
                    "price": item.unit_price,
                    "total": item.line_total
                }
                for item in order.items
            ]
        } for order in orders]
    
    def get_order_by_id(self, order_id):
        """根据ID获取采购订单详情"""
        order = PurchaseOrder.query.filter_by(po_guid=order_id).first()
        if not order:
            return None
        
        return {
            "id": order.po_guid,
            "orderNumber": order.po_number,
            "supplier": order.vendor.name if order.vendor else "",
            "amount": order.total_amount,
            "date": order.order_date.strftime("%Y-%m-%d"),
            "status": order.status,
            "items": [
                {
                    "name": item.item_description,
                    "quantity": item.quantity,
                    "price": item.unit_price,
                    "total": item.line_total
                }
                for item in order.items
            ]
        }
    
    def create_order(self, order_data):
        """创建新采购订单"""
        # Generate PO number
        year = datetime.now().year
        month = datetime.now().month
        sequence = PurchaseOrder.query.filter(
            db.extract('year', PurchaseOrder.created_at) == year,
            db.extract('month', PurchaseOrder.created_at) == month
        ).count() + 1
        po_number = f"PO-{year}-{sequence:04d}"
        
        # Create purchase order
        order = PurchaseOrder(
            po_guid=str(uuid.uuid4()),
            po_number=po_number,
            vendor_guid=order_data.get("vendor_id"),
            order_date=datetime.strptime(order_data.get("order_date"), "%Y-%m-%d"),
            total_amount=order_data.get("total_amount", 0),
            status="pending",
            notes=order_data.get("notes", "")
        )
        db.session.add(order)
        db.session.flush()
        
        # Create order entries
        for item_data in order_data.get("items", []):
            item = OrderEntry(
                entry_guid=str(uuid.uuid4()),
                po_guid=order.po_guid,
                item_description=item_data.get("name"),
                quantity=item_data.get("quantity", 0),
                unit_price=item_data.get("price", 0),
                line_total=item_data.get("total", 0)
            )
            db.session.add(item)
        
        db.session.commit()
        
        return {
            "id": order.po_guid,
            "orderNumber": order.po_number,
            "status": order.status
        }
    
    def approve_order(self, order_id):
        """审核采购订单"""
        order = PurchaseOrder.query.filter_by(po_guid=order_id).first()
        if not order:
            return False
        
        order.status = "completed"
        order.approved_at = datetime.now()
        db.session.commit()
        return True
