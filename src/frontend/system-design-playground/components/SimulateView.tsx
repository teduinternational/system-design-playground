import React, { useEffect, useState } from 'react';
import { Terminal, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SimulateView: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    "[10:00:01] System initializing...",
    "[10:00:02] Loading configuration from map...",
    "[10:00:02] Connected to Compute Nodes (4/4)",
    "[10:00:03] Database connection established (PRIMARY_DB)",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = [
        `[10:00:${Math.floor(Math.random() * 50 + 10)}] GET /api/v1/users - 200 OK (45ms)`,
        `[10:00:${Math.floor(Math.random() * 50 + 10)}] POST /api/v1/orders - 201 Created (120ms)`,
        `[10:00:${Math.floor(Math.random() * 50 + 10)}] Cache hit for key: user_profile_123`,
        `[10:00:${Math.floor(Math.random() * 50 + 10)}] Database checkpoint created`,
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [...prev.slice(-10), randomMsg]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 bg-background p-6 flex gap-6 overflow-hidden">
      {/* Left: Visual Status */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-secondary uppercase font-bold">Health Score</span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">98.5%</div>
            <div className="w-full bg-background h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-green-500 h-full w-[98.5%]"></div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-secondary uppercase font-bold">Active Users</span>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">1,240</div>
            <div className="text-xs text-green-400 mt-1">+12% from last min</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-secondary uppercase font-bold">Latencies</span>
              <Activity className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-3xl font-mono font-bold text-white">45ms</div>
            <div className="text-xs text-secondary mt-1">p99</div>
          </div>
        </div>

        {/* Mock Live View */}
        <div className="flex-1 bg-surface border border-border rounded-lg p-4 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#3b3f54_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
          <h3 className="text-sm font-bold text-white mb-4 z-10">Live Traffic Map</h3>
          
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="relative w-64 h-64">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse delay-75"></div>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse delay-150"></div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse delay-300"></div>
              
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-8 border border-primary/40 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>
              <div className="absolute inset-16 border border-primary/60 rounded-full flex items-center justify-center bg-surface/50 backdrop-blur-sm">
                <span className="text-xs font-mono text-primary animate-pulse">PROCESSING</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Console Logs */}
      <div className="w-96 bg-[#09090b] border border-border rounded-lg flex flex-col font-mono text-xs">
        <div className="h-8 bg-surface border-b border-border flex items-center px-3 gap-2">
          <Terminal className="w-3.5 h-3.5 text-secondary" />
          <span className="text-gray-400">System Logs</span>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-green-500">➜</span>
              <span className="text-gray-300">{log}</span>
            </div>
          ))}
          <div className="animate-pulse text-primary">_</div>
        </div>
      </div>
    </div>
  );
};