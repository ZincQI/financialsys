import { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, MapPin, TrendingUp, Building2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SupplierAPI } from '../api/api';

interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  rating: number;
  totalTransactions: number;
  totalAmount: number;
  status: 'active' | 'inactive';
  description: string;
}

interface Transaction {
  id: string;
  date: string;
  orderNumber: string;
  amount: number;
  status: 'completed' | 'pending';
  items: string;
}

export function SupplierManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsLoading(true);
        const data = await SupplierAPI.getSuppliers();
        setSuppliers(data);
        if (data.length > 0) {
          setSelectedSupplier(data[0]);
          // Fetch transaction history for the first supplier
          fetchTransactionHistory(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Fetch transaction history for a supplier
  const fetchTransactionHistory = async (supplierId: string) => {
    try {
      // Note: This API endpoint isn't implemented yet in the backend
      // We'll add mock data for now
      const mockTransactions: Transaction[] = [
        { id: 't1', date: '2024-12-20', orderNumber: 'PO-2024-1156', amount: 458600, status: 'pending', items: '热轧钢板、冷轧钢板、不锈钢管' },
        { id: 't2', date: '2024-11-15', orderNumber: 'PO-2024-1089', amount: 625000, status: 'completed', items: '热轧钢板 Q235' },
        { id: 't3', date: '2024-10-28', orderNumber: 'PO-2024-0954', amount: 380000, status: 'completed', items: '冷轧钢板、镀锌板' },
        { id: 't4', date: '2024-09-12', orderNumber: 'PO-2024-0823', amount: 512000, status: 'completed', items: '不锈钢管 304、角钢' },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      setTransactions([]);
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleSelectSupplier = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    await fetchTransactionHistory(supplier.id);
  };

  const handleAddSupplier = () => {
    // Handle add supplier logic
    alert('新增供应商功能开发中！');
  };

  const handleEditSupplier = () => {
    // Handle edit supplier logic
    alert('编辑供应商功能开发中！');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>供应商管理</h1>
        <Button 
          className="bg-[#1A365D] hover:bg-[#2A4A7D]" 
          onClick={handleAddSupplier}
        >
          <Plus className="w-4 h-4 mr-2" />
          新增供应商
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Supplier List */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索供应商..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  加载中...
                </div>
              ) : filteredSuppliers.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  暂无供应商
                </div>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <button
                    key={supplier.id}
                    onClick={() => handleSelectSupplier(supplier)}
                    className={`w-full text-left px-4 py-3 border-l-4 transition-colors ${selectedSupplier?.id === supplier.id
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-transparent hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{supplier.name}</p>
                        <p className="text-xs text-gray-500">{supplier.code}</p>
                      </div>
                      <Badge
                        variant={supplier.status === 'active' ? 'default' : 'secondary'}
                        className={supplier.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                      >
                        {supplier.status === 'active' ? '合作中' : '已停用'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                      <span>交易 {supplier.totalTransactions} 笔</span>
                      <span>•</span>
                      <span>¥ {(supplier.totalAmount / 10000).toFixed(0)}万</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Supplier Details */}
        <Card className="lg:col-span-2 shadow-md">
          {selectedSupplier && (
            <div>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-[#1A365D] rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="mb-1">{selectedSupplier.name}</CardTitle>
                      <p className="text-sm text-gray-500 mb-2">{selectedSupplier.code} | {selectedSupplier.category}</p>
                      <div className="flex items-center gap-2">
                        {renderStars(selectedSupplier.rating)}
                        <span className="text-sm text-gray-600">评级</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleEditSupplier}>
                    编辑信息
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <Tabs defaultValue="info" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="info">基本信息</TabsTrigger>
                    <TabsTrigger value="transactions">交易历史</TabsTrigger>
                    <TabsTrigger value="stats">统计分析</TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="info" className="space-y-4">
                    <div>
                      <h4 className="mb-3">供应商简介</h4>
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {selectedSupplier.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="mb-3">联系方式</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                            <Phone className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">联系人</p>
                            <p className="font-medium">{selectedSupplier.contact} - {selectedSupplier.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-green-50 rounded flex items-center justify-center">
                            <Mail className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">电子邮箱</p>
                            <p className="font-medium">{selectedSupplier.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-orange-50 rounded flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs">公司地址</p>
                            <p className="font-medium">{selectedSupplier.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Transaction History Tab */}
                  <TabsContent value="transactions" className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4>交易记录</h4>
                      <span className="text-sm text-gray-500">
                        共 {transactionHistory[selectedSupplier.id]?.length || 0} 笔交易
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(transactionHistory[selectedSupplier.id] || []).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-mono text-sm font-medium">{transaction.orderNumber}</p>
                              <p className="text-xs text-gray-500 mt-1">{transaction.date}</p>
                            </div>
                            <Badge
                              className={
                                transaction.status === 'completed'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                  : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                              }
                            >
                              {transaction.status === 'completed' ? '已完成' : '待审核'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{transaction.items}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-[#1A365D]">
                              ¥ {transaction.amount.toLocaleString()}.00
                            </span>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              <Eye className="w-4 h-4 mr-1" />
                              查看详情
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Statistics Tab */}
                  <TabsContent value="stats" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">累计交易金额</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-mono font-bold text-[#1A365D]" style={{ fontSize: '20px' }}>
                            ¥ {(selectedSupplier.totalAmount / 10000).toFixed(1)}万
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>同比增长 18%</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">交易笔数</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-mono font-bold text-[#1A365D]" style={{ fontSize: '20px' }}>
                            {selectedSupplier.totalTransactions} 笔
                          </p>
                          <p className="text-sm text-gray-500 mt-2">平均每月 13 笔</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">平均订单金额</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-mono font-bold text-[#1A365D]" style={{ fontSize: '20px' }}>
                            ¥ {Math.round(selectedSupplier.totalAmount / selectedSupplier.totalTransactions).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">较上季度持平</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-blue-900 mb-1">合作评价</p>
                            <p className="text-sm text-blue-700">
                              该供应商为优质长期合作伙伴，供货稳定，产品质量优良，结算及时。
                              建议继续保持良好合作关系，可考虑扩大采购规模或签订年度框架协议。
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
