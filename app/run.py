"""
Flask 应用启动文件
从项目根目录运行：python app/run.py
"""
import sys
import os

# 确保从项目根目录运行
if __name__ == '__main__':
    # 获取项目根目录路径
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    
    # 将项目根目录添加到 Python 路径
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

from app import create_app, db

app = create_app()

# Create all tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    # 监听所有网络接口，允许外部访问
    app.run(host='0.0.0.0', port=5000, debug=True)

