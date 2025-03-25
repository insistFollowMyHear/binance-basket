import { useState, useEffect, useRef } from 'react';

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, Trash2 } from "lucide-react";

import { spotTrading } from '@/services';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store'
import MarketPairsList from '@/components/market-pairs-list';
import OrderHistory from './components/order-history';
import MarketData from './components/market-data';
import TradingForm from './components/trading-form';

type OrderType = 'LIMIT' | 'MARKET';
type OrderSide = 'BUY' | 'SELL';
type OrderStatus = 'FILLED' | 'CANCELED' | 'NEW';

interface MarketPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: string;
  priceChangePercent: string;
}

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

export function SpotTrade() {
  const loadedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPair, setSelectedPair] = useState<MarketPair>({
    symbol: 'BTCUSDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    lastPrice: '0.00',
    priceChangePercent: '0.00'
  });
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<OrderHistoryItem[]>([]);
  const [isOrderQueryActive, setIsOrderQueryActive] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [viewMode, setViewMode] = useState<'open' | 'history'>('open');

  const [marketPairs, setMarketPairs] = useState<MarketPair[]>([]);
  const [filteredPairs, setFilteredPairs] = useState<MarketPair[]>([]);

  const { currentUser } = useSelector((state: RootState) => state.auth)

  // 模拟获取订单历史
  useEffect(() => {
    // 获取交易对
    if (currentUser?.id) {
      spotTrading.getSymbols(currentUser.id).then(res => {
        setMarketPairs(res.data);
        setFilteredPairs(res.data);
      });
    }
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
  }, []);

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
  };

  // 切换视图模式
  const handleViewModeChange = (mode: 'open' | 'history') => {
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

  // 下单
  const handlePlaceOrder = (orderData: {
    type: OrderType;
    side: OrderSide;
    price?: string;
    amount: string;
  }) => {
    setIsLoading(true);
    setTimeout(() => {
      const newOrder: OrderHistoryItem = {
        id: Math.random().toString(36).substring(2, 11),
        symbol: selectedPair.symbol,
        side: orderData.side,
        type: orderData.type,
        price: orderData.type === 'LIMIT' ? orderData.price! : selectedPair.lastPrice,
        quantity: orderData.amount,
        status: 'NEW',
        time: new Date().toISOString()
      };
      
      const updatedOrders = [newOrder, ...orderHistory];
      setOrderHistory(updatedOrders);
      setFilteredOrders(updatedOrders);
      setIsLoading(false);
    }, 1000);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFilteredPairs(marketPairs);
      return;
    }
    
    const filtered = marketPairs.filter(pair => 
      pair.symbol.toLowerCase().includes(value.toLowerCase()) ||
      pair.baseAsset.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPairs(filtered);
  };

  // 处理交易对选择
  const handlePairSelect = (symbol: string) => {
    const selected = marketPairs.find(pair => pair.symbol === symbol);
    if (selected) {
      setSelectedPair(selected);
    }
  };

  //#region -- 字段翻译
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
  //#endregion

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* 交易对选择器 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative min-w-[300px]">
            <div className="flex items-center space-x-2">
              <Select value={selectedPair.symbol} onValueChange={handlePairSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{selectedPair.baseAsset}</span>
                      <span className="text-muted-foreground">/</span>
                      <span>{selectedPair.quoteAsset}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <MarketPairsList
                    pairs={filteredPairs}
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    onSelect={handlePairSelect}
                  />
                </SelectContent>
              </Select>
            </div>
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
        <TradingForm
          selectedPair={selectedPair}
          isLoading={isLoading}
          onPlaceOrder={handlePlaceOrder}
        />

        {/* 市场数据 */}
        <MarketData />
      </div>

      {/* 订单历史 */}
      <OrderHistory
        isLoading={isLoading}
        viewMode={viewMode}
        searchQuery={searchQuery}
        filteredOrders={filteredOrders}
        isOrderQueryActive={isOrderQueryActive}
        onViewModeChange={handleViewModeChange}
        onSearchChange={setSearchQuery}
        onSearch={handleOrderQuery}
        onClearSearch={clearSearch}
        onCancelOrder={handleCancelOrder}
        onCancelAndReplace={handleCancelAndReplace}
      />

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