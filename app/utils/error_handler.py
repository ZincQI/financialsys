from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError

class AccountingError(Exception):
    def __init__(self, message, code=400):
        self.message = message
        self.code = code
        super().__init__(self.message)

class AccountingBalanceError(AccountingError):
    def __init__(self, message="借贷不平衡"):
        super().__init__(message)

class ResourceNotFoundError(AccountingError):
    def __init__(self, resource_type, resource_id):
        super().__init__(f"{resource_type} {resource_id} 不存在", 404)

class ValidationError(AccountingError):
    def __init__(self, message):
        super().__init__(message)

def handle_accounting_error(error):
    return jsonify({
        "code": error.code,
        "message": error.message
    }), error.code

def handle_sqlalchemy_error(error):
    from flask import current_app
    if current_app.debug:
        import traceback
        return jsonify({
            "code": 500,
            "message": "数据库操作失败",
            "error": str(error),
            "traceback": traceback.format_exc()
        }), 500
    return jsonify({
        "code": 500,
        "message": "数据库操作失败"
    }), 500

def handle_generic_error(error):
    from flask import current_app
    if current_app.debug:
        import traceback
        return jsonify({
            "code": 500,
            "message": "服务器内部错误",
            "error": str(error),
            "traceback": traceback.format_exc()
        }), 500
    return jsonify({
        "code": 500,
        "message": "服务器内部错误"
    }), 500

def register_error_handlers(app):
    app.register_error_handler(AccountingError, handle_accounting_error)
    app.register_error_handler(SQLAlchemyError, handle_sqlalchemy_error)
    app.register_error_handler(Exception, handle_generic_error)
