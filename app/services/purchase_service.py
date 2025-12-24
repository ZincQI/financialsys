from app import db
from app.models import PurchaseOrder, Transaction, Split
from app.utils.error_handler import ResourceNotFoundError
from decimal import Decimal

class PurchaseService:
    @staticmethod
    def approve_order(order_guid: str):
        """审批采购订单，自动生成交易"""
        # 1. 获取订单
        order = PurchaseOrder.query.filter_by(guid=order_guid).first()
        if not order:
            raise ResourceNotFoundError("采购订单", order_guid)
        
        # 2. 检查订单状态
        if order.status == "APPROVED":
            raise ValueError("订单已审批")
        
        # 3. 开始数据库事务
        with db.session.begin_nested():
            # 4. 更新订单状态
            order.status = "APPROVED"
            db.session.add(order)
            
            # 5. 计算订单总金额
            total_amount = sum(entry.quantity * entry.price for entry in order.entries)
            
            # 6. 创建Transaction
            transaction = Transaction(
                post_date=order.date_opened.date(),
                description=f"采购订单 {order.id}"
            )
            db.session.add(transaction)
            db.session.flush()  # 获取transaction.guid
            
            # 7. 创建Splits
            for entry in order.entries:
                # 借方：支出科目
                split_debit = Split(
                    tx_guid=transaction.guid,
                    account_guid=entry.i_acct_guid,
                    memo=f"采购 {entry.description}",
                    value_num=0,
                    value_denom=100
                )
                split_debit.amount = entry.quantity * entry.price
                db.session.add(split_debit)
            
            # 8. 贷方：应付账款-供应商（这里简化处理，假设使用一个固定科目）
            # TODO: 实际应根据供应商关联的应付科目来设置
            split_credit = Split(
                tx_guid=transaction.guid,
                account_guid="应付账款科目GUID",  # 这里需要替换为实际的应付账款科目GUID
                memo=f"应付供应商 {order.vendor.name}",
                value_num=0,
                value_denom=100
            )
            split_credit.amount = -total_amount
            db.session.add(split_credit)
        
        # 9. 提交事务
        db.session.commit()
        return transaction
    
    @staticmethod
    def get_order(order_guid: str):
        """根据GUID获取采购订单"""
        order = PurchaseOrder.query.filter_by(guid=order_guid).first()
        if not order:
            raise ResourceNotFoundError("采购订单", order_guid)
        return order
