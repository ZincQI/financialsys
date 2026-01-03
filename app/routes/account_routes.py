from flask import Blueprint, jsonify, request
from app.schemas import AccountCreate
from app.services import AccountService
from pydantic import ValidationError
from datetime import date

account_bp = Blueprint('accounts', __name__)

@account_bp.route('/accounts', methods=['GET'])
def get_accounts():
    """获取所有科目列表"""
    try:
        accounts = AccountService.get_all_accounts()
        result = []
        for account in accounts:
            result.append({
                "guid": account.guid,
                "name": account.name,
                "account_type": account.account_type,
                "parent_guid": account.parent_guid,
                "placeholder": account.placeholder,
                "code": account.code
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": "获取科目列表失败",
            "error": str(e)
        }), 500

@account_bp.route('/accounts', methods=['POST'])
def create_account():
    """创建新科目"""
    try:
        account_data = AccountCreate(**request.json)
        account = AccountService.create_account(account_data)
        return jsonify({
            "guid": account.guid,
            "name": account.name,
            "account_type": account.account_type,
            "parent_guid": account.parent_guid,
            "placeholder": account.placeholder,
            "code": account.code
        }), 201
    except ValidationError as e:
        return jsonify({
            "code": 400,
            "message": "数据验证失败",
            "errors": e.errors()
        }), 400
    except Exception as e:
        return jsonify({
            "code": 400,
            "message": str(e)
        }), 400

@account_bp.route('/accounts/tree', methods=['GET'])
def get_account_tree():
    """获取完整的科目树结构（带余额）"""
    try:
        report_date_str = request.args.get('date')
        report_date = None
        if report_date_str:
            try:
                report_date = date.fromisoformat(report_date_str)
            except ValueError:
                return jsonify({
                    "code": 400,
                    "message": "日期格式错误，应为YYYY-MM-DD"
                }), 400
        
        account_tree = AccountService.get_tree_with_balance(report_date)
        return jsonify(account_tree), 200
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": "获取科目树失败",
            "error": str(e)
        }), 500

@account_bp.route('/accounts/<account_guid>', methods=['GET'])
def get_account(account_guid):
    """根据GUID获取科目"""
    try:
        account = AccountService.get_account(account_guid)
        return jsonify({
            "guid": account.guid,
            "name": account.name,
            "account_type": account.account_type,
            "parent_guid": account.parent_guid,
            "placeholder": account.placeholder,
            "code": account.code
        }), 200
    except Exception as e:
        return jsonify({
            "code": 404,
            "message": str(e)
        }), 404

@account_bp.route('/accounts/<account_guid>', methods=['PUT'])
def update_account(account_guid):
    """更新科目（只允许更新名称）"""
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({"code": 400, "message": "请提供科目名称"}), 400
        
        account = AccountService.update_account(account_guid, data['name'])
        return jsonify({
            "guid": account.guid,
            "name": account.name,
            "account_type": account.account_type,
            "parent_guid": account.parent_guid,
            "placeholder": account.placeholder,
            "code": account.code
        }), 200
    except Exception as e:
        return jsonify({"code": 400, "message": str(e)}), 400

@account_bp.route('/accounts/<account_guid>', methods=['DELETE'])
def delete_account(account_guid):
    """删除科目"""
    try:
        AccountService.delete_account(account_guid)
        return jsonify({"message": "科目删除成功"}), 200
    except Exception as e:
        return jsonify({"code": 400, "message": str(e)}), 400

@account_bp.route('/accounts/<account_guid>/transaction-count', methods=['GET'])
def get_account_transaction_count(account_guid):
    """获取科目关联的交易记录数量"""
    try:
        count = AccountService.get_account_transaction_count(account_guid)
        return jsonify({"count": count}), 200
    except Exception as e:
        return jsonify({"code": 400, "message": str(e)}), 400

