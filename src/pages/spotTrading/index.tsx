import { useState, useEffect, useRef } from 'react';

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw } from "lucide-react";

import { spotTrading } from '@/services';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setSelectedPair as setReduxSelectedPair } from '@/store/slices/tradingSlice';
import MarketPairsList from '@/components/market-pairs-list';
import OrderHistory from './components/order-history';
import MarketData from './components/market-data';
import TradingForm from './components/trading-form';
import { MarketPair, UserAccount } from './types';

const STORAGE_KEY = 'selectedTradingPair';

export function SpotTrade() {
  const dispatch = useDispatch();
  const loadedRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, _setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPair, setSelectedPair] = useState<MarketPair>(() => {
    // 从 localStorage 读取保存的交易对
    const savedPair = localStorage.getItem(STORAGE_KEY);
    if (savedPair) {
      try {
        return JSON.parse(savedPair);
      } catch (e) {
        console.error('Failed to parse saved trading pair:', e);
      }
    }
    // 默认值
    return {
      symbol: 'BTCUSDT',
      baseAsset: 'BTC',
      quoteAsset: 'USDT',
      lastPrice: '0.00',
      priceChangePercent: '0.00',
      baseAssetPrecision: 0,
      quoteAssetPrecision: 0,
      limitOrder: {
        minQty: '0',
        maxQty: '0',
        stepSize: '0'
      },
      marketOrder: {
        minNotional: '0',
        maxNotional: '0'
      }
    };
  });
  const [userAccount, setUserAccount] = useState<UserAccount>({
    baseAsset: 0,
    quoteAsset: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [marketPairs, setMarketPairs] = useState<MarketPair[]>([]);
  const [filteredPairs, setFilteredPairs] = useState<MarketPair[]>([]);

  const { currentUser } = useSelector((state: RootState) => state.auth);

  // 加载数据
  useEffect(() => {
    if (!currentUser?.id) return;
    if (loadedRef.current) return;
    loadedRef.current = true;
    getSymbols();
    getUserAccount();
  }, [currentUser?.id]);

  // 获取用户资产
  const getUserAccount = async () => {
    const res = await spotTrading.getUserAccount(currentUser?.id);
    let _baseAsset = 0;
    let _quoteAsset = 0;
    res.data?.balances.forEach((item: any) => {
      if (item.asset === selectedPair.baseAsset) {
        _baseAsset = item.free;
      }
      if (item.asset === selectedPair.quoteAsset) {
        _quoteAsset = item.free;
      }
    });
    setUserAccount({
      baseAsset: _baseAsset,
      quoteAsset: _quoteAsset
    });
  };

  // 获取交易对
  const getSymbols = async () => {
    const res = await spotTrading.getSymbols(currentUser?.id);
    // 过滤掉已暂停的交易对
    const activeSymbols = res.data.filter((symbol: any) => 
      symbol.status === 'TRADING' && 
      !symbol.isSpotTradingAllowed === false
    );
    
    // 转换为 MarketPair 格式并保存最小交易数量信息
    const formattedPairs = activeSymbols.map((symbol: any): MarketPair => {
      // 获取订单尺寸
      const orderSize = symbol.filters.find((f: any) => f.filterType === 'LOT_SIZE');
      // 获取名义过滤器
      const notionalFilter = symbol.filters.find((f: any) => f.filterType === "NOTIONAL");
      // 获取价格过滤器
      const priceFilter = symbol.filters.find((f: any) => f.filterType === 'PERCENT_PRICE_BY_SIDE');
      
      return {
        symbol: symbol.symbol,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        lastPrice: symbol.lastPrice || '0.00',
        priceChangePercent: '0.00',
        baseAssetPrecision: symbol.baseAssetPrecision || 0,
        quoteAssetPrecision: symbol.quoteAssetPrecision || 0,
        limitOrder: {
          minQty: orderSize?.minQty || '0',
          maxQty: orderSize?.maxQty || '0',
          stepSize: orderSize?.stepSize || '0'
        },
        marketOrder: {
          minNotional: notionalFilter?.minNotional || '0',
          maxNotional: notionalFilter?.maxNotional || '0'
        },
        priceFilter: priceFilter ? {
          maxPricePercent: priceFilter.bidMultiplierUp || '1.2',    // 买入价格上限倍数
          minPricePercent: priceFilter.bidMultiplierDown || '0.8',  // 买入价格下限倍数
        } : undefined
      };
    });
    setMarketPairs(formattedPairs);
    setFilteredPairs(formattedPairs);

    // 如果当前选中的交易对在数据中，更新其信息
    const currentPair = formattedPairs.find((pair: MarketPair) => pair.symbol === selectedPair.symbol);
    if (currentPair) {
      handlePairSelect(currentPair.symbol);
    }
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
      // 保存到 localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
      // 保存到 Redux
      dispatch(setReduxSelectedPair(selected as any));
      // 更新用户资产
      getUserAccount();
    }
  };

  // 刷新数据
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        getSymbols(),
        getUserAccount()
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
                    pairs={filteredPairs as any}
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    onSelect={handlePairSelect}
                    searchInputRef={searchInputRef}
                  />
                </SelectContent>
              </Select>
              <div className="flex text-sm text-muted-foreground">
                <div className="mr-10">最小交易数量: {selectedPair.limitOrder?.minQty} {selectedPair.baseAsset}</div>
                <div>最小交易额: {selectedPair.marketOrder?.minNotional} {selectedPair.quoteAsset}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 交易模块 */}
        <TradingForm
          currentUser={currentUser}
          selectedPair={selectedPair}
          isLoading={isLoading}
          userAccount={userAccount}
          onRefreshData={refreshData}
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