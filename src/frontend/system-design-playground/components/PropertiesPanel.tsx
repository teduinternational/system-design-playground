import React from 'react';
import { 
  Server, 
  Zap,
  Settings,
  Activity
} from 'lucide-react';
import { useDiagramStore, useNode } from '../stores/useDiagramStore';

const PropertiesPanelComponent: React.FC = () => {
  // Subscribe only to selectedNodeId - this will only change when selection changes
  const selectedNodeId = useDiagramStore((state) => state.selectedNodeId);
  
  // Use optimized hook to get the node
  const selectedNode = useNode(selectedNodeId);
  
  // Debug: Log renders
  console.log('[PropertiesPanel] Render:', { selectedNodeId, hasNode: !!selectedNode });
  
  const updateNodeData = useDiagramStore((state) => state.updateNodeData);

  // Update handlers cho từng nhóm properties
  const handleSpecsChange = (field: string, value: number) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, {
      specs: {
        ...selectedNode.data.specs,
        [field]: value,
      },
    });
  };

  const handleSimulationChange = (field: string, value: number | undefined) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, {
      simulation: {
        ...selectedNode.data.simulation,
        [field]: value,
      },
    });
  };

  const handlePropsChange = (field: string, value: any) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, {
      props: {
        ...selectedNode.data.props,
        [field]: value,
      },
    });
  };

  const handleBasicInfoChange = (field: string, value: any) => {
    if (!selectedNode) return;
    updateNodeData(selectedNode.id, {
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

  // Extract data theo NodeModel structure
  const category = selectedNode.data.category || 'Unknown';
  const label = selectedNode.data.label || selectedNode.id;
  const technologies = selectedNode.data.technologies?.join(', ') || 'N/A';
  const provider = selectedNode.data.provider || '';
  const iconName = selectedNode.data.iconName || 'Server';
  const status = selectedNode.data.status || 'idle';
  
  // NodeSpecs - required fields
  const specs = selectedNode.data.specs || { 
    latencyBase: 10, 
    maxThroughput: 1000, 
    reliability: 0.99 
  };
  
  // SimulationProps
  const simulation = selectedNode.data.simulation || { 
    processingTimeMs: 10, 
    failureRate: 0.001 
  };
  
  // TechnicalProps
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
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
              <Server className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">{category}</h3>
              <p className="text-xs text-secondary">{technologies}</p>
            </div>
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Label</label>
            <input
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              type="text"
              value={label}
              onChange={(e) => handleBasicInfoChange('label', e.target.value)}
            />
          </div>

          {/* Provider */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Provider (optional)</label>
            <input
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              type="text"
              placeholder="e.g., AWS, Azure, GCP"
              value={provider}
              onChange={(e) => handleBasicInfoChange('provider', e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Status</label>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'healthy' ? 'bg-green-500' :
                status === 'warning' ? 'bg-yellow-500' :
                status === 'error' ? 'bg-red-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-sm capitalize">{status}</span>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Node Specs - Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Performance Specs
          </h4>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Latency Base (ms) *</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono" 
              type="number" 
              step="0.1"
              value={specs.latencyBase}
              onChange={(e) => handleSpecsChange('latencyBase', parseFloat(e.target.value) || 0)}
            />
            <p className="text-[10px] text-gray-500">Base processing latency for this node</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Max Throughput (req/s) *</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono" 
              type="number" 
              value={specs.maxThroughput}
              onChange={(e) => handleSpecsChange('maxThroughput', parseFloat(e.target.value) || 0)}
            />
            <p className="text-[10px] text-gray-500">Maximum requests per second</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Reliability (0.0 - 1.0) *</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono" 
              type="number" 
              step="0.001"
              min="0"
              max="1"
              value={specs.reliability}
              onChange={(e) => handleSpecsChange('reliability', parseFloat(e.target.value) || 0)}
            />
            <p className="text-[10px] text-gray-500">Uptime reliability (e.g., 0.99 = 99%)</p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Technical Props - Infrastructure Config */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" />
            Technical Configuration
          </h4>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Instance Count</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono" 
              type="number" 
              value={props.instanceCount || 1}
              onChange={(e) => handlePropsChange('instanceCount', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Clustered</label>
            <select
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={props.isClustered ? 'true' : 'false'}
              onChange={(e) => handlePropsChange('isClustered', e.target.value === 'true')}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Region</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
              type="text" 
              placeholder="e.g., us-east-1"
              value={props.region || ''}
              onChange={(e) => handlePropsChange('region', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Backup Policy</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
              type="text" 
              placeholder="e.g., Daily, Weekly"
              value={props.backupPolicy || ''}
              onChange={(e) => handlePropsChange('backupPolicy', e.target.value)}
            />
          </div>

          {/* Additional Props - Dynamic fields */}
          {props.additionalProps && Object.keys(props.additionalProps).length > 0 && (
            <div className="pt-2 border-t border-border space-y-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Additional Properties</p>
              {Object.entries(props.additionalProps).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-xs"
                    type="text"
                    value={String(value)}
                    onChange={(e) => handlePropsChange('additionalProps', {
                      ...props.additionalProps,
                      [key]: e.target.value
                    })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="border-border" />

        {/* Simulation Props - Runtime Behavior */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            Simulation Parameters
          </h4>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Processing Time (ms) *</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono" 
              type="number"
              step="0.1"
              value={simulation.processingTimeMs}
              onChange={(e) => handleSimulationChange('processingTimeMs', parseFloat(e.target.value) || 0)}
            />
            <p className="text-[10px] text-gray-500">Time to process each request</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Failure Rate (0.0 - 1.0) *</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono" 
              type="number" 
              step="0.001"
              min="0"
              max="1"
              value={simulation.failureRate}
              onChange={(e) => handleSimulationChange('failureRate', parseFloat(e.target.value) || 0)}
            />
            <p className="text-[10px] text-gray-500">Probability of request failure</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Queue Size (optional)</label>
            <input 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono" 
              type="number" 
              value={simulation.queueSize || ''}
              placeholder="Leave empty for unlimited"
              onChange={(e) => handleSimulationChange('queueSize', e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <p className="text-[10px] text-gray-500">Max queued requests before dropping</p>
          </div>

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
                      simulation.currentLoad > 0.8 ? 'bg-red-500' : 
                      simulation.currentLoad > 0.6 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`} 
                    style={{ width: `${simulation.currentLoad * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500">Real-time load indicator (read-only)</p>
            </div>
          )}
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