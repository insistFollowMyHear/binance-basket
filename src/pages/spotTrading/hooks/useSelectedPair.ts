import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedPair as setReduxSelectedPair } from '@/store/slices/tradingSlice';
import { spotTrading } from '@/services';
import { MarketPair } from '../types';

const STORAGE_KEY = 'selectedTradingPair';

const DEFAULT_PAIR: MarketPair = {
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

export function useSelectedPair(userId?: string) {
  const dispatch = useDispatch();
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
    return DEFAULT_PAIR;
  });

  const [avgPrice, setAvgPrice] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  // 获取当前均价
  const getAvgPrice = useCallback(async () => {
    if (!userId || !selectedPair.symbol) return;

    setIsLoading(true);
    try {
      const res = await spotTrading.getAvgPrice(userId, selectedPair.symbol);
      setAvgPrice(res.data.price);
      return res.data.price;
    } catch (error) {
      console.error('Failed to fetch average price:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedPair.symbol]);

  // 处理交易对选择
  const handlePairSelect = useCallback((pair: MarketPair) => {
    setSelectedPair(pair);
    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pair));
    // 保存到 Redux
    dispatch(setReduxSelectedPair(pair));
    // 更新当前均价
    getAvgPrice();
  }, [dispatch, getAvgPrice]);

  return {
    selectedPair,
    avgPrice,
    isLoading,
    handlePairSelect,
    getAvgPrice
  };
} 