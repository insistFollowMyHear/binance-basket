import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// 保证金模式
type MarginMode = 'cross' | 'isolated';
// 订单类型
type OrderType = 'LIMIT' | 'MARKET';
// 交易方向
type TradeSide = 'long' | 'short';
// 单位类型
type UnitType = 'USDT' | 'TOKEN';

export function TradingForm({ symbol = 'BTCUSDT' }: { symbol?: string }) {
  // 保证金模式：全仓或逐仓
  const [marginMode, setMarginMode] = useState<MarginMode>('cross');
  // 杠杆倍数
  const [leverage, setLeverage] = useState<number>(20);
  // 是否显示杠杆调整弹窗
  const [showLeverageModal, setShowLeverageModal] = useState<boolean>(false);
  // 是否显示保证金模式弹窗
  const [showMarginModeModal, setShowMarginModeModal] = useState<boolean>(false);
  // 订单类型：限价或市价
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  // 价格输入
  const [price, setPrice] = useState<string>('');
  // 数量输入
  const [amount, setAmount] = useState<string>('');
  // 单位类型：USDT或代币
  const [unitType, setUnitType] = useState<UnitType>('USDT');
  // 是否启用止盈止损
  const [enableTakeProfitAndStopLoss, setEnableTakeProfitAndStopLoss] = useState<boolean>(false);
  // 止盈止损价格
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');

  // 模拟数据 - 可用余额
  const availableBalance = '10,000.00';
  
  // 获取交易对中的币种名称（如BTCUSDT中的BTC）
  const tokenName = symbol.replace('USDT', '');

  // 处理开仓操作
  const handlePlaceOrder = (side: TradeSide) => {
    alert(`${side === 'long' ? '开多' : '开空'} ${amount} ${unitType === 'USDT' ? 'USDT' : tokenName}，价格：${price || '市价'}`);
  };

  // 渲染杠杆调整弹窗
  const renderLeverageModal = () => {
    if (!showLeverageModal) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowLeverageModal(false)}></div>
        <div className="bg-gray-800 p-6 rounded-lg w-96 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">调整杠杆</h3>
            <button onClick={() => setShowLeverageModal(false)} className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">{leverage}x</span>
              <span className="text-gray-400">最大可用: 125x</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="125" 
              value={leverage} 
              onChange={e => setLeverage(Number(e.target.value))}
              className="w-full"
            />
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[5, 10, 20, 50, 75].map(value => (
                <button 
                  key={value}
                  onClick={() => setLeverage(value)}
                  className={`px-2 py-1 rounded ${
                    leverage === value ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {value}x
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowLeverageModal(false)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            确认
          </button>
        </div>
      </div>
    );
  };

  // 渲染保证金模式弹窗
  const renderMarginModeModal = () => {
    if (!showMarginModeModal) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMarginModeModal(false)}></div>
        <div className="bg-gray-800 p-6 rounded-lg w-96 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">切换保证金模式</h3>
            <button onClick={() => setShowMarginModeModal(false)} className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3 mb-4">
            <button 
              onClick={() => setMarginMode('cross')}
              className={`w-full flex items-center p-3 rounded ${
                marginMode === 'cross' ? 'bg-gray-700 border border-blue-500' : 'bg-gray-700'
              }`}
            >
              <div className="mr-3">
                {marginMode === 'cross' && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">全仓模式</div>
                <div className="text-gray-400 text-sm">所有全仓仓位共享账户中全部可用余额</div>
              </div>
            </button>
            
            <button 
              onClick={() => setMarginMode('isolated')}
              className={`w-full flex items-center p-3 rounded ${
                marginMode === 'isolated' ? 'bg-gray-700 border border-blue-500' : 'bg-gray-700'
              }`}
            >
              <div className="mr-3">
                {marginMode === 'isolated' && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">逐仓模式</div>
                <div className="text-gray-400 text-sm">需为各个逐仓仓位分配特定数量的保证金</div>
              </div>
            </button>
          </div>
          <button 
            onClick={() => setShowMarginModeModal(false)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            确认
          </button>
        </div>
      </div>
    );
  };

  return (
    <Card >
      <CardContent className="p-4">
        {/* 头部保证金模式和杠杆设置 */}
        <div className='flex items-center gap-4 mb-4'>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMarginModeModal(true)}
          >
            {marginMode === 'cross' ? '全仓' : '逐仓'}
          </Button>
          <Button 
            size="sm"
            variant="outline"
            onClick={() => setShowLeverageModal(true)}
          >
            {leverage}x
          </Button>
        </div>

        {/* 限价/市价切换 */}
        <Tabs defaultValue="limit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="limit" onClick={() => setOrderType('LIMIT')}>限价</TabsTrigger>
            <TabsTrigger value="market" onClick={() => setOrderType('MARKET')}>市价</TabsTrigger>
          </TabsList>

        {/* 可用余额 */}
        <div className="flex items-center mb-4 text-sm">
          <span className="text-muted-foreground mr-2">可用:</span>
          <span className="text-muted-foreground">{availableBalance} USDT</span>
        </div>
        </Tabs>

        {/* 价格输入 - 仅限价单显示 */}
        {orderType === 'LIMIT' && (
          <div className="flex items-center space-x-2 mb-4">
            <Input
              id="market-price"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
            />
            <span className='text-sm'>USDT</span>
          </div>
        )}

        {/* 数量输入 */}
        <div className="flex items-center space-x-2 mb-4">
          <Input
            id="market-amount"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
          />
          <Select
            value={unitType} 
            onValueChange={() => setUnitType(unitType === 'USDT' ? 'TOKEN' : 'USDT')}
          >
            <SelectTrigger className="w-full max-w-[60px] border-none px-0 focus:ring-0">
              <SelectValue>
                <span className='text-sm'>{unitType === 'USDT' ? 'USDT' : tokenName}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDT">USDT</SelectItem>
              <SelectItem value="TOKEN">{tokenName}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 止盈止损 */}
        <div className="mb-4 space-y-3">
          <div className='flex items-center'>
            <Checkbox
              id="enableTakeProfitAndStopLoss"
              checked={enableTakeProfitAndStopLoss}
              onCheckedChange={() => setEnableTakeProfitAndStopLoss((prev) => !prev)}
            />
            <Label htmlFor="enableTakeProfitAndStopLoss">
              <span className='text-xs ml-2 cursor-pointer'>止盈/止损</span>
            </Label>
          </div>
          {
            enableTakeProfitAndStopLoss && (
              <div className='flex items-center gap-2'>
                <Input
                  placeholder="止盈价格"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                />
                <Input
                  placeholder="止损价格"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                />
              </div>
            )
          }
        </div>

        {/* 交易按钮 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            className='bg-green-500 text-white hover:bg-green-600 hover:text-white border-none'
            variant="outline"
            onClick={() => handlePlaceOrder('long')}
          >
            买入/做多
          </Button>
          <Button 
            className='bg-red-500 text-white hover:bg-red-600 hover:text-white border-none'
            variant="outline"
            onClick={() => handlePlaceOrder('short')}
          >
            卖出/做空
          </Button>
        </div>

        {/* 价格信息显示 */}
        <div className="">
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="space-y-2">
              <div className='flex items-center gap-2'>
                <span>保证金</span>
                <span>0.00 USDT</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>可开</span>
                <span>58,428.50 USDT</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className='flex items-center gap-2'>
                <span>保证金</span>
                <span>0.00 USDT</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>可开</span>
                <span>58,428.50 USDT</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* 模态框 */}
      {renderLeverageModal()}
      {renderMarginModeModal()}
    </Card>
  );
} 