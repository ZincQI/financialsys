create table order_entries
(
    order_guid  varchar(36)    not null,
    description varchar(255)   not null,
    quantity    decimal(10, 2) not null,
    price       decimal(10, 2) not null,
    i_acct_guid varchar(36)    not null,
    guid        varchar(36)    not null
        primary key,
    created_at  datetime       null,
    updated_at  datetime       null,
    constraint order_entries_ibfk_1
        foreign key (i_acct_guid) references accounts (guid),
    constraint order_entries_ibfk_2
        foreign key (order_guid) references purchase_orders (guid)
            on delete cascade
);

create index i_acct_guid
    on order_entries (i_acct_guid);

create index order_guid
    on order_entries (order_guid);

INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('3aed3886-be47-4cde-b0ef-a2253c238148', '精密仪器001', 1.00, 5000.00, '9b86808d-d8c3-4889-8b70-308948c6684d', '0d91bbd0-6882-418e-9332-13a8474a1b5f', '2026-01-02 14:13:32', '2026-01-02 14:13:32');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('3ca03cc4-ceca-47e4-8e39-66c355e237bc', '钢材采购', 1.00, 300.00, 'f65a09fc-65d5-4473-841e-6c22f56a8f85', '16ce02ee-07f9-43a2-8f85-fb69caec3a58', '2026-01-02 14:14:58', '2026-01-02 14:14:58');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('329e83ed-f73c-4833-9a74-7a32d46b07ba', '购买商品', 1.00, 100.00, '00000000-0000-0000-0000-000000000001', '383d3237-16ca-49bd-849a-c211428c271d', '2026-01-02 14:39:57', '2026-01-02 14:39:57');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('699136d2-0188-4bed-8e43-a220e3394fa0', '首批精密仪器采购', 1.00, 100.00, '00000000-0000-0000-0000-000000000001', '5bb88864-c315-4672-880d-ae19f19a2303', '2026-01-03 05:37:44', '2026-01-03 05:37:44');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440001', '热轧钢板 Q235 10mm', 50.00, 4500.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440001', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440001', '冷轧钢板 SPCC 5mm', 30.00, 5200.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440002', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440001', '不锈钢管 304 直径50mm', 100.00, 3800.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440003', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440002', '热轧钢板 Q235 8mm', 80.00, 4200.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440004', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440003', '冷轧钢板 SPCC 3mm', 40.00, 5500.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440005', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440003', '镀锌板 Z275 2mm', 25.00, 4800.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440006', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440004', '不锈钢管 304 直径80mm', 60.00, 4200.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440007', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440004', '角钢 Q235 50x50x5', 120.00, 3500.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440008', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440005', '聚丙烯 PP 颗粒', 500.00, 8500.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440009', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440005', '聚乙烯 PE 颗粒', 300.00, 9200.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440010', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440006', 'PVC 树脂粉', 200.00, 7800.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440011', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440007', '五层瓦楞纸箱 50x40x30cm', 1000.00, 12.50, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440012', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440007', '泡沫填充物 20x20x20cm', 500.00, 8.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440013', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440008', '透明胶带 48mmx50m', 200.00, 15.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440014', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440009', '不锈钢螺丝 M6x20', 5000.00, 0.85, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440015', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440009', '镀锌螺母 M6', 5000.00, 0.45, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440016', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440010', '活动扳手 12寸', 50.00, 85.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440017', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440010', '螺丝刀套装', 30.00, 120.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440018', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440011', '电阻 1KΩ 1/4W', 10000.00, 0.12, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440019', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440011', '电容 100uF 25V', 5000.00, 0.35, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440020', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440012', 'LED 灯珠 5mm 红色', 2000.00, 0.85, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440021', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('660e8400-e29b-41d4-a716-446655440012', 'PCB 电路板 10x10cm', 100.00, 25.00, '00000000-0000-0000-0000-000000000001', '770e8400-e29b-41d4-a716-446655440022', '2025-12-30 19:35:59', '2025-12-30 19:35:59');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('1d0046b4-e802-4265-a3ba-1bae29b8be6f', '机器1', 10.00, 11000.00, '4f042265-7589-459a-813e-0010857b0045', 'd5f82cd3-10ab-46fe-9dfa-370c10e58203', '2026-01-03 06:15:16', '2026-01-03 06:15:16');
INSERT INTO financialsys.order_entries (order_guid, description, quantity, price, i_acct_guid, guid, created_at, updated_at) VALUES ('f96ba956-d494-49d8-b66c-49c8d862e421', '机器', 10.00, 1500.00, '4f042265-7589-459a-813e-0010857b0045', 'f02033a5-c73d-4bd2-8bdb-fe8ce3a2bd42', '2026-01-03 02:44:49', '2026-01-03 02:44:49');
