create table accounts
(
    name         varchar(100)                                               not null,
    account_type enum ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY') not null,
    parent_guid  varchar(36)                                                null,
    placeholder  tinyint(1)                                                 null,
    code         varchar(50)                                                null,
    guid         varchar(36)                                                not null
        primary key,
    created_at   datetime                                                   null,
    updated_at   datetime                                                   null,
    constraint accounts_ibfk_1
        foreign key (parent_guid) references accounts (guid)
            on delete set null,
    check (`placeholder` in (0, 1))
);

create index parent_guid
    on accounts (parent_guid);

INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('临时支出科目', 'EXPENSE', 'fbe5f3cf-04db-416e-9628-3d7fd950cf54', 0, '2367', '00000000-0000-0000-0000-000000000001', '2026-12-30 19:28:44', '2026-12-30 19:28:44');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('营业成本', 'EXPENSE', 'fbe5f3cf-04db-416e-9628-3d7fd950cf54', 1, '6792', '008b193e-f366-4f3b-abc4-287b12a1913a', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('银行存款', 'ASSET', 'cda2b5f7-5485-4c1c-9e99-6e69a9b0b8d4', 0, '1002', '01a85b3a-d467-4267-891d-f19735427c62', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('其他业务收入', 'INCOME', '5c2d81ab-31ea-4e7d-8c9d-a7b181879071', 0, '6051', '065ca958-7e0a-4b5c-9239-5bdb77aae43b', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('累计折旧', 'ASSET', '5c8d0876-c427-4c71-a529-57a9cf92d11b', 0, '1602', '071ee60b-bfce-43b0-8271-1aa16184b50e', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('盈余公积', 'EQUITY', 'ada25624-0835-4d1b-ad9f-3ec3e6585833', 0, '4101', '17299801-18a2-4f9d-b79f-5baa650f56e8', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('管理费用', 'EXPENSE', '57ee6255-3975-48b1-a207-94388c4b09bd', 0, '6602', '1970c419-2873-4dbe-ac86-4e30f98ecdef', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('利润分配', 'EQUITY', 'ada25624-0835-4d1b-ad9f-3ec3e6585833', 0, '4104', '23d75031-73bd-4b7c-9e56-69fd8b9cbe24', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('流动负债', 'LIABILITY', '4b69e824-6ed1-4588-9b65-75819c50b199', 1, '5417', '241f4811-e52d-4018-bcc6-d9d6c924ae54', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('本年利润', 'EQUITY', 'ada25624-0835-4d1b-ad9f-3ec3e6585833', 0, '4103', '39d23b24-f8c9-4429-8b3d-d0da6200cca6', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('库存商品', 'ASSET', 'cda2b5f7-5485-4c1c-9e99-6e69a9b0b8d4', 0, '1405', '3f60277b-72e2-458f-b66c-9831d80a3bb4', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('应收账款', 'ASSET', 'cda2b5f7-5485-4c1c-9e99-6e69a9b0b8d4', 0, '1122', '43218e62-6a8a-4b4b-a730-de2ff760bdd3', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('其他业务成本', 'EXPENSE', '008b193e-f366-4f3b-abc4-287b12a1913a', 0, '6402', '46ecc2dd-7d72-4f0c-822f-235244985e71', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('负债', 'LIABILITY', null, 1, '3482', '4b69e824-6ed1-4588-9b65-75819c50b199', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('主营业务成本', 'EXPENSE', '008b193e-f366-4f3b-abc4-287b12a1913a', 0, '6401', '4f042265-7589-459a-813e-0010857b0045', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('期间费用', 'EXPENSE', 'fbe5f3cf-04db-416e-9628-3d7fd950cf54', 1, '7656', '57ee6255-3975-48b1-a207-94388c4b09bd', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('实收资本', 'EQUITY', 'ada25624-0835-4d1b-ad9f-3ec3e6585833', 0, '4001', '5a5c9119-d64c-4661-b0be-47dcd199c9e8', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('收入', 'INCOME', null, 1, '2478', '5c2d81ab-31ea-4e7d-8c9d-a7b181879071', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('非流动资产', 'ASSET', '836c4e41-d568-43e3-9ccc-624b5711bbb5', 1, '5432', '5c8d0876-c427-4c71-a529-57a9cf92d11b', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('所得税费用', 'EXPENSE', 'fbe5f3cf-04db-416e-9628-3d7fd950cf54', 0, '6801', '5ec9a58f-02f8-49d1-b643-141c6be8851a', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('主营业务收入', 'INCOME', '5c2d81ab-31ea-4e7d-8c9d-a7b181879071', 0, '6001', '784c572c-af01-4f67-b6c1-23271fedb11b', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('营业外收入', 'INCOME', '5c2d81ab-31ea-4e7d-8c9d-a7b181879071', 0, '6301', '7963f289-eeab-462e-991c-7aefee80ec6b', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('资产', 'ASSET', null, 1, '0742', '836c4e41-d568-43e3-9ccc-624b5711bbb5', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('应交税费', 'LIABILITY', '241f4811-e52d-4018-bcc6-d9d6c924ae54', 0, '2221', '8ed80dc5-a89f-4d92-b961-baa1abe62261', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('库存现金', 'ASSET', 'cda2b5f7-5485-4c1c-9e99-6e69a9b0b8d4', 0, '1001', '8f53688d-2827-488d-b3ab-a104784c84d6', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('财务费用', 'EXPENSE', '57ee6255-3975-48b1-a207-94388c4b09bd', 0, '6603', '9a5d78e4-3c4f-457c-9fa8-d192fba4d089', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('销售费用', 'EXPENSE', '57ee6255-3975-48b1-a207-94388c4b09bd', 0, '6601', '9b86808d-d8c3-4889-8b70-308948c6684d', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('长期借款', 'LIABILITY', 'db47c63a-a3ee-44ba-91c0-e68f82a9f1ad', 0, '2501', 'acebae1c-0717-4599-b044-fd00dccaa9df', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('所有者权益', 'EQUITY', null, 1, '4522', 'ada25624-0835-4d1b-ad9f-3ec3e6585833', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('应付职工薪酬', 'LIABILITY', '241f4811-e52d-4018-bcc6-d9d6c924ae54', 0, '2211', 'cb68b3b2-65b0-4564-8a16-ba6a87a72781', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('流动资产', 'ASSET', '836c4e41-d568-43e3-9ccc-624b5711bbb5', 1, '4455', 'cda2b5f7-5485-4c1c-9e99-6e69a9b0b8d4', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('资本公积', 'EQUITY', 'ada25624-0835-4d1b-ad9f-3ec3e6585833', 0, '4002', 'd275e11e-94b0-4bf1-a875-69b79d2f5889', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('非流动负债', 'LIABILITY', '4b69e824-6ed1-4588-9b65-75819c50b199', 1, '6654', 'db47c63a-a3ee-44ba-91c0-e68f82a9f1ad', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('应付账款', 'LIABILITY', '241f4811-e52d-4018-bcc6-d9d6c924ae54', 0, '2202', 'ddfc3be4-8123-4d00-a7cc-38201cc06b49', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('短期借款', 'LIABILITY', '241f4811-e52d-4018-bcc6-d9d6c924ae54', 0, '2001', 'dec810a2-3deb-45e8-83d8-1e4d98368f8a', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('固定资产', 'ASSET', '5c8d0876-c427-4c71-a529-57a9cf92d11b', 0, '1601', 'f5fb50ba-e45d-4588-bfc5-ba15b4eb1db8', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('营业外支出', 'EXPENSE', 'fbe5f3cf-04db-416e-9628-3d7fd950cf54', 0, '6711', 'f65a09fc-65d5-4473-841e-6c22f56a8f85', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
INSERT INTO financialsys.accounts (name, account_type, parent_guid, placeholder, code, guid, created_at, updated_at) VALUES ('费用', 'EXPENSE', null, 1, '5456', 'fbe5f3cf-04db-416e-9628-3d7fd950cf54', '2026-12-28 13:05:20', '2026-12-28 13:05:20');
