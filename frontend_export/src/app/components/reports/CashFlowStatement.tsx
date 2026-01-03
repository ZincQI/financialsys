import React from 'react';
import { Card } from '../ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CashFlowData {
  operating: {
    inflows: number;
    outflows: number;
    net: number;
  };
  investing: {
    inflows: number;
    outflows: number;
    net: number;
  };
  financing: {
    inflows: number;
    outflows: number;
    net: number;
  };
  net_increase: number;
  start_balance: number;
  end_balance: number;
}

interface CashFlowStatementProps {
  data: CashFlowData;
  reportPeriod: string;
}

export function CashFlowStatement({ data, reportPeriod }: CashFlowStatementProps) {
  const cashFlowItems = [
    { name: '一、经营活动产生的现金流量', amount: 0, indent: 0, isSubtotal: true, icon: null as 'up' | 'down' | null },
    { name: '销售商品、提供劳务收到的现金', amount: data.operating.inflows, indent: 1, isSubtotal: false, icon: 'up' as const },
    { name: '收到的税费返还', amount: 0, indent: 1, isSubtotal: false, icon: 'up' as const },
    { name: '收到其他与经营活动有关的现金', amount: 0, indent: 1, isSubtotal: false, icon: 'up' as const },
    { name: '购买商品、接受劳务支付的现金', amount: -data.operating.outflows, indent: 1, isSubtotal: false, icon: 'down' as const },
    { name: '支付给职工以及为职工支付的现金', amount: 0, indent: 1, isSubtotal: false, icon: 'down' as const },
    { name: '支付的各项税费', amount: 0, indent: 1, isSubtotal: false, icon: 'down' as const },
    { name: '支付其他与经营活动有关的现金', amount: 0, indent: 1, isSubtotal: false, icon: 'down' as const },
    { name: '经营活动现金流量净额', amount: data.operating.net, indent: 0, isSubtotal: true, icon: null },
    { name: '', amount: 0, indent: 0, isSubtotal: false, icon: null },
    { name: '二、投资活动产生的现金流量', amount: 0, indent: 0, isSubtotal: true, icon: null },
    { name: '收回投资收到的现金', amount: data.investing.inflows, indent: 1, isSubtotal: false, icon: 'up' as const },
    { name: '取得投资收益收到的现金', amount: 0, indent: 1, isSubtotal: false, icon: 'up' as const },
    { name: '购建固定资产支付的现金', amount: -data.investing.outflows, indent: 1, isSubtotal: false, icon: 'down' as const },
    { name: '投资支付的现金', amount: 0, indent: 1, isSubtotal: false, icon: 'down' as const },
    { name: '投资活动现金流量净额', amount: data.investing.net, indent: 0, isSubtotal: true, icon: null },
    { name: '', amount: 0, indent: 0, isSubtotal: false, icon: null },
    { name: '三、筹资活动产生的现金流量', amount: 0, indent: 0, isSubtotal: true, icon: null },
    { name: '吸收投资收到的现金', amount: data.financing.inflows, indent: 1, isSubtotal: false, icon: 'up' as const },
    { name: '取得借款收到的现金', amount: 0, indent: 1, isSubtotal: false, icon: 'up' as const },
    { name: '偿还债务支付的现金', amount: -data.financing.outflows, indent: 1, isSubtotal: false, icon: 'down' as const },
    { name: '分配股利、利润支付的现金', amount: 0, indent: 1, isSubtotal: false, icon: 'down' as const },
    { name: '筹资活动现金流量净额', amount: data.financing.net, indent: 0, isSubtotal: true, icon: null },
    { name: '', amount: 0, indent: 0, isSubtotal: false, icon: null },
    { name: '四、现金及现金等价物净增加额', amount: data.net_increase, indent: 0, isTotal: true, icon: null },
    { name: '加：期初现金及现金等价物余额', amount: data.start_balance, indent: 0, isTotal: false, icon: null },
    { name: '五、期末现金及现金等价物余额', amount: data.end_balance, indent: 0, isTotal: true, icon: null },
  ];

  const renderRow = (
    item: {
      name: string;
      amount: number;
      indent: number;
      isSubtotal: boolean;
      isTotal?: boolean;
      icon: 'up' | 'down' | null;
    },
    index: number
  ) => {
    if (item.name === '') {
      return <tr key={index} className="h-2"></tr>;
    }

    return (
      <tr key={index} className="border-b border-gray-100">
        <td className="px-6 py-2">
          <div style={{ paddingLeft: `${item.indent * 24}px` }} className="flex items-center gap-2">
            {item.icon === 'up' && <ArrowUpRight className="w-4 h-4 text-[#10B981]" />}
            {item.icon === 'down' && <ArrowDownRight className="w-4 h-4 text-[#DC2626]" />}
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
          } ${item.amount < 0 ? 'text-[#DC2626]' : ''} ${item.isTotal ? 'text-[#1A365D]' : ''}`}
        >
          {item.amount !== 0 && (
            <span
              className={
                item.isTotal
                  ? 'border-b-2 border-[#1A365D]'
                  : item.isSubtotal
                    ? 'border-b border-gray-400'
                    : ''
              }
            >
              {item.amount < 0
                ? `(${Math.abs(item.amount).toLocaleString()}.00)`
                : `${item.amount.toLocaleString()}.00`}
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
        <h2 className="mb-2">现金流量表</h2>
        <p className="text-sm text-gray-600">Cash Flow Statement</p>
        <p className="text-sm text-gray-500 mt-2">会计期间: {reportPeriod}</p>
      </div>

      <table className="w-full">
        <thead className="bg-[#1A365D] text-white">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">项目</th>
            <th className="px-6 py-3 text-right font-semibold">本期金额</th>
          </tr>
        </thead>
        <tbody>{cashFlowItems.map((item, index) => renderRow(item, index))}</tbody>
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

