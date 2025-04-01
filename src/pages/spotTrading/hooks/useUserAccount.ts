import { useState, useCallback } from 'react';
import { spotTrading } from '@/services';
import { UserAccount, MarketPair } from '../types';

export function useUserAccount(userId?: string) {
  const [userAccount, setUserAccount] = useState<UserAccount>({ baseAsset: 0, quoteAsset: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // 获取用户资产
  const getUserAccount = useCallback(async (selectedPair: MarketPair) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await spotTrading.getUserAccount(userId);
      let _baseAsset = 0;
      let _quoteAsset = 0;
      res.data?.balances.forEach((item: any) => {
        if (item.asset === selectedPair.baseAsset) {
          _baseAsset = item.free;
        }
        if (item.asset === selectedPair.quoteAsset) {
          _quoteAsset = item.free;
        }
      });
      const newAccount = {
        baseAsset: _baseAsset,
        quoteAsset: _quoteAsset
      };
      setUserAccount(newAccount);
      return newAccount;
    } catch (error) {
      console.error('Failed to fetch user account:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    userAccount,
    isLoading,
    getUserAccount
  };
} 