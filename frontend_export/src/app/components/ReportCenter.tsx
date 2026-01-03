import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, Printer, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ReportAPI } from '../api/api';
import { BalanceSheet } from './reports/BalanceSheet';
import { IncomeStatement } from './reports/IncomeStatement';
import { CashFlowStatement } from './reports/CashFlowStatement';
import { format } from 'date-fns';

// 获取默认时间段（当前月份，如果没有数据则使用2026年1月）
const getDefaultPeriod = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // 默认使用当前月份，如果当前月份还没有数据，则使用2026年1月（因为数据在2026年）
  if (year >= 2026) {
    return `${year}-${String(month).padStart(2, '0')}`;
  } else {
    return '2026-01'; // 默认使用2026年1月，因为数据在这个月份
  }
};

// 生成2025年1月到2026年12月的月份选项
const generateMonthOptions = (): Array<{ value: string; label: string }> => {
  const options: Array<{ value: string; label: string }> = [];
  
  // 生成2025年1月到12月
  for (let month = 1; month <= 12; month++) {
    const monthStr = String(month).padStart(2, '0');
    const value = `2025-${monthStr}`;
    const label = `2025 年 ${month} 月`;
    options.push({ value, label });
  }
  
  // 生成2026年1月到12月
  for (let month = 1; month <= 12; month++) {
    const monthStr = String(month).padStart(2, '0');
    const value = `2026-${monthStr}`;
    const label = `2026 年 ${month} 月`;
    options.push({ value, label });
  }
  
  // 添加季度选项（2025年和2026年的所有季度）
  for (let year = 2025; year <= 2026; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      const value = `${year}-Q${quarter}`;
      const label = `${year} 年 第${['', '一', '二', '三', '四'][quarter]}季度`;
      options.push({ value, label });
    }
  }
  
  // 添加年度选项
  options.push({ value: '2025', label: '2025 年度' });
  options.push({ value: '2026', label: '2026 年度' });
  
  return options;
};

