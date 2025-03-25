import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface MarketPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: string;
  priceChangePercent: string;
}

interface MarketPairsListProps {
  pairs: MarketPair[];
  searchQuery: string;
  onSearch: (value: string) => void;
  onSelect: (symbol: string) => void;
}

const ITEM_HEIGHT = 40;
const SEARCH_HEIGHT = 48;
const LIST_HEIGHT = 300;

const MarketPairsList: React.FC<MarketPairsListProps> = ({
  pairs,
  searchQuery,
  onSearch,
  onSelect,
}) => {
  // 渲染单个交易对项
  const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const pair = pairs[index];
    return (
      <div style={style}>
        <SelectItem
          key={pair.symbol}
          value={pair.symbol}
          className="cursor-pointer"
          onClick={() => onSelect(pair.symbol)}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-medium">{pair.baseAsset}</span>
              <span className="text-muted-foreground">/</span>
              <span>{pair.quoteAsset}</span>
            </div>
            {pair.lastPrice !== '0.00' && (
              <span className={
                parseFloat(pair.priceChangePercent) > 0 
                  ? "text-green-500" 
                  : "text-red-500"
              }>
                {pair.lastPrice}
              </span>
            )}
          </div>
        </SelectItem>
      </div>
    );
  });

  return (
    <div className="px-3 py-2">
      <div className="mb-2">
        <Input
          placeholder="搜索交易对..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="h-8"
        />
      </div>
      {pairs.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          未找到交易对
        </div>
      ) : (
        <List
          height={LIST_HEIGHT}
          itemCount={pairs.length}
          itemSize={ITEM_HEIGHT}
          width="100%"
          className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        >
          {Row}
        </List>
      )}
    </div>
  );
};

export default React.memo(MarketPairsList); 