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
  ArrowRight
} from 'lucide-react';
import { NodeData } from '../types';

const IconMap: Record<string, React.FC<any>> = {
  Server, Box, Database, HardDrive, Globe, Network, ShieldCheck, Layers, Search, Cpu, Zap
};

export const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const Icon = data.iconName ? IconMap[data.iconName] : Box;
  
  // Xác định màu sắc dựa trên trạng thái hoặc loại (có thể mở rộng logic này)
  const isSimulating = data.isSimulating;
  
  return (
    <div className={`
      relative min-w-[180px] rounded-lg border-2 bg-surface transition-all duration-200 group
      ${selected ? 'border-primary shadow-[0_0_15px_rgba(43,75,238,0.3)]' : 'border-border hover:border-gray-500'}
    `}>
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-3 !h-3 !bg-secondary !border-2 !border-surface group-hover:!bg-primary transition-colors" 
      />

      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Icon Container */}
          <div className={`
            w-10 h-10 rounded flex items-center justify-center shrink-0
            ${selected ? 'bg-primary text-white' : 'bg-surface-hover text-secondary'}
          `}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>

          {/* Label Info */}
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-gray-200 truncate block">{data.label}</span>
            <span className="text-[10px] text-gray-500 truncate block">{data.subLabel || data.type}</span>
          </div>
        </div>

        {/* Simulation Stats Overlay */}
        {isSimulating && data.stats && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-700 space-y-2 animate-in fade-in duration-300">
            
            {/* CPU Bar */}
            <div className="space-y-1">
               <div className="flex justify-between text-[9px] uppercase font-mono text-gray-400">
                 <span>Load</span>
                 <span className={data.stats.cpu > 80 ? 'text-red-400' : 'text-green-400'}>{data.stats.cpu}%</span>
               </div>
               <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                 <div 
                    className={`h-full rounded-full transition-all duration-500 ${data.stats.cpu > 80 ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${data.stats.cpu}%` }}
                 />
               </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-background/50 rounded px-2 py-1 border border-border">
                <div className="text-[9px] text-gray-500 uppercase">Req/s</div>
                <div className="text-xs font-mono text-blue-400">{data.stats.requests}</div>
              </div>
              <div className="bg-background/50 rounded px-2 py-1 border border-border">
                <div className="text-[9px] text-gray-500 uppercase">Lat</div>
                <div className="text-xs font-mono text-yellow-400">{data.stats.latency}ms</div>
              </div>
            </div>

            {/* Processing Indicator */}
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3 !h-3 !bg-secondary !border-2 !border-surface group-hover:!bg-primary transition-colors" 
      />
    </div>
  );
});