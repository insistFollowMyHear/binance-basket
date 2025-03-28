import { get, post } from '@/utils/request';
import { baseUrl } from './config'

export const spotTrading = {
  // 获取当前用户现货账户信息
  getUserAccount: async (binanceUserId: string): Promise<any> => {
    return get(`${baseUrl}/api/spot/account`, { id: binanceUserId });
  },

  // 获取交易对
  getSymbols: async (binanceUserId: string): Promise<any> => {
    return get(`${baseUrl}/api/spot/symbols`, { id: binanceUserId });
  },

  // 用户当前挂单
  getOpenOrders: async (binanceUserId: string, symbol: string): Promise<any> => {
    return get(`${baseUrl}/api/spot/openOrders`, { id: binanceUserId, symbol });
  },

  // 用户所有订单
  getAllOrders: async (binanceUserId: string, symbol: string): Promise<any> => {
    return get(`${baseUrl}/api/spot/allOrders`, { id: binanceUserId, symbol });
  },

  // 撤销订单
  cancelOrder: async (binanceUserId: string, symbol: string, orderId: number): Promise<any> => {
    return post(`${baseUrl}/api/spot/cancelOrder?id=${binanceUserId}`, {
      symbol,
      orderId
    });
  },

  // 撤销所有订单
  cancelAllOrders: async (binanceUserId: string, symbol: string): Promise<any> => {
    return post(`${baseUrl}/api/spot/cancelAllOrders?id=${binanceUserId}`, {
      symbol
    });
  },

  // 下单测试
  testOrder: async (binanceUserId: string, symbol: string, side: string, quantity: number, price: number, type: string): Promise<any> => {
    return get(`${baseUrl}/api/spot/testOrder`, {
      id: binanceUserId,
      symbol,
      side,
      quantity,
      price,
      type
    });
  }
} 