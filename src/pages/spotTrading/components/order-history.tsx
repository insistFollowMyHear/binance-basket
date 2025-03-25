import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from '@/components/ui/loading';
import { Search, X, Trash2, RotateCcw } from "lucide-react";

type OrderType = 'LIMIT' | 'MARKET';
type OrderSide = 'BUY' | 'SELL';
type OrderStatus = 'FILLED' | 'CANCELED' | 'NEW';

interface OrderHistoryItem {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  quantity: string;
  status: OrderStatus;
  time: string;
}

interface OrderHistoryProps {
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

const OrderHistory: React.FC<OrderHistoryProps> = ({
  isLoading,
  viewMode,
  searchQuery,
  filteredOrders,
  isOrderQueryActive,
  onViewModeChange,
  onSearchChange,
  onSearch,
  onClearSearch,
  onCancelOrder,
  onCancelAndReplace,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const translateStatus = (status: OrderStatus) => {
    switch(status) {
      case 'FILLED': return '已成交';
      case 'CANCELED': return '已取消';
      case 'NEW': return '未成交';
      default: return status;
    }
  };

  const translateOrderType = (type: OrderType) => {
    return type === 'LIMIT' ? '限价单' : '市价单';
  };

  const translateOrderSide = (side: OrderSide) => {
    return side === 'BUY' ? '买入' : '卖出';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <CardTitle>订单历史</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('open')}
              >
                当前挂单
              </Button>
              <Button
                variant={viewMode === 'history' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('history')}
              >
                历史订单
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Input
                className="pl-8 h-8 w-[200px] md:w-[300px]"
                placeholder="输入交易对或订单ID搜索"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button variant="outline" size="sm" className="h-8" onClick={onSearch}>
              查询
            </Button>
          </div>
        </div>
        {isOrderQueryActive && (
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span>
              搜索结果: {filteredOrders.length} 条订单
              {searchQuery && <span className="ml-1">（关键词: "{searchQuery}"）</span>}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 ml-2 text-xs"
              onClick={onClearSearch}
            >
              清除筛选
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">时间</th>
                  <th className="text-left py-3 px-4">交易对</th>
                  <th className="text-left py-3 px-4">类型</th>
                  <th className="text-left py-3 px-4">方向</th>
                  <th className="text-right py-3 px-4">价格</th>
                  <th className="text-right py-3 px-4">数量</th>
                  <th className="text-left py-3 px-4">状态</th>
                  <th className="text-right py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{formatDate(order.time)}</td>
                      <td className="py-3 px-4">{order.symbol}</td>
                      <td className="py-3 px-4">{translateOrderType(order.type)}</td>
                      <td className={`py-3 px-4 ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                        {translateOrderSide(order.side)}
                      </td>
                      <td className="py-3 px-4 text-right">{order.price}</td>
                      <td className="py-3 px-4 text-right">{order.quantity}</td>
                      <td className={`py-3 px-4 ${
                        order.status === 'FILLED' ? 'text-green-500' : 
                        order.status === 'CANCELED' ? 'text-muted-foreground' : 'text-blue-500'
                      }`}>
                        {translateStatus(order.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {order.status === 'NEW' && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-red-500 hover:text-red-600"
                              onClick={() => onCancelOrder(order)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-blue-500 hover:text-blue-600"
                              onClick={() => onCancelAndReplace(order)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      {isOrderQueryActive ? '未找到匹配的订单记录' : '暂无订单记录'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(OrderHistory); 