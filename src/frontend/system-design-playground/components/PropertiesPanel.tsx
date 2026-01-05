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
import { useDiagramStore, useNode } from '../stores/useDiagramStore';

const PropertiesPanelComponent: React.FC = () => {
  // Subscribe only to selectedNodeId - this will only change when selection changes
  const selectedNodeId = useDiagramStore((state) => state.selectedNodeId);
  
  // Use optimized hook to get the node
  const selectedNode = useNode(selectedNodeId);
  
  // Debug: Log renders
  console.log('[PropertiesPanel] Render:', { selectedNodeId, hasNode: !!selectedNode });
  
  const updateNodeSimulation = useDiagramStore((state) => state.updateNodeSimulation);
  const updateNodeSpecs = useDiagramStore((state) => state.updateNodeSpecs);

  const handleSimulationChange = (field: string, value: number) => {
    if (!selectedNode) return;
    
    updateNodeSimulation(selectedNode.id, {
      [field]: value,
    } as any);
  };

  const handlePropsChange = (field: string, value: any) => {
    if (!selectedNode) return;
    
    updateNodeSpecs(selectedNode.id, {
      [field]: value,
    });
  };

  if (!selectedNode) {
    return (
      <aside className="w-80 bg-surface border-l border-border flex flex-col shrink-0 z-10 h-full items-center justify-center text-secondary">
        <div className="text-sm">Select a component to view properties</div>
      </aside>
    );
  }

  const simulation = selectedNode.data.simulation || { processingTimeMs: 0, failureRate: 0 };
  const category = selectedNode.data.category || 'Unknown';
  const technologies = selectedNode.data.technologies?.join(', ') || 'N/A';
  const props = selectedNode.data.props || {};

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
            <h3 className="text-base font-semibold text-white">{category}</h3>
            <p className="text-xs text-secondary">{technologies}</p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Technical Properties */}
        {Object.keys(props).length > 0 && (
          <>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" />
                Technical Configuration
              </h4>
              
              {/* Render all properties as editable fields */}
              {Object.entries(props).map(([key, value]) => {
                // Format the key to display name
                const displayName = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim();
                
                // Determine input type based on value type
                if (typeof value === 'boolean') {
                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">{displayName}</label>
                      <select
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        value={value ? 'true' : 'false'}
                        onChange={(e) => handlePropsChange(key, e.target.value === 'true')}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  );
                } else if (typeof value === 'number') {
                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">{displayName}</label>
                      <input
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                        type="number"
                        value={value}
                        onChange={(e) => handlePropsChange(key, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  );
                } else {
                  // String values
                  return (
                    <div key={key} className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-400">{displayName}</label>
                      <input
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                        type="text"
                        value={String(value)}
                        onChange={(e) => handlePropsChange(key, e.target.value)}
                      />
                    </div>
                  );
                }
              })}
            </div>
            
            <hr className="border-border" />
          </>
        )}
            
            {simulation.currentLoad !== undefined && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Current Load</label>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{(simulation.currentLoad * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        simulation.currentLoad > 0.8 ? 'bg-red-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${simulation.currentLoad * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

        {/* Simulation Parameters */}
        <div className="space-y-5">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Simulation Parameters
            </h4>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Processing Time (ms)</label>
              <input 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                type="number" 
                value={simulation.processingTimeMs}
                onChange={(e) => handleSimulationChange('processingTimeMs', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Jitter (ms)</label>
              <input 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                type="number" 
                value={simulation.jitterMs || 0}
                onChange={(e) => handleSimulationChange('jitterMs', parseFloat(e.target.value))}
              />
              <p className="text-[10px] text-gray-500">Random latency variation (0-jitter ms)</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Capacity (req/s)</label>
              <input 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                type="number" 
                value={simulation.capacity || 0}
                onChange={(e) => handleSimulationChange('capacity', parseFloat(e.target.value))}
              />
              <p className="text-[10px] text-gray-500">Max requests/second (causes queuing delay when exceeded)</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Failure Rate (0.0 - 1.0)</label>
              <input 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                type="number" 
                step="0.001"
                min="0"
                max="1"
                value={simulation.failureRate}
                onChange={(e) => handleSimulationChange('failureRate', parseFloat(e.target.value))}
              />
            </div>

            {simulation.queueSize !== undefined && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Queue Size</label>
                <input 
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                  type="number" 
                  value={simulation.queueSize}
                  onChange={(e) => handleSimulationChange('queueSize', parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        <hr className="border-border" />

        {/* Node Status */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary">Status</h4>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              selectedNode.data.status === 'healthy' ? 'bg-green-500' :
              selectedNode.data.status === 'warning' ? 'bg-yellow-500' :
              selectedNode.data.status === 'error' ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-sm capitalize">{selectedNode.data.status || 'idle'}</span>
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

// Memoize component to prevent unnecessary re-renders from parent
export const PropertiesPanel = React.memo(PropertiesPanelComponent);