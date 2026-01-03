from decimal import Decimal
from typing import Any, Dict, List, Optional

from app import db
from app.models import OrderEntry, PurchaseOrder, Vendor


class VendorService:
    """供应商相关业务逻辑"""

    def _serialize_vendor(self, vendor: Vendor) -> Dict[str, Any]:
        guid = vendor.guid
        total_transactions = self._get_total_transactions(guid)
        total_amount = self._get_total_amount(guid)
        
        return {
            "id": guid,
            "name": vendor.name,
            "code": vendor.code,
            "contact": vendor.contact,
            "phone": vendor.phone,
            "email": vendor.email,
            "address": vendor.address,
            "category": vendor.category,
            "rating": vendor.rating or 0,
            "totalTransactions": total_transactions,
            "totalAmount": float(total_amount),
            "status": vendor.status,
            "description": vendor.description or "",
        }
    
    def get_all_vendors(self) -> List[Dict[str, Any]]:
        """获取所有供应商（用于左侧列表）"""
        vendors = Vendor.query.order_by(Vendor.created_at.desc()).all()
        return [self._serialize_vendor(vendor) for vendor in vendors]

    def get_vendor_by_guid(self, vendor_guid: str) -> Optional[Dict[str, Any]]:
        """根据 GUID 获取供应商详情"""
        vendor = Vendor.query.filter_by(guid=vendor_guid).first()
        if not vendor:
            return None
        return self._serialize_vendor(vendor)

    def create_vendor(self, vendor_data: Dict[str, Any]) -> Dict[str, Any]:
        """创建新供应商"""
        sequence = Vendor.query.count() + 1
        vendor_code = f"SUP-{sequence:03d}"
        
        vendor = Vendor(
            name=vendor_data.get("name", ""),
            code=vendor_data.get("code") or vendor_code,
            contact=vendor_data.get("contact", ""),
            phone=vendor_data.get("phone", ""),
            email=vendor_data.get("email", ""),
            address=vendor_data.get("address", ""),
            category=vendor_data.get("category", ""),
            rating=vendor_data.get("rating", 5),
            status=vendor_data.get("status", "active"),
            description=vendor_data.get("description", ""),
        )
        
        db.session.add(vendor)
        db.session.commit()
        
        return self._serialize_vendor(vendor)

    def update_vendor(self, vendor_guid: str, vendor_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """更新供应商信息"""
        vendor = Vendor.query.filter_by(guid=vendor_guid).first()
        if not vendor:
            return None
        
        vendor.name = vendor_data.get("name", vendor.name)
        vendor.code = vendor_data.get("code", vendor.code)
        vendor.contact = vendor_data.get("contact", vendor.contact)
        vendor.phone = vendor_data.get("phone", vendor.phone)
        vendor.email = vendor_data.get("email", vendor.email)
        vendor.address = vendor_data.get("address", vendor.address)
        vendor.category = vendor_data.get("category", vendor.category)
        vendor.rating = vendor_data.get("rating", vendor.rating)
        vendor.status = vendor_data.get("status", vendor.status)
        vendor.description = vendor_data.get("description", vendor.description)
        
        db.session.commit()
        
        return self._serialize_vendor(vendor)
    
    def _get_total_transactions(self, vendor_guid: str) -> int:
        """获取供应商交易笔数（关联采购订单数）"""
        return PurchaseOrder.query.filter_by(vendor_guid=vendor_guid).count()
    
    def _get_total_amount(self, vendor_guid: str) -> Decimal:
        """获取供应商交易总金额（按采购订单明细汇总）"""
        orders = PurchaseOrder.query.filter_by(vendor_guid=vendor_guid).all()
        total = Decimal("0")

        for order in orders:
            # 使用订单下的明细行计算总金额：sum(quantity * price)
            for entry in order.entries:  # type: ignore[attr-defined]
                if isinstance(entry.quantity, Decimal) and isinstance(entry.price, Decimal):
                    total += entry.quantity * entry.price
                else:
                    total += Decimal(str(entry.quantity)) * Decimal(str(entry.price))

        return total
    
    def get_transaction_history(self, vendor_guid: str) -> List[Dict[str, Any]]:
        """获取供应商交易历史（用于“交易历史”标签页）"""
        orders = (
            PurchaseOrder.query.filter_by(vendor_guid=vendor_guid)
            .order_by(PurchaseOrder.date_opened.desc())
            .all()
        )

        history: List[Dict[str, Any]] = []
        
        for order in orders:
            # 取前 3 条明细的描述拼接
            entries: List[OrderEntry] = getattr(order, "entries", [])  # type: ignore[assignment]
            first_entries = entries[:3]
            items = ", ".join(entry.description for entry in first_entries)
            if len(entries) > 3:
                items += f" 等共 {len(entries)} 项"

            # 计算该订单金额
            amount = Decimal("0")
            for entry in entries:
                amount += Decimal(str(entry.quantity)) * Decimal(str(entry.price))
            
            history.append(
                {
                    "id": order.guid,
                    "date": order.date_opened.strftime("%Y-%m-%d"),
                    "orderNumber": order.id,
                    "amount": float(amount),
                    "status": "pending" if order.status == "OPEN" else "completed",
                    "items": items,
                }
            )
        
        return history
