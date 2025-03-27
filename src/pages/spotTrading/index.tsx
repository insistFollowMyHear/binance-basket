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
import { MarketPair, OrderHistoryItem, OrderType, OrderSide, OrderStatus, UserAccount } from './types';

export function SpotTrade() {
  const loadedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPair, setSelectedPair] = useState<MarketPair>({
    symbol: 'BTCUSDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    lastPrice: '0.00',
    priceChangePercent: '0.00',
    minQuantity: '0',
    minNotional: '0'
  });
  const [userAccount, setUserAccount] = useState<UserAccount>({
    baseAsset: 0,
    quoteAsset: 0
  })

  const [searchQuery, setSearchQuery] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderHistoryItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [isOrderQueryActive, setIsOrderQueryActive] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'open' | 'history'>('open');

  const [marketPairs, setMarketPairs] = useState<MarketPair[]>([]);
  const [filteredPairs, setFilteredPairs] = useState<MarketPair[]>([]);

  const { currentUser } = useSelector((state: RootState) => state.auth)

  // 加载数据
  useEffect(() => {
    if (!currentUser?.id) return
    if (loadedRef.current) return
    loadedRef.current = true
    getSymbols()
    getUserAccount()
  }, [currentUser?.id]);

  // 获取用户资产
  const getUserAccount = async () => {
    const res = await spotTrading.getUserAccount(currentUser?.id)
    let _baseAsset = 0
    let _quoteAsset = 0
    res.data?.balances.forEach((item: any) => {
      if (item.asset === selectedPair.baseAsset) {
        _baseAsset = item.free
      }
      if (item.asset === selectedPair.quoteAsset) {
        _quoteAsset = item.free
      }
    })
    setUserAccount({
      baseAsset: _baseAsset,
      quoteAsset: _quoteAsset
    })
  }

  // 获取交易对
  const getSymbols = async () => {
    const res = await spotTrading.getSymbols(currentUser?.id)
    // 过滤掉已暂停的交易对
    const activeSymbols = res.data.filter((symbol: any) => 
      symbol.status === 'TRADING' && 
      !symbol.isSpotTradingAllowed === false
    );
    
    // 转换为 MarketPair 格式并保存最小交易数量信息
    const formattedPairs = activeSymbols.map((symbol: any): MarketPair => ({
      symbol: symbol.symbol,
      baseAsset: symbol.baseAsset,
      quoteAsset: symbol.quoteAsset,
      lastPrice: '0.00',
      priceChangePercent: '0.00',
      minQuantity: symbol.filters.find((f: any) => f.filterType === 'LOT_SIZE')?.minQty || '0',
      minNotional: symbol.filters.find((f: any) => f.filterType === 'MIN_NOTIONAL')?.minNotional || '0'
    }));

    setMarketPairs(formattedPairs);
    setFilteredPairs(formattedPairs);

    // 如果当前选中的交易对在数据中，更新其信息
    const currentPair = formattedPairs.find((pair: MarketPair) => pair.symbol === selectedPair.symbol);
    if (currentPair) {
      setSelectedPair(currentPair);
    }
  }

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
    symbol: string;
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

  // 处理交易对搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFilteredPairs(marketPairs);
      return;
    }
    
    const filtered = marketPairs.filter((pair: MarketPair) => 
      pair.symbol.toLowerCase().includes(value.toLowerCase()) ||
      pair.baseAsset.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPairs(filtered);
  };

  // 处理交易对选择
  const handlePairSelect = (symbol: string) => {
    const selected = marketPairs.find((pair: MarketPair) => pair.symbol === symbol);
    if (selected) {
      setSelectedPair(selected);
    }
  };

  //#region -- 字段翻译
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
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full min-w-[300px]">
            <div className="flex flex-col space-y-2">
              <Select value={selectedPair.symbol} onValueChange={handlePairSelect}>
                <SelectTrigger className="w-full max-w-[300px]">
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
              <div className="flex text-sm text-muted-foreground">
                <div className="mr-10">最小交易数量: {selectedPair.minQuantity} {selectedPair.baseAsset}</div>
                <div>最小交易额: {selectedPair.minNotional} {selectedPair.quoteAsset}</div>
              </div>
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
          userAccount={userAccount}
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
        currentUser={currentUser}
        selectedPair={selectedPair}
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