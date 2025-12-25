from app import db
from app.models import Account
from app.schemas.account_schemas import AccountCreate
from app.utils.error_handler import ResourceNotFoundError

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
    def generate_account_code(account_type: str, parent_guid: str | None) -> str:
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
    def delete_account(account_guid: str):
        """删除科目"""
        account = Account.query.filter_by(guid=account_guid).first()
        if not account:
            raise ResourceNotFoundError("科目", account_guid)
        
        # 检查是否有子科目
        child_accounts = Account.query.filter_by(parent_guid=account_guid).all()
        if child_accounts:
            raise ValueError("该科目下存在子科目，无法删除")
        
        # 检查是否有交易关联
        if account.splits:
            raise ValueError("该科目下存在关联交易，无法删除")
        
        # 删除科目
        db.session.delete(account)
        db.session.commit()
    
    @staticmethod
    def get_account_transaction_count(account_guid: str):
        """获取科目关联的交易记录数量"""
        account = Account.query.filter_by(guid=account_guid).first()
        if not account:
            raise ResourceNotFoundError("科目", account_guid)
        
        # 直接通过splits关系获取交易记录数量
        return len(account.splits)
