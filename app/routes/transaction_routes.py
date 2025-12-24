from flask import Blueprint, jsonify, request
from app.schemas import TransactionCreate, TransactionResponse
from app.services import TransactionService
from pydantic import ValidationError
from datetime import date

transaction_bp = Blueprint('transactions', __name__)

@transaction_bp.route('/transactions', methods=['POST'])
def create_transaction():
    """录入凭证"""
    try:
        transaction_data = TransactionCreate(**request.json)
        transaction = TransactionService.create_transaction(transaction_data)
        return jsonify(TransactionResponse.from_orm(transaction).model_dump()), 201
    except ValidationError as e:
        return jsonify({
            "code": 400,
            "message": "数据验证失败",
            "errors": e.errors()
        }), 400

@transaction_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """查询凭证列表，支持按日期范围筛选"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # 转换日期格式
    if start_date:
        start_date = date.fromisoformat(start_date)
    if end_date:
        end_date = date.fromisoformat(end_date)
    
    transactions = TransactionService.get_transactions(start_date, end_date)
    return jsonify([TransactionResponse.from_orm(tx).model_dump() for tx in transactions]), 200

@transaction_bp.route('/transactions/<transaction_guid>', methods=['GET'])
def get_transaction(transaction_guid):
    """根据GUID获取交易"""
    transaction = TransactionService.get_transaction(transaction_guid)
    return jsonify(TransactionResponse.from_orm(transaction).model_dump()), 200
