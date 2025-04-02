import { useEffect, useRef } from 'react';
import WebSocketService, { WSData } from '@/services/ws';

export function useMarketSubscription(
  symbol: string,
  isEnabled: boolean, // 是否启用订阅，根据 userId 判断
  onData: (info: any) => void // 处理市场数据
) {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const currentSymbolRef = useRef<string>('');
  const isEnabledRef = useRef(false);

  useEffect(() => {
    isEnabledRef.current = isEnabled;

    // 如果条件没变且已经有订阅，则保持现有订阅
    if (currentSymbolRef.current === symbol && unsubscribeRef.current) {
      return;
    }

    // 清理旧的订阅
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // 如果禁用或没有 symbol，不创建新订阅
    if (!isEnabled || !symbol) {
      currentSymbolRef.current = '';
      return;
    }
  const wsService = new WebSocketService();

    // 创建新订阅
    console.log(`Creating new subscription for symbol: ${symbol}`);
    currentSymbolRef.current = symbol;
    
    const unsubscribe = wsService.subscribeMarket(
      symbol,
      ['avgPrice'],
      (data: WSData) => {
        if (
          data.type === "market_stream_message" && 
          data.symbol === currentSymbolRef.current &&
          isEnabledRef.current
        ) {
          const { data: info } = data;
          if (info?.s === currentSymbolRef.current) {
            onData(info);
          }
        }
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      currentSymbolRef.current = '';
    };
  }, [symbol, isEnabled]);
} 