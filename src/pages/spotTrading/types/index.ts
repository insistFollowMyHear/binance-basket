export * from './order-history';

export type OrderType = 'LIMIT' | 'MARKET';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'FILLED' | 'CANCELED' | 'NEW';

// 交易对
export interface MarketPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: string;
  priceChangePercent: string;
  minQuantity: string;
  minNotional: string;
}

// 订单历史
export interface OrderHistoryItem {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  quantity: string;
  status: OrderStatus;
  time: string;
}

// 用户资产
export interface UserAccount {
  baseAsset: number;
  quoteAsset: number;
}

