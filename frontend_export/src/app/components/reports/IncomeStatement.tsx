import React from 'react';
import { Card } from '../ui/card';

interface AccountNode {
  guid: string;
  name: string;
  account_type: string;
  balance: number;
  code?: string;
  children?: AccountNode[];
}

interface IncomeStatementProps {
  income: AccountNode[];
  expenses: AccountNode[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  reportPeriod: string;
}

// 将树形结构转换为扁平数组用于渲染
function flattenIncomeStatement(
  accounts: AccountNode[],
  indent: number = 0
): Array<{
  code: string;
  name: string;
  amount: number;
  indent: number;
  isSubtotal: boolean;
  isTotal: boolean;
}> {
  const result: Array<{
    code: string;
    name: string;
    amount: number;
    indent: number;
    isSubtotal: boolean;
    isTotal: boolean;
  }> = [];

  accounts.forEach((account) => {
    const hasChildren = account.children && account.children.length > 0;
    const balance = account.balance || 0;

    // 添加当前节点
    result.push({
      code: account.code || '',
      name: account.name,
      amount: balance,
      indent,
      isSubtotal: hasChildren,
      isTotal: false,
    });

    // 如果有子节点，递归处理
    if (hasChildren && account.children) {
      const childResults = flattenIncomeStatement(account.children, indent + 1);
      result.push(...childResults);

      // 添加小计行
      const childrenTotal = account.children.reduce((sum, child) => sum + (child.balance || 0), 0);
      if (childrenTotal > 0) {
        result.push({
          code: '',
          name: '',
          amount: 0,
          indent: 0,
          isSubtotal: false,
          isTotal: false,
        });
      }
    }
  });

  return result;
}

export function IncomeStatement({
  income,
  expenses,
  totalIncome,
  totalExpenses,
  netIncome,
  reportPeriod,
}: IncomeStatementProps) {
  const incomeData = flattenIncomeStatement(income);
  const expenseData = flattenIncomeStatement(expenses);

  // 构建完整的利润表数据
  const statementData = [
    { code: '', name: '一、营业收入', amount: totalIncome, indent: 0, isSubtotal: true, isTotal: false },
    ...incomeData,
    { code: '', name: '', amount: 0, indent: 0, isSubtotal: false, isTotal: false },
    { code: '', name: '二、营业成本', amount: totalExpenses, indent: 0, isSubtotal: true, isTotal: false },
    ...expenseData,
    { code: '', name: '', amount: 0, indent: 0, isSubtotal: false, isTotal: false },
    { code: '', name: '营业利润', amount: totalIncome - totalExpenses, indent: 0, isSubtotal: true, isTotal: false },
    { code: '', name: '', amount: 0, indent: 0, isSubtotal: false, isTotal: false },
    { code: '', name: '净利润', amount: netIncome, indent: 0, isSubtotal: false, isTotal: true },
  ];

  const renderRow = (
    item: {
      code: string;
      name: string;
      amount: number;
      indent: number;
      isSubtotal: boolean;
      isTotal: boolean;
    },
    index: number
  ) => {
    if (item.name === '') {
      return <tr key={index} className="h-2"></tr>;
    }

    return (
      <tr key={index} className="border-b border-gray-100">
        <td className="px-6 py-2">
          <div style={{ paddingLeft: `${item.indent * 24}px` }}>
            <span
              className={`
              ${item.isTotal ? 'font-bold text-[#1A365D]' : ''}
              ${item.isSubtotal ? 'font-semibold' : ''}
              ${!item.isTotal && !item.isSubtotal ? 'text-gray-700' : ''}
            `}
            >
              {item.name}
            </span>
          </div>
        </td>
        <td
          className={`px-6 py-2 text-right font-mono ${
            item.isTotal || item.isSubtotal ? 'font-semibold' : ''
          } ${item.isTotal ? 'text-[#10B981]' : ''}`}
        >
          {item.amount > 0 && (
            <span
              className={
                item.isTotal
                  ? 'border-b-2 border-[#10B981]'
                  : item.isSubtotal
                    ? 'border-b border-gray-400'
                    : ''
              }
            >
              {item.amount.toLocaleString()}.00
            </span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <Card
      className="shadow-md overflow-hidden bg-white"
      style={{ maxWidth: '900px', margin: '0 auto' }}
    >
      <div className="text-center py-6 border-b border-gray-200 bg-gray-50">
        <h2 className="mb-2">利润表</h2>
        <p className="text-sm text-gray-600">Income Statement</p>
        <p className="text-sm text-gray-500 mt-2">会计期间: {reportPeriod}</p>
      </div>

      <table className="w-full">
        <thead className="bg-[#1A365D] text-white">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">项目</th>
            <th className="px-6 py-3 text-right font-semibold">本期金额</th>
          </tr>
        </thead>
        <tbody>{statementData.map((item, index) => renderRow(item, index))}</tbody>
      </table>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-gray-600">编制单位: GnuCash-Lite 演示公司</p>
            <p className="text-gray-600 mt-1">编制日期: {new Date().toISOString().split('T')[0]}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">单位: 人民币元</p>
            <p className="text-gray-600 mt-1">法定代表人: ________ 财务负责人: ________</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

