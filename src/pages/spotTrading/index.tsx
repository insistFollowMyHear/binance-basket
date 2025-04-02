import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Loading } from '@/components/ui/loading'
import MarketPairsList from '@/components/market-pairs-list';

import MarketData from './components/market-data';
import TradingForm from './components/trading-form';
import OrderHistory from './components/order-history';

import { MarketPair } from './types';

import {
  useMarketSubscription,
  useMarketPairs,
  useSelectedPair,
  useUserAccount
} from './hooks';

import { NoData } from '@/components/NoData';

export function SpotTrade() {
  const loadedRef = useRef(false);

  // const [isRefreshing, setIsRefreshing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useSelector((state: RootState) => state.auth);

  // 使用 hooks
  const {
    selectedPair,
    avgPrice,
    isLoading: isPriceLoading,
    handlePairSelect: onPairSelect,
    getAvgPrice
  } = useSelectedPair(currentUser?.id);

  const {
    marketPairs,
    filteredPairs,
    isLoading: isPairsLoading,
    getSymbols,
    handleSearch
  } = useMarketPairs(currentUser?.id);

  const {
    userAccount,
    isLoading: isAccountLoading,
    getUserAccount
  } = useUserAccount(currentUser?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [streamsInfo, setStreamsInfo] = useState<any>({});

  // 订阅市场数据
  useMarketSubscription(
    selectedPair.symbol,
    !!currentUser?.id,
    (info) => setStreamsInfo(info)
  );

  // 初始化数据
  useEffect(() => {
    if (!currentUser?.id || loadedRef.current) return;
    loadedRef.current = true;

    const initData = async () => {
      const pairs = await getSymbols();
      if (pairs?.length) {
        const currentPair = pairs.find((pair: MarketPair) => pair.symbol === selectedPair.symbol);
        if (currentPair) {
          handlePairSelect(currentPair.symbol);
        }
      }
    };

    initData();
  }, [currentUser?.id]);

  // 处理交易对选择
  const handlePairSelect = async (symbol: string) => {
    const selected = marketPairs.find((pair: MarketPair) => pair.symbol === symbol);
    if (selected) {
      await onPairSelect(selected);
      await getUserAccount(selected);
    }
  };

  // 刷新数据
  const refreshData = async () => {
    try {
      await Promise.all([
        getSymbols(),
        getUserAccount(selectedPair),
        getAvgPrice()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // 处理搜索
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    handleSearch(value);
  };

  if (isPairsLoading || isPriceLoading || isAccountLoading) {
    return <Loading className="h-96" />
  }

  if (!currentUser?.id) {
    return <NoData />
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* 交易对选择器 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full min-w-[300px]">
            <div className="flex flex-col space-y-2">
              <Select 
                value={selectedPair.symbol} 
                onValueChange={handlePairSelect}
                onOpenChange={(open) => {
                  if (open && searchInputRef.current) {
                    // 当下拉框打开时，聚焦到搜索框
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                    }, 0);
                  }
                }}
              >
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
                    onSearch={handleSearchChange}
                    onSelect={handlePairSelect}
                    searchInputRef={searchInputRef}
                  />
                </SelectContent>
              </Select>
              <div className="flex text-sm text-muted-foreground">
                <div className="mr-10">最小交易数量: {selectedPair.limitOrder?.minQty} {selectedPair.baseAsset}</div>
                <div className="mr-10">最小交易额: {selectedPair.marketOrder?.minNotional} {selectedPair.quoteAsset}</div>
                <div>当前均价: {streamsInfo?.w || avgPrice}</div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            disabled={isRefreshing}
            onClick={refreshData}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '刷新中' : '刷新'}
          </Button>
        </div> */}
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 交易模块 */}
        <TradingForm
          currentUser={currentUser}
          selectedPair={selectedPair}
          userAccount={userAccount}
          onRefreshData={refreshData}
          streamsInfo={streamsInfo}
        />

        {/* 市场数据 */}
        <MarketData />
      </div>

      {/* 订单历史 */}
      <OrderHistory
        currentUser={currentUser}
        selectedPair={selectedPair}
      />
    </div>
  );
}