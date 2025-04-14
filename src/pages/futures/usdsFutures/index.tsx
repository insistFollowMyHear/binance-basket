import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

import { usdsFutures } from '@/services';

import { NoData } from '@/components/NoData';

import SymbolHeader from './components/SymbolHeader';
import { TradingForm } from './components/TradingForm';
import { AccountModule } from './components/AccountModule';
import { OrderHistory } from './components/OrderHistory';

export function UsdsFutures() {
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const [exchangeInfo, setExchangeInfo] = useState<any>({
    symbols: []
  });
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.id) {
      Promise.all([
        getExchangeInfo(),
        // getAccount()
      ]).then(([exchangeInfo]) => {
        console.log(exchangeInfo);
        setExchangeInfo(exchangeInfo);
        setAccount(account);
      });
    }
  }, [currentUser?.id]);

  // 获取交易对和交易规则
  const getExchangeInfo = async () => {
    try {
      const res = await usdsFutures.getExchangeInfo(currentUser.id);
      return res.data;
    } catch (error) {
      console.error(error);
    }
  }

  // 获取账户信息
  // const getAccount = async () => {
  //   try {
  //     const res = await usdsFutures.getAccount(currentUser.id);
  //     return res.data;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  if (!currentUser?.id) {
    return <NoData />
  }

  return (
    <div className="container mx-auto p-4">
      <SymbolHeader
        userID={currentUser.id}
        exchangeInfo={exchangeInfo}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className='flex flex-col gap-4'>
          <TradingForm />
          <AccountModule accountInfo={account} />
        </div>
        <OrderHistory />
      </div>
    </div>
  );
}