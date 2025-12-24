import { useState } from 'react';
import { Search, Plus, Phone, Mail, MapPin, TrendingUp, Building2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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

const suppliersData: Supplier[] = [
  {
    id: '1',
    name: '华东钢材有限公司',
    code: 'SUP-001',
    contact: '张经理',
    phone: '021-12345678',
    email: 'zhang@huadong-steel.com',
    address: '上海市浦东新区工业路888号',
    category: '原材料供应商',
    rating: 5,
    totalTransactions: 156,
    totalAmount: 45680000,
    status: 'active',
    description: '华东地区知名钢材供应商，主营各类优质钢材产品。合作15年，供货稳定，质量可靠。提供热轧、冷轧钢板及各类型钢，支持定制加工服务。',
  },
  {
    id: '2',
    name: '江苏化工集团',
    code: 'SUP-002',
    contact: '李主任',
    phone: '025-87654321',
    email: 'li@jiangsu-chem.com',
    address: '江苏省南京市化工园区中山路200号',
    category: '化工原料供应商',
    rating: 4,
    totalTransactions: 89,
    totalAmount: 23450000,
    status: 'active',
    description: '江苏省大型化工企业，产品线丰富。主要供应聚乙烯树脂、增塑剂等化工原料。具备完善的质量管理体系和环保认证。',
  },
  {
    id: '3',
    name: '上海包装材料厂',
    code: 'SUP-003',
    contact: '王厂长',
    phone: '021-66778899',
    email: 'wang@sh-package.com',
    address: '上海市嘉定区包装工业园区',
    category: '包装材料供应商',
    rating: 4,
    totalTransactions: 234,
    totalAmount: 8760000,
    status: 'active',
    description: '专业包装材料生产厂家，提供各类纸箱、气泡膜、缓冲材料。支持定制印刷，交货及时，价格合理。',
  },
  {
    id: '4',
    name: '广东五金制造商',
    code: 'SUP-004',
    contact: '陈总',
    phone: '0755-88990011',
    email: 'chen@gd-hardware.com',
    address: '广东省深圳市宝安区五金产业园',
    category: '五金配件供应商',
    rating: 5,
    totalTransactions: 312,
    totalAmount: 18920000,
    status: 'active',
    description: '华南地区领先的五金制造企业，产品涵盖螺栓、轴承、链条等标准件及精密五金。技术实力雄厚，交付能力强。',
  },
  {
    id: '5',
    name: '北京电子元件有限公司',
    code: 'SUP-005',
    contact: '刘工',
    phone: '010-12349876',
    email: 'liu@bj-electronic.com',
    address: '北京市海淀区中关村科技园',
    category: '电子元器件供应商',
    rating: 5,
    totalTransactions: 178,
    totalAmount: 32450000,
    status: 'active',
    description: '专注于电子元器件分销，代理多个国际知名品牌。提供单片机、LED、电源模块等产品，技术支持完善。',
  },
];

const transactionHistory: { [key: string]: Transaction[] } = {
  '1': [
    { id: 't1', date: '2024-12-20', orderNumber: 'PO-2024-1156', amount: 458600, status: 'pending', items: '热轧钢板、冷轧钢板、不锈钢管' },
    { id: 't2', date: '2024-11-15', orderNumber: 'PO-2024-1089', amount: 625000, status: 'completed', items: '热轧钢板 Q235' },
    { id: 't3', date: '2024-10-28', orderNumber: 'PO-2024-0954', amount: 380000, status: 'completed', items: '冷轧钢板、镀锌板' },
    { id: 't4', date: '2024-09-12', orderNumber: 'PO-2024-0823', amount: 512000, status: 'completed', items: '不锈钢管 304、角钢' },
  ],
  '2': [
    { id: 't5', date: '2024-12-18', orderNumber: 'PO-2024-1155', amount: 235000, status: 'completed', items: '聚乙烯树脂、增塑剂 DOP' },
    { id: 't6', date: '2024-11-05', orderNumber: 'PO-2024-1045', amount: 189000, status: 'completed', items: '聚氯乙烯树脂' },
    { id: 't7', date: '2024-10-20', orderNumber: 'PO-2024-0912', amount: 298000, status: 'completed', items: '增塑剂、稳定剂' },
  ],
  '3': [
    { id: 't8', date: '2024-12-15', orderNumber: 'PO-2024-1154', amount: 87500, status: 'completed', items: '瓦楞纸箱、气泡膜' },
    { id: 't9', date: '2024-12-01', orderNumber: 'PO-2024-1121', amount: 65000, status: 'completed', items: '纸箱、封箱胶带' },
    { id: 't10', date: '2024-11-18', orderNumber: 'PO-2024-1087', amount: 52000, status: 'completed', items: '气泡膜、珍珠棉' },
    { id: 't11', date: '2024-11-05', orderNumber: 'PO-2024-1042', amount: 48000, status: 'completed', items: '纸箱定制印刷' },
  ],
};

export function SupplierManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier>(suppliersData[0]);

  const filteredSuppliers = suppliersData.filter((supplier) =>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>供应商管理</h1>
        <Button className="bg-[#1A365D] hover:bg-[#2A4A7D]">
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
              {filteredSuppliers.map((supplier) => (
                <button
                  key={supplier.id}
                  onClick={() => setSelectedSupplier(supplier)}
                  className={`w-full text-left px-4 py-3 border-l-4 transition-colors ${
                    selectedSupplier.id === supplier.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
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
              ))}
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
                  <Button variant="outline" size="sm">
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
