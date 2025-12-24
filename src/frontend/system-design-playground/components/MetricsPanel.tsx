import React from 'react';
import { Activity, ChevronDown } from 'lucide-react';

export const MetricsPanel: React.FC = () => {
  return (
    <div className="h-48 bg-surface border-t border-border flex flex-col z-20 shrink-0">
      <div className="h-8 flex items-center justify-between px-4 border-b border-border bg-surface cursor-ns-resize hover:bg-surface-hover transition-colors">
        <div className="flex items-center gap-2">
          <Activity className="text-secondary w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">System Metrics</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-secondary">Real-time</span>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <button className="text-secondary hover:text-white">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 flex gap-6 overflow-hidden">
        {/* Chart Area (Simulated) */}
        <div className="flex-1 flex flex-col gap-2 relative">
          <h4 className="text-xs text-secondary mb-1">Total Request Latency (p99)</h4>
          <div className="flex-1 border-l border-b border-border relative flex items-end justify-between px-1 pb-px gap-1">
            {/* Grid Lines */}
            <div className="absolute top-[25%] w-full h-px bg-border/30 border-dashed border-t border-white/10"></div>
            <div className="absolute top-[50%] w-full h-px bg-border/30 border-dashed border-t border-white/10"></div>
            <div className="absolute top-[75%] w-full h-px bg-border/30 border-dashed border-t border-white/10"></div>
            
            {/* Bars */}
            {[30, 45, 40, 60, 55, 80, 70, 65, 50, 45, 55, 60, 75, 85, 90, 70, 60, 50, 40, 35].map((height, i) => (
               <div key={i} className={`w-1 bg-primary/${30 + height} h-[${height}%] rounded-t-sm`} style={{height: `${height}%`}}></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-secondary font-mono mt-1">
            <span>10:00</span>
            <span>10:05</span>
            <span>10:10</span>
            <span>10:15</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="w-48 flex flex-col gap-4 border-l border-border pl-6 justify-center">
          <div>
            <p className="text-[10px] uppercase text-secondary font-medium tracking-wider">Error Rate</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-mono font-medium text-white">0.02%</span>
              <span className="text-xs text-green-400 mb-1">↓ 12%</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase text-secondary font-medium tracking-wider">Throughput</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-mono font-medium text-white">4.5k</span>
              <span className="text-xs text-secondary mb-1">rps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};