import { useState } from 'react';
import { Trash2, Plus, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface JournalEntry {
  id: string;
  account: string;
  memo: string;
  debit: string;
  credit: string;
}

export function TransactionRegister() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: '1', account: '', memo: '', debit: '', credit: '' },
  ]);
  const [transactionDate, setTransactionDate] = useState('2024-12-24');
  const [globalMemo, setGlobalMemo] = useState('');

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: Date.now().toString(), account: '', memo: '', debit: '', credit: '' },
    ]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof JournalEntry, value: string) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const calculateTotal = (type: 'debit' | 'credit') => {
    return entries.reduce((sum, entry) => {
      const value = parseFloat(entry[type]) || 0;
      return sum + value;
    }, 0);
  };

  const debitTotal = calculateTotal('debit');
  const creditTotal = calculateTotal('credit');
  const difference = Math.abs(debitTotal - creditTotal);
  const isBalanced = debitTotal > 0 && creditTotal > 0 && difference < 0.01;

  const accountOptions = [
    '1001 - 库存现金',
    '1002 - 银行存款 - 工商银行',
    '1002 - 银行存款 - 建设银行',
    '1012 - 其他货币资金',
    '1121 - 应收账款',
    '1403 - 原材料',
    '2202 - 应付账款',
    '4001 - 生产成本',
    '6001 - 主营业务收入',
    '6401 - 主营业务成本',
  ];

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

        {/* Attachment Upload */}
        <div className="mt-4">
          <label className="block text-sm mb-2 text-gray-700">上传附件</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">点击或拖拽文件至此处上传</p>
            <p className="text-xs text-gray-400 mt-1">支持 PDF、JPG、PNG 格式</p>
          </div>
        </div>
      </Card>

      {/* Journal Entries Table */}
      <Card className="shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-1/3">会计科目</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-1/4">行摘要</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 w-1/6">借方金额</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 w-1/6">贷方金额</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-16">操作</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Select
                      value={entry.account}
                      onValueChange={(value) => updateEntry(entry.id, 'account', value)}
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="选择科目" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
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
                      onChange={(e) => updateEntry(entry.id, 'debit', e.target.value)}
                      className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-right font-mono text-[#10B981]"
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={entry.credit}
                      onChange={(e) => updateEntry(entry.id, 'credit', e.target.value)}
                      className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 text-right font-mono text-[#DC2626]"
                      step="0.01"
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
              ))}
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

      {/* Sticky Footer - Balance Check */}
      <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 rounded-t-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-sm text-gray-600 mr-2">借方总计:</span>
              <span className="font-mono text-[#10B981]" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ¥ {debitTotal.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600 mr-2">贷方总计:</span>
              <span className="font-mono text-[#DC2626]" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                ¥ {creditTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Balance Status */}
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600">借贷平衡</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600">差额: ¥ {difference.toFixed(2)}</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline">重置</Button>
              <Button 
                disabled={!isBalanced}
                className="bg-[#1A365D] hover:bg-[#2A4A7D] disabled:bg-gray-300"
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
