create table purchase_orders
(
    id                  varchar(50)               not null,
    vendor_guid         varchar(36)               not null,
    status              enum ('OPEN', 'APPROVED') not null,
    date_opened         datetime                  null,
    guid                varchar(36)               not null
        primary key,
    created_at          datetime                  null,
    updated_at          datetime                  null,
    credit_account_guid varchar(36)               null,
    constraint fk_purchase_orders_credit_account
        foreign key (credit_account_guid) references accounts (guid)
            on delete set null,
    constraint fk_purchase_orders_vendor_guid
        foreign key (vendor_guid) references vendors (guid)
            on update cascade
);

INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2026-0006', '7cca18d1-e93d-496c-b8bd-c1c81b37c99f', 'APPROVED', '2026-01-03 14:15:16', '1d0046b4-e802-4265-a3ba-1bae29b8be6f', '2026-01-03 06:15:16', '2026-01-03 06:15:19', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2026-0003', '7cca18d1-e93d-496c-b8bd-c1c81b37c99f', 'APPROVED', '2026-01-02 22:39:57', '329e83ed-f73c-4833-9a74-7a32d46b07ba', '2026-01-02 14:39:57', '2026-01-02 14:40:02', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2026-0001', '7cca18d1-e93d-496c-b8bd-c1c81b37c99f', 'APPROVED', '2026-01-02 22:13:32', '3aed3886-be47-4cde-b0ef-a2253c238148', '2026-01-02 14:13:32', '2026-01-02 14:13:40', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2026-0002', '550e8400-e29b-41d4-a716-446655440001', 'APPROVED', '2026-01-02 22:14:58', '3ca03cc4-ceca-47e4-8e39-66c355e237bc', '2026-01-02 14:14:58', '2026-01-02 14:15:38', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1156', '550e8400-e29b-41d4-a716-446655440001', 'APPROVED', '2025-12-20 10:00:00', '660e8400-e29b-41d4-a716-446655440001', '2025-12-30 19:35:59', '2026-01-01 14:41:05', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1089', '550e8400-e29b-41d4-a716-446655440001', 'APPROVED', '2025-11-15 14:30:00', '660e8400-e29b-41d4-a716-446655440002', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-0954', '550e8400-e29b-41d4-a716-446655440001', 'APPROVED', '2025-10-28 09:15:00', '660e8400-e29b-41d4-a716-446655440003', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-0823', '550e8400-e29b-41d4-a716-446655440001', 'APPROVED', '2025-09-12 16:45:00', '660e8400-e29b-41d4-a716-446655440004', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1023', '550e8400-e29b-41d4-a716-446655440002', 'APPROVED', '2025-11-20 11:00:00', '660e8400-e29b-41d4-a716-446655440005', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-0987', '550e8400-e29b-41d4-a716-446655440002', 'APPROVED', '2025-10-10 13:20:00', '660e8400-e29b-41d4-a716-446655440006', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1123', '550e8400-e29b-41d4-a716-446655440003', 'APPROVED', '2025-12-05 08:30:00', '660e8400-e29b-41d4-a716-446655440007', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1056', '550e8400-e29b-41d4-a716-446655440003', 'APPROVED', '2025-11-08 15:00:00', '660e8400-e29b-41d4-a716-446655440008', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1145', '550e8400-e29b-41d4-a716-446655440004', 'APPROVED', '2025-12-15 10:30:00', '660e8400-e29b-41d4-a716-446655440009', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1098', '550e8400-e29b-41d4-a716-446655440004', 'APPROVED', '2025-11-18 14:00:00', '660e8400-e29b-41d4-a716-446655440010', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1111', '550e8400-e29b-41d4-a716-446655440005', 'APPROVED', '2025-12-01 09:00:00', '660e8400-e29b-41d4-a716-446655440011', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2025-1067', '550e8400-e29b-41d4-a716-446655440005', 'APPROVED', '2025-11-12 16:30:00', '660e8400-e29b-41d4-a716-446655440012', '2025-12-30 19:35:59', '2025-12-30 19:35:59', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2026-0005', '7cca18d1-e93d-496c-b8bd-c1c81b37c99f', 'APPROVED', '2026-01-03 13:37:44', '699136d2-0188-4bed-8e43-a220e3394fa0', '2026-01-03 05:37:44', '2026-01-03 05:37:49', '01a85b3a-d467-4267-891d-f19735427c62');
INSERT INTO financialsys.purchase_orders (id, vendor_guid, status, date_opened, guid, created_at, updated_at, credit_account_guid) VALUES ('PO-2026-0004', '7cca18d1-e93d-496c-b8bd-c1c81b37c99f', 'APPROVED', '2026-01-03 10:44:49', 'f96ba956-d494-49d8-b66c-49c8d862e421', '2026-01-03 02:44:49', '2026-01-03 02:44:55', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49');
