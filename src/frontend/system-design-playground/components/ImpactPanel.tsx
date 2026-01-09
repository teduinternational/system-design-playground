import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import type { MetricsDiff } from '../services/types/metrics.types';

interface ImpactPanelProps {
  diff: MetricsDiff;
  isVisible: boolean;
  onClose: () => void;
}

interface MetricChangeProps {
  label: string;
  value: string;
  trend: 'up' | 'down';
  color: 'green' | 'red' | 'orange' | 'blue';
  icon: React.ReactNode;
}

const MetricChange: React.FC<MetricChangeProps> = ({ label, value, trend, color, icon }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  
  const colorClasses = {
    green: 'bg-green-500/10 border-green-500 text-green-500',
    red: 'bg-red-500/10 border-red-500 text-red-500',
    orange: 'bg-orange-500/10 border-orange-500 text-orange-500',
    blue: 'bg-blue-500/10 border-blue-500 text-blue-500',
  };

  return (
    <div className={`border rounded-lg p-3 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <TrendIcon className="w-5 h-5" />
        <span className="text-xl font-bold">{value}</span>
      </div>
    </div>
  );
};

export const ImpactPanel: React.FC<ImpactPanelProps> = ({ diff, isVisible, onClose }) => {
  if (!isVisible) return null;

  const formatCost = (delta: number) => {
    const sign = delta >= 0 ? '+' : '';
    return `${sign}$${Math.abs(delta).toFixed(2)}`;
  };

  const formatPercentage = (delta: number) => {
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${(delta * 100).toFixed(2)}%`;
  };

  const formatScore = (delta: number) => {
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta}`;
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-white">What-if Impact Analysis</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-400 mb-4">
          Preview of changes if you apply this configuration:
        </p>

        {/* Cost Impact */}
        <MetricChange
          label="Monthly Cost"
          value={formatCost(diff.costDelta)}
          trend={diff.costDelta >= 0 ? 'up' : 'down'}
          color={diff.costDelta >= 0 ? 'orange' : 'green'}
          icon={<DollarSign className="w-4 h-4" />}
        />

        {/* Error Rate Impact */}
        <MetricChange
          label="Error Rate"
          value={formatPercentage(diff.errorRateDelta)}
          trend={diff.errorRateDelta >= 0 ? 'up' : 'down'}
          color={diff.errorRateDelta <= 0 ? 'green' : 'red'}
          icon={<AlertTriangle className="w-4 h-4" />}
        />

        {/* Health Score Impact */}
        <MetricChange
          label="Health Score"
          value={formatScore(diff.healthScoreDelta)}
          trend={diff.healthScoreDelta >= 0 ? 'up' : 'down'}
          color={diff.healthScoreDelta >= 0 ? 'green' : 'red'}
          icon={<Activity className="w-4 h-4" />}
        />

        {/* Availability Impact */}
        <MetricChange
          label="Availability"
          value={formatPercentage(diff.availabilityDelta)}
          trend={diff.availabilityDelta >= 0 ? 'up' : 'down'}
          color={diff.availabilityDelta >= 0 ? 'green' : 'red'}
          icon={<Activity className="w-4 h-4" />}
        />
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-800 rounded-b-lg">
        <p className="text-xs text-gray-400 italic">
          💡 Adjust instance count to see real-time cost and performance impact
        </p>
      </div>
    </div>
  );
};