export function ReportCenter() {
  // 默认显示2025年1月
  const defaultPeriod = useMemo(() => getDefaultPeriod(), []);
  const [period, setPeriod] = useState(defaultPeriod);
  const [periodType, setPeriodType] = useState<'preset' | 'custom'>('preset');
  // 默认自定义日期范围为2025年1月1日到2026年12月31日
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(
    new Date(2025, 0, 1)
  );
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(
    new Date(2026, 11, 31)
  );
  const [balanceSheetData, setBalanceSheetData] = useState<any>(null);
  const [incomeStatementData, setIncomeStatementData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  // 解析期间字符串，返回开始和结束日期
  const parsePeriod = (periodStr: string): { startDate: string; endDate: string } => {
    if (periodStr.includes('-Q')) {
      // 季度：2025-Q4
      const [year, quarter] = periodStr.split('-Q');
      const quarterNum = parseInt(quarter);
      const startMonth = (quarterNum - 1) * 3 + 1;
      const endMonth = quarterNum * 3;
      const daysInEndMonth = new Date(parseInt(year), endMonth, 0).getDate();
      return {
        startDate: `${year}-${String(startMonth).padStart(2, '0')}-01`,
        endDate: `${year}-${String(endMonth).padStart(2, '0')}-${daysInEndMonth}`,
      };
    } else if (periodStr.includes('-')) {
      // 月份：2025-12
      const [year, month] = periodStr.split('-');
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
      return {
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-${daysInMonth}`,
      };
    } else {
      // 年度：2025
      return {
        startDate: `${periodStr}-01-01`,
        endDate: `${periodStr}-12-31`,
      };
    }
  };
  
  // 获取当前使用的日期范围
  const getDateRange = (): { startDate: string; endDate: string } => {
    if (periodType === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: format(customStartDate, 'yyyy-MM-dd'),
        endDate: format(customEndDate, 'yyyy-MM-dd'),
      };
    }
    return parsePeriod(period);
  };
  
  // 格式化期间显示文本
  const getPeriodDisplayText = (): string => {
    if (periodType === 'custom' && customStartDate && customEndDate) {
      return `${format(customStartDate, 'yyyy年MM月dd日')} - ${format(customEndDate, 'yyyy年MM月dd日')}`;
    }
    const option = monthOptions.find(opt => opt.value === period);
    return option ? option.label : period;
  };

  // 获取资产负债表数据
  const fetchBalanceSheet = async () => {
    try {
      setIsLoading(true);
      const { endDate } = getDateRange();
      const data = await ReportAPI.getBalanceSheet(endDate);
      console.log('Balance Sheet Data:', data); // 调试日志
      setBalanceSheetData(data);
    } catch (error) {
      console.error('Failed to fetch balance sheet:', error);
      setBalanceSheetData(null); // 确保错误时清空数据
    } finally {
      setIsLoading(false);
    }
  };

  // 获取利润表数据
  const fetchIncomeStatement = async () => {
    try {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange();
      const data = await ReportAPI.getIncomeStatement(startDate, endDate);
      console.log('Income Statement Data:', data); // 调试日志
      setIncomeStatementData(data);
    } catch (error) {
      console.error('Failed to fetch income statement:', error);
      setIncomeStatementData(null); // 确保错误时清空数据
    } finally {
      setIsLoading(false);
    }
  };

  // 获取现金流量表数据
  const fetchCashFlow = async () => {
    try {
      setIsLoading(true);
      const { startDate, endDate } = getDateRange();
      const data = await ReportAPI.getCashFlowStatement(startDate, endDate);
      console.log('Cash Flow Data:', data); // 调试日志
      setCashFlowData(data);
    } catch (error) {
      console.error('Failed to fetch cash flow statement:', error);
      setCashFlowData(null); // 确保错误时清空数据
    } finally {
      setIsLoading(false);
    }
  };

  // 当期间改变时，重新获取数据
  useEffect(() => {
    if (periodType === 'preset' || (periodType === 'custom' && customStartDate && customEndDate)) {
      fetchBalanceSheet();
      fetchIncomeStatement();
      fetchCashFlow();
    }
  }, [period, periodType, customStartDate, customEndDate]);
  
  // 处理预设期间选择
  const handlePresetPeriodChange = (value: string) => {
    if (value === '__custom__') {
      setPeriodType('custom');
      // 如果没有选择日期，默认设置为2025年1月1日到2026年12月31日
      if (!customStartDate || !customEndDate) {
        setCustomStartDate(new Date(2025, 0, 1));
        setCustomEndDate(new Date(2026, 11, 31));
      }
    } else {
      setPeriodType('preset');
      setPeriod(value);
    }
  };
  
  // 处理自定义日期确认
  const handleCustomDateConfirm = () => {
    if (customStartDate && customEndDate) {
      if (customStartDate > customEndDate) {
        alert('开始日期不能晚于结束日期');
        return;
      }
      setPeriodType('custom');
      // 触发数据刷新
      fetchBalanceSheet();
      fetchIncomeStatement();
      fetchCashFlow();
    }
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
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <label className="text-sm text-gray-700">会计期间:</label>
            </div>
            
            {/* 预设期间选择 */}
            {periodType === 'preset' && (
              <Select value={period} onValueChange={handlePresetPeriodChange}>
                <SelectTrigger className="w-48 bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">自定义时间</SelectItem>
              </SelectContent>
            </Select>
            )}
            
            {/* 自定义时间选择 */}
            {periodType === 'custom' && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-64 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate && customEndDate
                        ? `${format(customStartDate, 'yyyy-MM-dd')} ~ ${format(customEndDate, 'yyyy-MM-dd')}`
                        : '选择日期范围'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">开始日期</Label>
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                          initialFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">结束日期</Label>
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                          disabled={(date) => customStartDate ? date < customStartDate : false}
                        />
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button 
                          onClick={handleCustomDateConfirm} 
                          className="flex-1"
                          disabled={!customStartDate || !customEndDate}
                        >
                          确认
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPeriodType('preset');
                            setCustomStartDate(new Date(2025, 0, 1));
                            setCustomEndDate(new Date(2026, 11, 31));
                          }}
                          className="flex-1"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPeriodType('preset');
                    setCustomStartDate(new Date(2025, 0, 1));
                    setCustomEndDate(new Date(2026, 11, 31));
                  }}
                >
                  返回预设
                </Button>
              </div>
            )}
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : balanceSheetData ? (
            <BalanceSheet
              assets={balanceSheetData.assets || []}
              liabilities={balanceSheetData.liabilities || []}
              equity={balanceSheetData.equity || []}
              totalAssets={balanceSheetData.total_assets || 0}
              totalLiabilities={balanceSheetData.total_liabilities || 0}
              totalEquity={balanceSheetData.total_equity || 0}
              reportDate={period}
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">无法加载数据</div>
            </div>
          )}
        </TabsContent>

        {/* Income Statement */}
        <TabsContent value="income-statement">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : incomeStatementData ? (
            <IncomeStatement
              income={incomeStatementData.income || []}
              expenses={incomeStatementData.expenses || []}
              totalIncome={incomeStatementData.total_income || 0}
              totalExpenses={incomeStatementData.total_expenses || 0}
              netIncome={incomeStatementData.net_income || 0}
              reportPeriod={period}
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">无法加载数据</div>
            </div>
          )}
        </TabsContent>

        {/* Cash Flow Statement */}
        <TabsContent value="cash-flow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : cashFlowData ? (
            <CashFlowStatement data={cashFlowData} reportPeriod={period} />
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">无法加载数据</div>
            </div>
          )}
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
