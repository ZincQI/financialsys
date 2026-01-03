from flask import Blueprint, jsonify, request
from app.schemas import TransactionCreate
from app.services import TransactionService
from app.utils.error_handler import AccountingBalanceError, ResourceNotFoundError
from pydantic import ValidationError
from datetime import date

transaction_bp = Blueprint('transactions', __name__)

@transaction_bp.route('/transactions', methods=['POST'])
def create_transaction():
    """录入凭证"""
    try:
        transaction_data = TransactionCreate(**request.json)
        transaction = TransactionService.create_transaction(transaction_data)
        # 手动构建响应，因为Split的amount是property
        response_data = {
            "guid": transaction.guid,
            "post_date": transaction.post_date.isoformat(),
            "description": transaction.description,
            "splits": [
                {
                    "guid": split.guid,
                    "account_guid": split.account_guid,
                    "memo": split.memo,
                    "amount": float(split.amount),
                    "reconcile_state": split.reconcile_state or "n"
                }
                for split in transaction.splits
            ]
        }
        return jsonify(response_data), 201
    except ValidationError as e:
        return jsonify({
            "code": 400,
            "message": "数据验证失败",
            "errors": e.errors()
        }), 400
    except AccountingBalanceError as e:
        return jsonify({
            "code": 400,
            "message": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": "创建凭证失败",
            "error": str(e)
        }), 500

@transaction_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """查询凭证列表，支持按日期范围筛选"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # 转换日期格式
        if start_date:
            start_date = date.fromisoformat(start_date)
        if end_date:
            end_date = date.fromisoformat(end_date)
        
        transactions = TransactionService.get_transactions(start_date, end_date)
        # 手动构建响应
        result = []
        for tx in transactions:
            result.append({
                "guid": tx.guid,
                "post_date": tx.post_date.isoformat(),
                "description": tx.description,
                "splits": [
                    {
                        "guid": split.guid,
                        "account_guid": split.account_guid,
                        "memo": split.memo,
                        "amount": float(split.amount),
                        "reconcile_state": split.reconcile_state or "n"
                    }
                    for split in tx.splits
                ]
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": "获取凭证列表失败",
            "error": str(e)
        }), 500

@transaction_bp.route('/transactions/<transaction_guid>', methods=['GET'])
def get_transaction(transaction_guid):
    """根据GUID获取交易"""
    try:
        transaction = TransactionService.get_transaction(transaction_guid)
        # 手动构建响应
        response_data = {
            "guid": transaction.guid,
            "post_date": transaction.post_date.isoformat(),
            "description": transaction.description,
            "splits": [
                {
                    "guid": split.guid,
                    "account_guid": split.account_guid,
                    "memo": split.memo,
                    "amount": float(split.amount),
                    "reconcile_state": split.reconcile_state or "n"
                }
                for split in transaction.splits
            ]
        }
        return jsonify(response_data), 200
    except ResourceNotFoundError as e:
        return jsonify({
            "code": 404,
            "message": str(e)
        }), 404
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": "获取凭证失败",
            "error": str(e)
        }), 500
