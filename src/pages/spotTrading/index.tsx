import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, ChevronDown, RefreshCw, Search, X, Trash2, RotateCcw } from "lucide-react";
import { Loading } from '@/components/ui/loading';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { spotTrading } from '@/services';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store'

type OrderType = 'LIMIT' | 'MARKET';
type OrderSide = 'BUY' | 'SELL';
type OrderStatus = 'FILLED' | 'CANCELED' | 'NEW';

interface OrderHistoryItem {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  quantity: string;
  status: OrderStatus;
  time: string;
}

interface MarketPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: string;
  priceChangePercent: string;
}

export function SpotTrade() {
  const loadedRef = useRef(false)
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [selectedPair, setSelectedPair] = useState<MarketPair>({
    symbol: 'BTCUSDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    lastPrice: '64235.50',
    priceChangePercent: '2.35'
  });
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<OrderHistoryItem[]>([]);
  const [isOrderQueryActive, setIsOrderQueryActive] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'open' | 'history'>('all');

  const { user: { id: userId } } = useSelector((state: RootState) => state.auth)

  // 模拟获取订单历史
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const orders: OrderHistoryItem[] = [
        {
          id: '123456789',
          symbol: 'BTCUSDT',
          side: 'BUY',
          type: 'LIMIT',
          price: '64100.50',
          quantity: '0.01',
          status: 'FILLED',
          time: new Date().toISOString()
        },
        {
          id: '123456788',
          symbol: 'BTCUSDT',
          side: 'SELL',
          type: 'MARKET',
          price: '64235.50',
          quantity: '0.005',
          status: 'FILLED',
          time: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '123456787',
          symbol: 'ETHUSDT',
          side: 'BUY',
          type: 'LIMIT',
          price: '3410.25',
          quantity: '0.15',
          status: 'CANCELED',
          time: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '123456786',
          symbol: 'ETHUSDT',
          side: 'SELL',
          type: 'LIMIT',
          price: '3450.80',
          quantity: '0.25',
          status: 'NEW',
          time: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '123456785',
          symbol: 'BNBUSDT',
          side: 'BUY',
          type: 'MARKET',
          price: '570.20',
          quantity: '1.5',
          status: 'FILLED',
          time: new Date(Date.now() - 14400000).toISOString()
        }
      ];
      setOrderHistory(orders);
      setFilteredOrders(orders);
      setIsLoading(false);
    }, 1000);

    if (loadedRef.current) return
    loadedRef.current = true

    // 获取市场最近50条交易
    async function fetchTrades() {
      try {
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }
    fetchTrades()
  }, []);

  // 获取市场最近50条交易


  // 计算总额
  useEffect(() => {
    if (price && amount && orderType === 'LIMIT') {
      setTotal((parseFloat(price) * parseFloat(amount)).toFixed(2));
    }
  }, [price, amount, orderType]);

  // 处理订单查询
  const handleOrderQuery = () => {
    setIsLoading(true);
    setIsOrderQueryActive(!!searchQuery);
    
    setTimeout(() => {
      if (!searchQuery) {
        setFilteredOrders(orderHistory);
      } else {
        const filtered = orderHistory.filter(order => 
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
          order.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredOrders(filtered);
      }
      setIsLoading(false);
    }, 300);
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredOrders(orderHistory);
    setIsOrderQueryActive(false);
  };

  // 撤销单个订单
  const handleCancelOrder = (order: OrderHistoryItem) => {
    setSelectedOrder(order);
    setShowCancelDialog(true);
  };

  // 确认撤销订单
  const confirmCancelOrder = () => {
    if (!selectedOrder) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const updatedOrders = orderHistory.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'CANCELED' as OrderStatus }
          : order
      );
      setOrderHistory(updatedOrders);
      setFilteredOrders(updatedOrders);
      setShowCancelDialog(false);
      setSelectedOrder(null);
      setIsLoading(false);
    }, 500);
  };

  // 撤销当前交易对的所有挂单
  const handleCancelAllOrders = () => {
    setShowCancelAllDialog(true);
  };

  // 确认撤销所有挂单
  const confirmCancelAllOrders = () => {
    setIsLoading(true);
    setTimeout(() => {
      const updatedOrders = orderHistory.map(order => 
        order.symbol === selectedPair.symbol && order.status === 'NEW'
          ? { ...order, status: 'CANCELED' as OrderStatus }
          : order
      );
      setOrderHistory(updatedOrders);
      setFilteredOrders(updatedOrders);
      setShowCancelAllDialog(false);
      setIsLoading(false);
    }, 500);
  };

  // 撤销挂单并重新下单
  const handleCancelAndReplace = (order: OrderHistoryItem) => {
    setSelectedOrder(order);
    setShowCancelDialog(true);
    // 设置新的价格和数量
    setPrice(order.price);
    setAmount(order.quantity);
    setOrderSide(order.side);
    setOrderType(order.type);
  };

  // 切换视图模式
  const handleViewModeChange = (mode: 'all' | 'open' | 'history') => {
    setViewMode(mode);
    setIsLoading(true);
    setTimeout(() => {
      let filtered = orderHistory;
      switch (mode) {
        case 'open':
          filtered = orderHistory.filter(order => order.status === 'NEW');
          break;
        case 'history':
          filtered = orderHistory.filter(order => order.status !== 'NEW');
          break;
      }
      setFilteredOrders(filtered);
      setIsLoading(false);
    }, 300);
  };

  const handlePlaceOrder = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newOrder: OrderHistoryItem = {
        id: Math.random().toString(36).substring(2, 11),
        symbol: selectedPair.symbol,
        side: orderSide,
        type: orderType,
        price: orderType === 'LIMIT' ? price : selectedPair.lastPrice,
        quantity: amount,
        status: 'NEW',
        time: new Date().toISOString()
      };
      
      const updatedOrders = [newOrder, ...orderHistory];
      setOrderHistory(updatedOrders);
      setFilteredOrders(updatedOrders);
      setAmount('');
      setPrice('');
      setTotal('');
      setIsLoading(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // 翻译订单状态
  const translateStatus = (status: OrderStatus) => {
    switch(status) {
      case 'FILLED': return '已成交';
      case 'CANCELED': return '已取消';
      case 'NEW': return '未成交';
      default: return status;
    }
  };

  // 翻译订单类型
  const translateOrderType = (type: OrderType) => {
    return type === 'LIMIT' ? '限价单' : '市价单';
  };

  // 翻译订单方向
  const translateOrderSide = (side: OrderSide) => {
    return side === 'BUY' ? '买入' : '卖出';
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* 交易对选择器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="font-bold text-lg">{selectedPair.symbol}</div>
          <Button variant="ghost" size="sm" className="h-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium">{selectedPair.lastPrice}</div>
          <div className={`text-sm ${parseFloat(selectedPair.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {parseFloat(selectedPair.priceChangePercent) >= 0 ? '+' : ''}{selectedPair.priceChangePercent}%
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={handleCancelAllOrders}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            撤销所有挂单
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 交易模块 */}
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
                        onChange={(e) => setPrice(e.target.value)}
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">数量 ({selectedPair.baseAsset})</Label>
                      <Input
                        id="amount"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        step="0.0001"
                        min="0"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <Button 
                          key={percent} 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setAmount((0.01 * percent / 100).toFixed(4));
                          }}
                        >
                          {percent}%
                        </Button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="total">总额 ({selectedPair.quoteAsset})</Label>
                      <Input
                        id="total"
                        placeholder="0.00"
                        value={total}
                        onChange={(e) => {
                          setTotal(e.target.value);
                          if (price && parseFloat(price) > 0) {
                            setAmount((parseFloat(e.target.value) / parseFloat(price)).toFixed(4));
                          }
                        }}
                        type="number"
                        step="0.01"
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
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        step="0.0001"
                        min="0"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <Button 
                          key={percent} 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setAmount((0.01 * percent / 100).toFixed(4));
                          }}
                        >
                          {percent}%
                        </Button>
                      ))}
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
                    onClick={handlePlaceOrder}
                    variant={orderSide === 'BUY' ? 'default' : 'destructive'}
                  >
                    {isLoading ? <Loading size="sm" /> : (
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

        {/* 订单簿/交易图表占位符 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>市场数据</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <ArrowUpDown className="mx-auto h-12 w-12 mb-4" />
              <p>这里将显示交易图表</p>
              <p className="text-sm">价格走势、订单簿和深度图</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 订单历史表格 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <CardTitle>订单历史</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('all')}
                >
                  全部
                </Button>
                <Button
                  variant={viewMode === 'open' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('open')}
                >
                  当前挂单
                </Button>
                <Button
                  variant={viewMode === 'history' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('history')}
                >
                  历史订单
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  className="pl-8 h-8 w-[200px] md:w-[300px]"
                  placeholder="输入交易对或订单ID搜索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOrderQuery()}
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button variant="outline" size="sm" className="h-8" onClick={handleOrderQuery}>
                查询
              </Button>
            </div>
          </div>
          {isOrderQueryActive && (
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <span>
                搜索结果: {filteredOrders.length} 条订单
                {searchQuery && <span className="ml-1">（关键词: "{searchQuery}"）</span>}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 ml-2 text-xs"
                onClick={clearSearch}
              >
                清除筛选
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">时间</th>
                    <th className="text-left py-3 px-4">交易对</th>
                    <th className="text-left py-3 px-4">类型</th>
                    <th className="text-left py-3 px-4">方向</th>
                    <th className="text-right py-3 px-4">价格</th>
                    <th className="text-right py-3 px-4">数量</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-right py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{formatDate(order.time)}</td>
                        <td className="py-3 px-4">{order.symbol}</td>
                        <td className="py-3 px-4">{translateOrderType(order.type)}</td>
                        <td className={`py-3 px-4 ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                          {translateOrderSide(order.side)}
                        </td>
                        <td className="py-3 px-4 text-right">{order.price}</td>
                        <td className="py-3 px-4 text-right">{order.quantity}</td>
                        <td className={`py-3 px-4 ${
                          order.status === 'FILLED' ? 'text-green-500' : 
                          order.status === 'CANCELED' ? 'text-muted-foreground' : 'text-blue-500'
                        }`}>
                          {translateStatus(order.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {order.status === 'NEW' && (
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-red-500 hover:text-red-600"
                                onClick={() => handleCancelOrder(order)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-blue-500 hover:text-blue-600"
                                onClick={() => handleCancelAndReplace(order)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        {isOrderQueryActive ? '未找到匹配的订单记录' : '暂无订单记录'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 撤销订单确认对话框 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认撤销订单</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要撤销该订单吗？此操作不可撤销。
              {selectedOrder && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>订单ID: {selectedOrder.id}</p>
                  <p>交易对: {selectedOrder.symbol}</p>
                  <p>类型: {translateOrderType(selectedOrder.type)}</p>
                  <p>方向: {translateOrderSide(selectedOrder.side)}</p>
                  <p>价格: {selectedOrder.price}</p>
                  <p>数量: {selectedOrder.quantity}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelOrder} className="bg-red-600 hover:bg-red-700">
              确认撤销
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 撤销所有挂单确认对话框 */}
      <AlertDialog open={showCancelAllDialog} onOpenChange={setShowCancelAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认撤销所有挂单</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要撤销 {selectedPair.symbol} 的所有未成交订单吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelAllOrders} className="bg-red-600 hover:bg-red-700">
              确认撤销所有
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}