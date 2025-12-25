# 中小企业财务管理系统 - 测试使用指南

## 系统概述
本系统是一个基于Flask + React + TypeScript的中小企业财务管理系统，使用SQLite数据库，无需外部依赖（如MySQL、PostgreSQL等），可开箱即用。

## 技术栈
- **后端**: Flask, Flask-SQLAlchemy, Flask-Migrate
- **前端**: React, TypeScript, Tailwind CSS, Vite
- **数据库**: SQLite
- **API**: RESTful API with CORS support

## 目录结构
```
financialsys/
├── app/                      # Flask后端应用
│   ├── models/              # 数据库模型
│   ├── routes/              # API路由
│   ├── services/            # 业务逻辑
│   ├── static/              # 前端静态资源
│   └── templates/           # Flask模板
├── frontend_export/         # React前端源码
├── migrations/              # 数据库迁移文件
├── venv/                    # Python虚拟环境
├── run.py                   # 应用启动脚本
└── requirements.txt         # Python依赖
```

## 系统特点
1. **无需外部数据库依赖**: 使用SQLite数据库，数据存储在本地文件中
2. **虚拟环境优先**: 系统会优先使用项目根目录下的虚拟环境
3. **前后端一体化**: 前端代码已构建并集成到Flask应用中
4. **完整的API支持**: 包含账户管理、交易处理、报表生成等核心功能
5. **响应式设计**: 支持各种屏幕尺寸

## 测试使用步骤

### 1. 确保虚拟环境已创建
如果项目根目录下已有`venv`文件夹，则跳过此步骤。否则，运行以下命令创建虚拟环境：

```bash
# Windows
python -m venv venv

# Linux/macOS
python3 -m venv venv
```

### 2. 激活虚拟环境

```bash
# Windows PowerShell
venv\Scripts\Activate.ps1

# Windows Command Prompt
venv\Scripts\activate.bat

# Linux/macOS
source venv/bin/activate
```

### 3. 安装依赖

```bash
# 安装Python依赖
pip install -r requirements.txt

# 前端依赖已在构建时包含，无需额外安装
```

### 4. 初始化数据库

```bash
# 执行数据库迁移
python -m flask db upgrade
```

### 5. 启动应用

```bash
# 运行Flask应用
python run.py
```

应用将在 `http://localhost:5000` 启动

### 6. 访问系统
打开浏览器，访问 `http://localhost:5000` 即可进入系统

## 功能测试要点

### 1. 仪表盘功能
- 检查KPI卡片是否显示正确数据
- 验证图表数据是否正常加载
- 检查待办事项列表是否显示

### 2. 账户管理
- 查看科目树结构
- 尝试添加新账户
- 检查账户详情

### 3. 凭证管理
- 创建新凭证
- 查看凭证列表
- 验证凭证保存功能

### 4. 报表功能
- 查看资产负债表
- 查看利润表
- 检查报表数据是否准确

## API端点测试
系统提供了完整的RESTful API，可使用工具（如Postman、curl等）进行测试。主要API端点包括：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/accounts` | GET | 获取所有账户 |
| `/api/accounts/tree` | GET | 获取账户树结构 |
| `/api/accounts` | POST | 创建新账户 |
| `/api/transactions` | GET | 获取所有交易 |
| `/api/transactions` | POST | 创建新交易 |
| `/api/reports/dashboard` | GET | 获取仪表盘数据 |
| `/api/reports/balance-sheet` | GET | 获取资产负债表 |
| `/api/reports/income-statement` | GET | 获取利润表 |

## 系统维护

### 数据库备份
SQLite数据库文件位于项目根目录下的`financialsys.db`，定期备份此文件即可。

### 系统更新
1. 拉取最新代码
2. 激活虚拟环境
3. 安装新依赖（如果有）
4. 执行数据库迁移
5. 重启应用

## 常见问题及解决方案

### 1. 应用无法启动
- 检查虚拟环境是否正确激活
- 检查依赖是否已正确安装
- 查看控制台错误信息

### 2. API返回404或500错误
- 检查数据库是否已正确初始化
- 查看Flask控制台的错误日志
- 验证API端点是否正确

### 3. 前端页面空白
- 检查浏览器控制台是否有JavaScript错误
- 验证前端资源路径是否正确
- 确保Flask应用已正确配置静态资源

### 4. 数据库相关错误
- 确保已执行数据库迁移
- 检查数据库文件权限
- 尝试重新初始化数据库

## 联系方式
如有任何问题或建议，请联系开发团队。
