import { get } from '@/utils/request';
import { baseUrl } from '../config'

export const usdsFutures = {
  getExchangeInfo: async (binanceUserId: string): Promise<any> => {
    return get(`${baseUrl}/api/futures/usds/exchangeInfo`, { id: binanceUserId });
  },

  get24hrPriceChangeStatistics: async (binanceUserId: string, symbol: string): Promise<any> => {
    return get(`${baseUrl}/api/futures/usds/24hrPriceChangeStatistics`, { id: binanceUserId, symbol });
  },
  
  getFundingRateHistory: async (binanceUserId: string, symbol: string): Promise<any> => {
    return get(`${baseUrl}/api/futures/usds/fundingRateHistory`, { id: binanceUserId, symbol });
  },

  getAccount: async (binanceUserId: string): Promise<any> => {
    return get(`${baseUrl}/api/futures/usds/account`, { id: binanceUserId });
  }
}
