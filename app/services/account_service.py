from app import db
from app.models import Account, Split, Transaction
from app.schemas.account_schemas import AccountCreate
from app.utils.error_handler import ResourceNotFoundError
from decimal import Decimal
from datetime import date
from typing import Optional

class AccountService:
    @staticmethod
    def create_account(account_data: AccountCreate):
        """创建新科目"""
        # 验证父科目是否存在
        parent_account = None
        if account_data.parent_guid:
            parent_account = Account.query.filter_by(guid=account_data.parent_guid).first()
            if not parent_account:
                raise ResourceNotFoundError("父科目", account_data.parent_guid)
        
        # 自动生成科目代码
        code = AccountService.generate_account_code(account_data.account_type, account_data.parent_guid)
        
        # 创建科目
        account = Account(
            name=account_data.name,
            account_type=account_data.account_type,
            parent_guid=account_data.parent_guid,
            placeholder=account_data.placeholder,
            code=code
        )
        
        db.session.add(account)
        db.session.commit()
        return account
    
    @staticmethod
    def generate_account_code(account_type: str, parent_guid: Optional[str]) -> str:
        """自动生成科目代码"""
        # 科目类型前缀映射
        type_prefix = {
            "ASSET": "1",
            "LIABILITY": "2",
            "EQUITY": "3",
            "INCOME": "4",
            "EXPENSE": "5"
        }.get(account_type, "0")
        
        if parent_guid:
            # 如果是子科目，获取父科目代码并生成子代码
            parent_account = Account.query.filter_by(guid=parent_guid).first()
            if not parent_account:
                raise ResourceNotFoundError("父科目", parent_guid)
            
            # 获取该父科目下的所有子科目
            child_accounts = Account.query.filter_by(parent_guid=parent_guid).all()
            # 生成子科目代码：父科目代码 + 三位序号
            next_seq = len(child_accounts) + 1
            return f"{parent_account.code}{next_seq:03d}"
        else:
            # 如果是根科目，生成根代码：类型前缀 + 两位序号
            root_accounts = Account.query.filter_by(parent_guid=None, account_type=account_type).all()
            next_seq = len(root_accounts) + 1
            return f"{type_prefix}{next_seq:02d}"
    
    @staticmethod
    def get_account(account_guid: str):
        """根据GUID获取科目"""
        account = Account.query.filter_by(guid=account_guid).first()
        if not account:
            raise ResourceNotFoundError("科目", account_guid)
        return account
    
    @staticmethod
    def get_tree():
        """获取完整的科目树结构"""
        # 获取所有根科目（没有父科目）
        root_accounts = Account.query.filter_by(parent_guid=None).all()
        
        # 递归构建树
        def build_tree(account):
            account_dict = {
                "guid": account.guid,
                "name": account.name,
                "account_type": account.account_type,
                "parent_guid": account.parent_guid,
                "placeholder": account.placeholder,
                "code": account.code,
                "children": []
            }
            
            # 递归处理子科目
            for child in account.children:
                account_dict["children"].append(build_tree(child))
            
            return account_dict
        
        return [build_tree(account) for account in root_accounts]
    
    @staticmethod
    def get_accounts_by_type(account_type):
        """根据科目类型获取科目列表"""
        return Account.query.filter_by(account_type=account_type).all()
    
    @staticmethod
    def get_all_accounts():
        """获取所有科目列表"""
        return Account.query.all()
    
    @staticmethod
    def update_account(account_guid: str, name: str):
        """更新科目（只允许更新名称）"""
        account = Account.query.filter_by(guid=account_guid).first()
        if not account:
            raise ResourceNotFoundError("科目", account_guid)
        
        # 只允许更新名称
        account.name = name
        db.session.commit()
        return account
    
    @staticmethod
    def delete_account(account_guid: str):
        """删除科目"""
        account = Account.query.filter_by(guid=account_guid).first()
        if not account:
            raise ResourceNotFoundError("科目", account_guid)
        
        # 检查是否有子科目
        child_accounts = Account.query.filter_by(parent_guid=account_guid).all()
        if child_accounts:
            child_names = [child.name for child in child_accounts]
            raise ValueError(f"该科目下存在 {len(child_accounts)} 个子科目（{', '.join(child_names[:3])}{'...' if len(child_names) > 3 else ''}），无法删除")
        
        # 检查是否有交易关联（只检查当前科目，不包括子科目，因为子科目已经检查过了）
        if account.splits:
            raise ValueError(f"该科目下存在 {len(account.splits)} 笔关联交易，无法删除")
        
        # 删除科目
        db.session.delete(account)
        db.session.commit()
    
    @staticmethod
    def get_account_transactions(account_guid: str):
        """获取科目关联的所有交易详情（包括子科目）"""
        account = Account.query.filter_by(guid=account_guid).first()
        if not account:
            raise ResourceNotFoundError("科目", account_guid)
        
        # 递归获取所有子科目的GUID
        def get_all_descendant_guids(acc):
            guids = [acc.guid]
            for child in acc.children:
                guids.extend(get_all_descendant_guids(child))
            return guids
        
        all_account_guids = get_all_descendant_guids(account)
        
        # 查询所有相关的splits
        splits = Split.query.filter(Split.account_guid.in_(all_account_guids)).order_by(Split.created_at.desc()).all()
        
        # 构建交易详情列表
        transactions_dict = {}
        for split in splits:
            tx_guid = split.tx_guid
            if tx_guid not in transactions_dict:
                transaction = split.transaction
                transactions_dict[tx_guid] = {
                    "guid": transaction.guid,
                    "post_date": transaction.post_date.isoformat(),
                    "description": transaction.description,
                    "enter_date": transaction.enter_date.isoformat() if transaction.enter_date else None,
                    "splits": []
                }
            
            # 获取科目信息
            split_account = split.account
            transactions_dict[tx_guid]["splits"].append({
                "guid": split.guid,
                "account_guid": split.account_guid,
                "account_name": split_account.name,
                "account_code": split_account.code,
                "memo": split.memo or "",
                "amount": float(split.amount),
                "reconcile_state": split.reconcile_state or "n"
            })
        
        # 转换为列表并按日期排序
        result = list(transactions_dict.values())
        result.sort(key=lambda x: x["post_date"], reverse=True)
        
        return result
    
    @staticmethod
    def get_account_transaction_count(account_guid: str):
        """获取科目关联的交易记录数量（包括所有子科目的交易）"""
        account = Account.query.filter_by(guid=account_guid).first()
        if not account:
            raise ResourceNotFoundError("科目", account_guid)
        
        # 递归计算所有子科目的交易数量
        def count_transactions_recursive(acc):
            count = len(acc.splits)  # 当前科目的直接交易数量
            
            # 递归计算所有子科目的交易数量
            for child in acc.children:
                count += count_transactions_recursive(child)
            
            return count
        
        return count_transactions_recursive(account)
    
    @staticmethod
    def calculate_account_balance(account_guid: str, report_date: date = None):
        """计算指定科目的余额"""
        account = Account.query.filter_by(guid=account_guid).first()
        if not account:
            raise ResourceNotFoundError("科目", account_guid)
        
        # 如果有子科目，递归计算子科目余额之和
        if account.children:
            total_balance = Decimal(0)
            for child in account.children:
                total_balance += AccountService.calculate_account_balance(child.guid, report_date)
            return total_balance
        
        # 叶子节点，直接计算余额
        query = Split.query.join(Transaction).filter(Split.account_guid == account_guid)
        if report_date:
            query = query.filter(Transaction.post_date <= report_date)
        
        splits = query.all()
        balance = sum(split.amount for split in splits)
        return balance
    
    @staticmethod
    def get_tree_with_balance(report_date: date = None):
        """获取带有余额的科目树结构"""
        root_accounts = Account.query.filter_by(parent_guid=None).all()
        
        def build_tree_with_balance(account):
            balance = AccountService.calculate_account_balance(account.guid, report_date)
            
            account_dict = {
                "guid": account.guid,
                "name": account.name,
                "account_type": account.account_type,
                "parent_guid": account.parent_guid,
                "placeholder": account.placeholder,
                "code": account.code,
                "balance": float(balance),
                "children": []
            }
            
            # 递归处理子科目
            for child in account.children:
                account_dict["children"].append(build_tree_with_balance(child))
            
            return account_dict
        
        return [build_tree_with_balance(account) for account in root_accounts]
