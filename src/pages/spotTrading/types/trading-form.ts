import { MarketPair, UserAccount, OrderType, OrderSide } from './index';

export interface TradingFormProps {
  selectedPair: MarketPair;
  isLoading: boolean;
  userAccount: UserAccount;
  onPlaceOrder: (orderData: {
    symbol: string;
    type: OrderType;
    side: OrderSide;
    price?: string;
    amount: string;
  }) => void;
}