import React, { useEffect, useState } from 'react';  
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from '@/components/ui/loading';
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import eventEmitter from '@/utils/eventEmitter';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { spotTrading } from '@/services';
import { OrderType, OrderSide, OrderStatus, OrderHistoryProps } from '../types';

const PAGE_SIZE = 20; // 每页显示的订单数量

const OrderHistory: React.FC<OrderHistoryProps> = ({
  currentUser,
  selectedPair,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'open' | 'history'>('open');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!currentUser?.id) return;
    loadOrders();
    // 切换交易对或视图模式时，重置页码
    setCurrentPage(1);
  }, [currentUser?.id, selectedPair.symbol, viewMode]);

  useEffect(() => {
    eventEmitter.on('loadChildOrderHistory', () => {
      loadOrders();
    });

    return () => {
      eventEmitter.off('loadChildOrderHistory', loadOrders);
    };
  }, []);

  // 加载订单数据
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      if (viewMode === 'open') {
        await getUserOpenOrders();
      } else {
        await getUserAllOrders();
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取用户当前挂单
  const getUserOpenOrders = async () => {
    const res = await spotTrading.getOpenOrders(currentUser?.id, selectedPair.symbol);
    if (res.data) {
      // 按时间降序排序
      const sortedOrders = res.data.sort((a: any, b: any) => b.time - a.time);
      setOrderHistory(sortedOrders);
    }
  };

  // 获取用户交易历史
  const getUserAllOrders = async () => {
    const res = await spotTrading.getAllOrders(currentUser?.id, selectedPair.symbol);
    if (res.data) {

      // 按时间降序排序
      const sortedOrders = res.data
        .sort((a: any, b: any) => b.time - a.time)
        .filter((order: any) => order.status !== 'NEW');
      setOrderHistory(sortedOrders);
    }
  };

  // 获取当前页的订单
  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return orderHistory.slice(startIndex, endIndex);
  };

  // 获取总页数
  const getTotalPages = () => {
    return Math.ceil(orderHistory.length / PAGE_SIZE);
  };

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 撤销单个订单
  const handleCancelOrder = (order: any) => {
    setSelectedOrder(order);
    setShowCancelDialog(true);
  };

  // 确认撤销订单
  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;
    
    setIsLoading(true);
    try {
      const res = await spotTrading.cancelOrder(currentUser?.id, selectedPair.symbol, selectedOrder.orderId);
      if (res.success) {
        setShowCancelDialog(false);
        setSelectedOrder(null);
        // 重新加载订单列表
        await loadOrders();
      } else {
        throw new Error(res.error?.message || '撤销订单失败');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      // 可以在这里添加错误提示
    } finally {
      setIsLoading(false);
    }
  };

  // 撤销当前交易对的所有挂单
  const handleCancelAllOrders = () => {
    setShowCancelAllDialog(true);
  };

  // 确认撤销所有挂单
  const confirmCancelAllOrders = async () => {
    setIsLoading(true);
    try {
      const res = await spotTrading.cancelAllOrders(currentUser?.id, selectedPair.symbol);
      if (res.success) {
        setShowCancelAllDialog(false);
        // 重新加载订单列表
        await loadOrders();
      } else {
        throw new Error(res.error?.message || '撤销所有订单失败');
      }
    } catch (error) {
      console.error('Failed to cancel all orders:', error);
      // 可以在这里添加错误提示
    } finally {
      setIsLoading(false);
    }
  };

  // 切换订单视图
  const handleViewModeChange = (mode: 'open' | 'history') => {
    setViewMode(mode);
    setCurrentPage(1); // 重置页码
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const translateStatus = (status: OrderStatus) => {
    switch(status) {
      case 'FILLED': return '已成交';
      case 'CANCELED': return '已取消';
      case 'NEW': return '未成交';
      case 'PARTIALLY_FILLED': return '部分成交';
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
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('open')}
              >
                当前挂单
              </Button>
              <Button
                variant={viewMode === 'history' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('history')}
              >
                历史订单
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {viewMode === 'open' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={handleCancelAllOrders}
                disabled={orderHistory.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                撤销所有挂单
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : (
          <>
            <div className="relative">
              <div className="overflow-x-auto">
                <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
                  <table className="w-full text-sm border-collapse relative">
                    <thead className="sticky top-0 bg-background z-10">
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 whitespace-nowrap min-w-[160px]">时间</th>
                        <th className="text-left py-3 px-4 whitespace-nowrap min-w-[120px]">交易对</th>
                        <th className="text-left py-3 px-4 whitespace-nowrap min-w-[80px]">类型</th>
                        <th className="text-left py-3 px-4 whitespace-nowrap min-w-[60px]">方向</th>
                        <th className="text-right py-3 px-4 whitespace-nowrap min-w-[70px]">价格</th>
                        <th className="text-right py-3 px-4 whitespace-nowrap min-w-[70px]">数量</th>
                        <th className="text-right py-3 px-4 whitespace-nowrap min-w-[70px]">成交量</th>
                        <th className="text-left py-3 px-4 whitespace-nowrap min-w-[100px]">状态</th>
                        {viewMode === 'open' && (
                          <th className="text-right py-3 px-4 whitespace-nowrap min-w-[80px] sticky right-0 bg-background shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)]">操作</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentPageOrders().length > 0 ? (
                        getCurrentPageOrders().map((order) => (
                          <tr key={order.orderId} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 min-w-[160px]">{formatDate(order.time)}</td>
                            <td className="py-3 px-4 min-w-[120px]">{order.symbol}</td>
                            <td className="py-3 px-4 min-w-[80px]">{translateOrderType(order.type)}</td>
                            <td className={`py-3 px-4 min-w-[60px] ${order.side === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                              {translateOrderSide(order.side)}
                            </td>
                            <td className="py-3 px-4 text-right min-w-[70px]">{Number(order.price)}</td>
                            <td className="py-3 px-4 text-right min-w-[70px]">{Number(order.origQty)}</td>
                            <td className="py-3 px-4 text-right min-w-[70px]">{Number(order.executedQty)}</td>
                            <td className={`py-3 px-4 min-w-[100px] ${
                              order.status === 'FILLED' ? 'text-green-500' : 
                              order.status === 'CANCELED' ? 'text-muted-foreground' : 
                              order.status === 'PARTIALLY_FILLED' ? 'text-yellow-500' :
                              'text-blue-500'
                            }`}>
                              {translateStatus(order.status)}
                            </td>
                            {viewMode === 'open' && (
                              <td className="py-3 px-4 text-right min-w-[80px] sticky right-0 bg-background shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.1)]">
                                {order.status === 'NEW' && (
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-red-500 hover:text-red-600"
                                      onClick={() => handleCancelOrder(order)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={viewMode === 'open' ? 9 : 8} className="py-8 text-center text-muted-foreground">
                            暂无订单记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 分页控件 */}
            {orderHistory.length > PAGE_SIZE && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  共 {orderHistory.length} 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    第 {currentPage} / {getTotalPages()} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === getTotalPages()}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* 撤销订单确认对话框 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认撤销订单</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>您确定要撤销该订单吗？此操作不可撤销。</p>
                {selectedOrder && (
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex">
                      <dt className="w-16">交易对:</dt>
                      <dd>{selectedOrder.symbol}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-16">类型:</dt>
                      <dd>{translateOrderType(selectedOrder.type)}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-16">方向:</dt>
                      <dd>{translateOrderSide(selectedOrder.side)}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-16">价格:</dt>
                      <dd>{selectedOrder.price}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-16">数量:</dt>
                      <dd>{selectedOrder.origQty}</dd>
                    </div>
                  </dl>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelOrder} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? '撤销中...' : '确认撤销'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 撤销所有挂单确认对话框 */}
      <AlertDialog open={showCancelAllDialog} onOpenChange={setShowCancelAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认撤销所有挂单</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要撤销 {selectedPair.symbol} 的所有未成交订单吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelAllOrders} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? '撤销中...' : '确认撤销所有'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default React.memo(OrderHistory); 