@account_bp.route('/accounts/<account_guid>/balance', methods=['GET'])
def get_account_balance(account_guid):
    """获取科目余额"""
    try:
        report_date_str = request.args.get('date')
        report_date = None
        if report_date_str:
            try:
                report_date = date.fromisoformat(report_date_str)
            except ValueError:
                return jsonify({
                    "code": 400,
                    "message": "日期格式错误，应为YYYY-MM-DD"
                }), 400
        
        balance = AccountService.calculate_account_balance(account_guid, report_date)
        return jsonify({"balance": float(balance)}), 200
    except Exception as e:
        return jsonify({"code": 400, "message": str(e)}), 400

@account_bp.route('/accounts/<account_guid>/transactions', methods=['GET'])
def get_account_transactions(account_guid):
    """获取科目关联的所有交易详情（包括子科目）"""
    try:
        transactions = AccountService.get_account_transactions(account_guid)
        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"code": 400, "message": str(e)}), 400

@account_bp.route('/accounts/<account_guid>/quick-entry', methods=['POST'])
def create_quick_entry(account_guid):
    """从科目快速创建交易（快速记账）"""
    try:
        from app.services import TransactionService
        from app.schemas.transaction_schemas import TransactionCreate, SplitCreate
        from decimal import Decimal
        
        data = request.json
        if not data:
            return jsonify({"code": 400, "message": "请求数据不能为空"}), 400
        
        # 获取必要字段
        post_date = data.get('post_date')
        description = data.get('description', '')
        amount = data.get('amount')  # 金额（正数表示增加，负数表示减少）
        opposite_account_guid = data.get('opposite_account_guid')  # 对方科目
        memo = data.get('memo', '')
        
        if not post_date:
            return jsonify({"code": 400, "message": "入账日期不能为空"}), 400
        if not amount:
            return jsonify({"code": 400, "message": "金额不能为空"}), 400
        if not opposite_account_guid:
            return jsonify({"code": 400, "message": "对方科目不能为空"}), 400
        
        # 验证科目是否存在
        account = AccountService.get_account(account_guid)
        opposite_account = AccountService.get_account(opposite_account_guid)
        
        # 判断科目类型，确定借贷方向
        # 资产类：增加为借方，减少为贷方
        # 负债类：增加为贷方，减少为借方
        # 权益类：增加为贷方，减少为借方
        # 收入类：增加为贷方，减少为借方
        # 费用类：增加为借方，减少为贷方
        
        amount_decimal = Decimal(str(amount))
        
        # 根据科目类型和金额正负确定借贷方向
        # 在数据库中：借方为正数，贷方为负数
        def get_split_amount(account_type, amount):
            """根据科目类型和金额变化返回split的amount值
            amount > 0 表示增加，amount < 0 表示减少
            返回的amount：正数表示借方，负数表示贷方
            """
            if account_type == 'ASSET':
                # 资产类：增加为借方（正数），减少为贷方（负数）
                return amount
            elif account_type in ['LIABILITY', 'EQUITY', 'INCOME']:
                # 负债、权益、收入类：增加为贷方（负数），减少为借方（正数）
                return -amount
            elif account_type == 'EXPENSE':
                # 费用类：增加为借方（正数），减少为贷方（负数）
                return amount
            else:
                return Decimal(0)
        
        # 当前科目的split amount
        account_amount = get_split_amount(account.account_type, amount_decimal)
        
        # 对方科目的split amount（必须与当前科目相反，确保借贷平衡）
        opposite_amount = -account_amount
        
        # 创建分录
        splits = [
            SplitCreate(
                account_guid=account_guid,
                memo=memo,
                amount=account_amount
            ),
            SplitCreate(
                account_guid=opposite_account_guid,
                memo=description or memo,
                amount=opposite_amount
            )
        ]
        
        # 创建交易
        transaction_data = TransactionCreate(
            post_date=date.fromisoformat(post_date),
            description=description or memo,
            splits=splits
        )
        
        transaction = TransactionService.create_transaction(transaction_data)
        
        # 返回交易信息
        return jsonify({
            "guid": transaction.guid,
            "post_date": transaction.post_date.isoformat(),
            "description": transaction.description,
            "message": "快速记账成功"
        }), 201
        
    except ValidationError as e:
        return jsonify({
            "code": 400,
            "message": "数据验证失败",
            "errors": e.errors()
        }), 400
    except Exception as e:
        return jsonify({
            "code": 400,
            "message": str(e)
        }), 400
