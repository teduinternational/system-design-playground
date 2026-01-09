import React from 'react';
import { DollarSign, Activity, Zap, AlertCircle } from 'lucide-react';
import { KpiCard } from './KpiCard';
import { GaugeChart } from './GaugeChart';
import type { SystemMetrics } from '../services/types/metrics.types';

interface KpiDashboardProps {
  metrics: SystemMetrics | null;
  loading?: boolean;
  compact?: boolean;
}

export const KpiDashboard: React.FC<KpiDashboardProps> = ({ 
  metrics, 
  loading = false,
  compact = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-gray-800 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No metrics available. Add nodes to your diagram to see KPIs.</p>
      </div>
    );
  }

  const getCostStatus = (cost: number): 'success' | 'warning' | 'danger' => {
    if (cost < 1000) return 'success';
    if (cost < 3000) return 'warning';
    return 'danger';
  };

  const getHealthStatus = (score: number): 'success' | 'warning' | 'danger' => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const getAvailabilityStatus = (availability: number): 'success' | 'warning' | 'danger' => {
    if (availability >= 99.9) return 'success';
    if (availability >= 99) return 'warning';
    return 'danger';
  };

  const getRatingBadgeColor = (rating: string): string => {
    const colors: Record<string, string> = {
      'Excellent': 'bg-green-500/20 text-green-500 border-green-500',
      'High Efficiency': 'bg-blue-500/20 text-blue-500 border-blue-500',
      'Medium Efficiency': 'bg-orange-500/20 text-orange-500 border-orange-500',
      'Needs Optimization': 'bg-red-500/20 text-red-500 border-red-500',
    };
    return colors[rating] || colors['Needs Optimization'];
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">${metrics.monthlyCost.toFixed(2)}/mo</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">{metrics.healthScore}/100</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">{metrics.availabilityPercentage.toFixed(2)}%</span>
        </div>
        <div className={`text-xs px-2 py-1 rounded border ${getRatingBadgeColor(metrics.efficiencyRating)}`}>
          {metrics.efficiencyRating}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Cost Card */}
        <KpiCard
          title="Monthly Cost"
          value={`$${metrics.monthlyCost.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          status={getCostStatus(metrics.monthlyCost)}
          subtitle="Estimated infrastructure cost"
          breakdown={metrics.costBreakdown}
          showBreakdown={true}
        />

        {/* Health Score Card */}
        <KpiCard
          title="System Health"
          value={`${metrics.healthScore}/100`}
          icon={<Activity className="w-5 h-5" />}
          status={getHealthStatus(metrics.healthScore)}
          subtitle="Overall system reliability"
        />

        {/* Availability Card */}
        <KpiCard
          title="Availability"
          value={`${metrics.availabilityPercentage.toFixed(2)}%`}
          icon={<Zap className="w-5 h-5" />}
          status={getAvailabilityStatus(metrics.availabilityPercentage)}
          subtitle="Expected uptime"
        />

        {/* Error Rate Card */}
        <KpiCard
          title="Error Rate"
          value={`${(metrics.overallErrorRate * 100).toFixed(2)}%`}
          icon={<AlertCircle className="w-5 h-5" />}
          status={metrics.overallErrorRate < 0.01 ? 'success' : metrics.overallErrorRate < 0.05 ? 'warning' : 'danger'}
          subtitle="Average failure rate"
        />
      </div>

      {/* Gauge and Efficiency Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Gauge */}
        <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/50">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Performance Score</h3>
          <div className="flex justify-center">
            <GaugeChart
              value={metrics.healthScore}
              label="Health Score"
              size="lg"
            />
          </div>
        </div>

        {/* Efficiency & Bottlenecks */}
        <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/50">
          <h3 className="text-sm font-medium text-gray-400 mb-4">System Analysis</h3>
          
          {/* Efficiency Badge */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Efficiency Rating</div>
            <div className={`inline-block px-4 py-2 rounded border text-sm font-medium ${getRatingBadgeColor(metrics.efficiencyRating)}`}>
              {metrics.efficiencyRating}
            </div>
          </div>

          {/* Bottlenecks */}
          {metrics.bottlenecks && metrics.bottlenecks.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Bottlenecks Detected</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {metrics.bottlenecks.map((bottleneck, index) => (
                  <div
                    key={index}
                    className="text-xs bg-red-500/10 border border-red-500/30 rounded px-2 py-1 text-red-400"
                  >
                    ⚠️ {bottleneck}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!metrics.bottlenecks || metrics.bottlenecks.length === 0) && (
            <div className="text-xs text-green-500 bg-green-500/10 border border-green-500/30 rounded px-2 py-1">
              ✅ No bottlenecks detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
