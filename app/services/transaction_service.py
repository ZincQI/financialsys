from app import db
from app.models import Transaction, Split
from app.schemas.transaction_schemas import TransactionCreate
from app.utils.error_handler import AccountingBalanceError, ResourceNotFoundError
from decimal import Decimal

class TransactionService:
    @staticmethod
    def create_transaction(transaction_data: TransactionCreate):
        """创建交易，包含借贷平衡校验和原子性保存"""
        # 1. 验证余额是否平衡
        total_amount = sum(split.amount for split in transaction_data.splits)
        # 允许极小的误差（1e-9）
        if abs(total_amount) > Decimal('1e-9'):
            raise AccountingBalanceError(f"借贷不平衡，差额为：{total_amount}")
        
        # 2. 开始数据库事务
        with db.session.begin_nested():
            # 3. 创建Transaction
            transaction = Transaction(
                post_date=transaction_data.post_date,
                description=transaction_data.description
            )
            db.session.add(transaction)
            db.session.flush()  # 获取transaction.guid
            
            # 4. 创建Splits
            for split_data in transaction_data.splits:
                split = Split(
                    tx_guid=transaction.guid,
                    account_guid=split_data.account_guid,
                    memo=split_data.memo,
                    value_num=0,  # 将在amount setter中设置
                    value_denom=100
                )
                split.amount = split_data.amount  # 使用setter自动转换分子分母
                db.session.add(split)
        
        # 5. 提交事务
        db.session.commit()
        return transaction
    
    @staticmethod
    def get_transaction(transaction_guid: str):
        """根据GUID获取交易"""
        transaction = Transaction.query.filter_by(guid=transaction_guid).first()
        if not transaction:
            raise ResourceNotFoundError("交易", transaction_guid)
        return transaction
    
    @staticmethod
    def get_transactions(start_date=None, end_date=None):
        """获取交易列表，支持日期范围筛选"""
        query = Transaction.query
        if start_date:
            query = query.filter(Transaction.post_date >= start_date)
        if end_date:
            query = query.filter(Transaction.post_date <= end_date)
        return query.order_by(Transaction.post_date.desc()).all()
