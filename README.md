# 中小企业财务管理系统

一个基于复式记账法的企业财务管理系统，采用前后端分离架构，提供完整的财务管理功能。

## 📋 项目简介

本系统是一个面向中小企业的财务管理解决方案，核心设计理念基于复式记账法（Double-Entry Bookkeeping），确保所有财务交易的借贷平衡。系统提供直观的 Web 界面，支持凭证录入、科目管理、采购管理、供应商管理和财务报表等功能。

### 核心特性

- ✅ **复式记账**：严格遵循借贷平衡原则，确保财务数据准确性
- ✅ **科目管理**：支持树形结构的会计科目体系，灵活组织财务数据
- ✅ **凭证录入**：直观的凭证录入界面，实时验证借贷平衡
- ✅ **采购管理**：完整的采购订单流程，支持审核和自动生成凭证
- ✅ **供应商管理**：供应商信息维护和交易历史查询
- ✅ **财务报表**：自动生成资产负债表、利润表和现金流量表
- ✅ **数据验证**：前后端双重验证，确保数据完整性

## 🛠 技术栈

### 后端
- **框架**: Flask 2.x
- **ORM**: SQLAlchemy
- **数据库**: MySQL 8.0
- **数据验证**: Pydantic
- **CORS**: Flask-CORS

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Shadcn UI
- **样式**: Tailwind CSS
- **状态管理**: React Hooks

### 数据库
- **数据库**: MySQL 8.0
- **字符集**: UTF-8
- **存储引擎**: InnoDB

## 📁 项目结构

```
GnuCash/
├── app/                          # 后端 Flask 应用
│   ├── __init__.py              # Flask 应用初始化
│   ├── run.py                   # 应用启动文件
│   ├── requirements.txt         # Python 依赖
│   │
│   ├── models/                  # 数据模型层
│   │   ├── base.py             # 基础模型类
│   │   ├── account.py           # 会计科目模型
│   │   ├── transaction.py      # 交易凭证模型
│   │   ├── split.py            # 分录模型
│   │   ├── vendor.py           # 供应商模型
│   │   ├── purchase_order.py   # 采购订单模型
│   │   └── order_entry.py     # 订单明细模型
│   │
│   ├── routes/                  # API 路由层
│   │   ├── account_routes.py   # 科目管理 API
│   │   ├── transaction_routes.py  # 凭证管理 API
│   │   ├── report_routes.py    # 报表 API
│   │   ├── purchase_routes.py  # 采购管理 API
│   │   └── vendor_routes.py    # 供应商管理 API
│   │
│   ├── services/                # 业务逻辑层
│   │   ├── account_service.py  # 科目业务逻辑
│   │   ├── transaction_service.py  # 交易业务逻辑
│   │   ├── report_service.py   # 报表业务逻辑
│   │   ├── purchase_service.py # 采购业务逻辑
│   │   └── vendor_service.py   # 供应商业务逻辑
│   │
│   ├── schemas/                 # 数据验证层（Pydantic）
│   │   ├── account_schemas.py  # 科目数据验证
│   │   └── transaction_schemas.py  # 交易数据验证
│   │
│   └── utils/                   # 工具函数
│       ├── error_handler.py    # 错误处理
│       └── math_utils.py       # 数学工具（金额精度处理）
│
├── frontend_export/              # 前端 React 应用
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # React 组件
│   │   │   │   ├── Dashboard.tsx           # 仪表盘
│   │   │   │   ├── TransactionRegister.tsx # 凭证录入
│   │   │   │   ├── ChartOfAccounts.tsx      # 科目管理
│   │   │   │   ├── PurchaseOrders.tsx      # 采购管理
│   │   │   │   ├── SupplierManagement.tsx  # 供应商管理
│   │   │   │   └── ReportCenter.tsx         # 报表中心
│   │   │   ├── api/            # API 调用封装
│   │   │   └── App.tsx         # 主应用组件
│   │   └── main.tsx            # 入口文件
│   ├── package.json
│   └── vite.config.ts
│
└── sql/                         # 数据库脚本
    ├── financialsys_accounts.sql
    ├── financialsys_transactions.sql
    ├── financialsys_splits.sql
    ├── financialsys_vendors.sql
    ├── financialsys_purchase_orders.sql
    └── financialsys_order_entries.sql
```

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 16+
- MySQL 8.0+

