from flask import Blueprint, jsonify, request
from app.services import ReportService
from datetime import date

report_bp = Blueprint('reports', __name__)

@report_bp.route('/reports/balance-sheet', methods=['GET'])
def get_balance_sheet():
    """获取资产负债表数据"""
    report_date_str = request.args.get('date', date.today().isoformat())
    try:
        report_date = date.fromisoformat(report_date_str)
    except ValueError:
        return jsonify({
            "code": 400,
            "message": "日期格式错误，应为YYYY-MM-DD"
        }), 400
    
    balance_sheet = ReportService.get_balance_sheet(report_date)
    return jsonify(balance_sheet), 200

@report_bp.route('/reports/income-statement', methods=['GET'])
def get_income_statement():
    """获取利润表数据"""
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    if not start_date_str or not end_date_str:
        return jsonify({
            "code": 400,
            "message": "缺少必要参数 start_date 或 end_date"
        }), 400
    
    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
    except ValueError:
        return jsonify({
            "code": 400,
            "message": "日期格式错误，应为YYYY-MM-DD"
        }), 400
    
    income_statement = ReportService.get_income_statement(start_date, end_date)
    return jsonify(income_statement), 200

@report_bp.route('/reports/dashboard', methods=['GET'])
def get_dashboard_data():
    """获取仪表盘数据"""
    try:
        dashboard_data = ReportService.get_dashboard_data()
        return jsonify(dashboard_data), 200
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": "获取仪表盘数据失败",
            "error": str(e)
        }), 500

@report_bp.route('/reports/cash-flow', methods=['GET'])
def get_cash_flow_statement():
    """获取现金流量表数据"""
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')
    
    if not start_date_str or not end_date_str:
        return jsonify({
            "code": 400,
            "message": "缺少必要参数 start_date 或 end_date"
        }), 400
    
    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
    except ValueError:
        return jsonify({
            "code": 400,
            "message": "日期格式错误，应为YYYY-MM-DD"
        }), 400
    
    cash_flow = ReportService.get_cash_flow_statement(start_date, end_date)
    return jsonify(cash_flow), 200
