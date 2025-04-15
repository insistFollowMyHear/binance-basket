import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
    return (
      <Dialog open={showLeverageModal} onOpenChange={setShowLeverageModal}>
        <DialogTrigger asChild>
          <Button 
            size="sm"
            variant="outline"
          >
            {leverage}x
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整杠杆</DialogTitle>
          </DialogHeader>
          <Label>杠杆</Label>
          <Input
            type="number"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
          />
          <div className="grid grid-cols-5 gap-2 mt-2">
            {[25, 50, 75, 100, 125].map(value => (
              <Button
                key={value}
                size="sm"
                onClick={() => setLeverage(value)}
                variant={leverage === value ? 'default' : 'outline'}
              >
                  {value}x
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button
              className='w-full'
              variant="default"
              onClick={() => setShowLeverageModal(false)}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // 渲染保证金模式弹窗
  const renderMarginModeModal = () => {
    return (
      <Dialog open={showMarginModeModal} onOpenChange={setShowMarginModeModal}>
        <DialogTrigger asChild>
        <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMarginModeModal(true)}
          >
            {marginMode === 'cross' ? '全仓' : '逐仓'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>保证金模式</DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              variant={marginMode === 'cross' ? 'default' : 'outline'}
              onClick={() => setMarginMode('cross')}
            >
              全仓
            </Button>
            <Button
              variant={marginMode === 'isolated' ? 'default' : 'outline'}
              onClick={() => setMarginMode('isolated')}
            >
              逐仓
            </Button>
          </div>
          <div className='text-xs text-muted-foreground mt-2'>
            <ul className='list-disc list-inside'>
              <li className='mb-2 leading-5'>调整保证金模式仅对当前合约生效。</li>
              <li className='mb-2 leading-5'>全仓保证金模式: 保证金资产相同的全仓仓位共享该资产的全仓保证金。在强平事件中，交易者可能会损失全部该保证金和该保证金资产下的所有全仓仓位。</li>
              <li className='mb-2 leading-5'>逐仓保证金模式: 一定数量保证金被分配到仓位上。如果仓位保证金亏损到低于维持保证金的水平，仓位将被强平。在逐仓模式下，您可以为这个仓位添加和减少保证金。</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              className='w-full'
              variant="default"
              onClick={() => setShowMarginModeModal(false)}
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  };

  return (
    <Card >
      <CardContent className="p-4">
        {/* 头部保证金模式和杠杆设置 */}
        <div className='flex items-center gap-4 mb-4'>
          {renderMarginModeModal()}
          {renderLeverageModal()}
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
    </Card>
  );
} 