### 后端安装与运行

1. **安装依赖**
   ```bash
   cd app
   pip install -r requirements.txt
   ```

2. **配置数据库**
   - 创建 MySQL 数据库
   - 执行 `sql/` 目录下的 SQL 脚本初始化数据库
   - 在 `app/__init__.py` 中配置数据库连接信息

3. **启动后端服务**
   ```bash
   cd app
   python run.py
   ```
   后端服务默认运行在 `http://39.97.44.219:5000`

### 前端安装与运行

1. **安装依赖**
   ```bash
   cd frontend_export
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```
   前端应用默认运行在 `http://39.97.44.219:5173`

## 📚 功能模块

### 1. 仪表盘 (Dashboard)

- 显示关键财务指标
- 科目余额汇总（资产、负债、所有者权益、收入、费用）
- 会计恒等式验证
- 待办任务提醒

### 2. 凭证录入 (Transaction Register)

- 支持多行分录录入
- 实时借贷平衡验证
- 科目选择按类别分组显示（资产、负债、所有者权益、收入、费用）
- 自动生成凭证号
- 支持全局摘要和行摘要

**使用示例**：录入支付税费 100 元
- 第 1 行：选择"所得税费用"，填写借方 100
- 第 2 行：选择"银行存款"，填写贷方 100

### 3. 科目管理 (Chart of Accounts)

- 树形结构展示会计科目
- 支持新增、编辑、删除科目
- 科目余额查询
- 查看科目下的详细交易记录
- 删除保护：有子科目或交易记录的科目不能删除

### 4. 采购管理 (Purchase Orders)

- 创建采购订单
- 订单审核功能
- 审核通过后自动生成会计凭证
- 支持批量审核
- 订单详情查看

**采购订单审核逻辑**：
- 借方：订单明细中的支出科目
- 贷方：应付账款

### 5. 供应商管理 (Supplier Management)

- 供应商信息维护（新增、编辑）
- 供应商列表查询
- 供应商交易历史查询
- 供应商评级管理

### 6. 报表中心 (Report Center)

- **资产负债表**：显示资产、负债和所有者权益
- **利润表**：显示收入、费用和净利润
- **现金流量表**：显示现金流入流出情况
- 支持按日期范围查询

## 🔌 API 接口

### 科目管理

- `GET /api/accounts` - 获取所有科目（树形结构）
- `GET /api/accounts/tree` - 获取科目树
- `POST /api/accounts` - 创建新科目
- `PUT /api/accounts/<guid>` - 更新科目信息
- `DELETE /api/accounts/<guid>` - 删除科目
- `GET /api/accounts/<guid>/transactions` - 获取科目交易记录

### 凭证管理

- `POST /api/transactions` - 创建新凭证
- `GET /api/transactions` - 查询凭证列表（支持日期范围筛选）

### 采购管理

- `GET /api/purchase-orders` - 获取采购订单列表（支持分页）
- `GET /api/purchase-orders/<id>` - 获取订单详情
- `POST /api/purchase-orders` - 创建新订单
- `POST /api/purchase-orders/<id>/approve` - 审核订单

### 供应商管理

- `GET /api/vendors` - 获取供应商列表
- `GET /api/vendors/<guid>` - 获取供应商详情
- `POST /api/vendors` - 创建新供应商
- `PUT /api/vendors/<guid>` - 更新供应商信息
- `GET /api/vendors/<guid>/transactions` - 获取供应商交易历史

### 报表

- `GET /api/reports/dashboard` - 获取仪表盘数据
- `GET /api/reports/balance-sheet` - 获取资产负债表
- `GET /api/reports/income-statement` - 获取利润表
- `GET /api/reports/cash-flow` - 获取现金流量表

