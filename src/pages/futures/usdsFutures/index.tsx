import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

import { usdsFutures } from '@/services';

import SymbolHeader from './components/SymbolHeader';
import { TradingForm } from './components/TradingForm';
import { AccountModule } from './components/AccountModule';
import { OrderHistory } from './components/OrderHistory';

export function UsdsFutures() {
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const [priceChangeStatistics, setPriceChangeStatistics] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.id) {
      Promise.all([
        get24hrPriceChangeStatistics(),
      ]).then(([priceChangeStatistics]) => {
        setPriceChangeStatistics(priceChangeStatistics);
      });
    }
  }, [currentUser?.id]);

  // 24小时价格变动统计
  const get24hrPriceChangeStatistics = async () => {
    try {
      const res = await usdsFutures.get24hrPriceChangeStatistics(currentUser.id);
      return res.data;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="container mx-auto px-4  space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
          priceChangeStatistics && (
            <SymbolHeader
              priceChangeStatistics={priceChangeStatistics}
            />
          )
        }
      
        <TradingForm />
        
        <AccountModule />
        
        <OrderHistory />
      </div>
    </div>
  );
}