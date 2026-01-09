import React, { useState, useCallback, useEffect } from 'react';
import { 
  Server, 
  Zap,
  Settings,
  Activity,
  TrendingUp
} from 'lucide-react';
import { useDiagramStore, useNode } from '../stores/useDiagramStore';
import { calculateWhatIf } from '../services/metrics.service';
import { ImpactPanel } from './ImpactPanel';
import type { SystemMetrics, MetricsDiff, DiagramContent } from '../services/types/metrics.types';
import { debounce } from '../utils/debounce';

interface PropertiesPanelProps {
  currentMetrics?: SystemMetrics | null;
  onMetricsUpdate?: (metrics: SystemMetrics) => void;
}

const PropertiesPanelComponent: React.FC<PropertiesPanelProps> = ({
  currentMetrics,
  onMetricsUpdate
}) => {
  // Subscribe only to selectedNodeId - this will only change when selection changes
  const selectedNodeId = useDiagramStore((state) => state.selectedNodeId);
  
  // Use optimized hook to get the node
  const selectedNode = useNode(selectedNodeId);
  
  // Debug: Log renders
  console.log('[PropertiesPanel] Render:', { selectedNodeId, hasNode: !!selectedNode });
  
  const updateNodeData = useDiagramStore((state) => state.updateNodeData);
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);

  // What-if analysis state
  const [whatIfMetrics, setWhatIfMetrics] = useState<SystemMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [metricsDiff, setMetricsDiff] = useState<MetricsDiff | null>(null);

  // Reset what-if state when node selection changes
  useEffect(() => {
    setWhatIfMetrics(null);
    setShowImpact(false);
    setMetricsDiff(null);
  }, [selectedNodeId]);

  // Convert store nodes to API format
  const convertToDiagramContent = useCallback((): DiagramContent | null => {
    if (!nodes.length) return null;

    return {
      metadata: {
        id: '',
        name: 'Current Diagram',
        description: 'Live diagram state',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type || 'customNode',
        metadata: {
          label: node.data.label || node.id,
          category: node.data.category || 'Compute',
          specs: node.data.specs || { latencyBase: 10, maxThroughput: 1000, reliability: 0.99 },
          technologies: node.data.technologies || [],
          provider: node.data.provider,
          props: node.data.props,
          simulation: node.data.simulation || { processingTimeMs: 10, failureRate: 0.001 },
          iconName: node.data.iconName,
          status: node.data.status,
        },
        position: node.position,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        data: {
          protocol: 'HTTP',
          networkLatency: 5,
        },
      })),
    };
  }, [nodes, edges]);

  // Debounced what-if calculation
  const debouncedWhatIf = useCallback(
    debounce(async (nodeId: string, newInstanceCount: number) => {
      if (!currentMetrics) return;

      setIsCalculating(true);
      try {
        const diagramContent = convertToDiagramContent();
        if (!diagramContent) return;

        const newMetrics = await calculateWhatIf({
          diagramContent,
          nodeId,
          newInstanceCount,
        });

        setWhatIfMetrics(newMetrics);

        // Calculate diff
        const diff: MetricsDiff = {
          costDelta: newMetrics.monthlyCost - currentMetrics.monthlyCost,
          errorRateDelta: newMetrics.overallErrorRate - currentMetrics.overallErrorRate,
          healthScoreDelta: newMetrics.healthScore - currentMetrics.healthScore,
          availabilityDelta: newMetrics.availabilityPercentage - currentMetrics.availabilityPercentage,
        };

        setMetricsDiff(diff);
        setShowImpact(true);
      } catch (error) {
        console.error('What-if calculation failed:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 500),
    [currentMetrics, convertToDiagramContent]
  );

  // Handle instance count change with what-if preview
  const handleInstanceCountChange = (newValue: number) => {
    if (!selectedNode) return;

    // Update UI immediately
    handlePropsChange('instanceCount', newValue);

    // Trigger what-if calculation if metrics available
    if (currentMetrics) {
      debouncedWhatIf(selectedNode.id, newValue);
    }
  };

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
    <>
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-400">Instance Count</label>
              {currentMetrics && (
                <button
                  onClick={() => setShowImpact(!showImpact)}
                  className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  title="What-if Analysis"
                >
                  <TrendingUp className="w-3 h-3" />
                  What-if
                </button>
              )}
            </div>
            
            {/* Slider for better UX */}
            <input
              type="range"
              min="1"
              max="10"
              value={props.instanceCount || 1}
              onChange={(e) => handleInstanceCountChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            
            {/* Value display */}
            <div className="flex items-center justify-between">
              <input 
                className="w-20 bg-background border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-center" 
                type="number" 
                value={props.instanceCount || 1}
                onChange={(e) => handleInstanceCountChange(parseInt(e.target.value) || 1)}
              />
              {isCalculating && (
                <span className="text-xs text-blue-500 animate-pulse">Calculating...</span>
              )}
            </div>

            {/* What-if preview inline */}
            {whatIfMetrics && metricsDiff && (
              <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost Impact:</span>
                  <span className={metricsDiff.costDelta >= 0 ? 'text-orange-400' : 'text-green-400'}>
                    {metricsDiff.costDelta >= 0 ? '+' : ''}${metricsDiff.costDelta.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Health Score:</span>
                  <span className={metricsDiff.healthScoreDelta >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {metricsDiff.healthScoreDelta >= 0 ? '+' : ''}{metricsDiff.healthScoreDelta}
                  </span>
                </div>
              </div>
            )}
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
        <button 
          className="flex-1 py-2 px-4 rounded-md bg-surface-hover hover:bg-[#252836] text-white text-xs font-medium border border-border transition-colors"
          onClick={() => {
            setWhatIfMetrics(null);
            setShowImpact(false);
            setMetricsDiff(null);
          }}
        >
          Reset
        </button>
        {whatIfMetrics && onMetricsUpdate && (
          <button 
            className="flex-1 py-2 px-4 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow-[0_0_20px_-5px_rgba(43,75,238,0.3)] transition-colors"
            onClick={() => {
              onMetricsUpdate?.(whatIfMetrics);
              setShowImpact(false);
            }}
          >
            Apply Changes
          </button>
        )}
      </div>
    </aside>

    {/* Impact Panel */}
    {metricsDiff && (
      <ImpactPanel
        diff={metricsDiff}
        isVisible={showImpact}
        onClose={() => setShowImpact(false)}
      />
    )}
    </>
  );
};

// Memoize component to prevent unnecessary re-renders from parent
export const PropertiesPanel = React.memo(PropertiesPanelComponent);