import React, { useState } from 'react';

// 保证金模式
type MarginMode = 'cross' | 'isolated';
// 交易类型
type TradeType = 'open' | 'close';
// 订单类型
type OrderType = 'limit' | 'market';
// 交易方向
type TradeSide = 'long' | 'short';
// 单位类型
type UnitType = 'USDT' | 'TOKEN';

export function TradingForm({ symbol = 'BTCUSDT' }: { symbol?: string }) {
  // 保证金模式：全仓或逐仓
  const [marginMode, setMarginMode] = useState<MarginMode>('cross');
  // 杠杆倍数
  const [leverage, setLeverage] = useState<number>(20);
  // 是否显示杠杆调整弹窗
  const [showLeverageModal, setShowLeverageModal] = useState<boolean>(false);
  // 是否显示保证金模式弹窗
  const [showMarginModeModal, setShowMarginModeModal] = useState<boolean>(false);
  // 交易类型：开仓或平仓
  const [tradeType, setTradeType] = useState<TradeType>('open');
  // 订单类型：限价或市价
  const [orderType, setOrderType] = useState<OrderType>('limit');
  // 价格输入
  const [price, setPrice] = useState<string>('');
  // 数量输入
  const [amount, setAmount] = useState<string>('');
  // 单位类型：USDT或代币
  const [unitType, setUnitType] = useState<UnitType>('USDT');
  // 是否启用止盈止损
  const [enableTakeProfit, setEnableTakeProfit] = useState<boolean>(false);
  const [enableStopLoss, setEnableStopLoss] = useState<boolean>(false);
  // 止盈止损价格
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');

  // 模拟数据 - 可用余额
  const availableBalance = '10,000.00';
  
  // 获取交易对中的币种名称（如BTCUSDT中的BTC）
  const tokenName = symbol.replace('USDT', '');

  // 处理开仓操作
  const handlePlaceOrder = (side: TradeSide) => {
    alert(`${side === 'long' ? '开多' : '开空'} ${amount} ${unitType === 'USDT' ? 'USDT' : tokenName}，价格：${price || '市价'}`);
  };

  // 渲染杠杆调整弹窗
  const renderLeverageModal = () => {
    if (!showLeverageModal) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowLeverageModal(false)}></div>
        <div className="bg-gray-800 p-6 rounded-lg w-96 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">调整杠杆</h3>
            <button onClick={() => setShowLeverageModal(false)} className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white">{leverage}x</span>
              <span className="text-gray-400">最大可用: 125x</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="125" 
              value={leverage} 
              onChange={e => setLeverage(Number(e.target.value))}
              className="w-full"
            />
            <div className="grid grid-cols-5 gap-2 mt-2">
              {[5, 10, 20, 50, 75].map(value => (
                <button 
                  key={value}
                  onClick={() => setLeverage(value)}
                  className={`px-2 py-1 rounded ${
                    leverage === value ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {value}x
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowLeverageModal(false)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            确认
          </button>
        </div>
      </div>
    );
  };

  // 渲染保证金模式弹窗
  const renderMarginModeModal = () => {
    if (!showMarginModeModal) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMarginModeModal(false)}></div>
        <div className="bg-gray-800 p-6 rounded-lg w-96 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">切换保证金模式</h3>
            <button onClick={() => setShowMarginModeModal(false)} className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-3 mb-4">
            <button 
              onClick={() => setMarginMode('cross')}
              className={`w-full flex items-center p-3 rounded ${
                marginMode === 'cross' ? 'bg-gray-700 border border-blue-500' : 'bg-gray-700'
              }`}
            >
              <div className="mr-3">
                {marginMode === 'cross' && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">全仓模式</div>
                <div className="text-gray-400 text-sm">所有全仓仓位共享账户中全部可用余额</div>
              </div>
            </button>
            
            <button 
              onClick={() => setMarginMode('isolated')}
              className={`w-full flex items-center p-3 rounded ${
                marginMode === 'isolated' ? 'bg-gray-700 border border-blue-500' : 'bg-gray-700'
              }`}
            >
              <div className="mr-3">
                {marginMode === 'isolated' && (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <div className="text-white font-medium">逐仓模式</div>
                <div className="text-gray-400 text-sm">需为各个逐仓仓位分配特定数量的保证金</div>
              </div>
            </button>
          </div>
          <button 
            onClick={() => setShowMarginModeModal(false)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            确认
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      {/* 头部保证金模式和杠杆设置 */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => setShowMarginModeModal(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          <span className="text-white">{marginMode === 'cross' ? '全仓' : '逐仓'}</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <button 
          onClick={() => setShowLeverageModal(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          <span className="text-white">{leverage}x</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* 开仓/平仓切换 */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 text-center ${
            tradeType === 'open' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-400 border-b border-gray-700'
          }`}
          onClick={() => setTradeType('open')}
        >
          开仓
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            tradeType === 'close' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-400 border-b border-gray-700'
          }`}
          onClick={() => setTradeType('close')}
        >
          平仓
        </button>
      </div>
      
      {/* 限价/市价切换 */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            orderType === 'limit' 
              ? 'bg-gray-700 text-blue-500' 
              : 'bg-gray-700 text-gray-400'
          }`}
          onClick={() => setOrderType('limit')}
        >
          限价
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            orderType === 'market' 
              ? 'bg-gray-700 text-blue-500' 
              : 'bg-gray-700 text-gray-400'
          }`}
          onClick={() => setOrderType('market')}
        >
          市价
        </button>
      </div>
      
      {/* 可用余额 */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-400">可用</span>
        <span className="text-white">{availableBalance} USDT</span>
      </div>
      
      {/* 价格输入 - 仅限价单显示 */}
      {orderType === 'limit' && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              className="w-full bg-gray-700 text-white p-3 pr-16 rounded-lg focus:outline-none"
              placeholder="价格"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              USDT
            </div>
          </div>
        </div>
      )}
      
      {/* 数量输入 */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-gray-700 text-white p-3 pr-24 rounded-lg focus:outline-none"
            placeholder="数量"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={() => setUnitType(unitType === 'USDT' ? 'TOKEN' : 'USDT')}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 bg-gray-600 rounded-r-lg"
          >
            {unitType === 'USDT' ? 'USDT' : tokenName}
          </button>
        </div>
      </div>
      
      {/* 数量百分比选择 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {['25%', '50%', '75%', '100%'].map((percent) => (
          <button
            key={percent}
            className="bg-gray-700 text-gray-300 py-1 rounded-lg hover:bg-gray-600"
            onClick={() => {
              // 模拟根据百分比计算数量
              const maxAmount = 1000;
              const percentage = parseInt(percent) / 100;
              setAmount((maxAmount * percentage).toString());
            }}
          >
            {percent}
          </button>
        ))}
      </div>
      
      {/* 止盈止损 */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableTakeProfit"
            checked={enableTakeProfit}
            onChange={() => setEnableTakeProfit(!enableTakeProfit)}
            className="mr-2"
          />
          <label htmlFor="enableTakeProfit" className="text-gray-300">止盈</label>
          
          {enableTakeProfit && (
            <div className="relative ml-4 flex-1">
              <input
                type="text"
                className="w-full bg-gray-700 text-white p-2 pr-16 rounded-lg focus:outline-none"
                placeholder="止盈价格"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                USDT
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableStopLoss"
            checked={enableStopLoss}
            onChange={() => setEnableStopLoss(!enableStopLoss)}
            className="mr-2"
          />
          <label htmlFor="enableStopLoss" className="text-gray-300">止损</label>
          
          {enableStopLoss && (
            <div className="relative ml-4 flex-1">
              <input
                type="text"
                className="w-full bg-gray-700 text-white p-2 pr-16 rounded-lg focus:outline-none"
                placeholder="止损价格"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                USDT
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 交易按钮 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
          onClick={() => handlePlaceOrder('long')}
        >
          开多
        </button>
        <button
          className="bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
          onClick={() => handlePlaceOrder('short')}
        >
          开空
        </button>
      </div>
      
      {/* 价格信息显示 */}
      <div className="bg-gray-700 p-3 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">开多强平价</div>
            <div className="text-white">≈ 58,428.50 USDT</div>
          </div>
          <div>
            <div className="text-gray-400">开空强平价</div>
            <div className="text-white">≈ 79,254.30 USDT</div>
          </div>
          <div>
            <div className="text-gray-400">保证金</div>
            <div className="text-white">≈ 500.00 USDT</div>
          </div>
          <div>
            <div className="text-gray-400">最大可开</div>
            <div className="text-white">≈ 2.5 BTC</div>
          </div>
        </div>
      </div>
      
      {/* 模态框 */}
      {renderLeverageModal()}
      {renderMarginModeModal()}
    </div>
  );
} 