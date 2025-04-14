import { useState } from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';

export function AccountModule({ accountInfo }: { accountInfo: any }) {

  // 当前选择的资产类型
  const [selectedAsset, setSelectedAsset] = useState('USDT');

  // 模拟保证金数据
  const marginData = {
    marginRatio: '120%',
    maintenanceMargin: '200.00 USDT',
  };

  // 处理资产类型切换
  const handleSelectAsset = (asset: string) => {
    setSelectedAsset(asset);
  };

  // if (!accountInfo?.assets) {
  //   return <div className='p-4 pt-2'>
  //     <Skeleton className="" />
  //     <div className='flex flex-wrap justify-between items-center'>
  //       <div className='flex-1'>
  //         <Skeleton className="w-32 h-8 mb-2" />
  //         <div className='flex items-center gap-4'>
  //           <Skeleton className="w-32 h-6" />
  //           <Skeleton className="w-32 h-6" />
  //         </div>
  //       </div>
  //       <div className='flex-1'>
  //         <Skeleton className="w-32 h-8 mb-2" />
  //         <div className='flex items-center gap-4'>
  //           <Skeleton className="w-32 h-6" />
  //           <Skeleton className="w-32 h-6" />
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // }

  return (
    <Card>
      <CardContent className="p-4 pt-2">
        <div className='flex flex-col mb-2'>
          <Select
            value={selectedAsset} 
            onValueChange={handleSelectAsset}
          >
            <SelectTrigger className="w-full max-w-[100px] border-none px-0 focus:ring-0">
              <SelectValue>
                <span>USDT 全仓</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDT">USDT 全仓</SelectItem>
              <SelectItem value="BTC">BTC 全仓</SelectItem>
              <SelectItem value="ETH">ETH 全仓</SelectItem>
              <SelectItem value="BNB">BNB 全仓</SelectItem>
              <SelectItem value="USDC">USDC 全仓</SelectItem>
            </SelectContent>
          </Select>
          <div className='grid grid-cols-2 gap-4 text-muted-foreground text-sm'>
            <span>维持保证金：{marginData.maintenanceMargin}</span>
            <span>保证金余额：{marginData.marginRatio}</span>
          </div>
        </div>

        <div className='flex flex-col'>
          <div className='flex justify-between items-center gap-4'>
            <Select
              value={selectedAsset} 
              onValueChange={handleSelectAsset}
            >
              <SelectTrigger className="w-full max-w-[60px] border-none px-0">
                <SelectValue>
                  <span>USDT</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="BNB">BNB</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
            <span className='underline text-muted-foreground text-xs cursor-pointer'>划转</span>
          </div>
          <div className='grid grid-cols-2 gap-4 text-muted-foreground text-sm'>
            <span>钱包余额: 15678.00 USDT</span>
            <span>未实现盈亏: 15678.00 USDT</span>
            {/* <span>钱包余额：{accountInfo.totalWalletBalance || 0}</span>
            <span>未实现盈亏：{Number(accountInfo.totalUnrealizedProfit) || 0}</span> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 