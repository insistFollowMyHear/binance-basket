import React, { useState } from 'react';

// 标签类型
type TabType = 'positions' | 'openOrders';

// 持仓数据接口
interface Position {
  symbol: string;
  side: 'long' | 'short';
  size: string;
  leverage: number;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  pnlPercent: string;
  margin: string;
  liquidationPrice: string;
}

// 订单数据接口
interface Order {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  price: string;
  amount: string;
  filled: string;
  status: 'open' | 'partially_filled';
  time: string;
}

export function OrderHistory() {
  // 当前选中的标签
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  
  // 模拟持仓数据
  const positions: Position[] = [
    {
      symbol: 'BTCUSDT',
      side: 'long',
      size: '0.5',
      leverage: 20,
      entryPrice: '67,850.00',
      markPrice: '68,245.50',
      pnl: '+197.75',
      pnlPercent: '+0.58%',
      margin: '1,696.25',
      liquidationPrice: '58,428.50',
    },
    {
      symbol: 'ETHUSDT',
      side: 'short',
      size: '2.0',
      leverage: 10,
      entryPrice: '3,510.40',
      markPrice: '3,450.75',
      pnl: '+119.30',
      pnlPercent: '+1.70%',
      margin: '702.08',
      liquidationPrice: '3,895.20',
    },
  ];
  
  // 模拟订单数据
  const orders: Order[] = [
    {
      symbol: 'BTCUSDT',
      side: 'buy',
      type: 'limit',
      price: '67,500.00',
      amount: '0.2',
      filled: '0',
      status: 'open',
      time: '2024-04-08 15:30:45',
    },
    {
      symbol: 'ETHUSDT',
      side: 'sell',
      type: 'limit',
      price: '3,600.00',
      amount: '1.0',
      filled: '0.3',
      status: 'partially_filled',
      time: '2024-04-08 14:45:20',
    },
  ];

  // 处理平仓操作
  const handleClosePosition = (symbol: string, side: 'long' | 'short') => {
    alert(`平仓 ${symbol} ${side === 'long' ? '多头' : '空头'} 仓位`);
  };
  
  // 处理调整杠杆操作
  const handleAdjustLeverage = (symbol: string) => {
    alert(`调整 ${symbol} 杠杆`);
  };
  
  // 处理设置止盈止损操作
  const handleSetTPSL = (symbol: string) => {
    alert(`设置 ${symbol} 止盈止损`);
  };
  
  // 处理取消订单操作
  const handleCancelOrder = (symbol: string) => {
    alert(`取消 ${symbol} 订单`);
  };

  // 渲染持仓列表
  const renderPositions = () => {
    if (positions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          暂无持仓
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="py-2 text-left">合约</th>
              <th className="py-2 text-right">仓位</th>
              <th className="py-2 text-right">杠杆</th>
              <th className="py-2 text-right">开仓均价</th>
              <th className="py-2 text-right">标记价格</th>
              <th className="py-2 text-right">未实现盈亏</th>
              <th className="py-2 text-right">保证金</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="py-3 text-white">{position.symbol}</td>
                <td className={`py-3 text-right ${
                  position.side === 'long' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {position.side === 'long' ? '多头' : '空头'} {position.size}
                </td>
                <td className="py-3 text-right text-white">{position.leverage}x</td>
                <td className="py-3 text-right text-white">{position.entryPrice}</td>
                <td className="py-3 text-right text-white">{position.markPrice}</td>
                <td className={`py-3 text-right ${
                  position.pnl.startsWith('+') ? 'text-green-500' : 'text-red-500'
                }`}>
                  {position.pnl} ({position.pnlPercent})
                </td>
                <td className="py-3 text-right text-white">{position.margin}</td>
                <td className="py-3 text-right">
                  <div className="flex space-x-1 justify-end">
                    <button 
                      onClick={() => handleClosePosition(position.symbol, position.side)}
                      className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                    >
                      平仓
                    </button>
                    <button 
                      onClick={() => handleAdjustLeverage(position.symbol)}
                      className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                    >
                      杠杆
                    </button>
                    <button 
                      onClick={() => handleSetTPSL(position.symbol)}
                      className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                    >
                      止盈止损
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  // 渲染订单列表
  const renderOrders = () => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          暂无委托订单
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="py-2 text-left">合约</th>
              <th className="py-2 text-right">类型</th>
              <th className="py-2 text-right">方向</th>
              <th className="py-2 text-right">价格</th>
              <th className="py-2 text-right">数量</th>
              <th className="py-2 text-right">已成交</th>
              <th className="py-2 text-right">状态</th>
              <th className="py-2 text-right">时间</th>
              <th className="py-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="py-3 text-white">{order.symbol}</td>
                <td className="py-3 text-right text-white">
                  {order.type === 'limit' ? '限价' : '市价'}
                </td>
                <td className={`py-3 text-right ${
                  order.side === 'buy' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {order.side === 'buy' ? '买入' : '卖出'}
                </td>
                <td className="py-3 text-right text-white">
                  {order.type === 'market' ? '市价' : order.price}
                </td>
                <td className="py-3 text-right text-white">{order.amount}</td>
                <td className="py-3 text-right text-white">{order.filled}</td>
                <td className="py-3 text-right text-yellow-500">
                  {order.status === 'open' ? '未成交' : '部分成交'}
                </td>
                <td className="py-3 text-right text-gray-300 text-sm">{order.time}</td>
                <td className="py-3 text-right">
                  <button 
                    onClick={() => handleCancelOrder(order.symbol)}
                    className="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                  >
                    取消
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      {/* 标签切换 */}
      <div className="flex space-x-4 mb-4 border-b border-gray-700">
        <button
          className={`pb-2 px-4 flex items-center ${
            activeTab === 'positions'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('positions')}
        >
          持仓
          {positions.length > 0 && (
            <span className="ml-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
              {positions.length}
            </span>
          )}
        </button>
        <button
          className={`pb-2 px-4 flex items-center ${
            activeTab === 'openOrders'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('openOrders')}
        >
          当前委托
          {orders.length > 0 && (
            <span className="ml-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </button>
      </div>
      
      {/* 内容显示 */}
      <div>
        {activeTab === 'positions' ? renderPositions() : renderOrders()}
      </div>
    </div>
  );
} 