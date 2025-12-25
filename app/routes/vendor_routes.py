from flask import Blueprint, jsonify, request
from app.services.vendor_service import VendorService

vendor_bp = Blueprint('vendor_bp', __name__)
vendor_service = VendorService()

@vendor_bp.route('/vendors', methods=['GET'])
def get_vendors():
    """获取所有供应商"""
    vendors = vendor_service.get_all_vendors()
    return jsonify(vendors)

@vendor_bp.route('/vendors/<vendor_guid>', methods=['GET'])
def get_vendor(vendor_guid):
    """根据GUID获取供应商详情"""
    vendor = vendor_service.get_vendor_by_guid(vendor_guid)
    if vendor:
        return jsonify(vendor)
    return jsonify({'error': '供应商不存在'}), 404

@vendor_bp.route('/vendors', methods=['POST'])
def create_vendor():
    """创建新供应商"""
    vendor_data = request.json
    vendor = vendor_service.create_vendor(vendor_data)
    return jsonify(vendor), 201

@vendor_bp.route('/vendors/<vendor_guid>', methods=['PUT'])
def update_vendor(vendor_guid):
    """更新供应商信息"""
    vendor_data = request.json
    vendor = vendor_service.update_vendor(vendor_guid, vendor_data)
    if vendor:
        return jsonify(vendor)
    return jsonify({'error': '供应商不存在'}), 404
