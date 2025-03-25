import { baseUrl } from './config'

export const spotTrading = {
  getSymbols: async (userId: string): Promise<any> => {
    const response = await fetch(`${baseUrl}/api/spot/symbols?userId=${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch symbols')
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