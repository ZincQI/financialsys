from flask import Blueprint, jsonify, request
from app.services.purchase_service import PurchaseService

purchase_bp = Blueprint('purchase_bp', __name__)
purchase_service = PurchaseService()

@purchase_bp.route('/purchase-orders', methods=['GET'])
def get_purchase_orders():
    """获取所有采购订单"""
    orders = purchase_service.get_all_orders()
    return jsonify(orders)

@purchase_bp.route('/purchase-orders/<order_id>', methods=['GET'])
def get_purchase_order(order_id):
    """根据ID获取采购订单详情"""
    order = purchase_service.get_order_by_id(order_id)
    if order:
        return jsonify(order)
    return jsonify({'error': '采购订单不存在'}), 404

@purchase_bp.route('/purchase-orders', methods=['POST'])
def create_purchase_order():
    """创建新采购订单"""
    order_data = request.json
    order = purchase_service.create_order(order_data)
    return jsonify(order), 201

@purchase_bp.route('/purchase-orders/<order_id>/approve', methods=['POST'])
def approve_purchase_order(order_id):
    """审核采购订单"""
    result = purchase_service.approve_order(order_id)
    if result:
        return jsonify({'message': '采购订单已审核通过'}), 200
    return jsonify({'error': '审核失败'}), 400
