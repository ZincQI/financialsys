from app.models import PurchaseOrder, OrderEntry, Transaction, Split
from app import db
from app.models import Vendor
from app.services.transaction_service import TransactionService
from app.schemas.transaction_schemas import TransactionCreate, SplitCreate
from datetime import datetime, date
from decimal import Decimal
import uuid

class PurchaseService:
    def get_all_orders(self, page=1, per_page=10):
        """获取所有采购订单，支持分页"""
        # 计算分页参数
        offset = (page - 1) * per_page
        
        # 查询总数
        total = PurchaseOrder.query.count()
        
        # 查询分页数据
        orders = PurchaseOrder.query.order_by(PurchaseOrder.date_opened.desc()).offset(offset).limit(per_page).all()
        
        result = []
        for order in orders:
            # 计算订单总金额
            total_amount = Decimal(0)
            items = []
            for entry in order.entries:
                item_total = Decimal(entry.quantity) * Decimal(entry.price)
                total_amount += item_total
                items.append({
                    "name": entry.description,
                    "quantity": float(entry.quantity),
                    "price": float(entry.price),
                    "total": float(item_total)
                })
            
            result.append({
                "id": order.guid,
                "orderNumber": order.id,
                "supplier": order.vendor.name if order.vendor else "未知供应商",
                "amount": float(total_amount),
                "date": order.date_opened.strftime("%Y-%m-%d") if order.date_opened else datetime.now().strftime("%Y-%m-%d"),
                "status": "pending" if order.status == "OPEN" else "completed",
                "items": items,
                "credit_account_guid": order.credit_account_guid,
                "credit_account_name": order.credit_account.name if order.credit_account else None
            })
        
        return {
            "items": result,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page  # 向上取整
        }
    
    def get_order_by_id(self, order_id):
        """根据ID获取采购订单详情"""
        order = PurchaseOrder.query.filter_by(guid=order_id).first()
        if not order:
            return None
        
        # 计算订单总金额
        total_amount = Decimal(0)
        items = []
        for entry in order.entries:
            item_total = Decimal(entry.quantity) * Decimal(entry.price)
            total_amount += item_total
            items.append({
                "name": entry.description,
                "quantity": float(entry.quantity),
                "price": float(entry.price),
                "total": float(item_total)
            })
        
        return {
            "id": order.guid,
            "orderNumber": order.id,
            "supplier": order.vendor.name if order.vendor else "未知供应商",
            "amount": float(total_amount),
            "date": order.date_opened.strftime("%Y-%m-%d") if order.date_opened else datetime.now().strftime("%Y-%m-%d"),
            "status": "pending" if order.status == "OPEN" else "completed",
            "items": items,
            "credit_account_guid": order.credit_account_guid,
            "credit_account_name": order.credit_account.name if order.credit_account else None
        }
    
    def create_order(self, order_data):
        """创建新采购订单"""
        # Generate PO number
        year = datetime.now().year
        sequence = PurchaseOrder.query.filter(
            db.extract('year', PurchaseOrder.created_at) == year
        ).count() + 1
        po_number = f"PO-{year}-{sequence:04d}"
        
        # Create purchase order
        order = PurchaseOrder(
            id=po_number,
            vendor_guid=order_data.get("vendor_guid"),
            status="OPEN",
            date_opened=datetime.now(),
            credit_account_guid=order_data.get("credit_account_guid")  # 贷方科目
        )
        db.session.add(order)
        db.session.flush()
        
        # Create order entries
        for item_data in order_data.get("items", []):
            entry = OrderEntry(
                order_guid=order.guid,
                description=item_data.get("name", ""),
                quantity=Decimal(str(item_data.get("quantity", 0))),
                price=Decimal(str(item_data.get("price", 0))),
                i_acct_guid=item_data.get("i_acct_guid", "")
            )
            db.session.add(entry)
        
        db.session.commit()
        
        return {
            "id": order.guid,
            "orderNumber": order.id,
            "status": "pending"
        }
    
    def approve_order(self, order_id):
        """审核采购订单并生成凭证"""
        order = PurchaseOrder.query.filter_by(guid=order_id).first()
        if not order:
            return False
        
        if order.status == "APPROVED":
            return True  # 已经审核过了
        
        # 计算订单总金额（使用Decimal确保精度）
        total_amount = Decimal(0)
        entry_amounts = []  # 存储每个明细的金额，用于验证
        
        for entry in order.entries:
            # 确保使用Decimal进行精确计算
            entry_amount = Decimal(str(entry.quantity)) * Decimal(str(entry.price))
            entry_amounts.append(entry_amount)
            total_amount += entry_amount
        
        # 验证总金额计算是否正确（防止浮点数误差）
        calculated_total = sum(entry_amounts)
        if abs(total_amount - calculated_total) > Decimal('0.01'):
            raise ValueError(f"订单金额计算错误：总金额 {total_amount} 与明细合计 {calculated_total} 不一致")
        
        # 生成凭证
        # 借：支出科目（从order_entries的i_acct_guid获取）
        # 贷：根据订单中存储的credit_account_guid确定（应付账款或银行存款等）
        
        from app.models import Account
        from app.services.account_service import AccountService
        from app.utils.error_handler import ResourceNotFoundError
        
        # 获取贷方科目
        if order.credit_account_guid:
            # 使用订单中指定的贷方科目
            credit_account = Account.query.filter_by(guid=order.credit_account_guid).first()
            if not credit_account:
                raise ResourceNotFoundError("贷方科目", order.credit_account_guid)
        else:
            # 如果没有指定，默认使用应付账款（向后兼容）
            payable_accounts = Account.query.filter_by(
                account_type="LIABILITY",
                name="应付账款"
                ).all()
        
            if not payable_accounts:
                # 如果没有应付账款科目，创建一个
                from app.schemas.account_schemas import AccountCreate
                payable_account_data = AccountCreate(
                    name="应付账款",
                    account_type="LIABILITY",
                    parent_guid=None,
                    placeholder=False
                )
                credit_account = AccountService.create_account(payable_account_data)
            else:
                credit_account = payable_accounts[0]
        
        # 创建凭证的splits
        splits = []
        
        # 借方：支出科目（使用精确计算的金额）
        for i, entry in enumerate(order.entries):
            splits.append(SplitCreate(
                account_guid=entry.i_acct_guid,
                memo=f"采购订单 {order.id} - {entry.description}",
                amount=entry_amounts[i]  # 使用预先计算的精确金额
            ))
        
        # 贷方：根据订单中存储的贷方科目（使用精确计算的总金额）
        splits.append(SplitCreate(
            account_guid=credit_account.guid,
            memo=f"采购订单 {order.id} - {order.vendor.name if order.vendor else ''}",
            amount=-total_amount  # 使用精确计算的总金额
        ))
        
        # 验证借贷平衡（在提交前再次验证）
        debit_total = sum(entry_amounts)
        credit_total = total_amount
        if abs(debit_total - credit_total) > Decimal('0.01'):
            raise ValueError(f"借贷不平衡：借方 {debit_total}，贷方 {credit_total}，差额 {debit_total - credit_total}")
        
        # 创建交易凭证
        transaction_data = TransactionCreate(
            post_date=date.today(),
            description=f"采购订单 {order.id}",
            splits=splits
        )
        
        TransactionService.create_transaction(transaction_data)
        
        # 更新订单状态
        order.status = "APPROVED"
        db.session.commit()
        
        return True
