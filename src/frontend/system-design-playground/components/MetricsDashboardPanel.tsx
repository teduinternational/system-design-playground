import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { KpiDashboard } from './KpiDashboard';
import type { SystemMetrics } from '../services/types/metrics.types';

interface MetricsDashboardPanelProps {
  metrics: SystemMetrics | null;
  loading?: boolean;
}

export const MetricsDashboardPanel: React.FC<MetricsDashboardPanelProps> = ({ 
  metrics, 
  loading = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-gray-900 border-b border-gray-800 transition-all">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">KPI Dashboard</h2>
          {loading && (
            <span className="text-xs text-blue-500 animate-pulse">Calculating...</span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Dashboard Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <KpiDashboard metrics={metrics} loading={loading} />
        </div>
      )}
    </div>
  );
};
