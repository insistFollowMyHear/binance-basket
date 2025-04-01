import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from '@/components/ui/loading';
import { spotTrading } from '@/services/spotTrading';
import {
  OrderType,
  OrderSide,
  TradingFormProps,
} from '../types';

const TradingForm: React.FC<TradingFormProps> = ({
  currentUser,
  selectedPair,
  streamsInfo,
  onRefreshData
}) => {
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // 验证订单
  const validateOrder = () => {
    if (!amount) {
      throw new Error('请输入数量');
    }

    if (orderType === 'LIMIT' && !price) {
      throw new Error('限价单请输入价格');
    }

    // 验证最小交易数量
    const minQty = parseFloat(selectedPair.limitOrder?.minQty || '0');
    if (orderType === 'LIMIT' || (orderType === 'MARKET' && orderSide === 'SELL')) {
      if (parseFloat(amount) < minQty) {
        throw new Error(`最小交易数量为 ${minQty} ${selectedPair.baseAsset}`);
      }
    }

    // 验证最小名义价值
    const minNotional = parseFloat(selectedPair.marketOrder?.minNotional || '0');
    if (orderType === 'MARKET' && orderSide === 'BUY') {
      if (parseFloat(amount) < minNotional) {
        throw new Error(`最小交易金额为 ${minNotional} ${selectedPair.quoteAsset}`);
      }
    }

    // 验证价格偏差（仅限价单需要验证）
    if (orderType === 'LIMIT' && selectedPair.priceFilter) {
      const currentPrice = parseFloat(streamsInfo?.w);
      const orderPrice = parseFloat(price);
      
      if (currentPrice <= 0) {
        throw new Error('无法获取当前市场价格，请稍后重试');
      }

      if (orderSide === 'BUY') {
        const maxPrice = currentPrice * parseFloat(selectedPair.priceFilter.maxPricePercent);
        const minPrice = currentPrice * parseFloat(selectedPair.priceFilter.minPricePercent);

        if (orderPrice > maxPrice) {
          throw new Error(`买入价格不能高于当前价格的 ${(parseFloat(selectedPair.priceFilter.maxPricePercent) * 100 - 100).toFixed(2)}%`);
        }
        if (orderPrice < minPrice) {
          throw new Error(`买入价格不能低于当前价格的 ${(100 - parseFloat(selectedPair.priceFilter.minPricePercent) * 100).toFixed(2)}%`);
        }
      } else {
        const maxPrice = currentPrice * parseFloat(selectedPair.priceFilter.maxPricePercent);
        const minPrice = currentPrice * parseFloat(selectedPair.priceFilter.minPricePercent);
        
        if (orderPrice > maxPrice) {
          throw new Error(`卖出价格不能高于当前价格的 ${(parseFloat(selectedPair.priceFilter.maxPricePercent) * 100 - 100).toFixed(2)}%`);
        }
        if (orderPrice < minPrice) {
          throw new Error(`卖出价格不能低于当前价格的 ${(100 - parseFloat(selectedPair.priceFilter.minPricePercent) * 100).toFixed(2)}%`);
        }
      }

      if (parseFloat(total) < parseFloat(selectedPair.marketOrder?.minNotional || '0')) {
        throw new Error(`最小交易金额为 ${selectedPair.marketOrder?.minNotional} ${selectedPair.quoteAsset}`);
      }
  
      if (parseFloat(total) > parseFloat(selectedPair.marketOrder?.maxNotional || '0')) {
        throw new Error(`最大交易金额为 ${selectedPair.marketOrder?.maxNotional} ${selectedPair.quoteAsset}`);
      }
    }
  };

  // 处理测试订单提交
  const handleTestSubmit = async () => {
    try {
      setIsTestLoading(true);
      validateOrder();

      await spotTrading.createTestOrder(
        currentUser?.id,
        selectedPair.symbol,
        orderSide,
        orderType,
        amount,
        orderType === 'LIMIT' ? price : undefined
      );

      // 测试订单成功
      alert('测试订单验证通过！');
    } catch (error: any) {
      console.error('Test order failed:', error);
      alert(error.message || '测试订单失败');
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      validateOrder();

      await spotTrading.createOrder(
        currentUser?.id,
        selectedPair.symbol,
        orderSide,
        orderType,
        amount,
        orderType === 'LIMIT' ? price : undefined
      );

      // 清空表单
      setAmount('');
      setPrice('');
      setTotal('');

      // 刷新数据
      await onRefreshData();

      // 下单成功提示
      alert('下单成功！');
    } catch (error: any) {
      console.error('Place order failed:', error);
      alert(error.message || '下单失败');
    } finally {
      setIsLoading(false);
    }
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
                  {selectedPair.priceFilter && selectedPair.lastPrice !== '0.00' && (
                    <div className="text-xs text-muted-foreground">
                      当前价格: {selectedPair.lastPrice} {selectedPair.quoteAsset}
                      <br />
                      价格范围: {(parseFloat(selectedPair.lastPrice) * parseFloat(selectedPair.priceFilter.minPricePercent)).toFixed(selectedPair.quoteAssetPrecision)} ~ {(parseFloat(selectedPair.lastPrice) * parseFloat(selectedPair.priceFilter.maxPricePercent)).toFixed(selectedPair.quoteAssetPrecision)} {selectedPair.quoteAsset}
                    </div>
                  )}
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
                    disabled
                    type="number"
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
                    step={orderSide === 'BUY' 
                      ? 1 / Math.pow(10, selectedPair.quoteAssetPrecision || 8)
                      : selectedPair.limitOrder?.stepSize}
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

            <div className="mt-6 space-y-2">
              <Button 
                className="w-full" 
                variant="outline"
                disabled={isTestLoading || !amount || (orderType === 'LIMIT' && !price)}
                onClick={handleTestSubmit}
              >
                {isTestLoading ? <Loading size="sm" text="测试中..." /> : '测试下单'}
              </Button>

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