import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, X, Calendar, DollarSign, FileText, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Scale, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AccountAPI, ReportAPI } from '../api/api';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

interface Account {
  guid: string;
  code: string;
  name: string;
  account_type: string;
  parent_guid: string | null;
  placeholder: boolean;
  balance?: number;
  children?: Account[];
}

export function QuickEntry() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 会计恒等式验证数据
  const [accountingEquation, setAccountingEquation] = useState<any>(null);
  const [isLoadingEquation, setIsLoadingEquation] = useState(false);
  
  // 快速记账表单
  const [entryForm, setEntryForm] = useState({
    post_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    opposite_account_guid: '',
    memo: ''
  });
  
  // 对方科目选项
  const [oppositeAccountOptions, setOppositeAccountOptions] = useState<Account[]>([]);
  
  // 科目类型中文映射
  const accountTypeLabels: Record<string, string> = {
    'ASSET': '资产',
    'LIABILITY': '负债',
    'EQUITY': '所有者权益',
    'INCOME': '收入',
    'EXPENSE': '费用'
  };
  
  // 获取科目树和会计恒等式验证
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsLoadingEquation(true);
        
        // 并行获取科目树和会计恒等式验证
        const [accounts, equation] = await Promise.all([
          AccountAPI.getAccountTree(),
          ReportAPI.getDashboardData().catch(() => null)
        ]);
        
        setAccountsData(accounts);
        
        // 默认展开根节点
        const rootGuids = accounts.map((acc: Account) => acc.guid);
        setExpandedNodes(new Set(rootGuids));
        
        // 设置会计恒等式验证数据
        if (equation && equation.accounting_equation) {
          setAccountingEquation(equation.accounting_equation);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('获取数据失败');
      } finally {
        setIsLoading(false);
        setIsLoadingEquation(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 获取所有科目（用于对方科目选择）
  useEffect(() => {
    const fetchAllAccounts = async () => {
      try {
        const accounts = await AccountAPI.getAllAccounts();
        // 只显示非占位符的科目
        const nonPlaceholderAccounts = accounts.filter((acc: Account) => !acc.placeholder);
        setOppositeAccountOptions(nonPlaceholderAccounts);
      } catch (error) {
        console.error('Failed to fetch all accounts:', error);
      }
    };
    
    fetchAllAccounts();
  }, []);
  
  // 切换节点展开/折叠
  const toggleNode = (guid: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(guid)) {
      newExpanded.delete(guid);
    } else {
      newExpanded.add(guid);
    }
    setExpandedNodes(newExpanded);
  };
  
  // 选择科目
  const handleSelectAccount = (account: Account) => {
    // 只允许选择非占位符的科目
    if (account.placeholder) {
      toast.warning('占位符科目不能记账，请选择具体科目');
      return;
    }
    setSelectedAccount(account);
    // 重置表单
    setEntryForm({
      post_date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      opposite_account_guid: '',
      memo: ''
    });
  };
  
  // 格式化余额显示
  const formatBalance = (balance: number | undefined): string => {
    if (balance === undefined) return '';
    const absBalance = Math.abs(balance);
    const sign = balance >= 0 ? '+' : '-';
    return `${sign}¥${absBalance.toFixed(2)}`;
  };
  
  // 获取余额颜色
  const getBalanceColor = (balance: number | undefined, accountType: string): string => {
    if (balance === undefined) return 'text-gray-400';
    if (balance === 0) return 'text-gray-500';
    
    // 根据科目类型和余额正负确定颜色
    if (accountType === 'ASSET') {
      return balance > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
    } else if (accountType === 'LIABILITY') {
      return balance < 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
    } else if (accountType === 'EQUITY') {
      return balance < 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
    } else if (accountType === 'INCOME') {
      return balance < 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
    } else if (accountType === 'EXPENSE') {
      return balance > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold';
    }
    return 'text-gray-600';
  };
  
  // 渲染科目树节点
  const renderAccountNode = (account: Account, level: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.guid);
    const isSelected = selectedAccount?.guid === account.guid;
    const balance = account.balance ?? 0;
    
    return (
      <div key={account.guid}>
        <div
          className={`flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-100 rounded transition-colors ${
            isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => handleSelectAccount(account)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(account.guid);
              }}
              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          
          <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`text-sm truncate ${account.placeholder ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                {account.code && <span className="text-gray-500 mr-1">{account.code}</span>}
                {account.name}
              </span>
            </div>
            
            {balance !== undefined && !account.placeholder && (
              <div className={`text-sm font-mono ${getBalanceColor(balance, account.account_type)}`}>
                {formatBalance(balance)}
              </div>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {account.children!.map((child) => renderAccountNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  // 提交快速记账
  const handleSubmit = async () => {
    if (!selectedAccount) {
      toast.error('请先选择科目');
      return;
    }
    
    if (!entryForm.amount || parseFloat(entryForm.amount) === 0) {
      toast.error('请输入金额');
      return;
    }
    
    if (!entryForm.opposite_account_guid) {
      toast.error('请选择对方科目');
      return;
    }
    
    if (!entryForm.description && !entryForm.memo) {
      toast.error('请输入摘要或备注');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 获取对方科目名称用于提示
      const oppositeAccount = allAccountsForSelect.find(acc => acc.guid === entryForm.opposite_account_guid);
      const oppositeAccountName = oppositeAccount ? `${oppositeAccount.code || ''} ${oppositeAccount.name}`.trim() : '未知科目';
      
      await AccountAPI.createQuickEntry(selectedAccount.guid, {
        post_date: entryForm.post_date,
        description: entryForm.description || entryForm.memo,
        amount: parseFloat(entryForm.amount),
        opposite_account_guid: entryForm.opposite_account_guid,
        memo: entryForm.memo
      });
      
      // 显示详细的成功提示
      const amount = parseFloat(entryForm.amount);
      const selectedAccountName = `${selectedAccount.code || ''} ${selectedAccount.name}`.trim();
      
      const description = [
        `日期：${entryForm.post_date}`,
        `摘要：${entryForm.description || entryForm.memo || '无'}`,
        `金额：¥${Math.abs(amount).toFixed(2)}`,
        `借方：${selectedAccountName}`,
        `贷方：${oppositeAccountName}`
      ].join('\n');
      
      toast.success('记账成功！', {
        description: description,
        duration: 5000,
      });
      
      // 重置表单
      setEntryForm({
        post_date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        opposite_account_guid: '',
        memo: ''
      });
      
      // 刷新科目树和会计恒等式验证（重新获取余额）
      const [accounts, dashboardData] = await Promise.all([
        AccountAPI.getAccountTree(),
        ReportAPI.getDashboardData().catch(() => null)
      ]);
      setAccountsData(accounts);
      
      if (dashboardData && dashboardData.accounting_equation) {
        setAccountingEquation(dashboardData.accounting_equation);
      }
      
    } catch (error: any) {
      console.error('Failed to create quick entry:', error);
      toast.error('记账失败', {
        description: error.message || '请检查输入信息后重试',
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 扁平化科目树，用于对方科目选择
  const flattenAccounts = (accounts: Account[]): Account[] => {
    let result: Account[] = [];
    accounts.forEach(account => {
      if (!account.placeholder) {
        result.push(account);
      }
      if (account.children) {
        result = result.concat(flattenAccounts(account.children));
      }
    });
    return result;
  };
  
  const allAccountsForSelect = flattenAccounts(accountsData);
  
  return (
    <div className="flex h-full gap-4">
      {/* 左侧：科目树 */}
      <Card className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">选择科目</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAccount(null);
              setEntryForm({
                post_date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                opposite_account_guid: '',
                memo: ''
              });
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            加载中...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {accountsData.map((account) => renderAccountNode(account))}
          </div>
        )}
      </Card>
      
      {/* 右侧：快速记账表单和会计恒等式验证 */}
      <Card className="w-96 p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">快速记账</h2>
        
        {/* 会计恒等式验证（始终显示） */}
        {accountingEquation && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">会计恒等式验证</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">资产总额：</span>
                <span className="font-mono font-semibold">¥{accountingEquation.total_assets.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">负债总额：</span>
                <span className="font-mono font-semibold">¥{accountingEquation.total_liabilities.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">所有者权益：</span>
                <span className="font-mono font-semibold">¥{accountingEquation.total_equity_with_income.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-blue-200">
                <span className="text-gray-700 font-medium">等式右边：</span>
                <span className="font-mono font-semibold">¥{accountingEquation.right_side.toFixed(2)}</span>
              </div>
              <div className={`flex items-center gap-2 pt-1 ${accountingEquation.is_balanced ? 'text-green-600' : 'text-red-600'}`}>
                {accountingEquation.is_balanced ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">借贷平衡</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">借贷不平衡</span>
                    <span className="text-xs">差额：¥{Math.abs(accountingEquation.difference).toFixed(2)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {selectedAccount ? (
          <div className="flex-1 flex flex-col gap-4">
            {/* 已选科目显示 */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">已选科目</div>
              <div className="font-medium text-blue-900">
                {selectedAccount.code && <span className="text-gray-500 mr-1">{selectedAccount.code}</span>}
                {selectedAccount.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {accountTypeLabels[selectedAccount.account_type]}
              </div>
            </div>
            
            {/* 入账日期 */}
            <div>
              <Label htmlFor="post_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                入账日期
              </Label>
              <Input
                id="post_date"
                type="date"
                value={entryForm.post_date}
                onChange={(e) => setEntryForm({ ...entryForm, post_date: e.target.value })}
                className="mt-1"
              />
            </div>
            
            {/* 摘要 */}
            <div>
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                摘要
              </Label>
              <Input
                id="description"
                placeholder="例如：购买手机"
                value={entryForm.description}
                onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                className="mt-1"
              />
            </div>
            
            {/* 金额 */}
            <div>
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                金额
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="请输入金额"
                value={entryForm.amount}
                onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                className="mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">
                正数表示增加，负数表示减少
              </div>
            </div>
            
            {/* 对方科目 */}
            <div>
              <Label htmlFor="opposite_account">对方科目</Label>
              <Select
                value={entryForm.opposite_account_guid}
                onValueChange={(value) => setEntryForm({ ...entryForm, opposite_account_guid: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择对方科目" />
                </SelectTrigger>
                <SelectContent>
                  {allAccountsForSelect
                    .filter(acc => acc.guid !== selectedAccount.guid)
                    .map((account) => (
                      <SelectItem key={account.guid} value={account.guid}>
                        {account.code && <span className="text-gray-500 mr-1">{account.code}</span>}
                        {account.name}
                        <span className="text-gray-400 ml-2">
                          ({accountTypeLabels[account.account_type]})
                        </span>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 备注 */}
            <div>
              <Label htmlFor="memo">备注（可选）</Label>
              <Input
                id="memo"
                placeholder="补充说明"
                value={entryForm.memo}
                onChange={(e) => setEntryForm({ ...entryForm, memo: e.target.value })}
                className="mt-1"
              />
            </div>
            
            {/* 提交按钮 */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-auto"
            >
              {isSubmitting ? (
                <>处理中...</>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  确认记账
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            {/* 默认显示：使用说明和科目汇总 */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">使用说明</span>
                </div>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>从左侧科目树中选择要记账的科目</li>
                  <li>填写入账日期、摘要和金额</li>
                  <li>选择对方科目完成复式记账</li>
                  <li>系统自动确保借贷平衡</li>
                </ul>
              </div>
              
              {/* 科目汇总 */}
              {accountsData.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-3">科目汇总</div>
                  <div className="space-y-2 text-xs">
                    {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map((type) => {
                      const typeAccounts = flattenAccounts(accountsData).filter(
                        acc => acc.account_type === type && !acc.placeholder
                      );
                      const totalBalance = typeAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
                      
                      return (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-gray-600">{accountTypeLabels[type]}：</span>
                          <span className={`font-mono font-semibold ${getBalanceColor(totalBalance, type)}`}>
                            {formatBalance(totalBalance)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="text-center text-gray-400 text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>请从左侧选择科目开始记账</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

