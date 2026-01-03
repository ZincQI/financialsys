import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Edit, Trash2, AlertCircle, Eye, Save, X, FileText, Calendar, DollarSign, CheckCircle, Scale } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Badge } from './ui/badge';
import { AccountAPI, ReportAPI } from '../api/api';

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

export function ChartOfAccounts() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '11', '1002']));
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [isLoadingTransactionCount, setIsLoadingTransactionCount] = useState(false);
  
  // New account form state
  const [showNewAccountDialog, setShowNewAccountDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit account state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAccountName, setEditAccountName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // View transactions state
  const [showTransactionsSheet, setShowTransactionsSheet] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    name: '',
    account_type: 'ASSET',
    parent_guid: null as string | null,
    placeholder: false
  });
  
  // 会计恒等式验证数据
  const [accountingEquation, setAccountingEquation] = useState<any>(null);
  const [isLoadingEquation, setIsLoadingEquation] = useState(false);
  
  const handleNewAccount = () => {
    // Reset form for new account
    setNewAccountForm({
      name: '',
      account_type: 'ASSET',
      parent_guid: null,
      placeholder: false
    });
    setShowNewAccountDialog(true);
  };
  
  const handleAddSubAccount = () => {
    if (!selectedAccount) return;
    
    // Reset form for sub-account
    setNewAccountForm({
      name: '',
      account_type: selectedAccount.account_type,
      parent_guid: selectedAccount.guid,
      placeholder: false
    });
    setShowNewAccountDialog(true);
  };
  
  const handleEditAccount = () => {
    if (!selectedAccount) return;
    setEditAccountName(selectedAccount.name);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAccount || !editAccountName.trim()) {
      alert('科目名称不能为空！');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await AccountAPI.updateAccount(selectedAccount.guid, editAccountName.trim());
      
      // 更新本地状态
      setSelectedAccount({ ...selectedAccount, name: updated.name });
      
      // 刷新科目树
      await fetchAccountTree();
      
      setShowEditDialog(false);
      alert('科目名称已更新！');
    } catch (error: any) {
      console.error('Failed to update account:', error);
      alert(error.message || '更新失败，请重试！');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewTransactions = async () => {
    if (!selectedAccount) return;
    
    try {
      setIsLoadingTransactions(true);
      setShowTransactionsSheet(true);
      const data = await AccountAPI.getAccountTransactions(selectedAccount.guid);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      alert('获取交易详情失败，请重试！');
      setShowTransactionsSheet(false);
    } finally {
      setIsLoadingTransactions(false);
    }
  };
  
  // Fetch transaction count for a selected account
  const fetchTransactionCount = async (accountGuid: string) => {
    try {
      setIsLoadingTransactionCount(true);
      const response = await AccountAPI.getAccountTransactionCount(accountGuid);
      setTransactionCount(response.count);
    } catch (error) {
      console.error('Failed to fetch transaction count:', error);
      setTransactionCount(0);
    } finally {
      setIsLoadingTransactionCount(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    const accountGuid = selectedAccount.guid;
    
    try {
      setIsDeleting(true);
      await AccountAPI.deleteAccount(accountGuid);
      alert('科目删除成功！');
      
      // Refresh account tree
      await fetchAccountTree();
      setSelectedAccount(null);
      setShowDeleteAlert(false);
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      // 显示详细的错误信息
      const errorMessage = error?.response?.data?.message || error?.message || '删除科目失败，请重试！';
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCreateAccount = async () => {
    if (!newAccountForm.name) {
      alert('请填写科目名称！');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await AccountAPI.createAccount(newAccountForm);
      alert('科目创建成功！');
      
      // Refresh account tree
      await fetchAccountTree();
      setShowNewAccountDialog(false);
    } catch (error: any) {
      console.error('Failed to create account:', error);
      alert(error.message || '创建科目失败，请重试！');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch account tree data from API (with balance)
  const fetchAccountTree = async () => {
    try {
      setIsLoading(true);
      const data = await AccountAPI.getAccountTree();
      // 数据已经包含余额信息
      setAccountsData(data);
      // 不要自动选择第一个子科目，避免状态变化导致的问题
    } catch (error) {
      console.error('Failed to fetch account tree:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取会计恒等式验证数据
  const fetchAccountingEquation = async () => {
    try {
      setIsLoadingEquation(true);
      const dashboardData = await ReportAPI.getDashboardData();
      if (dashboardData && dashboardData.accounting_equation) {
        setAccountingEquation(dashboardData.accounting_equation);
      }
    } catch (error) {
      console.error('Failed to fetch accounting equation:', error);
    } finally {
      setIsLoadingEquation(false);
    }
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

  useEffect(() => {
    fetchAccountTree();
    fetchAccountingEquation();
  }, []);
  
  // Fetch transaction count when selected account changes
  useEffect(() => {
    if (selectedAccount) {
      fetchTransactionCount(selectedAccount.guid);
    }
  }, [selectedAccount]);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTree = (accounts: Account[], level: number = 0) => {
    return accounts.map((account) => {
      const hasChildren = account.children && account.children.length > 0;
      const isExpanded = expandedNodes.has(account.guid);
      const isSelected = selectedAccount?.guid === account.guid;
      const isParent = level < 2;
      const balance = account.balance ?? 0;

      return (
        <div key={account.guid}>
          <div
            className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded transition-colors ${
              isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => setSelectedAccount(account)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(account.guid);
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-5" />}
            
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-gray-400" />
              )
            ) : (
              <div className="w-1 h-1 bg-gray-400 rounded-full ml-1.5" />
            )}
            
            <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
              <span className={`text-sm truncate ${isParent ? 'font-semibold' : ''} ${account.placeholder ? 'text-gray-400 italic' : ''}`}>
              {account.code} - {account.name}
            </span>
              
              {balance !== undefined && !account.placeholder && (
                <div className={`text-sm font-mono ${getBalanceColor(balance, account.account_type)}`}>
                  {formatBalance(balance)}
                </div>
              )}
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderTree(account.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>会计科目管理</h1>
        <Button 
          className="bg-[#1A365D] hover:bg-[#2A4A7D]" 
          onClick={handleNewAccount}
        >
          <Plus className="w-4 h-4 mr-2" />
          新建科目
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tree View */}
        <Card className="lg:col-span-1 shadow-md p-4 h-[calc(100vh-250px)] overflow-auto">
          <div className="space-y-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : (
              renderTree(accountsData)
            )}
          </div>
        </Card>

        {/* Right: Detail View */}
        <Card className="lg:col-span-2 shadow-md">
          {selectedAccount ? (
            <div className="p-6">
              {/* 会计恒等式验证（始终显示在顶部） */}
              {accountingEquation && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
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
              
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="mb-1">{selectedAccount.name}</h2>
                  <p className="text-sm text-gray-500">科目代码: {selectedAccount.code}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddSubAccount}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    新增子科目
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditAccount}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                  {transactionCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleViewTransactions}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      查看交易
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDeleteAlert(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-600">科目名称</label>
                  <Input 
                    value={selectedAccount.name} 
                    className="bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-600">科目代码</label>
                  <Input 
                    value={selectedAccount.code} 
                    className="bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-600">科目类型</label>
                  <Input 
                    value={selectedAccount.account_type} 
                    className="bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-600">当前余额</label>
                  <div className="flex items-center h-10 px-3 bg-gray-50 rounded-md border border-gray-200">
                    <span className="font-mono text-[#1A365D]" style={{ fontSize: '16px', fontWeight: '600' }}>
                      ¥ {selectedAccount.balance?.toLocaleString() || '0'}.00
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">科目使用说明</p>
                    <p className="text-sm text-blue-700 mt-1">
                      该科目已有 {isLoadingTransactionCount ? '加载中...' : transactionCount} 笔关联交易记录。如需修改科目信息，请确保不影响历史数据的完整性。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>请从左侧选择一个科目以查看详情</p>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Warning Modal */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-white border-2 border-red-500">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-red-700">确认删除科目</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-700 text-base">
              确定要删除科目 <strong>{selectedAccount?.name}</strong> 吗？
            </AlertDialogDescription>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              请注意：如果该科目下存在子科目或关联交易，将无法删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteAlert(false)} disabled={isDeleting}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount} 
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '删除'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* New Account Dialog */}
      <Dialog open={showNewAccountDialog} onOpenChange={setShowNewAccountDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{newAccountForm.parent_guid ? '新增子科目' : '新建科目'}</DialogTitle>
            <DialogDescription>
              {newAccountForm.parent_guid ? '请填写子科目的详细信息' : '请填写新科目的详细信息'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                科目名称
              </Label>
              <Input
                id="name"
                value={newAccountForm.name}
                onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                className="col-span-3"
                placeholder="请输入科目名称"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_type" className="text-right">
                科目类型
              </Label>
              <Select
                value={newAccountForm.account_type}
                onValueChange={(value) => setNewAccountForm({ ...newAccountForm, account_type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择科目类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSET">资产</SelectItem>
                  <SelectItem value="LIABILITY">负债</SelectItem>
                  <SelectItem value="EQUITY">权益</SelectItem>
                  <SelectItem value="INCOME">收入</SelectItem>
                  <SelectItem value="EXPENSE">费用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAccountDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={handleCreateAccount}
              disabled={isSubmitting}
            >
              {isSubmitting ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑科目</DialogTitle>
            <DialogDescription>
              只能修改科目名称，其他信息因关联数据无法修改
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                科目名称
              </Label>
              <Input
                id="edit-name"
                value={editAccountName}
                onChange={(e) => setEditAccountName(e.target.value)}
                className="col-span-3"
                placeholder="请输入科目名称"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-500">
                科目代码
              </Label>
              <Input
                value={selectedAccount?.code || ''}
                className="col-span-3 bg-gray-50"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-gray-500">
                科目类型
              </Label>
              <Input
                value={selectedAccount?.account_type || ''}
                className="col-span-3 bg-gray-50"
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isSaving || !editAccountName.trim()}
              className="bg-[#1A365D] hover:bg-[#2A4A7D]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Transactions Sheet */}
      <Sheet open={showTransactionsSheet} onOpenChange={setShowTransactionsSheet}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>交易详情</SheetTitle>
            <SheetDescription>
              {selectedAccount?.name} ({selectedAccount?.code}) - 共 {transactions.length} 笔交易
            </SheetDescription>
          </SheetHeader>
          
          {isLoadingTransactions ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="w-16 h-16 mb-4 text-gray-300" />
              <p>该科目暂无交易记录</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.guid} className="p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{transaction.post_date}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {transaction.splits.length} 条分录
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="space-y-2">
                      {transaction.splits.map((split: any, index: number) => (
                        <div 
                          key={split.guid} 
                          className={`flex items-center justify-between p-2 rounded ${
                            split.account_guid === selectedAccount?.guid 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                {split.account_code} - {split.account_name}
                              </span>
                              {split.account_guid === selectedAccount?.guid && (
                                <Badge className="bg-blue-600 text-xs">当前科目</Badge>
                              )}
                            </div>
                            {split.memo && (
                              <p className="text-xs text-gray-500 mt-1">{split.memo}</p>
                            )}
                          </div>
                          <div className={`font-mono font-semibold ${
                            split.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {split.amount >= 0 ? '+' : ''}¥ {Math.abs(split.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-sm text-gray-600">交易总额:</span>
                      <span className="font-mono font-bold text-[#1A365D]">
                        ¥ {transaction.splits.reduce((sum: number, s: any) => sum + Math.abs(s.amount), 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
