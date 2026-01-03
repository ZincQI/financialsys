# 后端 API 服务

## 项目结构

```
app/
├── __init__.py          # Flask 应用初始化
├── run.py               # 应用启动文件
├── requirements.txt     # Python 依赖
│
├── models/              # 数据模型层
│   ├── base.py         # 基础模型
│   ├── account.py      # 会计科目模型
│   ├── transaction.py  # 交易凭证模型
│   ├── split.py        # 分录模型
│   ├── vendor.py       # 供应商模型
│   ├── purchase_order.py  # 采购订单模型
│   └── order_entry.py  # 订单明细模型
│
├── routes/              # API 路由层
│   ├── account_routes.py      # 科目管理 API
│   ├── transaction_routes.py   # 凭证管理 API
│   ├── report_routes.py       # 报表 API
│   ├── purchase_routes.py     # 采购管理 API
│   └── vendor_routes.py      # 供应商管理 API
│
├── services/            # 业务逻辑层
│   ├── account_service.py     # 科目业务逻辑
│   ├── transaction_service.py # 交易业务逻辑
│   ├── report_service.py      # 报表业务逻辑
│   ├── purchase_service.py    # 采购业务逻辑
│   └── vendor_service.py      # 供应商业务逻辑
│
├── schemas/             # 数据验证层（Pydantic）
│   ├── account_schemas.py      # 科目数据验证
│   ├── transaction_schemas.py  # 交易数据验证
│   └── report_schemas.py      # 报表数据验证
│
└── utils/               # 工具函数
    ├── error_handler.py # 错误处理
    └── math_utils.py    # 数学工具（金额精度处理）
```

## 技术栈

- **框架**: Flask
- **ORM**: SQLAlchemy
- **数据库**: MySQL 8.0
- **数据验证**: Pydantic
- **CORS**: Flask-CORS

## 数据库配置

数据库连接信息已配置在 `__init__.py` 中：

```python
# 数据库连接信息：39.97.44.219:3306, root, 123456Aa+
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456Aa%2B@39.97.44.219:3306/financialsys'
```

**注意**：密码中的特殊字符 `+` 需要进行 URL 编码为 `%2B`。

```python
mysql+pymysql://root:123456@localhost:3306/financialsys
```

## 启动方式

从项目根目录运行：

```bash
python app/run.py
```

应用将在 `http://0.0.0.0:5000` 启动，对外访问地址为 `http://39.97.44.219:5000`。

## API 接口

所有 API 接口前缀为 `/api`：

- `/api/accounts` - 科目管理
- `/api/transactions` - 凭证管理
- `/api/reports` - 报表中心
- `/api/purchase-orders` - 采购管理
- `/api/vendors` - 供应商管理

## 安装依赖

```bash
pip install -r app/requirements.txt
```

