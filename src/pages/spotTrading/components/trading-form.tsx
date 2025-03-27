import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from '@/components/ui/loading';
import {
  OrderType,
  OrderSide,
  TradingFormProps,
} from '../types';

const TradingForm: React.FC<TradingFormProps> = ({
  selectedPair,
  isLoading,
  onPlaceOrder,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');

  // 计算总额
  useEffect(() => {
    if (price && amount && orderType === 'LIMIT') {
      setTotal((parseFloat(price) * parseFloat(amount)).toFixed(selectedPair.quoteAssetPrecision || 8));
    }
  }, [price, amount]);

  // 获取 step 的小数位数
  const getDecimalPlaces = (step: string): number => {
    const parts = step.split('.');
    if (parts.length < 2) return 0;
    return parts[1].length;
  };

  // 处理数量输入
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setAmount('');
      return;
    }

    // 获取 step 的小数位数
    const stepSize = Number(selectedPair.limitOrder?.stepSize).toString() || '0.00000001';
    const maxDecimals = getDecimalPlaces(stepSize);

    // 处理小数点后的位数
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > maxDecimals) {
      // 如果小数部分超过允许的位数，截取到允许的位数
      const truncated = parseFloat(value).toFixed(maxDecimals);
      setAmount(truncated);
    } else {
      setAmount(value);
    }
  };

  // 处理价格输入
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setPrice('');
      return;
    }

    // 使用报价资产精度
    const maxDecimals = selectedPair.quoteAssetPrecision || 8;

    // 处理小数点后的位数
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > maxDecimals) {
      // 如果小数部分超过允许的位数，截取到允许的位数
      const truncated = parseFloat(value).toFixed(maxDecimals);
      setPrice(truncated);
    } else {
      setPrice(value);
    }
  };

  const handleSubmit = () => {
    console.log(selectedPair)
    onPlaceOrder({
      symbol: selectedPair.symbol,
      type: orderType,
      side: orderSide,
      price: orderType === 'LIMIT' ? price : undefined,
      amount,
    });
    
    // 清空表单
    setAmount('');
    setPrice('');
    setTotal('');
  };

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle>现货交易</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="limit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="limit" onClick={() => setOrderType('LIMIT')}>限价单</TabsTrigger>
            <TabsTrigger value="market" onClick={() => setOrderType('MARKET')}>市价单</TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button 
                variant={orderSide === 'BUY' ? 'default' : 'outline'} 
                className={orderSide === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={() => setOrderSide('BUY')}
              >
                买入 {selectedPair.baseAsset}
              </Button>
              <Button 
                variant={orderSide === 'SELL' ? 'default' : 'outline'} 
                className={orderSide === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''}
                onClick={() => setOrderSide('SELL')}
              >
                卖出 {selectedPair.baseAsset}
              </Button>
            </div>

            <TabsContent value="limit">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">价格 ({selectedPair.quoteAsset})</Label>
                  <Input
                    id="price"
                    placeholder="0.00"
                    value={price}
                    onChange={handlePriceChange}
                    type="number"
                    step={1 / Math.pow(10, selectedPair.quoteAssetPrecision || 8)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">数量 ({selectedPair.baseAsset})</Label>
                  <Input
                    id="amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                    type="number"
                    step={selectedPair.limitOrder?.stepSize}
                    min={selectedPair.limitOrder?.minQty}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="total">总额 ({selectedPair.quoteAsset})</Label>
                  <Input
                    id="total"
                    placeholder="0.00"
                    value={total}
                    onChange={(e) => setTotal(e.target.value)}
                    type="number"
                    step={1 / Math.pow(10, selectedPair.quoteAssetPrecision || 8)} 
                    min="0"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="market">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="market-amount">
                    {orderSide === 'BUY' 
                      ? `金额 (${selectedPair.quoteAsset})` 
                      : `数量 (${selectedPair.baseAsset})`}
                  </Label>
                  <Input
                    id="market-amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                    type="number"
                    step={selectedPair.limitOrder?.stepSize}
                    min={orderSide === 'BUY' 
                      ? selectedPair.marketOrder?.minNotional
                      : selectedPair.limitOrder?.minQty}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  市价单将以当前最优市场价格执行。
                </div>
              </div>
            </TabsContent>

            <div className="mt-6">
              <Button 
                className="w-full" 
                disabled={isLoading || !amount || (orderType === 'LIMIT' && !price)}
                onClick={handleSubmit}
                variant={orderSide === 'BUY' ? 'default' : 'destructive'}
              >
                {isLoading ? <Loading size="sm" text="提交中..." /> : (
                  orderSide === 'BUY' 
                    ? `买入 ${selectedPair.baseAsset}` 
                    : `卖出 ${selectedPair.baseAsset}`
                )}
              </Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default React.memo(TradingForm); 