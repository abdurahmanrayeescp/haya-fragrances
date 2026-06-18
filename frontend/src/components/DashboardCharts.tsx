'use client';

import { useState } from 'react';
import { TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';

interface MonthlyTrend {
  month: string;
  revenue: number;
  orders: number;
}

interface BrandDist {
  brand: string;
  count: number;
}

interface DashboardChartsProps {
  trends: MonthlyTrend[];
  brands: BrandDist[];
}

export function DashboardCharts({ trends = [], brands = [] }: DashboardChartsProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Fallback data if trends/brands are empty
  const defaultTrends: MonthlyTrend[] = [
    { month: 'Jan', revenue: 4500, orders: 15 },
    { month: 'Feb', revenue: 6200, orders: 20 },
    { month: 'Mar', revenue: 5800, orders: 18 },
    { month: 'Apr', revenue: 8900, orders: 28 },
    { month: 'May', revenue: 11200, orders: 35 },
    { month: 'Jun', revenue: 14800, orders: 48 }
  ];

  const defaultBrands: BrandDist[] = [
    { brand: 'Tom Ford', count: 5 },
    { brand: 'Chanel', count: 4 },
    { brand: 'Dior', count: 3 },
    { brand: 'YSL', count: 2 },
    { brand: 'Armani', count: 2 }
  ];

  const trendData = trends.length > 0 ? trends : defaultTrends;
  const brandData = brands.length > 0 ? brands : defaultBrands;

  // Calculate SVG heights and scales
  const maxRevenue = Math.max(...trendData.map((d) => d.revenue));
  const maxCount = Math.max(...brandData.map((d) => d.count));

  // Chart width/height variables
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 40;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
      {/* Sales Trend Bar Chart */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1F1F23] pb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-white text-sm font-semibold tracking-wider">MONTHLY REVENUE</h3>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#AEAEB2]">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-500 font-bold">+18.5%</span>
            <span>vs last month</span>
          </div>
        </div>

        {/* SVG Render */}
        <div className="relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
            {/* Gradients */}
            <defs>
              <linearGradient id="goldBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5E0A3" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => (
              <line
                key={idx}
                x1={padding}
                y1={padding + chartHeight * r}
                x2={svgWidth - padding}
                y2={padding + chartHeight * r}
                stroke="#1F1F23"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}

            {/* Render bars */}
            {trendData.map((d, idx) => {
              const barWidth = chartWidth / trendData.length - 16;
              const x = padding + idx * (chartWidth / trendData.length) + 8;
              const barHeight = maxRevenue > 0 ? (d.revenue / maxRevenue) * chartHeight : 0;
              const y = svgHeight - padding - barHeight;

              return (
                <g key={idx} onMouseEnter={() => setHoveredBar(idx)} onMouseLeave={() => setHoveredBar(null)}>
                  {/* Invisible broad hover area */}
                  <rect
                    x={x - 4}
                    y={padding}
                    width={barWidth + 8}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                  />
                  
                  {/* Actual visual bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#goldBarGrad)"
                    stroke="#D4AF37"
                    strokeWidth={hoveredBar === idx ? '2' : '0'}
                    rx="2"
                    className="transition-all duration-300 cursor-pointer"
                  />

                  {/* Month axis text */}
                  <text
                    x={x + barWidth / 2}
                    y={svgHeight - padding + 18}
                    fill="#AEAEB2"
                    fontSize="10"
                    textAnchor="middle"
                    className="font-medium"
                  >
                    {d.month.substring(0, 3)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive tooltips */}
          {hoveredBar !== null && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1F1F23]/90 border border-[#D4AF37]/35 rounded px-3 py-1.5 text-[11px] tracking-wide text-white backdrop-blur-sm pointer-events-none">
              <span className="text-[#D4AF37] font-semibold">{trendData[hoveredBar].month}</span>:{' '}
              <span className="font-bold">${trendData[hoveredBar].revenue.toFixed(2)}</span> ({trendData[hoveredBar].orders} orders)
            </div>
          )}
        </div>
      </div>

      {/* Brand Distribution Chart */}
      <div className="glass-card p-6 rounded-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#1F1F23] pb-4">
          <PieIcon className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-white text-sm font-semibold tracking-wider">BRAND DISTRIBUTION</h3>
        </div>

        <div className="space-y-4">
          {brandData.map((b, idx) => {
            const percentage = maxCount > 0 ? (b.count / maxCount) * 100 : 0;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs tracking-wider">
                  <span className="text-white font-medium">{b.brand}</span>
                  <span className="text-[#D4AF37] font-bold">{b.count} Items</span>
                </div>
                {/* Custom animated progress line */}
                <div className="w-full bg-[#1F1F23] h-2 rounded overflow-hidden">
                  <div
                    className="gold-bg-gradient h-full rounded transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
