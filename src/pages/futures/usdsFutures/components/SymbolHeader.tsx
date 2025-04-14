import React, { useState, useRef, useEffect } from 'react';
// import eventEmitter from '@/utils/eventEmitter';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import MarketPairsList from '@/components/market-pairs-list';

import { useToast } from "@/hooks/use-toast";
import { PriceChangeStatistics, SymbolInfo } from '../types';

import { usdsFutures } from '@/services';
import WebSocketService, { WSData } from '@/services/ws';

const STORAGE_KEY = 'usdsFuturesSelectedPair';

// 交易对数据接口
const SymbolHeader = React.memo(({ exchangeInfo, userID }: any) => {
  const { toast } = useToast();
  const wsService = new WebSocketService();
  const symbols = exchangeInfo?.symbols || [];

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPair, setSelectedPair] = useState<SymbolInfo>(() => {
    const savedPair = localStorage.getItem(STORAGE_KEY);
    if (savedPair) {
      try {
        return JSON.parse(savedPair);
      } catch (e) {
        console.error('Failed to parse saved trading pair:', e);
      }
    }
    return symbols[0] || {
      symbol: '',
      baseAsset: '',
      quoteAsset: '',
    };
  });

  const [currentPairPriceChange, setCurrentPairPriceChange] = useState<PriceChangeStatistics>({
    symbol: '',
    priceChange: '',
    priceChangePercent: '',
    lastPrice: '',
    highPrice: '',
    lowPrice: '',
    volume: '',
    quoteVolume: '',
  });

  useEffect(() => {
    setLoading(true);
    const symbol = symbols[0]?.symbol;
    if(symbol) {
      !selectedPair.symbol && setSelectedPair(symbols[0]);
      get24hrPriceChangeStatistics(selectedPair.symbol || symbol)
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [selectedPair, symbols]);

  // 订阅永续合约数据流
  const subscribeUsdsFuturesStream = (symbol: string) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    unsubscribeRef.current = wsService.subscribeUsdsFutures(
      symbol || selectedPair.symbol,
      ['ticker'],
      (data: WSData) => {
        if (data.type === 'usds_futures_stream_message' && data.symbol === symbol) {
          const { data: info } = data;
          if (info?.s === symbol) {
            setCurrentPairPriceChange({
              symbol: info.s,
              priceChange: info.p,
              priceChangePercent: info.P,
              lastPrice: info.c,
              highPrice: info.h,
              lowPrice: info.l,
              volume: info.v,
              quoteVolume: info.q,
            });
          }
        }
      }
    )
  }

  // 24小时价格变动统计
  const get24hrPriceChangeStatistics = async (symbol: string) => {
    try {
      const res = await usdsFutures.get24hrPriceChangeStatistics(userID, symbol);
      setCurrentPairPriceChange(res.data)
      subscribeUsdsFuturesStream(symbol);
    } catch (error) {
      toast({
        title: '获取24小时价格变动统计失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false);
    }
  }

  // 搜索
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  }

  // 选择交易对
  const handlePairSelect = (symbol: string) => {
    const selected = symbols.find((pair: any) => pair.symbol === symbol);
    if(selected) {
      setSelectedPair(selected);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    }
  }

  const renderPriceInfo = () => {
    if (loading) {
      return (
        <div className="flex space-x-6">
          {[...Array(6)].map((_, index) => (
            <div key={index}>
              <div className="text-[#848e9c] text-xs mb-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div>
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex space-x-6">
        <div>
          <div className="text-[#848e9c] text-xs">最新价格</div>
          <div className={`text-base font-semibold ${
            Number(currentPairPriceChange.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {currentPairPriceChange.lastPrice}
          </div>
        </div>
        <div>
          <div className="text-[#848e9c] text-xs">24h涨跌</div>
          <div className={`text-base font-semibold ${
            Number(currentPairPriceChange.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {Number(currentPairPriceChange.priceChangePercent) >= 0 ? '+' : ''}{currentPairPriceChange.priceChangePercent}%
          </div>
        </div>
        <div>
          <div className="text-[#848e9c] text-xs">24h最高</div>
          <div className="text-base font-semibold">{currentPairPriceChange.highPrice}</div>
        </div>
        <div>
          <div className="text-[#848e9c] text-xs">24h最低</div>
          <div className="text-base font-semibold">{currentPairPriceChange.lowPrice}</div>
        </div>
        <div>
          <div className="text-[#848e9c] text-xs">24h成交量({selectedPair.baseAsset})</div>
          <div className="text-base font-semibold">{currentPairPriceChange.volume}</div>
        </div>
        <div>
          <div className="text-[#848e9c] text-xs">24h成交量({selectedPair.quoteAsset})</div>
          <div className="text-base font-semibold">{currentPairPriceChange.quoteVolume}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center mb-4">
      {/* 交易对选择器 */}
      {symbols.length > 0 ? (
        <div className="relative min-w-[200px] mr-8">
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
                  <span className="font-bold">{selectedPair.symbol}</span>
                  <span className="text-muted-foreground">永续</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <MarketPairsList
                pairs={symbols}
                searchQuery={searchQuery}
                onSearch={handleSearchChange}
                onSelect={handlePairSelect}
                searchInputRef={searchInputRef}
              />
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="relative min-w-[200px] mr-8">
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      
      {/* 交易对信息 */}
      {renderPriceInfo()}
    </div>
  );
});

export default SymbolHeader;