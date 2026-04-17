import { useMemo } from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { cn } from '../../lib/utils'

export function AnalyticsChart({ 
  data, 
  title, 
  dataKey = "value", 
  xAxisKey = "date",
  color = "#ea580c", // Tailwind orange-600
  className 
}) {
  
  // Custom Tooltip for Recharts to match the application's styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-stone-200 p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-stone-600 mb-1">{label}</p>
          <p className="text-lg font-bold text-orange-600">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("bg-white p-6 rounded-xl border border-stone-200 shadow-sm", className)}>
      {title && <h3 className="text-lg font-semibold text-stone-800 mb-6">{title}</h3>}
      
      <div className="h-[300px] w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
              <XAxis 
                dataKey={xAxisKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#78716c' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#78716c' }} 
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-stone-400 text-sm">
            No analytics data available for this period.
          </div>
        )}
      </div>
    </div>
  )
}