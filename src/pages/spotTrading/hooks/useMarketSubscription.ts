import { useEffect, useRef } from 'react';
import ws, { WSData } from '@/services/ws';

export function useMarketSubscription(
  symbol: string,
  isEnabled: boolean,
  onData: (info: any) => void
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isEnabled || !symbol) return;

    // 订阅市场数据
    const unsubscribe = ws.subscribeMarket(
      symbol,
      ['avgPrice'],
      (data: WSData) => {
        if (data.type === 'market_stream' && data.symbol === symbol) {
          const { data: info } = data;
          // 处理市场数据
          if (info?.s === symbol) {
            onData(info);
          }
        }
      }
    );

    unsubscribeRef.current = unsubscribe;

    // 清理函数
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol, isEnabled, onData]);

  return {
    unsubscribe: () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }
  };
} 