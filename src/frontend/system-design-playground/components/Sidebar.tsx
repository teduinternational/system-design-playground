import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { LibraryCategory, NodeType } from '../types';

const COMPONENT_LIBRARY: LibraryCategory[] = [
  {
    title: "Compute",
    items: [
      { type: NodeType.COMPUTE, label: "Server", iconName: "Server", color: "text-purple-400" },
      { type: NodeType.COMPUTE, label: "Function", iconName: "Zap", color: "text-blue-400" },
      { type: NodeType.COMPUTE, label: "Container", iconName: "Box", color: "text-orange-400" },
      { type: NodeType.COMPUTE, label: "Worker", iconName: "Cpu", color: "text-green-400" },
    ]
  },
  {
    title: "Storage",
    items: [
      { type: NodeType.STORAGE, label: "SQL Database", iconName: "Database", color: "text-yellow-400" },
      { type: NodeType.STORAGE, label: "NoSQL Store", iconName: "Database", color: "text-red-400" },
      { type: NodeType.STORAGE, label: "Object Storage", iconName: "HardDrive", color: "text-cyan-400" },
    ]
  },
  {
    title: "Networking",
    items: [
      { type: NodeType.NETWORKING, label: "CDN", iconName: "Globe", color: "text-gray-400" },
      { type: NodeType.NETWORKING, label: "Load Balancer", iconName: "Network", color: "text-indigo-400" },
      { type: NodeType.NETWORKING, label: "Firewall", iconName: "ShieldCheck", color: "text-red-500" },
    ]
  },
  {
    title: "Messaging",
    items: [
      { type: NodeType.MESSAGING, label: "Queue", iconName: "Layers", color: "text-fuchsia-400" },
    ]
  }
];

const IconMap: Record<string, React.FC<any>> = {
  Server, Box, Database, HardDrive, Globe, Network, ShieldCheck, Layers, Search, Cpu, Zap
};

export const Sidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0 z-10 h-full">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
          <input 
            className="w-full bg-background border border-border rounded-md py-1.5 pl-8 pr-3 text-xs text-white placeholder-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
            placeholder="Search components..." 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Library List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-6">
        {COMPONENT_LIBRARY.map((category) => (
          <div key={category.title}>
            <h3 className="px-3 text-[10px] uppercase font-bold text-secondary tracking-wider mb-2">
              {category.title}
            </h3>
            <div className="grid grid-cols-2 gap-2 px-1">
              {category.items
                .filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => {
                  const Icon = IconMap[item.iconName] || Box;
                  return (
                    <div 
                      key={item.label}
                      className="group flex flex-col items-center justify-center gap-2 p-3 rounded hover:bg-surface-hover border border-transparent hover:border-border cursor-grab active:cursor-grabbing transition-all active:bg-primary/10 active:border-primary/50"
                      draggable
                      onDragStart={(event) => onDragStart(event, item.type, item.label)}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-xs font-medium text-gray-300">{item.label}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Pro Tip */}
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <Zap className="text-primary w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white">Pro Tip</span>
            <span className="text-[10px] text-secondary">Hold Shift to snap to grid.</span>
          </div>
        </div>
      </div>
    </aside>
  );
};