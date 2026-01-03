        # 获取贷方科目
        if order.credit_account_guid:
            # 使用订单中指定的贷方科目
            credit_account = Account.query.filter_by(guid=order.credit_account_guid).first()
            if not credit_account:
                raise ResourceNotFoundError("贷方科目", order.credit_account_guid)
        else:
            # 如果没有指定，默认使用应付账款（向后兼容）
            payable_accounts = Account.query.filter_by(
                account_type="LIABILITY",
                name="应付账款"
            ).all()
            
            if not payable_accounts:
                # 如果没有应付账款科目，创建一个
                from app.schemas.account_schemas import AccountCreate
                payable_account_data = AccountCreate(
                    name="应付账款",
                    account_type="LIABILITY",
                    parent_guid=None,
                    placeholder=False
                )
                credit_account = AccountService.create_account(payable_account_data)
            else:
                credit_account = payable_accounts[0]

