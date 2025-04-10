import React from 'react';
import { SymbolHeader } from './components/SymbolHeader';
import { TradingForm } from './components/TradingForm';
import { AccountModule } from './components/AccountModule';
import { OrderHistory } from './components/OrderHistory';

export function UsdsFutures() {
  return (
    <div className="container mx-auto px-4  space-y-4">
      <SymbolHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <TradingForm />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <AccountModule />
          
          <OrderHistory />
        </div>
      </div>
    </div>
  );
}