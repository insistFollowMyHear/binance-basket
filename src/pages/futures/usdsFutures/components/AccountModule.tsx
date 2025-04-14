import React, { useState } from 'react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function AccountModule() {
  // 当前选择的资产类型
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  // 资产下拉框是否展开
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // 模拟资产数据
  const assets = {
    USDT: { balance: '10,000.00', available: '8,500.00' },
    BTC: { balance: '0.25', available: '0.20' },
    ETH: { balance: '3.50', available: '3.00' },
    BNB: { balance: '12.75', available: '10.00' },
    USDC: { balance: '5,000.00', available: '4,000.00' },
  };

  // 模拟保证金数据
  const marginData = {
    marginRatio: '120%',
    maintenanceMargin: '200.00 USDT',
  };

  // 获取当前选中的资产数据
  const currentAsset = assets[selectedAsset as keyof typeof assets];

  // 处理资产类型切换
  const handleSelectAsset = (asset: string) => {
    setSelectedAsset(asset);
    setDropdownOpen(false);
  };

  // 处理划转操作
  const handleTransfer = () => {
    alert(`划转 ${selectedAsset}`);
  };

  return (
      <div className="p-4 pt-2">
        <div className="flex flex-wrap justify-between items-center">
          <div className='flex-1'>
            <Select
              value={selectedAsset} 
              onValueChange={handleSelectAsset}
            >
              <SelectTrigger className="w-full max-w-[100px] border-none px-0">
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
            <div className='flex items-center gap-4'>
              <span className='text-[#848e9c] text-sm'>维持保证金：{marginData.maintenanceMargin}</span>
              <span className='text-[#848e9c] text-sm'>保证金余额：{marginData.marginRatio}</span>
            </div>
          </div>

          <div className='flex-1'>
            <div className='flex justify-between items-center gap-4'>
              <Select
                value={selectedAsset} 
                onValueChange={handleSelectAsset}
              >
                <SelectTrigger className="w-full max-w-[100px] border-none px-0">
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
              <Button variant="outline" size="sm">划转</Button>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-[#848e9c] text-sm'>钱包余额：{marginData.maintenanceMargin}</span>
              <span className='text-[#848e9c] text-sm'>未实现盈亏：{marginData.marginRatio}</span>
            </div>
          </div>
        </div>
      </div>
    // <div className="bg-gray-800 p-4 rounded-lg">
    //   {/* 保证金比率 */}
    //   <div className="mb-4">
    //     <div className="mb-2">
    //       <span className="text-gray-400">保证金比率</span>
    //     </div>
    //     <div className="flex justify-between items-center mb-2">
    //       <span className="text-lg font-bold text-white">{marginData.marginRatio}</span>
    //       <span className="text-gray-400 text-sm">账户维持保证金：{marginData.maintenanceMargin}</span>
    //     </div>
    //   </div>
      
    //   {/* 资产信息 */}
    //   <div>
    //     <div className="flex justify-between items-center mb-3">
    //       {/* 资产选择器 */}
    //       <div className="relative">
    //         <div 
    //           className="flex items-center space-x-2 cursor-pointer" 
    //           onClick={() => setDropdownOpen(!dropdownOpen)}
    //         >
    //           <span className="text-lg font-medium text-white">{selectedAsset}</span>
    //           <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    //           </svg>
    //         </div>
            
    //         {/* 资产下拉选择框 */}
    //         {dropdownOpen && (
    //           <div className="absolute z-10 w-48 mt-2 bg-gray-700 rounded-lg shadow-lg">
    //             {Object.keys(assets).map((asset) => (
    //               <div
    //                 key={asset}
    //                 className={`px-4 py-2 cursor-pointer hover:bg-gray-600 ${
    //                   selectedAsset === asset ? 'bg-gray-600' : ''
    //                 }`}
    //                 onClick={() => handleSelectAsset(asset)}
    //               >
    //                 <span className="font-medium text-white">{asset}</span>
    //               </div>
    //             ))}
    //           </div>
    //         )}
    //       </div>
          
    //       {/* 划转按钮 */}
    //       <button 
    //         onClick={handleTransfer}
    //         className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    //       >
    //         划转
    //       </button>
    //     </div>
        
    //     {/* 资产余额信息 */}
    //     <div className="grid grid-cols-2 gap-4">
    //       <div>
    //         <div className="text-[#848e9c] text-sm">钱包余额</div>
    //         <div className="text-lg font-semibold text-white">
    //           {currentAsset.balance} {selectedAsset}
    //         </div>
    //       </div>
    //       <div>
    //         <div className="text-[#848e9c] text-sm">未实现盈亏</div>
    //         <div className="text-lg font-semibold text-white">
    //           {currentAsset.available} {selectedAsset}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
} 