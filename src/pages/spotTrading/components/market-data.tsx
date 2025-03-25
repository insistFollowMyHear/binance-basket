import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";

const MarketData: React.FC = () => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle>市场数据</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <ArrowUpDown className="mx-auto h-12 w-12 mb-4" />
          <p>这里将显示交易图表</p>
          <p className="text-sm">价格走势、订单簿和深度图</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(MarketData); 