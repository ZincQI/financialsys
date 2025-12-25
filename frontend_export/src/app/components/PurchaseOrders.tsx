import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Package } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { PurchaseOrderAPI } from '../api/api';

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
}

export function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch purchase orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await PurchaseOrderAPI.getPurchaseOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch purchase orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const handleApprove = async () => {
    if (!selectedOrder) return;

    try {
      await PurchaseOrderAPI.approvePurchaseOrder(selectedOrder.id);
      alert('订单已审核通过，凭证已生成！');
      setDrawerOpen(false);
      // Refresh orders list
      const data = await PurchaseOrderAPI.getPurchaseOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to approve purchase order:', error);
      alert('审核失败，请重试！');
    }
  };

  const handleNewOrder = () => {
    // Handle new order creation
    alert('新建采购订单功能开发中！');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>采购业务管理</h1>
        <Button 
          className="bg-[#1A365D] hover:bg-[#2A4A7D]" 
          onClick={handleNewOrder}
        >
          新建采购订单
        </Button>
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
                            onClick={() => handleViewDetails(order)}
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
                    onClick={handleApprove}
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
    </div>
  );
}
