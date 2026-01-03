import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle, CheckCircle, Scale, Building2, Wallet, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReportAPI } from '../api/api';

interface AccountingEquation {
  is_balanced: boolean;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;  // 权益类科目余额（不含净利润）
  net_income: number;  // 净利润
  total_equity_with_income: number;  // 完整的所有者权益（含净利润）
  right_side: number;
  difference: number;
  tolerance: number;
}

interface AccountSummary {
  assets: number;
  liabilities: number;
  equity: number;
  income: number;
  expenses: number;
  net_income: number;
}

interface DashboardData {
  cash_and_equivalents: number;
  cash_growth_rate: number;
  net_income: number;
  net_income_growth_rate: number;
  accounts_payable: number;
  accounts_payable_growth_rate: number;
  cash_flow_data: Array<{ month: string; amount: number }>;
  todo_items: Array<{
    id: number;
    type: string;
    title: string;
    deadline: string;
    urgent: boolean;
  }>;
  accounting_equation?: AccountingEquation;
  account_summary?: AccountSummary;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await ReportAPI.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">无法加载数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">现金及等价物</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="font-mono" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                ¥ {dashboardData.cash_and_equivalents.toLocaleString()}.00
              </div>
              <div className="flex items-center gap-1 text-sm">
                {dashboardData.cash_growth_rate >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[#10B981]">+{dashboardData.cash_growth_rate.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-[#DC2626]" />
                    <span className="text-[#DC2626]">{dashboardData.cash_growth_rate.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-gray-500 ml-1">较上月</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">本月净利润</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="font-mono" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                ¥ {dashboardData.net_income.toLocaleString()}.00
              </div>
              <div className="flex items-center gap-1 text-sm">
                {dashboardData.net_income_growth_rate >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[#10B981]">+{dashboardData.net_income_growth_rate.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-[#DC2626]" />
                    <span className="text-[#DC2626]">{dashboardData.net_income_growth_rate.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-gray-500 ml-1">较上月</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payables */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">应付账款</CardTitle>
            <CreditCard className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="font-mono" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                ¥ {dashboardData.accounts_payable.toLocaleString()}.00
              </div>
              <div className="flex items-center gap-1 text-sm">
                {dashboardData.accounts_payable_growth_rate >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-[#DC2626]" />
                    <span className="text-[#DC2626]">+{dashboardData.accounts_payable_growth_rate.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[#10B981]">{dashboardData.accounts_payable_growth_rate.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-gray-500 ml-1">较上月</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Summary - 科目余额汇总 */}
      {dashboardData.account_summary && (
        <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-800">科目余额汇总</CardTitle>
                <p className="text-sm text-gray-600 mt-1">各科目类型余额明细</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 资产 */}
              <div className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">资产</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-green-600 font-mono">
                    ¥ {dashboardData.account_summary.assets.toLocaleString()}.00
                  </p>
                </div>
              </div>

              {/* 负债 */}
              <div className="bg-white rounded-lg p-4 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-red-100">
                      <CreditCard className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">负债</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-red-600 font-mono">
                    ¥ {dashboardData.account_summary.liabilities.toLocaleString()}.00
                  </p>
                </div>
              </div>

              {/* 权益 */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Wallet className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">权益</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-purple-600 font-mono">
                    ¥ {dashboardData.account_summary.equity.toLocaleString()}.00
                  </p>
                </div>
              </div>

              {/* 收入 */}
              <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <TrendingUpIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">收入</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-blue-600 font-mono">
                    ¥ {dashboardData.account_summary.income.toLocaleString()}.00
                  </p>
                </div>
              </div>

              {/* 费用 */}
              <div className="bg-white rounded-lg p-4 border-2 border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <TrendingDownIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">费用</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-orange-600 font-mono">
                    ¥ {dashboardData.account_summary.expenses.toLocaleString()}.00
                  </p>
                </div>
              </div>

              {/* 净利润 */}
              <div className={`bg-white rounded-lg p-4 border-2 shadow-sm hover:shadow-md transition-shadow ${
                dashboardData.account_summary.net_income >= 0 
                  ? 'border-green-300' 
                  : 'border-red-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      dashboardData.account_summary.net_income >= 0 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {dashboardData.account_summary.net_income >= 0 ? (
                        <TrendingUpIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDownIcon className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">净利润</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className={`text-2xl font-bold font-mono ${
                    dashboardData.account_summary.net_income >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    ¥ {dashboardData.account_summary.net_income.toLocaleString()}.00
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboardData.account_summary.net_income >= 0 ? '盈利' : '亏损'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounting Equation Verification */}
      {dashboardData.accounting_equation && (
        <Card className={`shadow-md border-2 ${
          dashboardData.accounting_equation.is_balanced 
            ? 'border-green-500 bg-green-50' 
            : 'border-red-500 bg-red-50'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  dashboardData.accounting_equation.is_balanced 
                    ? 'bg-green-100' 
                    : 'bg-red-100'
                }`}>
                  <Scale className={`w-6 h-6 ${
                    dashboardData.accounting_equation.is_balanced 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-lg">会计恒等式验证</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">资产 = 负债 + 所有者权益</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold ${
                dashboardData.accounting_equation.is_balanced 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {dashboardData.accounting_equation.is_balanced ? '✓ 平衡' : '✗ 不平衡'}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Equation Display */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">资产</p>
                    <p className="text-xl font-bold text-[#1A365D]">
                      ¥ {dashboardData.accounting_equation.total_assets.toLocaleString()}.00
                    </p>
                  </div>
                  <div className="text-center text-2xl font-bold text-gray-400">=</div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">负债 + 权益</p>
                    <p className="text-xl font-bold text-[#1A365D]">
                      ¥ {dashboardData.accounting_equation.right_side.toLocaleString()}.00
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">负债总额</p>
                  <p className="text-lg font-semibold">
                    ¥ {dashboardData.accounting_equation.total_liabilities.toLocaleString()}.00
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">所有者权益（含净利润）</p>
                  <p className="text-lg font-semibold">
                    ¥ {dashboardData.accounting_equation.total_equity_with_income.toLocaleString()}.00
                  </p>
                </div>
              </div>

              {/* Net Income Breakdown */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-medium text-blue-800 mb-2">所有者权益构成</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">权益类科目余额:</span>
                    <span className="font-mono">¥ {dashboardData.accounting_equation.total_equity.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">净利润（收入-费用）:</span>
                    <span className={`font-mono ${dashboardData.accounting_equation.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ¥ {dashboardData.accounting_equation.net_income.toLocaleString()}.00
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-blue-300">
                    <span className="font-medium text-blue-900">所有者权益合计:</span>
                    <span className="font-mono font-bold text-blue-900">
                      ¥ {dashboardData.accounting_equation.total_equity_with_income.toLocaleString()}.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Difference */}
              {!dashboardData.accounting_equation.is_balanced && (
                <div className="bg-red-100 rounded-lg p-3 border border-red-300">
                  <p className="text-sm font-medium text-red-800 mb-1">差异</p>
                  <p className="text-lg font-bold text-red-600">
                    ¥ {Math.abs(dashboardData.accounting_equation.difference).toLocaleString()}.00
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    允许误差范围: ±¥ {dashboardData.accounting_equation.tolerance.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>近 6 个月资金流向</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.cash_flow_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis 
                  stroke="#6b7280"
                  allowDecimals={false}
                  tickFormatter={(value: number) => {
                    // 处理可能的非数字值
                    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
                      return '0';
                    }
                    
                    // 四舍五入到整数
                    const roundedValue = Math.round(value);
                    const absValue = Math.abs(roundedValue);
                    
                    // 处理0值
                    if (absValue === 0) {
                      return '0';
                    }
                    
                    // 大于等于1亿，显示为"X.X亿"
                    if (absValue >= 100000000) {
                      const formatted = (roundedValue / 100000000).toFixed(1);
                      // 去掉末尾的0和小数点
                      return `${formatted.replace(/\.0$/, '')}亿`;
                    } 
                    // 大于等于1万，显示为"X.X万"
                    else if (absValue >= 10000) {
                      const formatted = (roundedValue / 10000).toFixed(1);
                      // 去掉末尾的0和小数点
                      return `${formatted.replace(/\.0$/, '')}万`;
                    } 
                    // 小于1万，直接显示数字
                    else {
                      return roundedValue.toLocaleString('zh-CN');
                    }
                  }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={(value: number) => `¥ ${value.toLocaleString()}`}
                  contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#1A365D" 
                  strokeWidth={3}
                  dot={{ fill: '#1A365D', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* To-Do List */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>待办任务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.todo_items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-0.5">
                    {item.urgent ? (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.deadline}</p>
                  </div>
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap"
                    onClick={() => {
                      if (item.type === 'approval' && onNavigate) {
                        onNavigate('purchase');
                      }
                    }}
                  >
                    去处理
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
