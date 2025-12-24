import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface Account {
  id: string;
  code: string;
  name: string;
  balance: number;
  children?: Account[];
}

const accountsData: Account[] = [
  {
    id: '1',
    code: '1',
    name: '资产',
    balance: 0,
    children: [
      {
        id: '11',
        code: '11',
        name: '流动资产',
        balance: 0,
        children: [
          { id: '1001', code: '1001', name: '库存现金', balance: 125000, children: [] },
          {
            id: '1002',
            code: '1002',
            name: '银行存款',
            balance: 0,
            children: [
              { id: '100201', code: '100201', name: '工商银行', balance: 4580000, children: [] },
              { id: '100202', code: '100202', name: '建设银行', balance: 2540680, children: [] },
            ],
          },
          { id: '1012', code: '1012', name: '其他货币资金', balance: 0, children: [] },
          { id: '1121', code: '1121', name: '应收账款', balance: 1856000, children: [] },
        ],
      },
      {
        id: '12',
        code: '12',
        name: '非流动资产',
        balance: 0,
        children: [
          { id: '1201', code: '1201', name: '长期股权投资', balance: 5000000, children: [] },
          { id: '1601', code: '1601', name: '固定资产', balance: 12500000, children: [] },
        ],
      },
    ],
  },
  {
    id: '2',
    code: '2',
    name: '负债',
    balance: 0,
    children: [
      {
        id: '22',
        code: '22',
        name: '流动负债',
        balance: 0,
        children: [
          { id: '2202', code: '2202', name: '应付账款', balance: 3856230, children: [] },
          { id: '2241', code: '2241', name: '应付职工薪酬', balance: 850000, children: [] },
        ],
      },
    ],
  },
  {
    id: '4',
    code: '4',
    name: '权益',
    balance: 0,
    children: [
      { id: '4001', code: '4001', name: '实收资本', balance: 10000000, children: [] },
      { id: '4103', code: '4103', name: '未分配利润', balance: 8200450, children: [] },
    ],
  },
];

export function ChartOfAccounts() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '11', '1002']));
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(accountsData[0].children![0].children![1]);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

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
      const isExpanded = expandedNodes.has(account.id);
      const isSelected = selectedAccount?.id === account.id;
      const isParent = level < 2;

      return (
        <div key={account.id}>
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
                  toggleNode(account.id);
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
            
            <span className={`flex-1 text-sm ${isParent ? 'font-semibold' : ''}`}>
              {account.code} - {account.name}
            </span>
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
        <Button className="bg-[#1A365D] hover:bg-[#2A4A7D]">
          <Plus className="w-4 h-4 mr-2" />
          新建科目
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tree View */}
        <Card className="lg:col-span-1 shadow-md p-4 h-[calc(100vh-250px)] overflow-auto">
          <div className="space-y-1">
            {renderTree(accountsData)}
          </div>
        </Card>

        {/* Right: Detail View */}
        <Card className="lg:col-span-2 shadow-md">
          {selectedAccount ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="mb-1">{selectedAccount.name}</h2>
                  <p className="text-sm text-gray-500">科目代码: {selectedAccount.code}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    新增子科目
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
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
                  <label className="block text-sm mb-2 text-gray-600">父级科目</label>
                  <Input 
                    value="1002 - 银行存款" 
                    className="bg-gray-50"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-600">当前余额</label>
                  <div className="flex items-center h-10 px-3 bg-gray-50 rounded-md border border-gray-200">
                    <span className="font-mono text-[#1A365D]" style={{ fontSize: '16px', fontWeight: '600' }}>
                      ¥ {selectedAccount.balance.toLocaleString()}.00
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
                      该科目已有 {Math.floor(Math.random() * 50 + 10)} 笔关联交易记录。如需修改科目信息，请确保不影响历史数据的完整性。
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
              <AlertDialogTitle className="text-red-700">无法删除科目</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-700 text-base">
              该科目下存在关联交易，禁止删除！
            </AlertDialogDescription>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              如需删除此科目，请先将所有关联的凭证分录转移至其他科目，或联系系统管理员进行处理。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteAlert(false)}>
              我知道了
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
