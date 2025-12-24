from app import db
from app.models import Account, Split, Transaction
from decimal import Decimal, ROUND_HALF_UP
from datetime import date

class ReportService:
    @staticmethod
    def calculate_account_balance(account_guid: str, report_date: date):
        """计算指定科目在指定日期的余额"""
        # 查询该科目下所有在report_date之前或当天的split
        splits = Split.query.join(Transaction).filter(
            Split.account_guid == account_guid,
            Transaction.post_date <= report_date
        ).all()
        
        # 计算余额
        balance = sum(split.amount for split in splits)
        return balance
    
    @staticmethod
    def build_account_tree_with_balance(report_date: date, account_type: str = None):
        """构建带有余额的科目树"""
        # 获取所有科目
        query = Account.query
        if account_type:
            query = query.filter_by(account_type=account_type)
        
        all_accounts = query.all()
        
        # 创建科目字典，便于快速查找
        account_dict = {account.guid: account for account in all_accounts}
        
        # 构建树结构
        def build_tree_with_balance(account):
            """递归构建带有余额的科目树"""
            # 计算当前科目余额
            balance = Decimal(0)
            
            # 如果是叶子节点，直接计算余额
            if not account.children:
                balance = ReportService.calculate_account_balance(account.guid, report_date)
            else:
                # 如果是父节点，递归计算所有子节点的余额之和
                for child in account.children:
                    child_tree = build_tree_with_balance(child)
                    balance += child_tree["balance"]
            
            # 创建科目树节点
            account_tree = {
                "guid": account.guid,
                "name": account.name,
                "account_type": account.account_type,
                "balance": balance,
                "children": []
            }
            
            # 添加子节点
            for child in account.children:
                child_tree = build_tree_with_balance(child)
                account_tree["children"].append(child_tree)
            
            return account_tree
        
        # 只返回根科目
        root_accounts = [account for account in all_accounts if account.parent_guid is None]
        if account_type:
            root_accounts = [account for account in root_accounts if account.account_type == account_type]
        
        return [build_tree_with_balance(account) for account in root_accounts]
    
    @staticmethod
    def get_balance_sheet(report_date: date):
        """生成资产负债表"""
        assets = ReportService.build_account_tree_with_balance(report_date, "ASSET")
        liabilities = ReportService.build_account_tree_with_balance(report_date, "LIABILITY")
        equity = ReportService.build_account_tree_with_balance(report_date, "EQUITY")
        
        # 计算总计
        def sum_total(accounts):
            total = Decimal(0)
            for account in accounts:
                total += account["balance"]
            return total
        
        total_assets = sum_total(assets)
        total_liabilities = sum_total(liabilities)
        total_equity = sum_total(equity)
        
        return {
            "assets": assets,
            "liabilities": liabilities,
            "equity": equity,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "total_equity": total_equity
        }
    
    @staticmethod
    def get_income_statement(start_date: date, end_date: date):
        """生成利润表"""
        # 查询指定日期范围内的所有交易
        transactions = Transaction.query.filter(
            Transaction.post_date >= start_date,
            Transaction.post_date <= end_date
        ).all()
        
        # 计算收入和费用
        income = Decimal(0)
        expenses = Decimal(0)
        
        for transaction in transactions:
            for split in transaction.splits:
                if split.account.account_type == "INCOME":
                    income += split.amount
                elif split.account.account_type == "EXPENSE":
                    expenses += split.amount
        
        net_income = income - expenses
        
        # 构建收入和费用的科目树
        income_accounts = ReportService.build_account_tree_with_balance(end_date, "INCOME")
        expense_accounts = ReportService.build_account_tree_with_balance(end_date, "EXPENSE")
        
        # 只保留指定日期范围内的余额变化
        # TODO: 需要进一步优化，只计算指定日期范围内的余额变化
        
        return {
            "income": income_accounts,
            "expenses": expense_accounts,
            "total_income": income,
            "total_expenses": expenses,
            "net_income": net_income
        }
