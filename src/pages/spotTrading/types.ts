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
  isLoading: boolean;
  userAccount: UserAccount;
  onRefreshData: () => Promise<void>;
} 