import { useState, useCallback } from 'react';
import { spotTrading } from '@/services';
import { MarketPair } from '../types';

export function useMarketPairs(userId?: string) {
  const [marketPairs, setMarketPairs] = useState<MarketPair[]>([]);
  const [filteredPairs, setFilteredPairs] = useState<MarketPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取交易对
  const getSymbols = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const res = await spotTrading.getSymbols(userId);
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
      return formattedPairs;
    } catch (error) {
      console.error('Failed to fetch symbols:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // 处理交易对搜索
  const handleSearch = useCallback((value: string) => {
    if (!value.trim()) {
      setFilteredPairs(marketPairs);
      return;
    }
    
    const filtered = marketPairs.filter((pair: MarketPair) => 
      pair.symbol.toLowerCase().includes(value.toLowerCase()) ||
      pair.baseAsset.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPairs(filtered);
  }, [marketPairs]);

  return {
    marketPairs,
    filteredPairs,
    isLoading,
    getSymbols,
    handleSearch
  };
} 