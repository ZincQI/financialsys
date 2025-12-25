import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReportAPI } from '../api/api';

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
}

export function Dashboard() {
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
                <YAxis stroke="#6b7280" />
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
                  <button className="text-xs text-blue-600 hover:text-blue-700 hover:underline whitespace-nowrap">
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
