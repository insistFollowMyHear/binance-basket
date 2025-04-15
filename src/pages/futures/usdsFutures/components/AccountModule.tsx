import { useState } from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

  const transferDialog = () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <span className='underline text-muted-foreground text-xs cursor-pointer'>划转</span>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>划转</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-2 bg-muted-foreground/10 p-2 rounded-md'>
            <Select value={'现货账户'}>
              <SelectTrigger className='bg-transparent border-none p-2 rounded-md'>
                <SelectValue>
                  现货账户
                </SelectValue>
              </SelectTrigger>
            </Select>
            <div className='text-center text-muted-foreground text-sm'>
              至
            </div>
            <Select value={'U本位合约'}>
              <SelectTrigger className='text-center bg-transparent border-none p-2 rounded-md'>
                <SelectValue>
                  U本位合约
                </SelectValue>
              </SelectTrigger>
            </Select>
          </div>
          <div className='flex flex-col gap-2'>
            <Label>币种</Label>
            <Select>
              <SelectTrigger>
                <SelectValue>
                  USDT
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="BNB">BNB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-col gap-2'>
            <Label>数量</Label>
            <Input type="number" />
          </div>
          <DialogFooter>
              <Button variant="default">确认</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

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
            {transferDialog()}
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