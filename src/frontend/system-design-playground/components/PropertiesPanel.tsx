import React from 'react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Network, 
  TrendingUp, 
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { Node } from '../types';

interface PropertiesPanelProps {
  selectedNode: Node | null;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode }) => {
  if (!selectedNode) {
    return (
      <aside className="w-80 bg-surface border-l border-border flex flex-col shrink-0 z-10 h-full items-center justify-center text-secondary">
        <div className="text-sm">Select a component to view properties</div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-surface border-l border-border flex flex-col shrink-0 z-10 h-full overflow-hidden">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shrink-0">
        <h2 className="font-medium text-sm">Properties</h2>
        <span className="text-xs text-secondary bg-surface-hover px-2 py-1 rounded">ID: {selectedNode.id}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Node Identity */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{selectedNode.data.label}</h3>
            <p className="text-xs text-secondary">{selectedNode.data.subLabel || 'General Purpose Compute'}</p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Compute Resources Group */}
        <div className="space-y-5">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              Compute Resources
            </h4>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Instance Type</label>
              <div className="relative">
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                  <option>General Purpose (Standard)</option>
                  <option>Compute Optimized</option>
                  <option>Memory Optimized</option>
                  <option>GPU Accelerated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">vCPU</label>
                <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2 py-1.5">
                  <input className="w-full bg-transparent border-none p-0 text-sm text-white font-mono focus:ring-0 outline-none" type="number" defaultValue="4" />
                  <span className="text-xs text-secondary">core</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Memory</label>
                <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2 py-1.5">
                  <input className="w-full bg-transparent border-none p-0 text-sm text-white font-mono focus:ring-0 outline-none" type="number" defaultValue="16" />
                  <span className="text-xs text-secondary">GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Group */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" />
              Storage & IO
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">Disk Size</label>
                <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2 py-1.5">
                  <input className="w-full bg-transparent border-none p-0 text-sm text-white font-mono focus:ring-0 outline-none" type="number" defaultValue="250" />
                  <span className="text-xs text-secondary">GB</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-400">IOPS (Max)</label>
                <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2 py-1.5">
                  <input className="w-full bg-transparent border-none p-0 text-sm text-white font-mono focus:ring-0 outline-none" type="number" defaultValue="5000" />
                </div>
              </div>
            </div>
          </div>

          {/* Networking Group */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <Network className="w-3.5 h-3.5" />
              Networking
            </h4>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Security Group Rules</label>
              <textarea 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs text-secondary font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-20 resize-none leading-relaxed"
                defaultValue={`Inbound: TCP 80, 443\nOutbound: All Traffic\nInternal: TCP 5432 (DB)`}
              />
            </div>
          </div>

          {/* Scaling Group */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Scaling Policy
            </h4>
            <div className="space-y-2">
              <div className="relative">
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                  <option>Auto-scale (CPU &gt; 70%)</option>
                  <option>Manual Provisioning</option>
                  <option>Predictive Scaling</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Maintenance Toggle */}
        <div className="bg-background/50 rounded-lg p-3 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">Maintenance Mode</span>
            <button className="w-9 h-5 bg-border rounded-full relative transition-colors duration-200">
              <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-gray-400 rounded-full transition-transform duration-200"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-4 border-t border-border flex gap-2 shrink-0 bg-surface">
        <button className="flex-1 py-2 px-4 rounded-md bg-surface-hover hover:bg-[#252836] text-white text-xs font-medium border border-border transition-colors">
          Reset
        </button>
        <button className="flex-1 py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow-[0_0_20px_-5px_rgba(43,75,238,0.3)] transition-colors">
          Apply Config
        </button>
      </div>
    </aside>
  );
};