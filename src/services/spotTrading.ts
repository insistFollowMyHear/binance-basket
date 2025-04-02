import { get, post } from '@/utils/request';
import { baseUrl } from './config'

export const spotTrading = {
  // 获取当前用户现货账户信息
  getUserAccount: async (binanceUserId: string, apiKey?: string, secretKey?: string): Promise<any> => {
    if (apiKey && secretKey) {
      return get(`${baseUrl}/api/spot/account`, { api_key: apiKey, secret_key: secretKey });
    } else {
      return get(`${baseUrl}/api/spot/account`, { id: binanceUserId });
    }
  },

  // 获取交易对
  getSymbols: async (binanceUserId: string): Promise<any> => {
    return get(`${baseUrl}/api/spot/symbols`, { id: binanceUserId });
  },

  // 获取当前均价
  getAvgPrice: async (binanceUserId: string, symbol: string): Promise<any> => {
    return get(`${baseUrl}/api/spot/avgPrice`, { id: binanceUserId, symbol });
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
    try {
      const response = await post(`${baseUrl}/api/spot/cancelOrder?id=${binanceUserId}`, {
        symbol,
        orderId
      }, {
        timeout: 10000 // 设置10秒超时
      });
      return response;
    } catch (error) {
      console.error('Cancel order failed:', error);
      throw error;
    }
  },

  // 撤销所有订单
  cancelAllOrders: async (binanceUserId: string, symbol: string): Promise<any> => {
    try {
      const response = await post(`${baseUrl}/api/spot/cancelAllOrders?id=${binanceUserId}`, {
        symbol,
        recvWindow: 10000 // 增加接收窗口时间
      }, {
        timeout: 15000 // 设置15秒超时
      });
      return response;
    } catch (error) {
      console.error('Cancel all orders failed:', error);
      throw error;
    }
  },

  // 创建订单
  createOrder: async (
    binanceUserId: string,
    symbol: string,
    side: string,
    type: string,
    quantity: string,
    price?: string,
  ): Promise<any> => {
    try {
      const baseParams = {
        symbol,
        side,
        type,
      };

      let orderParams;
      
      if (type === 'LIMIT') {
        if (!price) {
          throw new Error('Price is required for LIMIT orders');
        }
        orderParams = {
          ...baseParams,
          quantity,
          price,
          timeInForce: 'GTC', // Good Till Cancel
        };
      } else if (type === 'MARKET') {
        // 对于市价单，买入使用交易额(quoteOrderQty)，卖出使用数量(quantity)
        orderParams = {
          ...baseParams,
          ...(side === 'BUY'
            ? { quoteOrderQty: quantity } // 买入：使用交易额
            : { quantity }) // 卖出：使用数量
        };
      } else {
        throw new Error('Unsupported order type');
      }

      const response = await post(
        `${baseUrl}/api/spot/createOrder?id=${binanceUserId}`,
        orderParams,
        {
          timeout: 10000
        }
      );
      return response;
    } catch (error) {
      console.error('Create order failed:', error);
      throw error;
    }
  },

  // 创建测试订单
  createTestOrder: async (
    binanceUserId: string,
    symbol: string,
    side: string,
    type: string,
    quantity: string,
    price?: string,
  ): Promise<any> => {
    try {
      const baseParams = {
        symbol,
        side,
        type,
      };

      let orderParams;
      
      if (type === 'LIMIT') {
        if (!price) {
          throw new Error('Price is required for LIMIT orders');
        }
        orderParams = {
          ...baseParams,
          quantity,
          price,
          timeInForce: 'GTC', // Good Till Cancel
        };
      } else if (type === 'MARKET') {
        // 对于市价单，买入使用交易额(quoteOrderQty)，卖出使用数量(quantity)
        orderParams = {
          ...baseParams,
          ...(side === 'BUY'
            ? { quoteOrderQty: quantity } // 买入：使用交易额
            : { quantity }) // 卖出：使用数量
        };
      } else {
        throw new Error('Unsupported order type');
      }

      const response = await post(
        `${baseUrl}/api/spot/createTestOrder?id=${binanceUserId}`,
        orderParams,
        {
          timeout: 10000
        }
      );
      return response;
    } catch (error) {
      console.error('Create test order failed:', error);
      throw error;
    }
  }
} 