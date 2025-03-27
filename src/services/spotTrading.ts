import { baseUrl } from './config'

export const spotTrading = {
  // 获取当前用户现货账户信息
  getUserAccount: async (binanceUserId: string): Promise<any> => {
    const response = await fetch(`${baseUrl}/api/spot/account?id=${binanceUserId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user account data')
    }
    return response.json()
  },

  // 获取交易对
  getSymbols: async (binanceUserId: string): Promise<any> => {
    const response = await fetch(`${baseUrl}/api/spot/symbols?id=${binanceUserId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch symbols')
    }
    return response.json()
  },

  // 用户当前挂单
  getOpenOrders: async (binanceUserId: string, symbol: string): Promise<any> => {
    const response = await fetch(`${baseUrl}/api/spot/openOrders?id=${binanceUserId}&symbol=${symbol}`)
    if (!response.ok) {
      throw new Error('Failed to fetch open orders')
    }
    return response.json()
  },

  // 用户所有订单
  getAllOrders: async (binanceUserId: string, symbol: string, startTime: number, endTime: number, limit: number): Promise<any> => {
    const response = await fetch(`${baseUrl}/api/spot/allOrders?id=${binanceUserId}&symbol=${symbol}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`) 
    if (!response.ok) {
      throw new Error('Failed to fetch all orders')
    }
    return response.json()
  },

  // // 获取市场深度
  // getDepth: async (symbol: string, limit: number = 50, userId: string): Promise<any> => {
  //   const response = await fetch(`${baseUrl}/api/spot/depth?symbol=${symbol}&limit=${limit}&userId=${userId}`)
  //   if (!response.ok) {
  //     throw new Error('Failed to fetch depth data')
  //   }
  //   return response.json()
  // },

  // // 获取市场近期交易
  // getTrades: async (symbol: string, limit: number = 50, userId: string): Promise<any> => {
  //   const response = await fetch(`${baseUrl}/api/spot/trades?symbol=${symbol}&limit=${limit}&userId=${userId}`)
  //   if (!response.ok) {
  //     throw new Error('Failed to fetch trades data')
  //   }
  //   return response.json()
  // },

  // // 获取市场最新价格
  // getTickerPrice: async (symbol: string, userId: string): Promise<any> => {
  //   const response = await fetch(`${baseUrl}/api/spot/ticker/price?symbol=${symbol}&userId=${userId}`)
  //   if (!response.ok) {
  //     throw new Error('Failed to fetch price data')
  //   }
  //   return response.json()
  // }
} 