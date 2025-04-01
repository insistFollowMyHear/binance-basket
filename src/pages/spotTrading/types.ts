export type OrderType = 'LIMIT' | 'MARKET';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'NEW' | 'FILLED' | 'CANCELED' | 'PARTIALLY_FILLED';

export interface OrderHistoryItem {
  orderId: number;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  origQty: string;
  executedQty: string;
  status: OrderStatus;
  time: number;
}

export interface MarketPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: string;
  priceChangePercent: string;
  baseAssetPrecision: number;
  quoteAssetPrecision: number;
  limitOrder: {
    minQty: string;
    maxQty: string;
    stepSize: string;
  };
  marketOrder: {
    minNotional: string;
    maxNotional: string;
  };
  priceFilter?: {
    maxPricePercent: string;  // 最大价格偏差百分比
    minPricePercent: string;  // 最小价格偏差百分比
  };
}

export interface UserAccount {
  baseAsset: number;
  quoteAsset: number;
}

export interface OrderHistoryProps {
  currentUser: any;
  selectedPair: MarketPair;
}

export interface TradingFormProps {
  currentUser: any;
  selectedPair: MarketPair;
  userAccount: UserAccount;
  streamsInfo: any;
  onRefreshData: () => Promise<void>;
} 