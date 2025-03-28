
import { OrderType, OrderSide, OrderStatus } from './index';

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

export interface OrderHistoryProps {
  currentUser: any;
  selectedPair: any;
}