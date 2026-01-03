create table vendors
(
    id          int auto_increment
        primary key,
    guid        varchar(36)                  not null,
    name        varchar(100)                 not null,
    code        varchar(50)                  null,
    contact     varchar(100)                 null,
    phone       varchar(50)                  null,
    email       varchar(100)                 null,
    address     varchar(255)                 null,
    category    varchar(100)                 null,
    rating      int         default 5        null,
    status      varchar(20) default 'active' null,
    description text                         null,
    created_at  datetime                     null,
    updated_at  datetime                     null,
    constraint uk_code
        unique (code),
    constraint uk_guid
        unique (guid)
);

INSERT INTO financialsys.vendors (id, guid, name, code, contact, phone, email, address, category, rating, status, description, created_at, updated_at) VALUES (1, '550e8400-e29b-41d4-a716-446655440001', '华东钢材有限公司', 'SUP-001', '张经理', '021-12345678', 'zhang@huadong-steel.com', '上海市浦东新区工业路888号', '原材料供应商', 5, 'active', '华东地区知名钢材供应商，主营各类优质钢材产品。合作15年，供货稳定，质量可靠。提供热轧、冷轧钢板及各类型钢，支持定制加工服务。', '2025-12-30 19:35:58', '2025-12-30 19:35:58');
INSERT INTO financialsys.vendors (id, guid, name, code, contact, phone, email, address, category, rating, status, description, created_at, updated_at) VALUES (2, '550e8400-e29b-41d4-a716-446655440002', '江苏化工集团', 'SUP-002', '李经理', '025-87654321', 'li@jiangsu-chem.com', '江苏省南京市化工园区科技路666号', '化工原料供应商', 4, 'active', '江苏省大型化工企业，专业生产各类化工原料及中间体。产品质量稳定，价格合理，服务周到。', '2025-12-30 19:35:58', '2025-12-30 19:35:58');
INSERT INTO financialsys.vendors (id, guid, name, code, contact, phone, email, address, category, rating, status, description, created_at, updated_at) VALUES (3, '550e8400-e29b-41d4-a716-446655440003', '上海包装材料厂', 'SUP-003', '王经理', '021-23456789', 'wang@shanghai-pack.com', '上海市嘉定区包装工业园123号', '包装材料供应商', 4, 'active', '专业生产各类包装材料，包括纸箱、泡沫、胶带等。交货及时，质量稳定，是长期合作伙伴。', '2025-12-30 19:35:58', '2025-12-30 19:35:58');
INSERT INTO financialsys.vendors (id, guid, name, code, contact, phone, email, address, category, rating, status, description, created_at, updated_at) VALUES (4, '550e8400-e29b-41d4-a716-446655440004', '广东五金制造商', 'SUP-004', '陈经理', '020-34567890', 'chen@guangdong-hardware.com', '广东省广州市番禺区五金工业区456号', '五金配件供应商', 5, 'active', '华南地区知名五金制造商，产品种类齐全，包括螺丝、螺母、工具等。质量优良，价格有竞争力。', '2025-12-30 19:35:58', '2025-12-30 19:35:58');
INSERT INTO financialsys.vendors (id, guid, name, code, contact, phone, email, address, category, rating, status, description, created_at, updated_at) VALUES (5, '550e8400-e29b-41d4-a716-446655440005', '北京电子元件有限公司', 'SUP-005', '王经理', '010-45678901', 'liu@beijing-electronics.com', '北京市海淀区中关村科技园789号', '电子元件供应商', 4, 'active', '专业从事电子元器件的研发、生产和销售。产品广泛应用于各类电子设备，技术先进，品质可靠。', '2025-12-30 19:35:58', '2026-01-02 13:47:47');
INSERT INTO financialsys.vendors (id, guid, name, code, contact, phone, email, address, category, rating, status, description, created_at, updated_at) VALUES (6, '7cca18d1-e93d-496c-b8bd-c1c81b37c99f', '上海精密仪器制造有限公司', 'SUP-006', '张三丰丰', '15202361234', 'shanghaijingmi@test.com', '上海市崇明区xx街道', '原材料供应', 5, 'active', '供应商信用良好', '2026-01-02 14:00:52', '2026-01-02 14:01:09');
