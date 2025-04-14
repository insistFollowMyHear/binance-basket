import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';

// 标签类型
type TabType = 'positions' | 'openOrders' | 'historyOrders';

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
  const positionList: any[] = [
    {
      symbol: 'BTCUSDT',
      size: '0.5',
      leverage: 20,
      entryPrice: '67,850.00',
      markPrice: '68,245.50',
      pnl: '+197.75',
      pnlPercent: '+0.58%',
      margin: '1,696.25',
      liquidationPrice: '58,428.50',
      breakEvenPrice: '67,500.00',
      marginRatio: '10.00%',
      marginRate: '10.00%'
    }
  ];
  
  // 模拟订单数据
  const openOrderList: Order[] = [];

  const historyOrderList: Order[] = [];
  

  // 处理平仓操作
  // const handleClosePosition = (symbol: string, side: 'long' | 'short') => {
  //   alert(`平仓 ${symbol} ${side === 'long' ? '多头' : '空头'} 仓位`);
  // };
  
  // // 处理调整杠杆操作
  // const handleAdjustLeverage = (symbol: string) => {
  //   alert(`调整 ${symbol} 杠杆`);
  // };
  
  // // 处理设置止盈止损操作
  // const handleSetTPSL = (symbol: string) => {
  //   alert(`设置 ${symbol} 止盈止损`);
  // };
  
  // // 处理取消订单操作
  // const handleCancelOrder = (symbol: string) => {
  //   alert(`取消 ${symbol} 订单`);
  // };

  // 渲染持仓列表
  const renderPositions = () => {
    if (positionList.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          暂无持仓
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">合约</TableHead>
              <TableHead className="min-w-[100px]">数量</TableHead>
              <TableHead className="min-w-[100px]">开仓均价</TableHead>
              <TableHead className="min-w-[100px]">损益两平价</TableHead>
              <TableHead className="min-w-[100px]">标记价格</TableHead>
              <TableHead className="min-w-[100px]">强平价格</TableHead>
              <TableHead className="min-w-[100px]">保证金比率</TableHead>
              <TableHead className="min-w-[100px]">保证金</TableHead>
              <TableHead className="sticky right-0 bg-background shadow-left z-10">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positionList.map((position, index) => (
              <TableRow key={index}>
                <TableCell className="min-w-[100px]">{position.symbol}</TableCell>
                <TableCell className="min-w-[100px]">{position.size}</TableCell>
                <TableCell className="min-w-[100px]">{position.entryPrice}</TableCell>
                <TableCell className="min-w-[100px]">{position.breakEvenPrice}</TableCell>
                <TableCell className="min-w-[100px]">{position.markPrice}</TableCell>
                <TableCell className="min-w-[100px]">{position.liquidationPrice}</TableCell>
                <TableCell className="min-w-[100px]">{position.marginRatio}</TableCell>
                <TableCell className="min-w-[100px]">{position.margin}</TableCell>
                <TableCell className="min-w-[100px] flex space-x-2 sticky right-0 bg-background shadow-left z-10">
                  <Button variant="outline" size="sm">
                    平仓
                  </Button>
                  <Button variant="outline" size="sm">
                    杠杆
                  </Button>
                  <Button variant="outline" size="sm">
                    止盈止损
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // 渲染订单列表
  const renderOrders = () => {
    if (activeTab === 'openOrders' && openOrderList.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          暂无委托订单
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">合约</TableHead>
              <TableHead className="min-w-[100px]">方向</TableHead>
              <TableHead className="min-w-[100px]">类型</TableHead>
              <TableHead className="min-w-[100px]">价格</TableHead>
              <TableHead className="min-w-[100px]">数量</TableHead>
              <TableHead className="min-w-[100px]">状态</TableHead>
              <TableHead className="min-w-[100px]">时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {openOrderList.map((order, index) => (
              <TableRow key={index}>
                <TableCell className="min-w-[100px]">{order.symbol}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4 mb-4">
            <Button
              variant={activeTab === 'positions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('positions')}
            >
              <span>持仓({positionList.length})</span>
            </Button>
            <Button
              variant={activeTab === 'openOrders' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('openOrders')}
            >
              <span>当前委托({openOrderList.length})</span>
            </Button>
            <Button
              variant={activeTab === 'historyOrders' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('historyOrders')}
            >
              <span>历史委托({historyOrderList.length})</span>
            </Button>
          </div>
          {
            activeTab === 'positions' && (
              <Button variant="outline" size="sm">一键平仓</Button>
            )
          }
        </div>
        
        {activeTab === 'positions' ? renderPositions() : renderOrders()}
      </CardContent>
    </Card>
    
  );
} 