import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  status?: 'success' | 'warning' | 'danger' | 'info';
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  breakdown?: Record<string, number>;
  showBreakdown?: boolean;
}

const statusColors = {
  success: 'border-green-500 bg-green-500/10',
  warning: 'border-orange-500 bg-orange-500/10',
  danger: 'border-red-500 bg-red-500/10',
  info: 'border-blue-500 bg-blue-500/10',
};

const statusIconColors = {
  success: 'text-green-500',
  warning: 'text-orange-500',
  danger: 'text-red-500',
  info: 'text-blue-500',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  status = 'info',
  subtitle,
  trend,
  trendValue,
  breakdown,
  showBreakdown = false,
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className={`border rounded-lg p-4 ${statusColors[status]} transition-all hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className={statusIconColors[status]}>{icon}</div>}
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-white mb-1">{value}</div>

      {/* Subtitle */}
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}

      {/* Breakdown */}
      {showBreakdown && breakdown && Object.keys(breakdown).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Cost Breakdown</div>
          <div className="space-y-1">
            {Object.entries(breakdown).map(([category, cost]) => (
              <div key={category} className="flex justify-between text-xs">
                <span className="text-gray-500">{category}</span>
                <span className="text-gray-300 font-medium">${cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
