
"use client"

import { Line, LineChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartTooltip, ChartTooltipContent, ChartContainer, ChartConfig } from '@/components/ui/chart';
import { ChartLegend, ChartLegendContent } from './ui/chart';

interface ActivityChartProps {
  data: any[];
  config: ChartConfig;
  dataKey: string;
  timeKey: string;
  type: 'bar' | 'line';
  goal?: number;
}

export default function ActivityChart({ data, config, dataKey, timeKey, type, goal }: ActivityChartProps) {
  const ChartComponent = type === 'line' ? LineChart : BarChart;
  
  return (
    <ChartContainer config={config} className="h-full w-full">
      <ResponsiveContainer>
        <ChartComponent data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={timeKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />

          {goal && (
            <ReferenceLine y={goal} label={{ value: 'Target', position: 'insideTopLeft' }} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
          )}
          
          {type === 'line' ? (
            <Line dataKey={dataKey} type="monotone" stroke={`var(--color-${dataKey})`} strokeWidth={2} dot={{ r: 4, fill: `var(--color-${dataKey})` }} />
          ) : (
            <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={4} />
          )}

        </ChartComponent>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
