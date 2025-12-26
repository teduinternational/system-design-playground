import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Server, 
  Box, 
  Database, 
  HardDrive, 
  Globe, 
  Network, 
  ShieldCheck, 
  Layers,
  Search,
  Cpu,
  Zap,
  Activity,
  ArrowRight,
  Shield,
  Package,
  ShoppingCart,
  Workflow
} from 'lucide-react';

const IconMap: Record<string, React.FC<any>> = {
  Server, 
  Box, 
  Database, 
  HardDrive, 
  Globe, 
  Network, 
  ShieldCheck, 
  Layers, 
  Search, 
  Cpu, 
  Zap,
  Shield,
  Package,
  ShoppingCart,
  Workflow
};

export const CustomNode = memo(({ data, selected }: NodeProps<any>) => {
  const Icon = data.iconName ? IconMap[data.iconName] : Box;
  
  // Extract data
  const category = data.category || data.type || 'Unknown';
  const technologies = data.technologies?.join(', ') || data.subLabel || 'N/A';
  const isSimulating = data.isSimulating;
  const simulation = data.simulation || {};
  const props = data.props || {};
  
  // Calculate quick stats to display
  const instanceCount = props.instanceCount || 1;
  const latency = simulation.processingTimeMs;
  const reliability = simulation.failureRate !== undefined 
    ? ((1 - simulation.failureRate) * 100).toFixed(1) 
    : null;
  
  return (
    <div className={`
      relative min-w-[220px] rounded-xl border-2 bg-slate-900 transition-all duration-300 group
      ${selected 
        ? 'border-primary shadow-[0_0_25px_rgba(43,75,238,0.6)] ring-2 ring-primary/30' 
        : 'border-slate-700 hover:border-slate-500 hover:shadow-lg'
      }
    `}>
      {/* Input Handle - Left Side */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-slate-900 hover:!bg-blue-400 hover:!scale-125 transition-all !rounded-full" 
        style={{ left: -6 }}
      />

      {/* Node Content */}
      <div className="p-4">
        {/* Header with Icon and Title */}
        <div className="flex items-center gap-3 mb-3">
          {/* Icon Container with Glow */}
          <div className={`
            w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
            ${selected 
              ? 'bg-primary/20 text-primary ring-2 ring-primary/50 shadow-[0_0_15px_rgba(43,75,238,0.4)]' 
              : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
            }
          `}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>

          {/* Label Info */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-white truncate leading-tight">
              {technologies}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider truncate mt-0.5">
              {category}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-1.5 pt-3 border-t border-slate-800">
          {/* Instance Count */}
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Instances</span>
            <span className="text-cyan-400 font-mono font-semibold">{instanceCount}x</span>
          </div>
          
          {/* Latency */}
          {latency !== undefined && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Latency</span>
              <span className="text-amber-400 font-mono font-semibold">{latency}ms</span>
            </div>
          )}
          
          {/* Reliability */}
          {reliability !== null && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Uptime</span>
              <span className="text-emerald-400 font-mono font-semibold">{reliability}%</span>
            </div>
          )}
        </div>

        {/* Current Load Bar - Only show during simulation */}
        {simulation.currentLoad !== undefined && simulation.currentLoad > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center text-[10px] mb-1.5">
              <span className="text-slate-500 uppercase tracking-wide font-medium">Load</span>
              <span className={`font-mono font-bold ${
                simulation.currentLoad > 0.8 ? 'text-red-400' : 
                simulation.currentLoad > 0.6 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {(simulation.currentLoad * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  simulation.currentLoad > 0.8 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                  simulation.currentLoad > 0.6 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                  'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`} 
                style={{ width: `${simulation.currentLoad * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator - Top Right */}
      {data.status && (
        <div className="absolute -top-1.5 -right-1.5 z-10">
          <span className="relative flex h-4 w-4">
            {data.status === 'healthy' && isSimulating && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </>
            )}
            {data.status === 'healthy' && !isSimulating && (
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
            )}
            {data.status === 'warning' && (
              <>
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-900"></span>
              </>
            )}
            {data.status === 'error' && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-slate-900"></span>
              </>
            )}
            {data.status === 'idle' && (
              <span className="relative inline-flex rounded-full h-4 w-4 bg-slate-600 border-2 border-slate-900"></span>
            )}
          </span>
        </div>
      )}

      {/* Output Handle - Right Side */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-slate-900 hover:!bg-purple-400 hover:!scale-125 transition-all !rounded-full" 
        style={{ right: -6 }}
      />
    </div>
  );
});