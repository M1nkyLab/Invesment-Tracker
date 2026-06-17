'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

interface PriceChartProps {
  data: any[];
}

export default function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[250px] mt-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 px-4 text-center">
        <LineChartIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Market Data Found</p>
        <p className="text-[10px] text-slate-400 mt-2 max-w-[200px] leading-relaxed">Click the "Refresh Market" button above to fetch the latest VOO price trends.</p>
      </div>
    );
  }

  // Sort data by date ascending for the chart
  const chartData = [...data].sort((a, b) => 
    new Date(a.price_date).getTime() - new Date(b.price_date).getTime()
  ).map(item => ({
    ...item,
    formattedDate: new Date(item.price_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    price: Number(item.closing_price).toFixed(2),
    sma30: item.sma_30 ? Number(item.sma_30).toFixed(2) : null,
  }));

  return (
    <div className="w-full h-[250px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis 
            dataKey="formattedDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 600 }}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--chart-axis)', fontSize: 10, fontWeight: 600 }}
            orientation="right"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--chart-tooltip-bg)', 
              border: '1px solid var(--card-border)', 
              borderRadius: '12px', 
              fontSize: '12px', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
            }}
            itemStyle={{ color: 'var(--foreground)', fontWeight: 700 }}
          />
          <Area 
            type="monotone" 
            dataKey="closing_price" 
            name="Price"
            stroke="#2563eb" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
          <Line 
            type="monotone" 
            dataKey="sma_30" 
            name="30-Day Average"
            stroke="#f59e0b" 
            strokeWidth={2} 
            dot={false}
            strokeDasharray="6 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
