export interface PriceChangeStatistics {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
};

export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  
}