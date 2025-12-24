import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const cashFlowData = [
  { month: '7月', amount: 450000 },
  { month: '8月', amount: 520000 },
  { month: '9月', amount: 480000 },
  { month: '10月', amount: 620000 },
  { month: '11月', amount: 580000 },
  { month: '12月', amount: 720000 },
];

const todoItems = [
  { id: 1, type: 'approval', title: '待审核采购订单 #PO-2024-1156', deadline: '今天 17:00', urgent: true },
  { id: 2, type: 'entry', title: '12月工资发放凭证待录入', deadline: '明天', urgent: false },
  { id: 3, type: 'review', title: '第四季度财务报表待复核', deadline: '本周五', urgent: false },
  { id: 4, type: 'payment', title: '应付供应商款项到期提醒', deadline: '12月28日', urgent: true },
];

export function Dashboard() {
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
                ¥ 7,245,680.00
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                <span className="text-[#10B981]">+12.5%</span>
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
                ¥ 1,523,400.00
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                <span className="text-[#10B981]">+8.3%</span>
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
                ¥ 3,856,230.00
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingDown className="w-4 h-4 text-[#DC2626]" />
                <span className="text-[#DC2626]">-5.2%</span>
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
              <LineChart data={cashFlowData}>
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
              {todoItems.map((item) => (
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
