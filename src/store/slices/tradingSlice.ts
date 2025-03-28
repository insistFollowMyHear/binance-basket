import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MarketPair } from '@/pages/spotTrading/types';

interface TradingState {
  selectedPair: MarketPair | null;
}

const initialState: TradingState = {
  selectedPair: null
};

export const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setSelectedPair: (state, action: PayloadAction<MarketPair>) => {
      state.selectedPair = action.payload;
    }
  }
});

export const { setSelectedPair } = tradingSlice.actions;

export default tradingSlice.reducer; 