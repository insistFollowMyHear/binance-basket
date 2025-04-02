import { get, post } from '@/utils/request';
import { baseUrl } from './config'

export const wallet = {
  getApiRestrictions: async (binanceUserId: string) => {
    return get(`${baseUrl}/api/wallet/account/apiRestrictions`, { id: binanceUserId });
  }
}

