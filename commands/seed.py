#!/usr/bin/env python3
"""初始化会计科目树脚本"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Account

class SeedScript:
    @staticmethod
    def init_accounts():
        """初始化会计科目树"""
        app = create_app()
        
        with app.app_context():
            # 检查是否已经初始化过
            if Account.query.count() > 0:
                print("会计科目已存在，跳过初始化")
                return
            
            print("开始初始化会计科目...")
            
            # 定义会计科目结构
            accounts_structure = {
                "ASSET": {
                    "name": "资产",
                    "children": [
                        {
                            "name": "流动资产",
                            "children": [
                                {"name": "库存现金", "code": "1001"},
                                {"name": "银行存款", "code": "1002"},
                                {"name": "应收账款", "code": "1122"},
                                {"name": "库存商品", "code": "1405"}
                            ]
                        },
                        {
                            "name": "非流动资产",
                            "children": [
                                {"name": "固定资产", "code": "1601"},
                                {"name": "累计折旧", "code": "1602"}
                            ]
                        }
                    ]
                },
                "LIABILITY": {
                    "name": "负债",
                    "children": [
                        {
                            "name": "流动负债",
                            "children": [
                                {"name": "短期借款", "code": "2001"},
                                {"name": "应付账款", "code": "2202"},
                                {"name": "应付职工薪酬", "code": "2211"},
                                {"name": "应交税费", "code": "2221"}
                            ]
                        },
                        {
                            "name": "非流动负债",
                            "children": [
                                {"name": "长期借款", "code": "2501"}
                            ]
                        }
                    ]
                },
                "EQUITY": {
                    "name": "所有者权益",
                    "children": [
                        {"name": "实收资本", "code": "4001"},
                        {"name": "资本公积", "code": "4002"},
                        {"name": "盈余公积", "code": "4101"},
                        {"name": "本年利润", "code": "4103"},
                        {"name": "利润分配", "code": "4104"}
                    ]
                },
                "INCOME": {
                    "name": "收入",
                    "children": [
                        {"name": "主营业务收入", "code": "6001"},
                        {"name": "其他业务收入", "code": "6051"},
                        {"name": "营业外收入", "code": "6301"}
                    ]
                },
                "EXPENSE": {
                    "name": "费用",
                    "children": [
                        {
                            "name": "营业成本",
                            "children": [
                                {"name": "主营业务成本", "code": "6401"},
                                {"name": "其他业务成本", "code": "6402"}
                            ]
                        },
                        {
                            "name": "期间费用",
                            "children": [
                                {"name": "销售费用", "code": "6601"},
                                {"name": "管理费用", "code": "6602"},
                                {"name": "财务费用", "code": "6603"}
                            ]
                        },
                        {"name": "营业外支出", "code": "6711"},
                        {"name": "所得税费用", "code": "6801"}
                    ]
                }
            }
            
            # 递归创建科目
            def create_account(account_data, account_type, parent_guid=None):
                """递归创建科目"""
                is_placeholder = "children" in account_data
                
                account = Account(
                    name=account_data["name"],
                    account_type=account_type,
                    parent_guid=parent_guid,
                    placeholder=is_placeholder,
                    code=account_data.get("code")
                )
                
                db.session.add(account)
                db.session.flush()  # 获取account.guid
                
                # 递归创建子科目
                if is_placeholder:
                    for child_data in account_data["children"]:
                        create_account(child_data, account_type, account.guid)
                
                return account
            
            # 创建所有科目
            for account_type, account_data in accounts_structure.items():
                create_account(account_data, account_type)
            
            # 提交事务
            db.session.commit()
            print(f"会计科目初始化完成，共创建 {Account.query.count()} 个科目")

if __name__ == "__main__":
    SeedScript.init_accounts()
