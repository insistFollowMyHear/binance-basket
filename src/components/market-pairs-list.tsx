import React, { RefObject } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarketPairsListProps {
  pairs: any[];
  searchQuery: string;
  onSearch: (value: string) => void;
  onSelect: (symbol: string) => void;
  searchInputRef?: RefObject<HTMLInputElement>;
}

const MarketPairsList: React.FC<MarketPairsListProps> = ({
  pairs,
  searchQuery,
  onSearch,
  onSelect,
  searchInputRef
}) => {
  return (
    <div className="w-full">
      <div className="p-2">
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="搜索交易对..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full"
        />
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-1 p-2">
          {pairs.map((pair) => (
            <button
              key={pair.symbol}
              onClick={() => onSelect(pair.symbol)}
              className="flex items-center justify-between w-full p-2 text-sm rounded-md hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{pair.baseAsset}</span>
                <span className="text-muted-foreground">/</span>
                <span>{pair.quoteAsset}</span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MarketPairsList; 