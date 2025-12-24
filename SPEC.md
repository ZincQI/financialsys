# 中小企业财务管理系统 - 后端开发规格说明书

## 1. 项目概况 (Project Overview)

本项目旨在构建一个基于 **Python Flask** 和 **MySQL** 的中小型企业财务管理系统。系统的核心设计理念模仿开源软件 **GnuCash**，采用**复式记账法 (Double-Entry Bookkeeping)**，强调资金流动的借贷平衡。

* **技术栈**:
* **后端框架**: Python Flask
* **数据库**: MySQL 8.0
* **ORM**: SQLAlchemy (推荐) 或 原生 SQL
* **数据验证**: Pydantic / Marshmallow
* **接口风格**: RESTful API



## 2. 数据库设计 (Data Layer)

*约束：所有表的主键使用 `VARCHAR(36)` 存储 UUID。金额字段为了保证精度，必须使用“分子/分母”整数存储或高精度 `DECIMAL`。*

### 2.1 核心财务表

**1. 会计科目表 (`accounts`)**

* **设计要点**: 树状结构，自关联。
* **Schema**:
* `guid`: PK, UUID
* `name`: String, 科目名称
* `account_type`: Enum (ASSET, LIABILITY, INCOME, EXPENSE, EQUITY)
* `parent_guid`: FK -> accounts.guid (父科目)
* `placeholder`: Boolean (是否为占位符，占位符不可记账)
* `code`: String (助记码)



**2. 交易凭证表 (`transactions`)**

* **设计要点**: 业务发生的表头，记录时间与摘要。
* **Schema**:
* `guid`: PK, UUID
* `post_date`: Date, 入账日期 (业务发生日)
* `enter_date`: Datetime, 录入时间
* `description`: String, 摘要
* `currency_guid`: FK -> commodities.guid



**3. 分录表 (`splits`)**

* **设计要点**: 复式记账原子单位，**核心表**。
* **Schema**:
* `guid`: PK, UUID
* `tx_guid`: FK -> transactions.guid (级联删除)
* `account_guid`: FK -> accounts.guid
* `memo`: String, 行备注
* `value_num`: BigInt, **金额分子** (如 100)
* `value_denom`: BigInt, **金额分母** (如 100，代表 1.00)
* `reconcile_state`: Char (n=未对账, y=已对账)



### 2.2 业务辅助表

**4. 供应商表 (`vendors`)**

* **Schema**: `guid`, `name`, `id` (编号), `address_phone`.

**5. 采购订单表 (`purchase_orders`)**

* **设计要点**: 业务单据，审核通过后生成 Transaction。
* **Schema**:
* `guid`: PK
* `id`: String (PO-2023xxxx)
* `vendor_guid`: FK -> vendors.guid
* `status`: Enum (OPEN, APPROVED)
* `date_opened`: Datetime



**6. 订单明细表 (`order_entries`)**

* **Schema**:
* `guid`: PK
* `order_guid`: FK
* `description`: String
* `quantity`: Decimal
* `price`: Decimal
* `i_acct_guid`: FK -> accounts.guid (**预设支出科目**)



---

## 3. 核心业务逻辑 (Service Layer)

*请在 Service 层实现以下核心算法，确保业务逻辑与 Controller 分离。*

### 3.1 交易处理服务 (`TransactionService`)

* **借贷平衡校验 (Crucial)**:
* 在保存 Transaction 之前，必须遍历其下所有的 Splits。
* 逻辑：`Sum(Split.value_num / Split.value_denom) MUST == 0`。
* 如果由浮点误差导致不为 0，应抛出 `AccountingBalanceError`。


* **原子性保存**:
* Transaction 头信息和 Split 列表必须在一个数据库事务 (Transaction) 中保存。
* 要么全成功，要么全回滚。



### 3.2 报表计算服务 (`ReportService`)

* **递归汇总 (Recursive Aggregation)**:
* **目标**: 计算父科目的余额（父科目本身不记账，余额 = 所有子科目余额之和）。
* **逻辑**:
1. 给定 `report_date`。
2. 对于叶子节点科目：`Sum(splits.value)` where `post_date <= report_date`。
3. 对于父节点科目：递归累加所有子节点的余额。


* **输出**: 用于生成资产负债表 (Balance Sheet) 的嵌套 JSON 数据。



### 3.3 采购业务服务 (`PurchaseService`)

* **业务财务一体化**:
* 提供 `approve_order(order_id)` 方法。
* 逻辑：当订单状态变为 APPROVED 时，自动创建一条 Transaction。
* **借 (Dr)**: `order_entries.i_acct_guid` (如：库存商品/管理费用)
* **贷 (Cr)**: 应付账款-供应商 (需查找该供应商关联的应付科目)





---

## 4. API 接口设计 (Controller Layer)

*请预留如下 RESTful 接口，返回 JSON 格式数据。*

### 4.1 科目管理

* `GET /api/accounts/tree`: 获取完整的科目树结构。
* `POST /api/accounts`: 创建新科目 (参数: name, type, parent_id)。

### 4.2 凭证管理 (核心)

* `POST /api/transactions`: 录入凭证。
* **Payload 示例**:
```json
{
  "date": "2025-10-01",
  "description": "采购办公用品",
  "splits": [
    {"account_id": "uuid-1", "amount": 100.00, "memo": "借方"},
    {"account_id": "uuid-2", "amount": -100.00, "memo": "贷方"}
  ]
}

```




* `GET /api/transactions`: 查询凭证列表 (支持按日期范围筛选)。

### 4.3 报表

* `GET /api/reports/balance-sheet`: 获取资产负债表数据 (参数: date)。
* `GET /api/reports/income-statement`: 获取利润表数据 (参数: start_date, end_date)。

---

## 5. 开发建议 (Implementation Steps)

1. **Model 层**: 先定义 SQLAlchemy Models，确保外键约束和数据类型正确。
2. **Service 层**: 优先实现 `TransactionService` 的平衡校验逻辑，这是系统的基石。
3. **Controller 层**: 实现 API 路由，处理 HTTP 请求参数解析和错误处理 (400/500)。
4. **Error Handling**: 定义全局异常处理，统一返回 `{ "code": 400, "message": "借贷不平" }` 格式的错误信息。

---

### 💡 如何使用这份文档进行 Vibe 编程？

1. **初始化项目**：
在 Cursor 中输入：
> "创建一个 Flask 项目结构，包含 models, services, routes, utils 目录。使用 SQLAlchemy 和 PyMySQL。"


2. **生成数据模型**：
复制上面的 **"2. 数据库设计"** 部分，发送给 Cursor：
> "根据这份数据库设计文档，在 `models` 目录下创建 SQLAlchemy 的模型类。注意使用 UUID 作为主键，金额字段请自行处理分子分母逻辑或使用 Decimal。"


3. **实现核心逻辑**：
复制 **"3. 核心业务逻辑"** 部分，发送给 Cursor：
> "请在 `services/transaction_service.py` 中实现凭证保存逻辑。必须包含借贷平衡校验算法（所有 split 金额求和为 0），并确保数据库事务原子性。"


4. **生成接口**：
复制 **"4. API 接口设计"** 部分，发送给 Cursor：
> "基于已有的 Service，在 `routes` 目录下实现这些 RESTful API。注意输入数据的校验。"

