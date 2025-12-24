import { useState } from 'react';
import { FileDown, Printer, Calendar, ArrowUpRight, ArrowDownRight, MinusCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface BalanceSheetItem {
  code: string;
  name: string;
  amount: number;
  isParent?: boolean;
  isTotal?: boolean;
  indent?: number;
}

interface IncomeStatementItem {
  code: string;
  name: string;
  amount: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
}

interface CashFlowItem {
  name: string;
  amount: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
  indent?: number;
  icon?: 'up' | 'down' | 'neutral';
}

// Balance Sheet Data
const assetsData: BalanceSheetItem[] = [
  { code: '', name: '流动资产:', amount: 0, isParent: true, indent: 0 },
  { code: '1001', name: '库存现金', amount: 125000, indent: 1 },
  { code: '1002', name: '银行存款', amount: 7120680, indent: 1 },
  { code: '1012', name: '其他货币资金', amount: 0, indent: 1 },
  { code: '1121', name: '应收账款', amount: 1856000, indent: 1 },
  { code: '1403', name: '原材料', amount: 2450000, indent: 1 },
  { code: '', name: '流动资产合计', amount: 11551680, isParent: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '非流动资产:', amount: 0, isParent: true, indent: 0 },
  { code: '1201', name: '长期股权投资', amount: 5000000, indent: 1 },
  { code: '1601', name: '固定资产', amount: 12500000, indent: 1 },
  { code: '', name: '非流动资产合计', amount: 17500000, isParent: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '资产总计', amount: 29051680, isTotal: true, indent: 0 },
];

const liabilitiesData: BalanceSheetItem[] = [
  { code: '', name: '流动负债:', amount: 0, isParent: true, indent: 0 },
  { code: '2202', name: '应付账款', amount: 3856230, indent: 1 },
  { code: '2241', name: '应付职工薪酬', amount: 850000, indent: 1 },
  { code: '2501', name: '短期借款', amount: 2000000, indent: 1 },
  { code: '', name: '流动负债合计', amount: 6706230, isParent: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '所有者权益:', amount: 0, isParent: true, indent: 0 },
  { code: '4001', name: '实收资本', amount: 10000000, indent: 1 },
  { code: '4002', name: '资本公积', amount: 4145000, indent: 1 },
  { code: '4103', name: '未分配利润', amount: 8200450, indent: 1 },
  { code: '', name: '所有者权益合计', amount: 22345450, isParent: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '负债及权益总计', amount: 29051680, isTotal: true, indent: 0 },
];

// Income Statement Data
const incomeStatementData: IncomeStatementItem[] = [
  { code: '', name: '一、营业收入', amount: 8560000, isSubtotal: true, indent: 0 },
  { code: '6001', name: '主营业务收入', amount: 8250000, indent: 1 },
  { code: '6051', name: '其他业务收入', amount: 310000, indent: 1 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '二、营业成本', amount: 4850000, isSubtotal: true, indent: 0 },
  { code: '6401', name: '主营业务成本', amount: 4650000, indent: 1 },
  { code: '6402', name: '其他业务成本', amount: 200000, indent: 1 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '三、营业税金及附加', amount: 125000, isSubtotal: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '四、销售费用', amount: 580000, isSubtotal: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '五、管理费用', amount: 920000, isSubtotal: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '六、财务费用', amount: 85000, isSubtotal: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '营业利润', amount: 2000000, isSubtotal: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '加：营业外收入', amount: 50000, indent: 0 },
  { code: '', name: '减：营业外支出', amount: 25000, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '利润总额', amount: 2025000, isSubtotal: true, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '减：所得税费用', amount: 501600, indent: 0 },
  { code: '', name: '', amount: 0, indent: 0 },
  { code: '', name: '净利润', amount: 1523400, isTotal: true, indent: 0 },
];

// Cash Flow Statement Data
const cashFlowData: CashFlowItem[] = [
  { name: '一、经营活动产生的现金流量', amount: 0, isSubtotal: true, indent: 0 },
  { name: '销售商品、提供劳务收到的现金', amount: 8950000, indent: 1, icon: 'up' },
  { name: '收到的税费返还', amount: 120000, indent: 1, icon: 'up' },
  { name: '收到其他与经营活动有关的现金', amount: 85000, indent: 1, icon: 'up' },
  { name: '购买商品、接受劳务支付的现金', amount: 5200000, indent: 1, icon: 'down' },
  { name: '支付给职工以及为职工支付的现金', amount: 1850000, indent: 1, icon: 'down' },
  { name: '支付的各项税费', amount: 680000, indent: 1, icon: 'down' },
  { name: '支付其他与经营活动有关的现金', amount: 425000, indent: 1, icon: 'down' },
  { name: '经营活动现金流量净额', amount: 1000000, isSubtotal: true, indent: 0 },
  { name: '', amount: 0, indent: 0 },
  { name: '二、投资活动产生的现金流量', amount: 0, isSubtotal: true, indent: 0 },
  { name: '收回投资收到的现金', amount: 0, indent: 1, icon: 'up' },
  { name: '取得投资收益收到的现金', amount: 150000, indent: 1, icon: 'up' },
  { name: '购建固定资产支付的现金', amount: 800000, indent: 1, icon: 'down' },
  { name: '投资支付的现金', amount: 500000, indent: 1, icon: 'down' },
  { name: '投资活动现金流量净额', amount: -1150000, isSubtotal: true, indent: 0 },
  { name: '', amount: 0, indent: 0 },
  { name: '三、筹资活动产生的现金流量', amount: 0, isSubtotal: true, indent: 0 },
  { name: '吸收投资收到的现金', amount: 0, indent: 1, icon: 'up' },
  { name: '取得借款收到的现金', amount: 2000000, indent: 1, icon: 'up' },
  { name: '偿还债务支付的现金', amount: 1000000, indent: 1, icon: 'down' },
  { name: '分配股利、利润支付的现金', amount: 500000, indent: 1, icon: 'down' },
  { name: '筹资活动现金流量净额', amount: 500000, isSubtotal: true, indent: 0 },
  { name: '', amount: 0, indent: 0 },
  { name: '四、现金及现金等价物净增加额', amount: 350000, isTotal: true, indent: 0 },
  { name: '加：期初现金及现金等价物余额', amount: 6895680, indent: 0 },
  { name: '五、期末现金及现金等价物余额', amount: 7245680, isTotal: true, indent: 0 },
];

export function ReportCenter() {
  const [period, setPeriod] = useState('2024-12');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const renderBalanceSheetRow = (item: BalanceSheetItem, index: number) => {
    if (item.name === '') {
      return <tr key={index} className="h-2"></tr>;
    }

    const isHovered = hoveredItem === `${item.code}-${item.name}`;

    return (
      <tr 
        key={index}
        className={`border-b border-gray-100 ${isHovered && item.amount > 0 ? 'bg-blue-50' : ''}`}
        onMouseEnter={() => item.amount > 0 && setHoveredItem(`${item.code}-${item.name}`)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <td className="px-4 py-2">
          <div style={{ paddingLeft: `${(item.indent || 0) * 24}px` }}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`
                      ${item.isTotal ? 'font-bold text-[#1A365D]' : ''}
                      ${item.isParent && !item.isTotal ? 'font-semibold' : ''}
                      ${item.isParent || item.isTotal ? '' : 'text-gray-700'}
                      ${isHovered && item.amount > 0 ? 'cursor-pointer text-blue-600' : ''}
                    `}
                  >
                    {item.name}
                  </span>
                </TooltipTrigger>
                {isHovered && item.amount > 0 && (
                  <TooltipContent>
                    <p className="text-xs">点击查看明细账</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </td>
        <td className={`px-4 py-2 text-right font-mono ${
          item.isTotal ? 'font-bold text-[#1A365D]' : ''
        }`}>
          {item.amount > 0 && (
            <span className={item.isTotal || item.isParent ? 'border-b-2 border-gray-800' : ''}>
              {item.amount.toLocaleString()}.00
            </span>
          )}
        </td>
      </tr>
    );
  };

  const renderIncomeStatementRow = (item: IncomeStatementItem, index: number) => {
    if (item.name === '') {
      return <tr key={index} className="h-2"></tr>;
    }

    return (
      <tr key={index} className="border-b border-gray-100">
        <td className="px-6 py-2">
          <div style={{ paddingLeft: `${(item.indent || 0) * 24}px` }}>
            <span className={`
              ${item.isTotal ? 'font-bold text-[#1A365D]' : ''}
              ${item.isSubtotal ? 'font-semibold' : ''}
              ${!item.isTotal && !item.isSubtotal ? 'text-gray-700' : ''}
            `}>
              {item.name}
            </span>
          </div>
        </td>
        <td className={`px-6 py-2 text-right font-mono ${
          item.isTotal || item.isSubtotal ? 'font-semibold' : ''
        } ${item.isTotal ? 'text-[#10B981]' : ''}`}>
          {item.amount > 0 && (
            <span className={item.isTotal ? 'border-b-2 border-[#10B981]' : item.isSubtotal ? 'border-b border-gray-400' : ''}>
              {item.amount.toLocaleString()}.00
            </span>
          )}
        </td>
      </tr>
    );
  };

  const renderCashFlowRow = (item: CashFlowItem, index: number) => {
    if (item.name === '') {
      return <tr key={index} className="h-2"></tr>;
    }

    return (
      <tr key={index} className="border-b border-gray-100">
        <td className="px-6 py-2">
          <div style={{ paddingLeft: `${(item.indent || 0) * 24}px` }} className="flex items-center gap-2">
            {item.icon === 'up' && <ArrowUpRight className="w-4 h-4 text-[#10B981]" />}
            {item.icon === 'down' && <ArrowDownRight className="w-4 h-4 text-[#DC2626]" />}
            <span className={`
              ${item.isTotal ? 'font-bold text-[#1A365D]' : ''}
              ${item.isSubtotal ? 'font-semibold' : ''}
              ${!item.isTotal && !item.isSubtotal ? 'text-gray-700' : ''}
            `}>
              {item.name}
            </span>
          </div>
        </td>
        <td className={`px-6 py-2 text-right font-mono ${
          item.isTotal || item.isSubtotal ? 'font-semibold' : ''
        } ${item.amount < 0 ? 'text-[#DC2626]' : ''} ${item.isTotal ? 'text-[#1A365D]' : ''}`}>
          {item.amount !== 0 && (
            <span className={item.isTotal ? 'border-b-2 border-[#1A365D]' : item.isSubtotal ? 'border-b border-gray-400' : ''}>
              {item.amount < 0 ? `(${Math.abs(item.amount).toLocaleString()}.00)` : `${item.amount.toLocaleString()}.00`}
            </span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>报表中心</h1>
      </div>

      {/* Toolbar */}
      <Card className="p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <label className="text-sm text-gray-700">会计期间:</label>
            </div>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-12">2024 年 12 月</SelectItem>
                <SelectItem value="2024-11">2024 年 11 月</SelectItem>
                <SelectItem value="2024-10">2024 年 10 月</SelectItem>
                <SelectItem value="2024-Q4">2024 年 第四季度</SelectItem>
                <SelectItem value="2024">2024 年度</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-2" />
              导出 Excel
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              打印
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs for Three Statements */}
      <Tabs defaultValue="balance-sheet" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 mx-auto">
          <TabsTrigger value="balance-sheet">资产负债表</TabsTrigger>
          <TabsTrigger value="income-statement">利润表</TabsTrigger>
          <TabsTrigger value="cash-flow">现金流量表</TabsTrigger>
        </TabsList>

        {/* Balance Sheet */}
        <TabsContent value="balance-sheet">
          <Card className="shadow-md overflow-hidden bg-white" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="text-center py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="mb-2">资产负债表</h2>
              <p className="text-sm text-gray-600">Balance Sheet</p>
              <p className="text-sm text-gray-500 mt-2">会计期间: {period}</p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-gray-300">
              <div>
                <div className="bg-[#1A365D] text-white px-4 py-3 text-center font-semibold">
                  资产 (Assets)
                </div>
                <table className="w-full">
                  <tbody>
                    {assetsData.map((item, index) => renderBalanceSheetRow(item, index))}
                  </tbody>
                </table>
              </div>

              <div>
                <div className="bg-[#1A365D] text-white px-4 py-3 text-center font-semibold">
                  负债及权益 (Liabilities & Equity)
                </div>
                <table className="w-full">
                  <tbody>
                    {liabilitiesData.map((item, index) => renderBalanceSheetRow(item, index))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gray-600">编制单位: GnuCash-Lite 演示公司</p>
                  <p className="text-gray-600 mt-1">编制日期: 2024-12-24</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">单位: 人民币元</p>
                  <p className="text-gray-600 mt-1">法定代表人: ________ 财务负责人: ________</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Income Statement */}
        <TabsContent value="income-statement">
          <Card className="shadow-md overflow-hidden bg-white" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="text-center py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="mb-2">利润表</h2>
              <p className="text-sm text-gray-600">Income Statement</p>
              <p className="text-sm text-gray-500 mt-2">会计期间: {period}</p>
            </div>

            <table className="w-full">
              <thead className="bg-[#1A365D] text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">项目</th>
                  <th className="px-6 py-3 text-right font-semibold">本期金额</th>
                </tr>
              </thead>
              <tbody>
                {incomeStatementData.map((item, index) => renderIncomeStatementRow(item, index))}
              </tbody>
            </table>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gray-600">编制单位: GnuCash-Lite 演示公司</p>
                  <p className="text-gray-600 mt-1">编制日期: 2024-12-24</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">单位: 人民币元</p>
                  <p className="text-gray-600 mt-1">法定代表人: ________ 财务负责人: ________</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Cash Flow Statement */}
        <TabsContent value="cash-flow">
          <Card className="shadow-md overflow-hidden bg-white" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="text-center py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="mb-2">现金流量表</h2>
              <p className="text-sm text-gray-600">Cash Flow Statement</p>
              <p className="text-sm text-gray-500 mt-2">会计期间: {period}</p>
            </div>

            <table className="w-full">
              <thead className="bg-[#1A365D] text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">项目</th>
                  <th className="px-6 py-3 text-right font-semibold">本期金额</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((item, index) => renderCashFlowRow(item, index))}
              </tbody>
            </table>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gray-600">编制单位: GnuCash-Lite 演示公司</p>
                  <p className="text-gray-600 mt-1">编制日期: 2024-12-24</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">单位: 人民币元</p>
                  <p className="text-gray-600 mt-1">法定代表人: ________ 财务负责人: ________</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
          <div>
            <p className="font-medium text-blue-900 mb-1">报表说明</p>
            <p className="text-sm text-blue-700">
              财务三大报表全面反映企业的财务状况和经营成果。资产负债表展示特定日期的财务状况，利润表反映一定期间的经营成果，现金流量表揭示现金收支变化。
              三表相互关联，共同构成完整的财务报告体系。
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
