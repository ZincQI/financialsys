import pytest
from app import create_app, db
from app.models import Account

@pytest.fixture
def app():
    """创建测试应用"""
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # 使用内存数据库
    
    with app.app_context():
        db.create_all()
        # 初始化测试数据
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """创建测试客户端"""
    return app.test_client()

@pytest.fixture
def init_accounts(app):
    """初始化测试科目"""
    with app.app_context():
        # 创建基本科目
        cash_account = Account(
            name="库存现金",
            account_type="ASSET",
            code="1001"
        )
        
        bank_account = Account(
            name="银行存款",
            account_type="ASSET",
            code="1002"
        )
        
        income_account = Account(
            name="主营业务收入",
            account_type="INCOME",
            code="6001"
        )
        
        expense_account = Account(
            name="管理费用",
            account_type="EXPENSE",
            code="6602"
        )
        
        db.session.add_all([cash_account, bank_account, income_account, expense_account])
        db.session.commit()
        
        return {
            "cash_guid": cash_account.guid,
            "bank_guid": bank_account.guid,
            "income_guid": income_account.guid,
            "expense_guid": expense_account.guid
        }
