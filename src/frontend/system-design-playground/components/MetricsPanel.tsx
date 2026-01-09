import React, { useMemo, useEffect, useRef } from 'react';
import { Activity, ChevronDown } from 'lucide-react';
import { LatencyDistributionChart } from './LatencyDistributionChart';
import type { PercentileSimulationResult } from '../services/types/simulation.types';

interface MetricsPanelProps {
  percentileResult?: PercentileSimulationResult | null;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ percentileResult }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const prevResultRef = useRef<PercentileSimulationResult | null>(null);

  // Auto-highlight panel when new simulation results arrive
  useEffect(() => {
    if (percentileResult && percentileResult !== prevResultRef.current) {
      prevResultRef.current = percentileResult;
      
      // Add highlight animation
      if (panelRef.current) {
        panelRef.current.classList.add('ring-2', 'ring-green-500/50');
        setTimeout(() => {
          panelRef.current?.classList.remove('ring-2', 'ring-green-500/50');
        }, 2000);
      }
    }
  }, [percentileResult]);
  // Tạo mảng latencies từ percentileResult hoặc dữ liệu mẫu
  const latencies = useMemo(() => {
    if (!percentileResult) {
      // Dữ liệu mẫu khi chưa có simulation
      const sampleLatencies: number[] = [];
      for (let i = 0; i < 200; i++) {
        const base = 50 + Math.random() * 30;
        const spike = Math.random() > 0.9 ? Math.random() * 50 : 0;
        sampleLatencies.push(base + spike);
      }
      return sampleLatencies;
    }

    // Generate latency distribution từ percentile stats
    // Dùng normal distribution giữa min và max với p50, p95 làm markers
    const latencyArray: number[] = [];
    const { minLatencyMs, maxLatencyMs, p50LatencyMs, p95LatencyMs, simulationCount } = percentileResult;
    
    // Tạo distribution gần đúng từ percentile data
    for (let i = 0; i < simulationCount; i++) {
      const rand = Math.random();
      let latency: number;
      
      if (rand < 0.5) {
        // 50% dưới P50
        latency = minLatencyMs + (p50LatencyMs - minLatencyMs) * (rand * 2);
      } else if (rand < 0.95) {
        // 45% giữa P50 và P95
        latency = p50LatencyMs + (p95LatencyMs - p50LatencyMs) * ((rand - 0.5) / 0.45);
      } else {
        // 5% trên P95
        latency = p95LatencyMs + (maxLatencyMs - p95LatencyMs) * ((rand - 0.95) / 0.05);
      }
      
      latencyArray.push(latency);
    }
    
    return latencyArray;
  }, [percentileResult]);

  return (
    <div 
      ref={panelRef}
      className="h-48 bg-surface border-t border-border flex flex-col z-20 shrink-0 transition-all duration-300"
    >
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
        {/* Latency Distribution Chart */}
        <div className="flex-1 flex flex-col gap-2">
          <h4 className="text-xs text-secondary mb-1">
            Latency Distribution (P50 & P95)
            {percentileResult && (
              <span className="ml-2 text-[10px] text-green-400">
                • {percentileResult.simulationCount} requests simulated
              </span>
            )}
          </h4>
          <div className="flex-1">
            <LatencyDistributionChart latencies={latencies} binCount={15} />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="w-48 flex flex-col gap-4 border-l border-border pl-6 justify-center">
          <div>
            <p className="text-[10px] uppercase text-secondary font-medium tracking-wider">Avg Latency</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-mono font-medium text-white">
                {percentileResult ? percentileResult.avgLatencyMs.toFixed(1) : '--'}
              </span>
              <span className="text-xs text-secondary mb-1">ms</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase text-secondary font-medium tracking-wider">Max Latency</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-mono font-medium text-white">
                {percentileResult ? percentileResult.maxLatencyMs.toFixed(1) : '--'}
              </span>
              <span className="text-xs text-secondary mb-1">ms</span>
            </div>
          </div>
          {percentileResult?.bottlenecks && percentileResult.bottlenecks.length > 0 && (
            <div>
              <p className="text-[10px] uppercase text-secondary font-medium tracking-wider">Bottlenecks</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-medium text-red-500">
                  {percentileResult.bottlenecks.length}
                </span>
                <span className="text-xs text-red-400 mb-1">detected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};