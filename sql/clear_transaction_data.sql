-- =====================================================
-- 清空交易相关数据的SQL脚本
-- 保留：accounts（科目）和 vendors（供应商）
-- 删除：transactions, splits, purchase_orders, order_entries
-- =====================================================
-- 
-- 外键依赖关系：
-- 1. splits -> transactions (on delete cascade)
-- 2. splits -> accounts (保留accounts)
-- 3. order_entries -> purchase_orders (on delete cascade)
-- 4. order_entries -> accounts (保留accounts)
-- 5. purchase_orders -> vendors (保留vendors)
-- 6. purchase_orders -> accounts (保留accounts)
--
-- 删除顺序（考虑级联删除）：
-- 1. 删除 transactions（会自动级联删除 splits）
-- 2. 删除 purchase_orders（会自动级联删除 order_entries）
-- 
-- 注意：由于 splits 有 on delete cascade，删除 transactions 时会自动删除相关 splits
-- 注意：由于 order_entries 有 on delete cascade，删除 purchase_orders 时会自动删除相关 order_entries
-- =====================================================

USE financialsys;

-- =====================================================
-- 步骤1：删除 transactions（交易）
-- 注意：这会自动级联删除 splits 表中的相关记录
-- =====================================================
DELETE FROM transactions;
SELECT CONCAT('已删除 transactions 表数据，影响行数：', ROW_COUNT()) AS '删除结果';

-- =====================================================
-- 步骤2：删除 purchase_orders（采购订单）
-- 注意：这会自动级联删除 order_entries 表中的相关记录
-- =====================================================
DELETE FROM purchase_orders;
SELECT CONCAT('已删除 purchase_orders 表数据，影响行数：', ROW_COUNT()) AS '删除结果';

-- =====================================================
-- 验证删除结果
-- =====================================================
SELECT 
    'splits' AS '表名',
    COUNT(*) AS '剩余记录数'
FROM splits
UNION ALL
SELECT 
    'transactions' AS '表名',
    COUNT(*) AS '剩余记录数'
FROM transactions
UNION ALL
SELECT 
    'order_entries' AS '表名',
    COUNT(*) AS '剩余记录数'
FROM order_entries
UNION ALL
SELECT 
    'purchase_orders' AS '表名',
    COUNT(*) AS '剩余记录数'
FROM purchase_orders
UNION ALL
SELECT 
    'accounts' AS '表名',
    COUNT(*) AS '剩余记录数'
FROM accounts
UNION ALL
SELECT 
    'vendors' AS '表名',
    COUNT(*) AS '剩余记录数'
FROM vendors;

SELECT '数据清理完成！accounts 和 vendors 数据已保留。' AS '完成提示';

