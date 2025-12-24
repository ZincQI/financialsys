from decimal import Decimal

class MathUtils:
    @staticmethod
    def decimal_to_fraction(amount):
        """将Decimal金额转换为分子分母形式
        例如：100.50 -> (10050, 100)
        """
        if isinstance(amount, float):
            amount = Decimal(str(amount))
        elif not isinstance(amount, Decimal):
            amount = Decimal(amount)
        
        # 将Decimal转换为分数
        sign, digits, exp = amount.as_tuple()
        factor = 10 ** abs(exp)
        if exp >= 0:
            num = int(''.join(map(str, digits))) * (10 ** exp)
            denom = 1
        else:
            num = int(''.join(map(str, digits)))
            denom = factor
        
        # 处理符号
        if sign:
            num = -num
        
        return num, denom
    
    @staticmethod
    def fraction_to_decimal(num, denom):
        """将分子分母转换为Decimal金额
        例如：(10050, 100) -> 100.50
        """
        return Decimal(num) / Decimal(denom)

# 创建工具类实例，方便直接导入使用
decimal_to_fraction = MathUtils.decimal_to_fraction
fraction_to_decimal = MathUtils.fraction_to_decimal
