import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Package, Plus, Trash2, X, Save } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { PurchaseOrderAPI, SupplierAPI, AccountAPI } from '../api/api';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './ui/pagination';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  credit_account_guid?: string;
  credit_account_name?: string;
}

export function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  
  // New order form state
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [suppliers, setSuppliers] = useState<Array<{id: string, name: string, code: string}>>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<Array<{guid: string, code: string, name: string, fullName: string}>>([]);
  const [creditAccounts, setCreditAccounts] = useState<Array<{guid: string, code: string, name: string, fullName: string, accountType: string}>>([]);
  const [newOrderForm, setNewOrderForm] = useState({
    vendor_guid: '',
    credit_account_guid: '',  // 贷方科目（应付账款或银行存款等）
    items: [{
      name: '',
      quantity: '',
      price: '',
      i_acct_guid: ''
    }]
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Fetch purchase orders from API
  const fetchOrders = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const data = await PurchaseOrderAPI.getPurchaseOrders(page, perPage);
      setOrders(data.items || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  // Fetch suppliers and expense accounts when dialog opens
  useEffect(() => {
    if (showNewOrderDialog) {
      fetchSuppliers();
      fetchExpenseAccounts();
      fetchCreditAccounts();
    }
  }, [showNewOrderDialog]);

  const fetchSuppliers = async () => {
    try {
      setIsLoadingSuppliers(true);
      const data = await SupplierAPI.getSuppliers();
      setSuppliers(data.map((s: any) => ({ id: s.id, name: s.name, code: s.code })));
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  const fetchExpenseAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const accounts = await AccountAPI.getAccountTree();
      
      // Flatten and filter expense accounts
      const flattenAccounts = (accounts: any[], parentName: string = ''): any[] => {
        let result: any[] = [];
        
        accounts.forEach((account: any) => {
          if (account.account_type === 'EXPENSE' && !account.placeholder) {
            const fullName = parentName ? `${parentName} - ${account.name}` : account.name;
            result.push({
              guid: account.guid,
              code: account.code || '',
              name: account.name,
              fullName: `${account.code || ''} - ${fullName}`.trim()
            });
          }
          
          if (account.children && account.children.length > 0) {
            const currentPath = parentName ? `${parentName} - ${account.name}` : account.name;
            result = result.concat(flattenAccounts(account.children, currentPath));
          }
        });
        
        return result;
      };
      
      setExpenseAccounts(flattenAccounts(accounts));
    } catch (error) {
      console.error('Failed to fetch expense accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const fetchCreditAccounts = async () => {
    try {
      const accounts = await AccountAPI.getAccountTree();
      
      // 获取可以作为贷方的科目：
      // 1. 负债类科目（如应付账款）- 表示未付款
      // 2. 资产类科目（如银行存款、库存现金等）- 表示已付款
      const flattenAccounts = (accounts: any[], parentName: string = ''): any[] => {
        let result: any[] = [];
        
        accounts.forEach((account: any) => {
          let shouldInclude = false;
          
          // 负债类科目：全部包含（如应付账款、应付票据等）
          if (account.account_type === 'LIABILITY' && !account.placeholder) {
            shouldInclude = true;
          }
          // 资产类科目：只包含货币资金类（银行存款、库存现金等）
          else if (account.account_type === 'ASSET' && !account.placeholder) {
            const name = account.name.toLowerCase();
            if (name.includes('银行') || name.includes('现金') || name.includes('存款') || 
                name.includes('货币资金') || name.includes('其他货币资金')) {
              shouldInclude = true;
            }
          }
          
          if (shouldInclude) {
            const fullName = parentName ? `${parentName} - ${account.name}` : account.name;
            result.push({
              guid: account.guid,
              code: account.code || '',
              name: account.name,
              fullName: `${account.code || ''} - ${fullName}`.trim(),
              accountType: account.account_type
            });
          }
          
          if (account.children && account.children.length > 0) {
            const currentPath = parentName ? `${parentName} - ${account.name}` : account.name;
            result = result.concat(flattenAccounts(account.children, currentPath));
          }
        });
        
        return result;
      };
      
      setCreditAccounts(flattenAccounts(accounts));
    } catch (error) {
      console.error('Failed to fetch credit accounts:', error);
    }
  };

  // 当搜索或筛选条件改变时，重置到第一页
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleApprove = async (orderId?: string) => {
    const orderIdToApprove = orderId || selectedOrder?.id;
    if (!orderIdToApprove) return;

    try {
      await PurchaseOrderAPI.approvePurchaseOrder(orderIdToApprove);
      if (!orderId) {
        alert('订单已审核通过，凭证已生成！');
        setDrawerOpen(false);
      }
      // Refresh orders list
      await fetchOrders(currentPage);
      // Clear selection if batch approving
      if (orderId) {
        setSelectedOrders(prev => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to approve purchase order:', error);
      alert('审核失败，请重试！');
    }
  };

  const handleBatchApprove = async () => {
    if (selectedOrders.size === 0) {
      alert('请先选择要审核的订单！');
      return;
    }

    if (!confirm(`确定要批量审核 ${selectedOrders.size} 个订单吗？`)) {
      return;
    }

    try {
      setIsBatchApproving(true);
      const orderIds = Array.from(selectedOrders);
      let successCount = 0;
      let failCount = 0;

      for (const orderId of orderIds) {
        try {
          await PurchaseOrderAPI.approvePurchaseOrder(orderId);
          successCount++;
        } catch (error) {
          console.error(`Failed to approve order ${orderId}:`, error);
          failCount++;
        }
      }

      alert(`批量审核完成！成功: ${successCount} 个，失败: ${failCount} 个`);
      setSelectedOrders(new Set());
      await fetchOrders(currentPage);
    } catch (error) {
      console.error('Failed to batch approve orders:', error);
      alert('批量审核失败，请重试！');
    } finally {
      setIsBatchApproving(false);
    }
  };

  const handleToggleSelect = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
    if (selectedOrders.size === pendingOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(pendingOrders.map(o => o.id)));
    }
  };

  const handleNewOrder = () => {
    setNewOrderForm({
      vendor_guid: '',
      credit_account_guid: '',  // 贷方科目
      items: [{
        name: '',
        quantity: '',
        price: '',
        i_acct_guid: ''
      }]
    });
    setShowNewOrderDialog(true);
  };

  const handleAddOrderItem = () => {
    setNewOrderForm({
      ...newOrderForm,
      items: [...newOrderForm.items, {
        name: '',
        quantity: '',
        price: '',
        i_acct_guid: ''
      }]
    });
  };

  const handleRemoveOrderItem = (index: number) => {
    if (newOrderForm.items.length > 1) {
      setNewOrderForm({
        ...newOrderForm,
        items: newOrderForm.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleUpdateOrderItem = (index: number, field: string, value: string) => {
    const newItems = [...newOrderForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setNewOrderForm({ ...newOrderForm, items: newItems });
  };

  const validateOrderForm = (): string[] => {
    const errors: string[] = [];

    // 验证供应商
    if (!newOrderForm.vendor_guid) {
      errors.push('请选择供应商！');
    }

    // 验证贷方科目
    if (!newOrderForm.credit_account_guid) {
      errors.push('请选择付款方式（贷方科目）！');
    }

    // 验证商品明细
    if (newOrderForm.items.length === 0) {
      errors.push('请至少添加一个商品！');
    }

    // 验证每个商品行
    newOrderForm.items.forEach((item, index) => {
      if (!item.name.trim()) {
        errors.push(`第 ${index + 1} 行：请填写商品名称！`);
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        errors.push(`第 ${index + 1} 行：请填写有效的数量（必须大于0）！`);
      }
      if (!item.price || parseFloat(item.price) <= 0) {
        errors.push(`第 ${index + 1} 行：请填写有效的单价（必须大于0）！`);
      }
      if (!item.i_acct_guid) {
        errors.push(`第 ${index + 1} 行：请选择支出科目！`);
      }
    });

    // 验证订单总额
    const totalAmount = parseFloat(calculateOrderTotal());
    if (totalAmount <= 0) {
      errors.push('订单总额必须大于0！');
    }

    // 验证金额计算的准确性（防止浮点数误差）
    let calculatedTotal = 0;
    newOrderForm.items.forEach((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const prc = parseFloat(item.price) || 0;
      calculatedTotal += qty * prc;
    });
    
    const difference = Math.abs(totalAmount - calculatedTotal);
    if (difference >= 0.01) {
      errors.push(`金额计算错误：订单总额与明细合计不一致，差额为 ¥${difference.toFixed(2)}`);
    }

    return errors;
  };

  const handleCreateOrder = async () => {
    // 验证表单
    const validationErrors = validateOrderForm();
    if (validationErrors.length > 0) {
      alert('表单验证失败，请修正以下问题：\n' + validationErrors.join('\n'));
      return;
    }

    try {
      setIsCreating(true);
      const orderData = {
        vendor_guid: newOrderForm.vendor_guid,
        credit_account_guid: newOrderForm.credit_account_guid,  // 贷方科目
        items: newOrderForm.items.map(item => ({
          name: item.name.trim(),
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
          i_acct_guid: item.i_acct_guid
        }))
      };

      await PurchaseOrderAPI.createPurchaseOrder(orderData);
      alert('采购订单创建成功！');
      setShowNewOrderDialog(false);
      await fetchOrders(currentPage);
    } catch (error: any) {
      console.error('Failed to create purchase order:', error);
      alert(error.message || '创建失败，请重试！');
    } finally {
      setIsCreating(false);
    }
  };

  const calculateItemTotal = (quantity: string, price: string) => {
    const qty = parseFloat(quantity) || 0;
    const prc = parseFloat(price) || 0;
    return (qty * prc).toFixed(2);
  };

  const calculateOrderTotal = () => {
    return newOrderForm.items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const prc = parseFloat(item.price) || 0;
      return sum + (qty * prc);
    }, 0).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>采购业务管理</h1>
        <div className="flex gap-2">
          {selectedOrders.size > 0 && (
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleBatchApprove}
              disabled={isBatchApproving}
            >
              {isBatchApproving ? '审核中...' : `批量审核 (${selectedOrders.size})`}
            </Button>
          )}
          <Button 
            className="bg-[#1A365D] hover:bg-[#2A4A7D]" 
            onClick={handleNewOrder}
          >
            新建采购订单
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索订单号或供应商..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Input
            type="date"
            className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-gray-300 focus:ring-2 focus:ring-blue-500">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="筛选状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={filteredOrders.filter(o => o.status === 'pending').length > 0 && 
                             filteredOrders.filter(o => o.status === 'pending').every(o => selectedOrders.has(o.id))}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">订单号</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">供应商</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">采购金额</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">创建日期</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">状态</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    暂无采购订单
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {order.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => handleToggleSelect(order.id)}
                        className="rounded border-gray-300"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm">{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{order.supplier}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono">¥ {order.amount.toLocaleString()}.00</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{order.date}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order.status === 'pending' ? (
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                        待审核
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        已完成
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                      >
                        查看详情
                      </button>
                      {order.status === 'pending' && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="text-green-600 hover:text-green-700 hover:underline text-sm"
                          >
                            审核
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                共 {total} 条记录，第 {currentPage} / {totalPages} 页
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                        }
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === pageNum}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                        }
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Card>

      {/* Details Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>采购订单详情</SheetTitle>
            <SheetDescription>
              订单号: {selectedOrder?.orderNumber}
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">供应商</p>
                    <p className="font-medium">{selectedOrder.supplier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">创建日期</p>
                    <p className="font-medium">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">订单状态</p>
                    <div>
                      {selectedOrder.status === 'pending' ? (
                        <Badge className="bg-orange-100 text-orange-700">待审核</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">已完成</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">订单总额</p>
                    <p className="font-mono font-semibold text-[#1A365D]">
                      ¥ {selectedOrder.amount.toLocaleString()}.00
                    </p>
                  </div>
                  {selectedOrder.credit_account_name && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">付款方式（贷方科目）</p>
                      <p className="font-medium text-blue-600">{selectedOrder.credit_account_name}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Items Table */}
              <div>
                <h3 className="mb-3">商品明细</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">商品名称</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">数量</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">单价</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">小计</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              {item.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono">
                            ¥ {item.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono font-medium">
                            ¥ {item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-right font-medium">
                          合计金额:
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#1A365D]">
                          ¥ {selectedOrder.amount.toLocaleString()}.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button */}
              {selectedOrder.status === 'pending' && (
                <div className="sticky bottom-0 pt-6 pb-4 bg-white border-t">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={() => handleApprove()}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    审核通过并生成凭证
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Purchase Order Dialog */}
      <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl">新建采购订单</DialogTitle>
            <DialogDescription className="text-base">
              填写采购订单信息，订单号将自动生成
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4 flex-1 overflow-y-auto min-h-0">
            {/* Supplier Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label htmlFor="vendor-select" className="text-base font-medium mb-2 block">供应商 *</Label>
              <Select
                value={newOrderForm.vendor_guid}
                onValueChange={(value) => setNewOrderForm({ ...newOrderForm, vendor_guid: value })}
              >
                <SelectTrigger className="mt-1 h-12 text-base" id="vendor-select">
                  <SelectValue placeholder={isLoadingSuppliers ? "加载中..." : "请选择供应商"} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.code} - {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Credit Account Selection (付款方式) */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Label htmlFor="credit-account-select" className="text-base font-medium mb-2 block">
                付款方式（贷方科目） *
              </Label>
              <Select
                value={newOrderForm.credit_account_guid}
                onValueChange={(value) => setNewOrderForm({ ...newOrderForm, credit_account_guid: value })}
              >
                <SelectTrigger className="mt-1 h-12 text-base" id="credit-account-select">
                  <SelectValue placeholder="请选择付款方式（应付账款或银行存款等）" />
                </SelectTrigger>
                <SelectContent>
                  {creditAccounts.map((account) => (
                    <SelectItem key={account.guid} value={account.guid}>
                      {account.fullName}
                      <span className="text-gray-400 ml-2">
                        ({account.accountType === 'LIABILITY' ? '负债' : '资产'})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600 mt-2">
                选择"应付账款"表示未付款，选择"银行存款"等表示已付款
              </p>
            </div>

            {/* Items Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">商品明细 *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={handleAddOrderItem}
                  className="h-10"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  添加商品
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 min-w-[200px]">商品名称</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 min-w-[250px]">支出科目</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 min-w-[120px]">数量</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 min-w-[150px]">单价 (¥)</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 min-w-[150px]">小计 (¥)</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-20">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newOrderForm.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Input
                            value={item.name}
                            onChange={(e) => handleUpdateOrderItem(index, 'name', e.target.value)}
                            placeholder="请输入商品名称"
                            className="w-full h-11 text-base"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Select
                            value={item.i_acct_guid}
                            onValueChange={(value) => handleUpdateOrderItem(index, 'i_acct_guid', value)}
                          >
                            <SelectTrigger className="w-full h-11 text-base">
                              <SelectValue placeholder={isLoadingAccounts ? "加载中..." : "请选择支出科目"} />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseAccounts.map((account) => (
                                <SelectItem key={account.guid} value={account.guid}>
                                  {account.fullName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateOrderItem(index, 'quantity', e.target.value)}
                            placeholder="0.00"
                            className="w-full h-11 text-base text-right"
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleUpdateOrderItem(index, 'price', e.target.value)}
                            placeholder="0.00"
                            className="w-full h-11 text-base text-right"
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-base font-semibold text-[#1A365D]">
                          ¥ {parseFloat(calculateItemTotal(item.quantity, item.price)).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOrderItem(index)}
                            disabled={newOrderForm.items.length === 1}
                            className="h-10 w-10 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td colSpan={4} className="px-6 py-4 text-right font-semibold text-base">
                        订单总额:
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-[#1A365D] text-xl">
                        ¥ {parseFloat(calculateOrderTotal()).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowNewOrderDialog(false)} 
              disabled={isCreating}
              className="h-11 px-6"
            >
              <X className="w-5 h-5 mr-2" />
              取消
            </Button>
            <Button 
              onClick={handleCreateOrder}
              disabled={isCreating}
              className="bg-[#1A365D] hover:bg-[#2A4A7D] h-11 px-6 text-base"
            >
              <Save className="w-5 h-5 mr-2" />
              {isCreating ? '创建中...' : '创建订单'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
