import { get } from '@/utils/request';
import { baseUrl } from '../config'

export const usdsFutures = {
  get24hrPriceChangeStatistics: async (binanceUserId: string): Promise<any> => {
    return get(`${baseUrl}/api/futures/usds/24hrPriceChangeStatistics`, { id: binanceUserId });
  },
  
  getFundingRateHistory: async (binanceUserId: string, symbol: string): Promise<any> => {
    return get(`${baseUrl}/api/futures/usds/fundingRateHistory`, { id: binanceUserId, symbol });
  }
}
