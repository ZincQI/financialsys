from app import db
from app.models import Account, Split, Transaction
from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from calendar import monthrange

class ReportService:
    @staticmethod
    def calculate_account_balance(account_guid: str, report_date: date = None):
        """计算指定科目在指定日期的余额
        
        Args:
            account_guid: 科目GUID
            report_date: 报告日期，如果为None则计算所有交易的余额（不进行日期过滤）
        """
        # 如果report_date为None，不进行日期过滤，计算所有交易
        if report_date is None:
            splits = Split.query.filter(
                Split.account_guid == account_guid
            ).all()
        else:
            # 查询该科目下所有在report_date之前或当天的split
            splits = Split.query.join(Transaction).filter(
                Split.account_guid == account_guid,
                Transaction.post_date <= report_date
            ).all()
        
        # 计算余额
        balance = sum(split.amount for split in splits)
        return balance
    
    @staticmethod
    def build_account_tree_with_balance(report_date: date = None, account_type: str = None):
        """构建带有余额的科目树
        
        Args:
            report_date: 报告日期，如果为None则计算所有交易的余额（不进行日期过滤）
            account_type: 科目类型过滤
        """
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
            # 注意：无论是否有子科目，都要计算父科目本身的splits余额
            # 因为父科目可能既有自己的splits，又有子科目
            balance = ReportService.calculate_account_balance(account.guid, report_date)
            
            # 如果有子节点，递归计算所有子节点的余额并累加
            if account.children:
                for child in account.children:
                    child_tree = build_tree_with_balance(child)
                    balance += child_tree["balance"]
            
            # 创建科目树节点
            account_tree = {
                "guid": account.guid,
                "name": account.name,
                "account_type": account.account_type,
                "balance": balance,
                "code": account.code or "",
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
    def get_balance_sheet(report_date: date = None):
        """生成资产负债表
        
        Args:
            report_date: 报告日期，如果为None则计算所有交易的余额（不进行日期过滤）
        """
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
        
        # 转换Decimal为float，并确保数据结构正确
        def convert_tree(node):
            """递归转换树节点"""
            return {
                "guid": node["guid"],
                "name": node["name"],
                "account_type": node["account_type"],
                "balance": float(node["balance"]),
                "code": node.get("code", ""),
                "children": [convert_tree(child) for child in node.get("children", [])]
            }
        
        return {
            "assets": [convert_tree(asset) for asset in assets],
            "liabilities": [convert_tree(liability) for liability in liabilities],
            "equity": [convert_tree(eq) for eq in equity],
            "total_assets": float(total_assets),
            "total_liabilities": float(total_liabilities),
            "total_equity": float(total_equity)
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
        # 注意：收入类科目余额是负数（贷方），费用类科目余额是正数（借方）
        income = Decimal(0)
        expenses = Decimal(0)
        
        for transaction in transactions:
            for split in transaction.splits:
                if split.account.account_type == "INCOME":
                    # 收入是贷方，amount是负数，需要取绝对值
                    income += abs(split.amount)
                elif split.account.account_type == "EXPENSE":
                    # 费用是借方，amount是正数
                    expenses += split.amount
        
        # 净利润 = 收入 - 费用
        net_income = income - expenses
        
        # 构建收入和费用的科目树
        income_accounts = ReportService.build_account_tree_with_balance(end_date, "INCOME")
        expense_accounts = ReportService.build_account_tree_with_balance(end_date, "EXPENSE")
        
        # 只保留指定日期范围内的余额变化
        # TODO: 需要进一步优化，只计算指定日期范围内的余额变化
        
        # 转换树结构
        def convert_tree(node):
            """递归转换树节点"""
            return {
                "guid": node["guid"],
                "name": node["name"],
                "account_type": node["account_type"],
                "balance": float(node["balance"]),
                "code": node.get("code", ""),
                "children": [convert_tree(child) for child in node.get("children", [])]
            }
        
        return {
            "income": [convert_tree(inc) for inc in income_accounts],
            "expenses": [convert_tree(exp) for exp in expense_accounts],
            "total_income": float(income),
            "total_expenses": float(expenses),
            "net_income": float(net_income)
        }
    
    @staticmethod
    def get_cash_flow_statement(start_date: date, end_date: date):
        """生成现金流量表"""
        # 简化版现金流量表：基于交易记录计算
        # 实际应该根据更复杂的业务规则计算
        
        transactions = Transaction.query.filter(
            Transaction.post_date >= start_date,
            Transaction.post_date <= end_date
        ).all()
        
        # 经营活动现金流量
        operating_inflows = Decimal(0)  # 收入类科目的贷方
        operating_outflows = Decimal(0)  # 费用类科目的借方
        
        # 投资活动现金流量
        investing_inflows = Decimal(0)
        investing_outflows = Decimal(0)
        
        # 筹资活动现金流量
        financing_inflows = Decimal(0)
        financing_outflows = Decimal(0)
        
        for transaction in transactions:
            for split in transaction.splits:
                account_type = split.account.account_type
                amount = split.amount
                
                if account_type == "INCOME":
                    # 收入增加现金
                    operating_inflows += abs(amount) if amount > 0 else 0
                elif account_type == "EXPENSE":
                    # 费用减少现金
                    operating_outflows += abs(amount) if amount < 0 else 0
                elif account_type == "ASSET":
                    # 资产类科目，需要根据具体科目判断
                    if "固定资产" in split.account.name or "长期投资" in split.account.name:
                        if amount < 0:
                            investing_outflows += abs(amount)
                        else:
                            investing_inflows += abs(amount)
                elif account_type == "LIABILITY":
                    # 负债类科目
                    if "借款" in split.account.name:
                        if amount > 0:
                            financing_inflows += abs(amount)
                        else:
                            financing_outflows += abs(amount)
        
        net_operating = operating_inflows - operating_outflows
        net_investing = investing_inflows - investing_outflows
        net_financing = financing_inflows - financing_outflows
        
        # 获取期初现金余额
        start_balance_sheet = ReportService.get_balance_sheet(start_date)
        start_cash = Decimal(0)
        for asset in start_balance_sheet["assets"]:
            if asset["name"] == "流动资产":
                for child in asset["children"]:
                    if child["name"] in ["库存现金", "银行存款", "其他货币资金"]:
                        start_cash += Decimal(str(child["balance"]))
        
        # 计算期末现金余额
        end_balance_sheet = ReportService.get_balance_sheet(end_date)
        end_cash = Decimal(0)
        for asset in end_balance_sheet["assets"]:
            if asset["name"] == "流动资产":
                for child in asset["children"]:
                    if child["name"] in ["库存现金", "银行存款", "其他货币资金"]:
                        end_cash += Decimal(str(child["balance"]))
        
        net_increase = net_operating + net_investing + net_financing
        
        return {
            "operating": {
                "inflows": float(operating_inflows),
                "outflows": float(operating_outflows),
                "net": float(net_operating)
            },
            "investing": {
                "inflows": float(investing_inflows),
                "outflows": float(investing_outflows),
                "net": float(net_investing)
            },
            "financing": {
                "inflows": float(financing_inflows),
                "outflows": float(financing_outflows),
                "net": float(net_financing)
            },
            "net_increase": float(net_increase),
            "start_balance": float(start_cash),
            "end_balance": float(end_cash)
        }
    
    @staticmethod
    def verify_accounting_equation(report_date: date = None):
        """验证会计恒等式：资产 = 负债 + 所有者权益
        
          注意：在复式记账中，所有者权益应该包括：
          1. 权益类科目（EQUITY）的余额
          2. 净利润（收入 - 费用），因为收入和费用最终会影响所有者权益
          
        Args:
            report_date: 报告日期，如果为None则计算所有交易的余额（不进行日期过滤）
        """
        balance_sheet = ReportService.get_balance_sheet(report_date)
        
        total_assets = Decimal(str(balance_sheet["total_assets"]))
        total_liabilities = Decimal(str(balance_sheet["total_liabilities"]))
        total_equity = Decimal(str(balance_sheet["total_equity"]))
        
        # 计算收入和费用类科目的余额
        # 收入类科目余额通常是负数（贷方），费用类科目余额通常是正数（借方）
        income_accounts = ReportService.build_account_tree_with_balance(report_date, "INCOME")
        expense_accounts = ReportService.build_account_tree_with_balance(report_date, "EXPENSE")
        
        def sum_total(accounts):
            total = Decimal(0)
            for account in accounts:
                total += account["balance"]
            return total
        
        total_income = sum_total(income_accounts)  # 通常是负数
        total_expenses = sum_total(expense_accounts)  # 通常是正数
        
        # 计算净利润
        # 收入是负数（贷方），费用是正数（借方）
        # 净利润 = -收入总额 - 费用总额 = -(收入总额 + 费用总额)
        # 或者：净利润 = |收入总额| - 费用总额
        net_income = -total_income - total_expenses
        
        # 计算完整的所有者权益 = 权益类科目余额（绝对值）+ 净利润
        # 注意：权益类科目在数据库中可能是负数（贷方），需要先取绝对值
        equity_abs_base = abs(total_equity)
        total_equity_with_income = equity_abs_base + net_income
        
        # 计算等式右边：负债 + 所有者权益（包含净利润）
        # 注意：负债在数据库中可能是负数（贷方），需要取绝对值
        liabilities_abs = abs(total_liabilities)
        # 所有者权益（含净利润）应该始终是正数
        equity_abs = abs(total_equity_with_income)
        right_side = liabilities_abs + equity_abs
        
        # 资产通常是正数（借方）
        assets_abs = abs(total_assets)
        
        # 计算差异
        difference = assets_abs - right_side
        
        # 允许的误差范围（由于浮点数精度问题，允许很小的误差）
        tolerance = Decimal('0.01')
        
        is_balanced = abs(difference) <= tolerance
        
        return {
            "is_balanced": is_balanced,
            "total_assets": float(assets_abs),
            "total_liabilities": float(liabilities_abs),
            "total_equity": float(equity_abs_base),  # 权益类科目余额（不含净利润，绝对值）
            "net_income": float(net_income),  # 净利润
            "total_equity_with_income": float(equity_abs),  # 完整的所有者权益（含净利润，绝对值）
            "right_side": float(right_side),
            "difference": float(difference),
            "tolerance": float(tolerance)
        }
    
    @staticmethod
    def get_dashboard_data():
        """获取仪表盘数据"""
        # 使用数据库中最新的交易日期作为"当前日期"，而不是系统日期
        # 这样可以避免系统日期与数据日期不匹配的问题
        latest_transaction = Transaction.query.order_by(Transaction.post_date.desc()).first()
        if latest_transaction:
            today = latest_transaction.post_date
        else:
            # 如果没有交易记录，使用系统日期
            today = date.today()
        
        # 计算所有交易，不使用日期过滤
        # 传入None表示计算所有交易的余额
        report_date = None
        
        # 验证会计恒等式（使用所有交易，不进行日期过滤）
        accounting_equation = ReportService.verify_accounting_equation(report_date)
        
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
        
        # 获取资产负债表数据（使用包含所有交易的日期）
        balance_sheet = ReportService.get_balance_sheet(report_date)
        
        # 计算现金及等价物
        # 直接通过科目名称查找，更可靠
        cash_and_equivalents = Decimal(0)
        cash_account_names = ["库存现金", "银行存款", "其他货币资金"]
        for name in cash_account_names:
            account = Account.query.filter_by(name=name).first()
            if account:
                balance = ReportService.calculate_account_balance(account.guid, report_date)
                cash_and_equivalents += balance
        
        # 如果通过树结构也能找到，也尝试一下（作为备用）
        if cash_and_equivalents == 0:
            for asset in balance_sheet["assets"]:
                if asset["name"] == "流动资产":
                    for child in asset["children"]:
                        if child["name"] in cash_account_names:
                            cash_and_equivalents += Decimal(str(child["balance"]))
        
        # 计算应付账款
        # 注意：应付账款是负债类科目，余额通常是负数（表示欠款），显示时需要取绝对值
        accounts_payable = Decimal(0)
        payable_account = Account.query.filter_by(name="应付账款").first()
        if payable_account:
            balance = ReportService.calculate_account_balance(payable_account.guid, report_date)
            # 负债类科目，负数表示欠款，取绝对值显示
            accounts_payable = abs(balance)
        
        # 如果直接查找没找到，尝试通过树结构查找（作为备用）
        if accounts_payable == 0:
            for liability in balance_sheet["liabilities"]:
                if liability["name"] == "流动负债":
                    for child in liability["children"]:
                        if child["name"] == "应付账款":
                            # 负债类科目，取绝对值
                            accounts_payable = abs(Decimal(str(child["balance"])))
                            break
                    if accounts_payable > 0:
                        break
        
        # 计算本月净利润
        # 获取本月的开始和结束日期
        start_of_month = date(current_year, current_month, 1)
        end_of_month = today
        
        # 获取本月的利润表数据
        income_statement = ReportService.get_income_statement(start_of_month, end_of_month)
        net_income = income_statement["net_income"]
        
        # 获取上个月的利润表数据
        start_of_last_month = date(previous_year, previous_month, 1)
        # 获取上个月的最后一天
        _, last_day = monthrange(previous_year, previous_month)
        end_of_last_month = date(previous_year, previous_month, last_day)
        
        last_month_income_statement = ReportService.get_income_statement(start_of_last_month, end_of_last_month)
        last_month_net_income = last_month_income_statement["net_income"]
        
        # 计算增长率
        def calculate_growth_rate(current, previous):
            if previous == 0:
                return 0
            return ((current - previous) / previous) * 100
        
        # 计算现金及等价物的增长率
        cash_and_equivalents_last_month = Decimal(0)
        cash_account_names = ["库存现金", "银行存款", "其他货币资金"]
        for name in cash_account_names:
            account = Account.query.filter_by(name=name).first()
            if account:
                balance = ReportService.calculate_account_balance(account.guid, end_of_last_month)
                cash_and_equivalents_last_month += balance
        
        # 如果直接查找没找到，尝试通过树结构查找（作为备用）
        if cash_and_equivalents_last_month == 0:
            last_month_balance_sheet = ReportService.get_balance_sheet(end_of_last_month)
            for asset in last_month_balance_sheet["assets"]:
                if asset["name"] == "流动资产":
                    for child in asset["children"]:
                        if child["name"] in cash_account_names:
                            cash_and_equivalents_last_month += Decimal(str(child["balance"]))
        
        cash_growth_rate = calculate_growth_rate(cash_and_equivalents, cash_and_equivalents_last_month)
        net_income_growth_rate = calculate_growth_rate(net_income, last_month_net_income)
        
        # 计算应付账款的增长率
        accounts_payable_last_month = Decimal(0)
        payable_account = Account.query.filter_by(name="应付账款").first()
        if payable_account:
            balance = ReportService.calculate_account_balance(payable_account.guid, end_of_last_month)
            # 负债类科目，取绝对值
            accounts_payable_last_month = abs(balance)
        
        # 如果直接查找没找到，尝试通过树结构查找（作为备用）
        if accounts_payable_last_month == 0:
            last_month_balance_sheet = ReportService.get_balance_sheet(end_of_last_month)
            for liability in last_month_balance_sheet["liabilities"]:
                if liability["name"] == "流动负债":
                    for child in liability["children"]:
                        if child["name"] == "应付账款":
                            # 负债类科目，取绝对值
                            accounts_payable_last_month = abs(Decimal(str(child["balance"])))
                            break
                    if accounts_payable_last_month > 0:
                        break
        
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
            # 使用该月的最后一天
            _, last_day = monthrange(year, month)
            month_end = date(year, month, last_day)
            month_cash = Decimal(0)
            cash_account_names = ["库存现金", "银行存款", "其他货币资金"]
            # 直接通过科目名称查找
            for name in cash_account_names:
                account = Account.query.filter_by(name=name).first()
                if account:
                    balance = ReportService.calculate_account_balance(account.guid, month_end)
                    month_cash += balance
            
            # 如果直接查找没找到，尝试通过树结构查找（作为备用）
            if month_cash == 0:
                month_balance_sheet = ReportService.get_balance_sheet(month_end)
                for asset in month_balance_sheet["assets"]:
                    if asset["name"] == "流动资产":
                        for child in asset["children"]:
                            if child["name"] in cash_account_names:
                                month_cash += Decimal(str(child["balance"]))
            
            # 获取月份名称
            month_names = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
            months.append(month_names[month - 1])
            cash_flow.append(month_cash)
        
        # 构建近6个月资金流向数据
        cash_flow_data = [
            {"month": month, "amount": float(amount)} for month, amount in zip(months, cash_flow)
        ]
        
        # 待办任务数据（从采购订单获取待审核订单）
        from app.models import PurchaseOrder
        pending_orders = PurchaseOrder.query.filter_by(status="OPEN").order_by(PurchaseOrder.date_opened.desc()).limit(4).all()
        todo_items = []
        for i, order in enumerate(pending_orders, 1):
            todo_items.append({
                "id": i,
                "type": "approval",
                "title": f"待审核采购订单 #{order.id}",
                "deadline": order.date_opened.strftime("%m月%d日") if order.date_opened else "待定",
                "urgent": True
            })
        
        # 计算详细的科目余额汇总
        # 使用与accounting_equation相同的日期和计算逻辑，确保数据一致性
        # 获取各类科目的余额（使用与verify_accounting_equation相同的逻辑）
        assets_accounts = ReportService.build_account_tree_with_balance(report_date, "ASSET")
        liabilities_accounts = ReportService.build_account_tree_with_balance(report_date, "LIABILITY")
        equity_accounts = ReportService.build_account_tree_with_balance(report_date, "EQUITY")
        income_accounts = ReportService.build_account_tree_with_balance(report_date, "INCOME")
        expense_accounts = ReportService.build_account_tree_with_balance(report_date, "EXPENSE")
        
        # 计算各类科目的总余额（使用与verify_accounting_equation相同的逻辑）
        def sum_total(accounts):
            total = Decimal(0)
            for account in accounts:
                total += account["balance"]
            return total
        
        total_assets = sum_total(assets_accounts)
        total_liabilities = sum_total(liabilities_accounts)
        total_equity = sum_total(equity_accounts)
        total_income = sum_total(income_accounts)  # 通常是负数（贷方）
        total_expenses = sum_total(expense_accounts)  # 通常是正数（借方）
        
        # 计算净利润（使用与verify_accounting_equation相同的逻辑）
        # 收入是负数（贷方），费用是正数（借方）
        # 净利润 = -收入总额 - 费用总额
        calculated_net_income = -total_income - total_expenses
        
        # 构建科目余额汇总数据（确保与accounting_equation使用相同的计算方式）
        account_summary = {
            "assets": float(abs(total_assets)),  # 资产通常是正数
            "liabilities": float(abs(total_liabilities)),  # 负债取绝对值
            "equity": float(abs(total_equity)),  # 权益取绝对值
            "income": float(abs(total_income)),  # 收入取绝对值（显示用）
            "expenses": float(abs(total_expenses)),  # 费用取绝对值（显示用）
            "net_income": float(calculated_net_income)  # 净利润（与accounting_equation中的net_income一致）
        }
        
        return {
            "cash_and_equivalents": float(cash_and_equivalents),
            "cash_growth_rate": float(cash_growth_rate),
            "net_income": float(net_income),
            "net_income_growth_rate": float(net_income_growth_rate),
            "accounts_payable": float(accounts_payable),
            "accounts_payable_growth_rate": float(accounts_payable_growth_rate),
            "cash_flow_data": cash_flow_data,
            "todo_items": todo_items,
            "accounting_equation": accounting_equation,
            "account_summary": account_summary
        }
