import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface AccountNode {
  guid: string;
  name: string;
  account_type: string;
  balance: number;
  code?: string;
  children?: AccountNode[];
}

interface BalanceSheetProps {
  assets: AccountNode[];
  liabilities: AccountNode[];
  equity: AccountNode[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  reportDate: string;
}

// 将树形结构转换为扁平数组用于渲染
function flattenAccountTree(
  accounts: AccountNode[],
  indent: number = 0,
  isParent: boolean = false
): Array<{
  code: string;
  name: string;
  amount: number;
  indent: number;
  isParent: boolean;
  isTotal: boolean;
}> {
  const result: Array<{
    code: string;
    name: string;
    amount: number;
    indent: number;
    isParent: boolean;
    isTotal: boolean;
  }> = [];

  if (!accounts || accounts.length === 0) {
    return result;
  }

  accounts.forEach((account) => {
    if (!account) return;
    
    const hasChildren = account.children && account.children.length > 0;
    const balance = account.balance || 0;

    // 如果有子节点，先递归处理子节点
    if (hasChildren && account.children) {
      const childResults = flattenAccountTree(account.children, indent + 1, false);
      result.push(...childResults);
    }

    // 添加当前节点（父节点显示在子节点之后，作为合计）
    // 注意：后端返回的父节点余额已经包含了所有子节点的余额
    // 所以这里直接显示父节点的余额即可
    // 显示所有节点，包括余额为0的节点（这样报表更完整）
    result.push({
      code: account.code || '',
      name: account.name,
      amount: balance,
      indent,
      isParent: hasChildren || isParent,
      isTotal: false,
    });
  });

  return result;
}

// 格式化报告日期
function formatReportDate(period: string): string {
  if (period.includes('-Q')) {
    // 季度：2025-Q4 -> 2025-12-31
    const [year, quarter] = period.split('-Q');
    const quarterNum = parseInt(quarter);
    const endMonth = quarterNum * 3;
    const daysInEndMonth = new Date(parseInt(year), endMonth, 0).getDate();
    return `${year}-${String(endMonth).padStart(2, '0')}-${daysInEndMonth}`;
  } else if (period.includes('-')) {
    // 月份：2025-12 -> 2025-12-31
    const [year, month] = period.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    return `${year}-${month}-${daysInMonth}`;
  } else {
    // 年度：2025 -> 2025-12-31
    return `${period}-12-31`;
  }
}

export function BalanceSheet({
  assets,
  liabilities,
  equity,
  totalAssets,
  totalLiabilities,
  totalEquity,
  reportDate,
}: BalanceSheetProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // 调试日志
  console.log('BalanceSheet props:', { 
    assets: assets?.length || 0, 
    liabilities: liabilities?.length || 0, 
    equity: equity?.length || 0, 
    totalAssets, 
    totalLiabilities, 
    totalEquity 
  });

  const assetsData = flattenAccountTree(assets || []);
  const liabilitiesData = flattenAccountTree(liabilities || []);
  const equityData = flattenAccountTree(equity || []);
  
  // 调试日志
  console.log('Flattened data lengths:', { 
    assetsData: assetsData.length, 
    liabilitiesData: liabilitiesData.length, 
    equityData: equityData.length 
  });

  // 添加总计行
  assetsData.push({
    code: '',
    name: '资产总计',
    amount: totalAssets,
    indent: 0,
    isParent: false,
    isTotal: true,
  });

  const liabilitiesAndEquityData = [
    ...liabilitiesData,
    ...equityData,
    {
      code: '',
      name: '负债及权益总计',
      amount: totalLiabilities + totalEquity,
      indent: 0,
      isParent: false,
      isTotal: true,
    },
  ];

  const renderRow = (
    item: {
      code: string;
      name: string;
      amount: number;
      indent: number;
      isParent: boolean;
      isTotal: boolean;
    },
    index: number
  ) => {
    if (item.name === '') {
      return <tr key={index} className="h-2"></tr>;
    }

    const isHovered = hoveredItem === `${item.code}-${item.name}`;

    return (
      <tr
        key={index}
        className={`border-b border-gray-100 ${isHovered && item.amount !== 0 ? 'bg-blue-50' : ''}`}
        onMouseEnter={() => item.amount !== 0 && setHoveredItem(`${item.code}-${item.name}`)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <td className="px-4 py-2">
          <div style={{ paddingLeft: `${item.indent * 24}px` }}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`
                      ${item.isTotal ? 'font-bold text-[#1A365D]' : ''}
                      ${item.isParent && !item.isTotal ? 'font-semibold' : ''}
                      ${item.isParent || item.isTotal ? '' : 'text-gray-700'}
                      ${isHovered && item.amount !== 0 ? 'cursor-pointer text-blue-600' : ''}
                    `}
                  >
                    {item.name}
                  </span>
                </TooltipTrigger>
                {isHovered && item.amount !== 0 && (
                  <TooltipContent>
                    <p className="text-xs">点击查看明细账</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </td>
        <td
          className={`px-4 py-2 text-right font-mono ${
            item.isTotal ? 'font-bold text-[#1A365D]' : ''
          }`}
        >
          {item.amount !== 0 ? (
            <span
              className={item.isTotal || item.isParent ? 'border-b-2 border-gray-800' : ''}
            >
              {Math.abs(item.amount).toLocaleString()}.00
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <Card
      className="shadow-md overflow-hidden bg-white"
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
      <div className="text-center py-6 border-b border-gray-200 bg-gray-50">
        <h2 className="mb-2">资产负债表</h2>
        <p className="text-sm text-gray-600">Balance Sheet</p>
        <p className="text-sm text-gray-500 mt-2">会计期间: {reportDate}</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-gray-300">
        <div>
          <div className="bg-[#1A365D] text-white px-4 py-3 text-center font-semibold">
            资产 (Assets)
          </div>
          <table className="w-full">
            <tbody>
              {assetsData.length > 0 ? (
                assetsData.map((item, index) => renderRow(item, index))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    暂无资产数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <div className="bg-[#1A365D] text-white px-4 py-3 text-center font-semibold">
            负债及权益 (Liabilities & Equity)
          </div>
          <table className="w-full">
            <tbody>
              {liabilitiesAndEquityData.length > 0 ? (
                liabilitiesAndEquityData.map((item, index) => renderRow(item, index))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                    暂无负债及权益数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-gray-600">编制单位: GnuCash-Lite 演示公司</p>
            <p className="text-gray-600 mt-1">编制日期: {formatReportDate(reportDate)}</p>
            <p className="text-gray-600 mt-1">单位: 人民币元</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">法定代表人: ________</p>
            <p className="text-gray-600 mt-1">财务负责人: ________</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

