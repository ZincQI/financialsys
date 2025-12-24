from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/financialsys')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models to ensure they are registered with SQLAlchemy
    from app.models import Account, Transaction, Split, Vendor, PurchaseOrder, OrderEntry
    
    # Register blueprints
    from app.routes import account_bp, transaction_bp, report_bp
    app.register_blueprint(account_bp, url_prefix='/api')
    app.register_blueprint(transaction_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')
    
    # Register error handlers
    from app.utils.error_handler import register_error_handlers
    register_error_handlers(app)
    
    return app
