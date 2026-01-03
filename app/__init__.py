from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Enable CORS
    CORS(app)
    
    # Database Configuration - MySQL
    # 数据库连接信息：39.97.44.219:3306, root, 123456Aa+
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456Aa%2B@39.97.44.219:3306/financialsys'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    
    # Import models to ensure they are registered with SQLAlchemy
    from app.models import Account, Transaction, Split, Vendor, PurchaseOrder, OrderEntry
    
    # Register blueprints
    from app.routes import account_bp, transaction_bp, report_bp, purchase_bp, vendor_bp
    app.register_blueprint(account_bp, url_prefix='/api')
    app.register_blueprint(transaction_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')
    app.register_blueprint(purchase_bp, url_prefix='/api')
    app.register_blueprint(vendor_bp, url_prefix='/api')
    
    # Register error handlers
    from app.utils.error_handler import register_error_handlers
    register_error_handlers(app)
    
    return app
