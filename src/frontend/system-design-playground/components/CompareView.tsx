import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  Viewport,
  Panel,
} from 'reactflow';
import { CustomNode } from './CustomNode';
import { ArrowLeftRight, Play, TrendingDown, TrendingUp } from 'lucide-react';
import 'reactflow/dist/style.css';

interface ScenarioData {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

interface ComparisonMetrics {
  totalLatencyMs: number;
  throughputRps: number;
  estimatedCostUsd: number;
}

interface ComparisonResult {
  scenario1: ComparisonMetrics;
  scenario2: ComparisonMetrics;
  differences: {
    latencyDiff: number;
    latencyPercent: number;
    throughputDiff: number;
    throughputPercent: number;
    costDiff: number;
    costPercent: number;
  };
}

interface CompareViewProps {
  scenario1: ScenarioData;
  scenario2: ScenarioData;
  onRunComparison: (scenario1Id: string, scenario2Id: string) => Promise<ComparisonResult>;
}

const nodeTypes = {
  custom: CustomNode,
};

// Inner canvas component with sync capability
const SyncedCanvas: React.FC<{
  nodes: Node[];
  edges: Edge[];
  label: string;
  syncViewport?: Viewport;
  onViewportChange?: (viewport: Viewport) => void;
}> = ({ nodes, edges, label, syncViewport, onViewportChange }) => {
  const { setViewport } = useReactFlow();

  // Sync viewport when prop changes
  React.useEffect(() => {
    if (syncViewport) {
      setViewport(syncViewport, { duration: 200 });
    }
  }, [syncViewport, setViewport]);

  const handleMove = useCallback(
    (_event: any, viewport: Viewport) => {
      onViewportChange?.(viewport);
    },
    [onViewportChange]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onMove={handleMove}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnDrag={true}
      zoomOnScroll={true}
      minZoom={0.1}
      maxZoom={4}
      fitView
      fitViewOptions={{ padding: 0.2 }}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#333" />
      <Controls />
      <MiniMap
        nodeColor={(node) => {
          return '#3b82f6';
        }}
        pannable
        zoomable
      />
      <Panel position="top-left" className="bg-surface/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
        <span className="text-sm font-semibold text-white">{label}</span>
      </Panel>
    </ReactFlow>
  );
};

export const CompareView: React.FC<CompareViewProps> = ({
  scenario1,
  scenario2,
  onRunComparison,
}) => {
  const [syncViewport, setSyncViewport] = useState<Viewport | null>(null);
  const [isSyncEnabled, setIsSyncEnabled] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const lastSyncSource = useRef<'left' | 'right'>('left');

  const handleViewportChange = useCallback(
    (viewport: Viewport, source: 'left' | 'right') => {
      if (isSyncEnabled && lastSyncSource.current !== source) {
        lastSyncSource.current = source;
        setSyncViewport(viewport);
        // Reset sync source after a short delay
        setTimeout(() => {
          lastSyncSource.current = source === 'left' ? 'right' : 'left';
        }, 250);
      }
    },
    [isSyncEnabled]
  );

  const handleRunComparison = async () => {
    setIsRunning(true);
    try {
      const result = await onRunComparison(scenario1.id, scenario2.id);
      setComparisonResult(result);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getChangeColor = (value: number, isInverse = false) => {
    // isInverse: true for metrics where lower is better (latency, cost)
    const isBetter = isInverse ? value < 0 : value > 0;
    return isBetter ? 'text-green-500' : value === 0 ? 'text-gray-400' : 'text-red-500';
  };

  const getChangeIcon = (value: number, isInverse = false) => {
    const isBetter = isInverse ? value < 0 : value > 0;
    if (value === 0) return null;
    return isBetter ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border bg-surface flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-white">Scenario Comparison</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSyncEnabled(!isSyncEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isSyncEnabled
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-surface-hover text-secondary border border-border'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Sync Viewport {isSyncEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={handleRunComparison}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run Dual Simulation'}
          </button>
        </div>
      </div>

      {/* Dual Canvases */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Canvas */}
        <div className="flex-1 border-r border-border">
          <ReactFlowProvider>
            <SyncedCanvas
              nodes={scenario1.nodes}
              edges={scenario1.edges}
              label={scenario1.name}
              syncViewport={lastSyncSource.current === 'right' ? syncViewport : undefined}
              onViewportChange={(viewport) => handleViewportChange(viewport, 'left')}
            />
          </ReactFlowProvider>
        </div>

        {/* Right Canvas */}
        <div className="flex-1">
          <ReactFlowProvider>
            <SyncedCanvas
              nodes={scenario2.nodes}
              edges={scenario2.edges}
              label={scenario2.name}
              syncViewport={lastSyncSource.current === 'left' ? syncViewport : undefined}
              onViewportChange={(viewport) => handleViewportChange(viewport, 'right')}
            />
          </ReactFlowProvider>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="h-48 border-t border-border bg-surface p-6 overflow-auto">
        <h3 className="text-lg font-bold text-white mb-4">Performance Comparison</h3>
        {!comparisonResult ? (
          <div className="flex items-center justify-center h-32 text-secondary">
            Run dual simulation to see comparison metrics
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary uppercase">
                    Metric
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary uppercase">
                    {scenario1.name}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary uppercase">
                    {scenario2.name}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary uppercase">
                    Difference
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary uppercase">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Total Latency */}
                <tr className="border-b border-border/50 hover:bg-surface-hover">
                  <td className="py-3 px-4 text-white font-medium">Total Latency</td>
                  <td className="py-3 px-4 text-right text-white font-mono">
                    {comparisonResult.scenario1.totalLatencyMs.toFixed(2)} ms
                  </td>
                  <td className="py-3 px-4 text-right text-white font-mono">
                    {comparisonResult.scenario2.totalLatencyMs.toFixed(2)} ms
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono font-semibold ${getChangeColor(comparisonResult.differences.latencyDiff, true)}`}>
                      {comparisonResult.differences.latencyDiff > 0 ? '+' : ''}
                      {comparisonResult.differences.latencyDiff.toFixed(2)} ms
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`flex items-center justify-end gap-1 font-semibold ${getChangeColor(comparisonResult.differences.latencyPercent, true)}`}>
                      {getChangeIcon(comparisonResult.differences.latencyPercent, true)}
                      <span>
                        {Math.abs(comparisonResult.differences.latencyPercent).toFixed(1)}%
                        {comparisonResult.differences.latencyPercent < 0 ? ' faster' : ' slower'}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Throughput */}
                <tr className="border-b border-border/50 hover:bg-surface-hover">
                  <td className="py-3 px-4 text-white font-medium">Throughput</td>
                  <td className="py-3 px-4 text-right text-white font-mono">
                    {comparisonResult.scenario1.throughputRps.toFixed(0)} req/s
                  </td>
                  <td className="py-3 px-4 text-right text-white font-mono">
                    {comparisonResult.scenario2.throughputRps.toFixed(0)} req/s
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono font-semibold ${getChangeColor(comparisonResult.differences.throughputDiff, false)}`}>
                      {comparisonResult.differences.throughputDiff > 0 ? '+' : ''}
                      {comparisonResult.differences.throughputDiff.toFixed(0)} req/s
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`flex items-center justify-end gap-1 font-semibold ${getChangeColor(comparisonResult.differences.throughputPercent, false)}`}>
                      {getChangeIcon(comparisonResult.differences.throughputPercent, false)}
                      <span>
                        {Math.abs(comparisonResult.differences.throughputPercent).toFixed(1)}%
                        {comparisonResult.differences.throughputPercent > 0 ? ' improvement' : ' decrease'}
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Estimated Cost */}
                <tr className="hover:bg-surface-hover">
                  <td className="py-3 px-4 text-white font-medium">Estimated Cost</td>
                  <td className="py-3 px-4 text-right text-white font-mono">
                    ${comparisonResult.scenario1.estimatedCostUsd.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-white font-mono">
                    ${comparisonResult.scenario2.estimatedCostUsd.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono font-semibold ${getChangeColor(comparisonResult.differences.costDiff, true)}`}>
                      {comparisonResult.differences.costDiff > 0 ? '+' : ''}
                      ${Math.abs(comparisonResult.differences.costDiff).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`flex items-center justify-end gap-1 font-semibold ${getChangeColor(comparisonResult.differences.costPercent, true)}`}>
                      {getChangeIcon(comparisonResult.differences.costPercent, true)}
                      <span>
                        {Math.abs(comparisonResult.differences.costPercent).toFixed(1)}%
                        {comparisonResult.differences.costPercent < 0 ? ' savings' : ' increase'}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
