import { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, Package } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';

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

const mockOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-1156',
    supplier: '华东钢材有限公司',
    amount: 458600,
    date: '2024-12-20',
    status: 'pending',
    items: [
      { name: '热轧钢板 Q235', quantity: 50, price: 4200, total: 210000 },
      { name: '冷轧钢板 SPCC', quantity: 30, price: 5500, total: 165000 },
      { name: '不锈钢管 304', quantity: 100, price: 836, total: 83600 },
    ],
  },
  {
    id: '2',
    orderNumber: 'PO-2024-1155',
    supplier: '江苏化工集团',
    amount: 235000,
    date: '2024-12-18',
    status: 'completed',
    items: [
      { name: '聚乙烯树脂', quantity: 10, price: 12000, total: 120000 },
      { name: '增塑剂 DOP', quantity: 5, price: 23000, total: 115000 },
    ],
  },
  {
    id: '3',
    orderNumber: 'PO-2024-1154',
    supplier: '上海包装材料厂',
    amount: 87500,
    date: '2024-12-15',
    status: 'completed',
    items: [
      { name: '瓦楞纸箱 大号', quantity: 5000, price: 12, total: 60000 },
      { name: '气泡膜 1米宽', quantity: 100, price: 275, total: 27500 },
    ],
  },
  {
    id: '4',
    orderNumber: 'PO-2024-1153',
    supplier: '广东五金制造商',
    amount: 156800,
    date: '2024-12-14',
    status: 'pending',
    items: [
      { name: '标准螺栓 M8', quantity: 10000, price: 0.5, total: 5000 },
      { name: '精密轴承 6204', quantity: 500, price: 120, total: 60000 },
      { name: '工业链条 06B-1', quantity: 200, price: 459, total: 91800 },
    ],
  },
  {
    id: '5',
    orderNumber: 'PO-2024-1152',
    supplier: '北京电子元件有限公司',
    amount: 342000,
    date: '2024-12-12',
    status: 'completed',
    items: [
      { name: '单片机 STM32F407', quantity: 1000, price: 45, total: 45000 },
      { name: 'LED灯珠 5mm', quantity: 50000, price: 0.3, total: 15000 },
      { name: '电源模块 24V/10A', quantity: 200, price: 1410, total: 282000 },
    ],
  },
];

export function PurchaseOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredOrders = mockOrders.filter((order) => {
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

  const handleApprove = () => {
    // Handle approve logic
    alert('订单已审核通过，凭证已生成！');
    setDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>采购业务管理</h1>
        <Button className="bg-[#1A365D] hover:bg-[#2A4A7D]">
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
              {filteredOrders.map((order) => (
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
