import json
from app import db
from app.models import Transaction, Split
from decimal import Decimal

class TestTransaction:
    def test_create_transaction_success(self, client, init_accounts):
        """测试成功创建交易"""
        # 准备测试数据
        transaction_data = {
            "post_date": "2025-12-24",
            "description": "测试交易",
            "splits": [
                {
                    "account_guid": init_accounts["cash_guid"],
                    "amount": 100.00
                },
                {
                    "account_guid": init_accounts["income_guid"],
                    "amount": -100.00
                }
            ]
        }
        
        # 发送请求
        response = client.post('/api/transactions', json=transaction_data)
        
        # 验证响应
        assert response.status_code == 201
        data = response.get_json()
        assert data["guid"] is not None
        assert data["description"] == "测试交易"
        assert len(data["splits"]) == 2
        
        # 验证数据库
        transactions = Transaction.query.all()
        assert len(transactions) == 1
        assert transactions[0].description == "测试交易"
        
        splits = Split.query.all()
        assert len(splits) == 2
        total_amount = sum(split.amount for split in splits)
        assert total_amount == Decimal('0')
    
    def test_create_transaction_balance_error(self, client, init_accounts):
        """测试借贷不平衡时的错误处理"""
        # 准备测试数据（借贷不平衡）
        transaction_data = {
            "post_date": "2025-12-24",
            "description": "测试不平衡交易",
            "splits": [
                {
                    "account_guid": init_accounts["cash_guid"],
                    "amount": 100.00
                },
                {
                    "account_guid": init_accounts["income_guid"],
                    "amount": -90.00  # 差额10元
                }
            ]
        }
        
        # 发送请求
        response = client.post('/api/transactions', json=transaction_data)
        
        # 验证响应
        assert response.status_code == 400
        data = response.get_json()
        assert data["code"] == 400
        assert "借贷不平衡" in data["message"]
        
        # 验证数据库中没有创建交易
        transactions = Transaction.query.all()
        assert len(transactions) == 0
        
        splits = Split.query.all()
        assert len(splits) == 0
    
    def test_get_transactions(self, client, init_accounts):
        """测试获取交易列表"""
        # 先创建一个交易
        transaction_data = {
            "post_date": "2025-12-24",
            "description": "测试交易",
            "splits": [
                {
                    "account_guid": init_accounts["cash_guid"],
                    "amount": 100.00
                },
                {
                    "account_guid": init_accounts["income_guid"],
                    "amount": -100.00
                }
            ]
        }
        client.post('/api/transactions', json=transaction_data)
        
        # 获取交易列表
        response = client.get('/api/transactions')
        
        # 验证响应
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["description"] == "测试交易"
