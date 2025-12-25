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
    
    @staticmethod
    def get_dashboard_data():
        """获取仪表盘数据"""
        today = date.today()
        
        # 计算当前月份
        current_month = today.month
        current_year = today.year
        
        # 计算上个月
        if current_month == 1:
            previous_month = 12
            previous_year = current_year - 1
        else:
            previous_month = current_month - 1
            previous_year = current_year
        
        # 获取资产负债表数据
        balance_sheet = ReportService.get_balance_sheet(today)
        
        # 计算现金及等价物
        # 假设现金及等价物是资产类科目下的特定科目
        cash_and_equivalents = Decimal(0)
        for asset in balance_sheet["assets"]:
            if asset["name"] == "流动资产":
                for child in asset["children"]:
                    if child["name"] in ["库存现金", "银行存款", "其他货币资金"]:
                        cash_and_equivalents += child["balance"]
        
        # 计算应付账款
        accounts_payable = Decimal(0)
        for liability in balance_sheet["liabilities"]:
            if liability["name"] == "流动负债":
                for child in liability["children"]:
                    if child["name"] == "应付账款":
                        accounts_payable += child["balance"]
        
        # 计算本月净利润
        # 获取本月的开始和结束日期
        start_of_month = date(current_year, current_month, 1)
        end_of_month = today
        
        # 获取本月的利润表数据
        income_statement = ReportService.get_income_statement(start_of_month, end_of_month)
        net_income = income_statement["net_income"]
        
        # 获取上个月的利润表数据
        if current_month == 1:
            start_of_last_month = date(previous_year, previous_month, 1)
            end_of_last_month = date(previous_year, previous_month, 31)
        else:
            start_of_last_month = date(previous_year, previous_month, 1)
            end_of_last_month = date(previous_year, previous_month, 30)
        
        last_month_income_statement = ReportService.get_income_statement(start_of_last_month, end_of_last_month)
        last_month_net_income = last_month_income_statement["net_income"]
        
        # 计算增长率
        def calculate_growth_rate(current, previous):
            if previous == 0:
                return 0
            return ((current - previous) / previous) * 100
        
        # 计算现金及等价物的增长率
        # 假设现金及等价物是资产类科目下的特定科目
        cash_and_equivalents_last_month = Decimal(0)
        last_month_balance_sheet = ReportService.get_balance_sheet(end_of_last_month)
        for asset in last_month_balance_sheet["assets"]:
            if asset["name"] == "流动资产":
                for child in asset["children"]:
                    if child["name"] in ["库存现金", "银行存款", "其他货币资金"]:
                        cash_and_equivalents_last_month += child["balance"]
        
        cash_growth_rate = calculate_growth_rate(cash_and_equivalents, cash_and_equivalents_last_month)
        net_income_growth_rate = calculate_growth_rate(net_income, last_month_net_income)
        
        # 计算应付账款的增长率
        accounts_payable_last_month = Decimal(0)
        for liability in last_month_balance_sheet["liabilities"]:
            if liability["name"] == "流动负债":
                for child in liability["children"]:
                    if child["name"] == "应付账款":
                        accounts_payable_last_month += child["balance"]
        
        accounts_payable_growth_rate = calculate_growth_rate(accounts_payable, accounts_payable_last_month)
        
        # 获取近6个月的资金流向数据
        months = []
        cash_flow = []
        
        # 计算近6个月的月份
        for i in range(5, -1, -1):
            month = current_month - i
            year = current_year
            if month <= 0:
                month += 12
                year -= 1
            
            # 获取当月的现金及等价物余额
            month_end = date(year, month, 28)
            month_balance_sheet = ReportService.get_balance_sheet(month_end)
            month_cash = Decimal(0)
            for asset in month_balance_sheet["assets"]:
                if asset["name"] == "流动资产":
                    for child in asset["children"]:
                        if child["name"] in ["库存现金", "银行存款", "其他货币资金"]:
                            month_cash += child["balance"]
            
            # 获取月份名称
            month_names = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
            months.append(month_names[month - 1])
            cash_flow.append(month_cash)
        
        # 构建近6个月资金流向数据
        cash_flow_data = [
            {"month": month, "amount": float(amount)} for month, amount in zip(months, cash_flow)
        ]
        
        # 待办任务数据（模拟数据）
        todo_items = [
            {"id": 1, "type": "approval", "title": "待审核采购订单 #PO-2024-1156", "deadline": "今天 17:00", "urgent": True},
            {"id": 2, "type": "entry", "title": "12月工资发放凭证待录入", "deadline": "明天", "urgent": False},
            {"id": 3, "type": "review", "title": "第四季度财务报表待复核", "deadline": "本周五", "urgent": False},
            {"id": 4, "type": "payment", "title": "应付供应商款项到期提醒", "deadline": "12月28日", "urgent": True},
        ]
        
        return {
            "cash_and_equivalents": cash_and_equivalents,
            "cash_growth_rate": cash_growth_rate,
            "net_income": net_income,
            "net_income_growth_rate": net_income_growth_rate,
            "accounts_payable": accounts_payable,
            "accounts_payable_growth_rate": accounts_payable_growth_rate,
            "cash_flow_data": cash_flow_data,
            "todo_items": todo_items
        }
