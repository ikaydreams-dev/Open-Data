import { cn } from '../../lib/utils'

export function AdminStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  className 
}) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0;

  return (
    <div className={cn("bg-white p-6 rounded-xl border border-stone-200 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-stone-500">{title}</h3>
        {Icon && (
          <div className="p-2 bg-orange-50 rounded-lg">
            <Icon size={20} className="text-orange-600" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-stone-900">{value}</span>
      </div>
      
      {typeof trend !== 'undefined' && (
        <div className="mt-2 flex items-center text-sm">
          <span
            className={cn(
              "font-medium",
              isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-stone-500"
            )}
          >
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span className="text-stone-400 ml-2">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}