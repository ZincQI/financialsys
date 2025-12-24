from flask import Blueprint, jsonify, request
from app.schemas import AccountCreate, AccountResponse, AccountTreeResponse
from app.services import AccountService
from pydantic import ValidationError

account_bp = Blueprint('accounts', __name__)

@account_bp.route('/accounts', methods=['POST'])
def create_account():
    """创建新科目"""
    try:
        account_data = AccountCreate(**request.json)
        account = AccountService.create_account(account_data)
        return jsonify(AccountResponse.from_orm(account).model_dump()), 201
    except ValidationError as e:
        return jsonify({
            "code": 400,
            "message": "数据验证失败",
            "errors": e.errors()
        }), 400

@account_bp.route('/accounts/tree', methods=['GET'])
def get_account_tree():
    """获取完整的科目树结构"""
    account_tree = AccountService.get_tree()
    return jsonify(account_tree), 200

@account_bp.route('/accounts/<account_guid>', methods=['GET'])
def get_account(account_guid):
    """根据GUID获取科目"""
    account = AccountService.get_account(account_guid)
    return jsonify(AccountResponse.from_orm(account).model_dump()), 200
