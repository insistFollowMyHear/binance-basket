
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
  isLoading: boolean;
  viewMode: 'open' | 'history';
  searchQuery: string;
  filteredOrders: OrderHistoryItem[];
  isOrderQueryActive: boolean;
  onViewModeChange: (mode: 'open' | 'history') => void;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
  onCancelOrder: (order: OrderHistoryItem) => void;
  onCancelAndReplace: (order: OrderHistoryItem) => void;
}