## 🗄 数据库设计

### 核心表结构

#### 1. 会计科目表 (accounts)
- `guid`: 主键，UUID
- `name`: 科目名称
- `account_type`: 科目类型（ASSET, LIABILITY, INCOME, EXPENSE, EQUITY）
- `parent_guid`: 父科目 GUID（支持树形结构）
- `placeholder`: 是否为占位符（占位符不可记账）
- `code`: 科目代码

#### 2. 交易凭证表 (transactions)
- `guid`: 主键，UUID
- `post_date`: 入账日期
- `description`: 摘要
- `enter_date`: 录入时间

#### 3. 分录表 (splits)
- `guid`: 主键，UUID
- `tx_guid`: 交易凭证 GUID（外键）
- `account_guid`: 会计科目 GUID（外键）
- `memo`: 行备注
- `value_num`: 金额分子
- `value_denom`: 金额分母（通常为 100）
- `reconcile_state`: 对账状态

#### 4. 供应商表 (vendors)
- `guid`: 主键，UUID
- `name`: 供应商名称
- `code`: 供应商编码
- `contact`: 联系人
- `phone`: 联系电话
- `email`: 电子邮箱
- `address`: 地址
- `category`: 供应商类别
- `rating`: 评级（1-5）
- `status`: 状态（active/inactive）

#### 5. 采购订单表 (purchase_orders)
- `guid`: 主键，UUID
- `id`: 订单号（PO-YYYY-XXXX）
- `vendor_guid`: 供应商 GUID（外键）
- `status`: 订单状态（OPEN, APPROVED）
- `date_opened`: 创建日期

#### 6. 订单明细表 (order_entries)
- `guid`: 主键，UUID
- `order_guid`: 订单 GUID（外键）
- `description`: 商品描述
- `quantity`: 数量
- `price`: 单价
- `i_acct_guid`: 支出科目 GUID（外键）

## 🔒 核心业务逻辑

### 复式记账验证

系统严格遵循复式记账原则，所有凭证必须满足：
```
∑(借方金额) = ∑(贷方金额)
```

在保存凭证前，系统会：
1. 验证至少有两个分录
2. 验证每个分录只填写借方或贷方（不能同时填写）
3. 验证借方总额等于贷方总额（允许 0.01 的误差）
4. 使用数据库事务确保原子性保存

### 科目余额计算

- **叶子节点科目**：直接计算该科目下所有分录的金额总和
- **父节点科目**：递归计算所有子科目的余额之和，加上父科目自身的分录金额

### 会计恒等式验证

系统自动验证会计恒等式：
```
资产 = 负债 + 所有者权益（含净利润）
```

其中：
- 所有者权益（含净利润）= |权益类科目余额| + 净利润
- 净利润 = 收入类科目余额 - 费用类科目余额

## 📝 使用说明

### 凭证录入

1. 进入"凭证录入"页面
2. 填写入账日期和全局摘要
3. 添加分录行：
   - 选择会计科目（按类别分组显示）
   - 填写行摘要（可选）
   - 填写借方金额或贷方金额（不能同时填写）
4. 系统实时显示借贷总额和平衡状态
5. 点击"保存凭证"完成录入

### 创建采购订单

1. 进入"采购管理"页面
2. 点击"新建采购订单"
3. 选择供应商
4. 添加商品明细：
   - 填写商品名称
   - 选择支出科目
   - 填写数量和单价
5. 系统自动计算订单总额
6. 点击"创建订单"
7. 订单创建后，点击"审核"按钮审核订单
8. 审核通过后，系统自动生成会计凭证

### 科目管理

1. 进入"科目管理"页面
2. 查看科目树形结构
3. 点击"新增科目"创建新科目
4. 点击科目行的"编辑"按钮修改科目名称
5. 点击"查看交易"查看该科目下的所有交易记录
6. 点击"删除"删除科目（有子科目或交易记录的科目不能删除）


