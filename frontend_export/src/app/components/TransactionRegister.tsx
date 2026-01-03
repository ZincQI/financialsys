import { useState, useEffect } from 'react';
import { Trash2, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AccountAPI, TransactionAPI } from '../api/api';

interface AccountOption {
  guid: string;
  code: string;
  name: string;
  fullName: string;
  accountType: string;
  parentPath: string;
}

interface JournalEntry {
  id: string;
  account: string;
  account_guid: string;
  memo: string;
  debit: string;
  credit: string;
}

export function TransactionRegister() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: '1', account: '', account_guid: '', memo: '', debit: '', credit: '' },
  ]);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [globalMemo, setGlobalMemo] = useState('');
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [accountTree, setAccountTree] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // 科目类型中文映射
  const accountTypeLabels: Record<string, string> = {
    'ASSET': '资产',
    'LIABILITY': '负债',
    'EQUITY': '所有者权益',
    'INCOME': '收入',
    'EXPENSE': '费用'
  };

  // Fetch account list from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        const accounts = await AccountAPI.getAllAccounts();
        setAccountTree(accounts);
        
        // 扁平化科目树，保留类型信息
        const flattenAccounts = (accounts: any[], parentPath: string = '', parentType: string = ''): AccountOption[] => {
          let result: AccountOption[] = [];
          
          accounts.forEach(account => {
            const currentType = account.account_type || parentType;
            const currentPath = parentPath ? `${parentPath} - ${account.name}` : account.name;
            
            // 只添加非placeholder的科目（实际可用的科目）
            if (!account.placeholder) {
              const code = account.code || '';
              result.push({
                guid: account.guid,
                code: code,
                name: account.name,
                fullName: code ? `${code} - ${currentPath}` : currentPath,
                accountType: currentType,
                parentPath: parentPath
              });
            }
            
            // 递归处理子科目
            if (account.children && account.children.length > 0) {
              result = result.concat(flattenAccounts(account.children, currentPath, currentType));
            }
          });
          
          return result;
        };
        
        setAccountOptions(flattenAccounts(accounts));
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: Date.now().toString(), account: '', account_guid: '', memo: '', debit: '', credit: '' },
    ]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof JournalEntry, value: string) => {
    setEntries(
      entries.map((entry) => {
        if (entry.id === id) {
          // If account is updated, also update account_guid
          if (field === 'account') {
            const selectedAccount = accountOptions.find(opt => opt.fullName === value);
            return {
              ...entry, 
              [field]: value,
              account_guid: selectedAccount?.guid || '',
            };
          }
          return { ...entry, [field]: value };
        }
        return entry;
      })
    );
  };

  const calculateTotal = (type: 'debit' | 'credit') => {
    return entries.reduce((sum, entry) => {
      const value = parseFloat(entry[type]) || 0;
      return sum + value;
    }, 0);
  };

  // 验证交易是否符合复式记账规则（实时验证）
  const validateTransaction = () => {
    const errors: string[] = [];

    // 1. 检查至少有两个分录
    if (entries.length < 2) {
      errors.push('至少需要两个分录才能保存凭证');
    }

    // 2. 检查每个分录
    entries.forEach((entry, index) => {
      // 2.1 检查是否选择了科目
      if (!entry.account_guid) {
        errors.push(`第 ${index + 1} 行：请选择会计科目`);
      }

      // 2.2 检查借方和贷方不能同时填写
      const debit = parseFloat(entry.debit) || 0;
      const credit = parseFloat(entry.credit) || 0;
      if (debit > 0 && credit > 0) {
        errors.push(`第 ${index + 1} 行：借方和贷方不能同时填写`);
      }

      // 2.3 检查至少有一个金额大于0
      if (debit <= 0 && credit <= 0) {
        errors.push(`第 ${index + 1} 行：请填写借方或贷方金额（必须大于0）`);
      }

      // 2.4 检查金额是否有效（大于0）
      if (debit < 0 || credit < 0) {
        errors.push(`第 ${index + 1} 行：金额不能为负数`);
      }
    });

    // 3. 检查借贷平衡
    const debitTotal = calculateTotal('debit');
    const creditTotal = calculateTotal('credit');
    const difference = Math.abs(debitTotal - creditTotal);

    if (debitTotal <= 0) {
      errors.push('借方总额必须大于0');
    }
    if (creditTotal <= 0) {
      errors.push('贷方总额必须大于0');
    }
    if (difference >= 0.01) {
      errors.push(`借贷不平衡，差额为：¥ ${difference.toFixed(2)}`);
    }

    return errors;
  };

  // 不再实时验证，只在提交时验证

  const debitTotal = calculateTotal('debit');
  const creditTotal = calculateTotal('credit');
  const difference = Math.abs(debitTotal - creditTotal);
  const isBalanced = debitTotal > 0 && creditTotal > 0 && difference < 0.01;

  const handleSaveTransaction = async () => {
    // 先进行完整验证
    const errors = validateTransaction();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationErrors(true);
      // 滚动到错误提示区域
      setTimeout(() => {
        const errorElement = document.querySelector('.validation-errors');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      return;
    }

    // 再次检查平衡（双重验证）
    if (!isBalanced) {
      const balanceError = `借贷不平衡，差额为：¥ ${difference.toFixed(2)}`;
      setValidationErrors([balanceError]);
      setShowValidationErrors(true);
      alert(balanceError);
      return;
    }

    // 验证通过，清除错误提示
    setShowValidationErrors(false);
    setValidationErrors([]);

    try {
      // Prepare transaction data for API
      // 按照复式记账规则：借方为正数，贷方为负数
      const transactionData = {
        post_date: transactionDate,
        description: globalMemo || '无摘要',
        splits: entries
          .filter(entry => entry.account_guid) // 过滤掉没有选择科目的行
          .map(entry => {
            const debit = parseFloat(entry.debit) || 0;
            const credit = parseFloat(entry.credit) || 0;
            // 借方为正数，贷方为负数
            const amount = debit > 0 ? debit : -credit;
            return {
              account_guid: entry.account_guid,
              memo: entry.memo || '',
              amount: amount,
            };
          }),
      };

      // 最后验证：检查所有splits的金额总和是否为0（借贷平衡）
      const totalAmount = transactionData.splits.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalAmount) >= 0.01) {
        alert(`借贷不平衡，差额为：¥ ${Math.abs(totalAmount).toFixed(2)}`);
        return;
      }

      // Save transaction to API
      const result = await TransactionAPI.createTransaction(transactionData);
      console.log('Transaction saved:', result);
      
      // Reset form
      setEntries([{ id: '1', account: '', account_guid: '', memo: '', debit: '', credit: '' }]);
      setGlobalMemo('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      
      alert('凭证保存成功！');
    } catch (error: any) {
      console.error('Failed to save transaction:', error);
      // 显示更详细的错误信息
      const errorMessage = error?.response?.data?.message || error?.message || '保存失败，请检查数据后重试！';
      alert(`保存失败：${errorMessage}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>新建凭证</h1>
        <div className="text-sm text-gray-500">凭证号将自动生成</div>
      </div>

      {/* Transaction Header */}
      <Card className="p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700">入账日期</label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-2 text-gray-700">全局摘要</label>
            <Input
              placeholder="例如：采购原材料一批"
              value={globalMemo}
              onChange={(e) => setGlobalMemo(e.target.value)}
              className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

      </Card>

      {/* Journal Entries Table */}
      <Card className="shadow-md overflow-hidden">
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start gap-2 text-sm text-blue-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">填写说明：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>每一行分录只能填写<strong>借方</strong>或<strong>贷方</strong>中的一个，不能同时填写</li>
                <li>至少需要两行分录，且借方总额必须等于贷方总额（借贷平衡）</li>
                <li>示例：支付税费100元 → 第1行：选择"所得税费用"，填写借方100；第2行：选择"银行存款"，填写贷方100</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-1/3">会计科目</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-1/4">行摘要</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 w-1/6">
                  <span className="text-[#10B981]">借方金额</span>
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 w-1/6">
                  <span className="text-[#DC2626]">贷方金额</span>
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-16">操作</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const hasDebit = parseFloat(entry.debit) > 0;
                const hasCredit = parseFloat(entry.credit) > 0;
                return (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Select
                        value={entry.account || undefined}
                        onValueChange={(value) => {
                          if (value === '__loading__' || value === '__no_accounts__') return;
                          const selectedAccount = accountOptions.find(opt => opt.fullName === value);
                          updateEntry(entry.id, 'account', value);
                          if (selectedAccount) {
                            updateEntry(entry.id, 'account_guid', selectedAccount.guid);
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="选择科目" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[400px]">
                          {isLoading ? (
                            <SelectItem value="__loading__" disabled>加载中...</SelectItem>
                          ) : accountOptions.length === 0 ? (
                            <SelectItem value="__no_accounts__" disabled>暂无科目</SelectItem>
                          ) : (
                            (() => {
                              // 按类别分组显示
                              const accountsByType: Record<string, AccountOption[]> = {
                                'ASSET': [],
                                'LIABILITY': [],
                                'EQUITY': [],
                                'INCOME': [],
                                'EXPENSE': []
                              };
                              
                              // 按accountType分组
                              accountOptions.forEach(opt => {
                                if (accountsByType[opt.accountType]) {
                                  accountsByType[opt.accountType].push(opt);
                                }
                              });
                              
                              const typeOrder = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
                              
                              return typeOrder.map(type => {
                                const accounts = accountsByType[type];
                                if (accounts.length === 0) return null;
                                
                                return (
                                  <div key={type}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-700 bg-blue-50 border-b border-blue-200 sticky top-0 z-10">
                                      {accountTypeLabels[type] || type}
                                    </div>
                                    {accounts.map((option) => (
                                      <SelectItem key={option.guid} value={option.fullName} className="pl-4">
                                        {option.fullName}
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              });
                            })()
                          )}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        placeholder="摘要说明"
                        value={entry.memo}
                        onChange={(e) => updateEntry(entry.id, 'memo', e.target.value)}
                        className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={entry.debit}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateEntry(entry.id, 'debit', value);
                          // 如果填写了借方，自动清空贷方
                          if (parseFloat(value) > 0 && hasCredit) {
                            updateEntry(entry.id, 'credit', '');
                          }
                        }}
                        className={`bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-right font-mono ${
                          hasDebit ? 'text-[#10B981] border-[#10B981]' : 'text-gray-500'
                        }`}
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={entry.credit}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateEntry(entry.id, 'credit', value);
                          // 如果填写了贷方，自动清空借方
                          if (parseFloat(value) > 0 && hasDebit) {
                            updateEntry(entry.id, 'debit', '');
                          }
                        }}
                        className={`bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-right font-mono ${
                          hasCredit ? 'text-[#DC2626] border-[#DC2626]' : 'text-gray-500'
                        }`}
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntry(entry.id)}
                        disabled={entries.length === 1}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {/* Add Entry Button Row */}
              <tr className="border-dashed border-2 border-gray-200">
                <td colSpan={5} className="px-4 py-3">
                  <button
                    onClick={addEntry}
                    className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 py-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">添加分录</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Validation Errors Display - 只在提交时显示 */}
      {showValidationErrors && validationErrors.length > 0 && (
        <Card className="p-4 shadow-md border-red-200 bg-red-50 validation-errors">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-2">凭证验证失败，请修正以下问题：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Sticky Footer - Balance Check */}
      <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 rounded-t-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-sm text-gray-600 mr-2">借方总计:</span>
              <span className="font-mono text-[#10B981]" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ¥ {calculateTotal('debit').toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600 mr-2">贷方总计:</span>
              <span className="font-mono text-[#DC2626]" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ¥ {calculateTotal('credit').toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Balance Status */}
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">借贷平衡</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">
                    差额: ¥ {difference.toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  setEntries([{ id: '1', account: '', account_guid: '', memo: '', debit: '', credit: '' }]);
                  setGlobalMemo('');
                  setTransactionDate(new Date().toISOString().split('T')[0]);
                  setValidationErrors([]);
                  setShowValidationErrors(false);
                }}
              >
                重置
              </Button>
              <Button 
                className="bg-[#1A365D] hover:bg-[#2A4A7D]"
                onClick={handleSaveTransaction}
              >
                保存凭证
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
