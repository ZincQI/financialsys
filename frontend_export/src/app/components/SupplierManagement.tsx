import { useState, useEffect } from 'react';
import { Search, Plus, Phone, Mail, MapPin, TrendingUp, Building2, Eye, Edit, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewTransactionDialogOpen, setIsViewTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Supplier>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showNewSupplierDialog, setShowNewSupplierDialog] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    category: '',
    rating: 5,
    status: 'active' as 'active' | 'inactive',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);

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
      const data = await SupplierAPI.getSupplierTransactions(supplierId);
      setTransactions(data);
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
    setNewSupplierForm({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      category: '',
      rating: 5,
      status: 'active',
      description: ''
    });
    setShowNewSupplierDialog(true);
  };

  const handleCreateSupplier = async () => {
    if (!newSupplierForm.name.trim()) {
      alert('请填写供应商名称！');
      return;
    }

    try {
      setIsCreating(true);
      const newSupplier = await SupplierAPI.createSupplier(newSupplierForm);
      
      // 刷新供应商列表
      const data = await SupplierAPI.getSuppliers();
      setSuppliers(data);
      
      // 选中新创建的供应商
      setSelectedSupplier(newSupplier);
      await fetchTransactionHistory(newSupplier.id);
      
      setShowNewSupplierDialog(false);
      alert('供应商创建成功！');
    } catch (error: any) {
      console.error('Failed to create supplier:', error);
      alert(error.message || '创建失败，请重试！');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSupplier = () => {
    if (!selectedSupplier) return;
    setEditFormData({ ...selectedSupplier });
    setIsEditDialogOpen(true);
  };

  const handleSaveSupplier = async () => {
    if (!selectedSupplier || !editFormData) return;
    
    try {
      setIsSaving(true);
      const updated = await SupplierAPI.updateSupplier(selectedSupplier.id, editFormData);
      
      // 更新供应商列表
      setSuppliers(suppliers.map(s => s.id === updated.id ? updated : s));
      setSelectedSupplier(updated);
      setIsEditDialogOpen(false);
      alert('供应商信息已更新！');
    } catch (error) {
      console.error('Failed to update supplier:', error);
      alert('更新失败，请重试！');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewTransactionDetails = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsViewTransactionDialogOpen(true);
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
                        共 {transactions.length} 笔交易
                      </span>
                    </div>

                    <div className="space-y-3">
                      {transactions.map((transaction) => (
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleViewTransactionDetails(transaction)}
                            >
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

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑供应商信息</DialogTitle>
            <DialogDescription>
              修改供应商的基本信息和联系方式
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">供应商名称 *</Label>
                <Input
                  id="name"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="code">供应商编码</Label>
                <Input
                  id="code"
                  value={editFormData.code || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact">联系人</Label>
                <Input
                  id="contact"
                  value={editFormData.contact || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">联系电话</Label>
                <Input
                  id="phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">电子邮箱</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">公司地址</Label>
              <Input
                id="address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">供应商类别</Label>
                <Input
                  id="category"
                  value={editFormData.category || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rating">评级 (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={editFormData.rating || 5}
                  onChange={(e) => setEditFormData({ ...editFormData, rating: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">状态</Label>
              <Select
                value={editFormData.status || 'active'}
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value as 'active' | 'inactive' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">合作中</SelectItem>
                  <SelectItem value="inactive">已停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">供应商简介</Label>
              <Textarea
                id="description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button 
              onClick={handleSaveSupplier}
              disabled={isSaving || !editFormData.name}
              className="bg-[#1A365D] hover:bg-[#2A4A7D]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={isViewTransactionDialogOpen} onOpenChange={setIsViewTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>交易详情</DialogTitle>
            <DialogDescription>
              订单号: {selectedTransaction?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">订单号</Label>
                  <p className="font-mono font-medium">{selectedTransaction.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-500">交易日期</Label>
                  <p className="font-medium">{selectedTransaction.date}</p>
                </div>
                <div>
                  <Label className="text-gray-500">交易金额</Label>
                  <p className="font-mono font-semibold text-[#1A365D] text-lg">
                    ¥ {selectedTransaction.amount.toLocaleString()}.00
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">状态</Label>
                  <div>
                    {selectedTransaction.status === 'completed' ? (
                      <Badge className="bg-green-100 text-green-700">已完成</Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700">待审核</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">商品明细</Label>
                <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">
                  {selectedTransaction.items}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Supplier Dialog */}
      <Dialog open={showNewSupplierDialog} onOpenChange={setShowNewSupplierDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增供应商</DialogTitle>
            <DialogDescription>
              填写供应商的基本信息和联系方式
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-name">供应商名称 *</Label>
                <Input
                  id="new-name"
                  value={newSupplierForm.name}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
                  className="mt-1"
                  placeholder="请输入供应商名称"
                />
              </div>
              <div>
                <Label htmlFor="new-category">供应商类别</Label>
                <Input
                  id="new-category"
                  value={newSupplierForm.category}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, category: e.target.value })}
                  className="mt-1"
                  placeholder="如：原材料供应商"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-contact">联系人</Label>
                <Input
                  id="new-contact"
                  value={newSupplierForm.contact}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, contact: e.target.value })}
                  className="mt-1"
                  placeholder="联系人姓名"
                />
              </div>
              <div>
                <Label htmlFor="new-phone">联系电话</Label>
                <Input
                  id="new-phone"
                  value={newSupplierForm.phone}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                  className="mt-1"
                  placeholder="联系电话"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new-email">电子邮箱</Label>
              <Input
                id="new-email"
                type="email"
                value={newSupplierForm.email}
                onChange={(e) => setNewSupplierForm({ ...newSupplierForm, email: e.target.value })}
                className="mt-1"
                placeholder="example@company.com"
              />
            </div>
            <div>
              <Label htmlFor="new-address">公司地址</Label>
              <Input
                id="new-address"
                value={newSupplierForm.address}
                onChange={(e) => setNewSupplierForm({ ...newSupplierForm, address: e.target.value })}
                className="mt-1"
                placeholder="公司详细地址"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-rating">评级 (1-5)</Label>
                <Input
                  id="new-rating"
                  type="number"
                  min="1"
                  max="5"
                  value={newSupplierForm.rating}
                  onChange={(e) => setNewSupplierForm({ ...newSupplierForm, rating: parseInt(e.target.value) || 5 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-status">状态</Label>
                <Select
                  value={newSupplierForm.status}
                  onValueChange={(value) => setNewSupplierForm({ ...newSupplierForm, status: value as 'active' | 'inactive' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">合作中</SelectItem>
                    <SelectItem value="inactive">已停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="new-description">供应商简介</Label>
              <Textarea
                id="new-description"
                value={newSupplierForm.description}
                onChange={(e) => setNewSupplierForm({ ...newSupplierForm, description: e.target.value })}
                className="mt-1"
                rows={4}
                placeholder="供应商简介、合作历史等信息"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowNewSupplierDialog(false)} disabled={isCreating}>
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button 
              onClick={handleCreateSupplier}
              disabled={isCreating || !newSupplierForm.name.trim()}
              className="bg-[#1A365D] hover:bg-[#2A4A7D]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isCreating ? '创建中...' : '创建'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
