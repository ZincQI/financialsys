from app import db
from app.models import Account
from app.schemas.account_schemas import AccountCreate
from app.utils.error_handler import ResourceNotFoundError

class AccountService:
    @staticmethod
    def create_account(account_data: AccountCreate):
        """创建新科目"""
        # 验证父科目是否存在
        if account_data.parent_guid:
            parent_account = Account.query.filter_by(guid=account_data.parent_guid).first()
            if not parent_account:
                raise ResourceNotFoundError("父科目", account_data.parent_guid)
        
        # 创建科目
        account = Account(
            name=account_data.name,
            account_type=account_data.account_type,
            parent_guid=account_data.parent_guid,
            placeholder=account_data.placeholder,
            code=account_data.code
        )
        
        db.session.add(account)
        db.session.commit()
        return account
    
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
