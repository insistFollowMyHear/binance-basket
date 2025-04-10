import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SymbolHeaderProps } from '../types';

// 交易对数据接口
const SymbolHeader = React.memo(({ priceChangeStatistics }: SymbolHeaderProps) => {
  console.log(priceChangeStatistics);

  // 当前选中的交易对
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  // 交易对下拉框是否展开
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  // 搜索关键词
  const [searchText, setSearchText] = useState<string>('');
  
  // 模拟交易对列表数据
  const symbols: any[] = [
    { symbol: 'BTCUSDT', lastPrice: '68,245.50', priceChangePercent: '+2.35', volume: '12.5B', high: '68,980.20', low: '67,125.30' },
    { symbol: 'ETHUSDT', lastPrice: '3,450.75', priceChangePercent: '+1.78', volume: '4.2B', high: '3,510.40', low: '3,380.20' },
    { symbol: 'BNBUSDT', lastPrice: '578.45', priceChangePercent: '-0.52', volume: '850M', high: '585.20', low: '572.30' },
    { symbol: 'ADAUSDT', lastPrice: '0.45', priceChangePercent: '+0.68', volume: '210M', high: '0.47', low: '0.44' },
    { symbol: 'DOGEUSDT', lastPrice: '0.1435', priceChangePercent: '+5.23', volume: '580M', high: '0.1510', low: '0.1380' },
  ];
  
  // 获取当前选中的交易对信息
  const currentSymbol = symbols.find(s => s.symbol === selectedSymbol) || symbols[0];
  
  // 过滤交易对列表
  const filteredSymbols = symbols.filter(s => 
    s.symbol.toLowerCase().includes(searchText.toLowerCase())
  );

  // 切换交易对
  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setDropdownOpen(false);
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        {/* 交易对选择器 */}
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-xl font-bold text-white">{selectedSymbol}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {/* 下拉选择框 */}
          {dropdownOpen && (
            <div className="absolute z-10 w-80 mt-2 bg-gray-700 rounded-lg shadow-lg">
              <div className="p-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none"
                  placeholder="搜索交易对"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredSymbols.map((symbol) => (
                  <div
                    key={symbol.symbol}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-600 ${
                      selectedSymbol === symbol.symbol ? 'bg-gray-600' : ''
                    }`}
                    onClick={() => handleSelectSymbol(symbol.symbol)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{symbol.symbol}</span>
                      <span className={`font-medium ${
                        Number(symbol.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {symbol.lastPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 交易对信息 */}
        <div className="flex space-x-6">
          <div>
            <div className="text-gray-400 text-sm">最新价格</div>
            <div className={`text-lg font-semibold ${
              Number(currentSymbol.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {currentSymbol.lastPrice}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">24h涨跌</div>
            <div className={`text-lg font-semibold ${
              Number(currentSymbol.priceChangePercent) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {Number(currentSymbol.priceChangePercent) >= 0 ? '+' : ''}{currentSymbol.priceChangePercent}%
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">24h成交额</div>
            <div className="text-lg font-semibold text-white">{currentSymbol.volume}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">24h最高</div>
            <div className="text-lg font-semibold text-white">{currentSymbol.high}</div>
          </div>
          <div>
            <div className="text-gray-400 text-sm">24h最低</div>
            <div className="text-lg font-semibold text-white">{currentSymbol.low}</div>
          </div>
        </div>
      </div>
    </Card>
  );
});

export default SymbolHeader;