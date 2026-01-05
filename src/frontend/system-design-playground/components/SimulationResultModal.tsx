import React from 'react';
import { X, TrendingUp, Zap, AlertCircle, CheckCircle2, Clock, Activity, AlertTriangle } from 'lucide-react';
import type { AnalyzeResponse, PercentileSimulationResult } from '../services/types/simulation.types';

interface SimulationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalyzeResponse;
  percentileResult?: PercentileSimulationResult;
}

export const SimulationResultModal: React.FC<SimulationResultModalProps> = ({
  isOpen,
  onClose,
  result,
  percentileResult,
}) => {
  if (!isOpen) return null;

  console.log('🎯 SimulationResultModal - percentileResult:', percentileResult);

  const { systemOverview, criticalPath, statistics, allPaths } = result;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Simulation Complete</h2>
              <p className="text-sm text-secondary">Performance Analysis Report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-hover transition-colors flex items-center justify-center text-secondary hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-hover rounded-lg p-4 border border-border">
              <div className="text-secondary text-sm mb-1">Total Nodes</div>
              <div className="text-2xl font-bold text-white">{systemOverview.totalNodes}</div>
            </div>
            <div className="bg-surface-hover rounded-lg p-4 border border-border">
              <div className="text-secondary text-sm mb-1">Total Edges</div>
              <div className="text-2xl font-bold text-white">{systemOverview.totalEdges}</div>
            </div>
            <div className="bg-surface-hover rounded-lg p-4 border border-border">
              <div className="text-secondary text-sm mb-1">Entry Points</div>
              <div className="text-2xl font-bold text-white">{systemOverview.entryPointsCount}</div>
            </div>
          </div>

          {/* Critical Path */}
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg p-5 border border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-lg">Critical Path (Longest Latency)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-secondary text-sm mb-1">From → To</div>
                <div className="text-white font-medium">
                  {criticalPath.from} → {criticalPath.to}
                </div>
              </div>
              <div>
                <div className="text-secondary text-sm mb-1">Total Latency</div>
                <div className="text-3xl font-bold text-red-500">
                  {criticalPath.totalLatencyMs.toFixed(2)}
                  <span className="text-lg text-secondary ml-1">ms</span>
                </div>
              </div>
            </div>
            <div className="bg-surface/50 rounded-lg p-3">
              <div className="text-secondary text-xs mb-2">Path ({criticalPath.pathLength} nodes)</div>
              <div className="flex items-center gap-2 flex-wrap">
                {criticalPath.path.map((nodeId, index) => (
                  <React.Fragment key={nodeId}>
                    <div className="bg-surface-hover px-3 py-1 rounded text-sm text-white border border-border">
                      {nodeId}
                    </div>
                    {index < criticalPath.path.length - 1 && (
                      <div className="text-secondary">→</div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-white text-lg">Performance Statistics</h3>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-surface-hover rounded-lg p-4 border border-border">
                <div className="text-secondary text-xs mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Average Latency
                </div>
                <div className="text-xl font-bold text-blue-500">
                  {statistics.averagePathLatencyMs.toFixed(2)}
                  <span className="text-xs text-secondary ml-1">ms</span>
                </div>
              </div>
              <div className="bg-surface-hover rounded-lg p-4 border border-border">
                <div className="text-secondary text-xs mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Max Latency
                </div>
                <div className="text-xl font-bold text-red-500">
                  {statistics.maxPathLatencyMs.toFixed(2)}
                  <span className="text-xs text-secondary ml-1">ms</span>
                </div>
              </div>
              <div className="bg-surface-hover rounded-lg p-4 border border-border">
                <div className="text-secondary text-xs mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Min Latency
                </div>
                <div className="text-xl font-bold text-green-500">
                  {statistics.minPathLatencyMs.toFixed(2)}
                  <span className="text-xs text-secondary ml-1">ms</span>
                </div>
              </div>
              <div className="bg-surface-hover rounded-lg p-4 border border-border">
                <div className="text-secondary text-xs mb-1">Total Paths</div>
                <div className="text-xl font-bold text-white">{statistics.totalPaths}</div>
              </div>
            </div>
          </div>

          {/* All Paths Table */}
          <div>
            <h3 className="font-bold text-white text-lg mb-3">All Execution Paths</h3>
            <div className="bg-surface-hover rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
                      Entry Node
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
                      End Node
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
                      Nodes
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
                      Latency (ms)
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allPaths.map((path, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 last:border-0 hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-white font-medium">
                        {path.entryNode}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {path.endNode}
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary text-right">
                        {path.nodeCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span
                          className={`font-semibold ${
                            path.latencyMs === statistics.maxPathLatencyMs
                              ? 'text-red-500'
                              : path.latencyMs === statistics.minPathLatencyMs
                              ? 'text-green-500'
                              : 'text-white'
                          }`}
                        >
                          {path.latencyMs.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {path.latencyMs === statistics.maxPathLatencyMs ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-500">
                            <AlertCircle className="w-3 h-3" />
                            Critical
                          </span>
                        ) : path.latencyMs === statistics.minPathLatencyMs ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-500">
                            <CheckCircle2 className="w-3 h-3" />
                            Optimal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-500">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Percentile Analysis (if available) */}
          {percentileResult && (
            <>
              <div className="border-t-2 border-border pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-white text-lg">Percentile Analysis</h3>
                  <span className="text-xs text-secondary bg-purple-500/10 px-2 py-1 rounded">
                    {percentileResult.simulationCount} simulations
                  </span>
                </div>

                {/* Percentile Stats */}
                <div className="grid grid-cols-5 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg p-4 border border-green-500/20">
                    <div className="text-green-500 text-xs mb-1 font-semibold">Min</div>
                    <div className="text-2xl font-bold text-white">
                      {percentileResult.minLatencyMs.toFixed(2)}
                      <span className="text-xs text-secondary ml-1">ms</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg p-4 border border-blue-500/20">
                    <div className="text-blue-500 text-xs mb-1 font-semibold">P50 (Median)</div>
                    <div className="text-2xl font-bold text-white">
                      {percentileResult.p50LatencyMs.toFixed(2)}
                      <span className="text-xs text-secondary ml-1">ms</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-lg p-4 border border-yellow-500/20">
                    <div className="text-yellow-500 text-xs mb-1 font-semibold">Average</div>
                    <div className="text-2xl font-bold text-white">
                      {percentileResult.avgLatencyMs.toFixed(2)}
                      <span className="text-xs text-secondary ml-1">ms</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-lg p-4 border border-orange-500/20">
                    <div className="text-orange-500 text-xs mb-1 font-semibold">P95</div>
                    <div className="text-2xl font-bold text-white">
                      {percentileResult.p95LatencyMs.toFixed(2)}
                      <span className="text-xs text-secondary ml-1">ms</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg p-4 border border-red-500/20">
                    <div className="text-red-500 text-xs mb-1 font-semibold">Max</div>
                    <div className="text-2xl font-bold text-white">
                      {percentileResult.maxLatencyMs.toFixed(2)}
                      <span className="text-xs text-secondary ml-1">ms</span>
                    </div>
                  </div>
                </div>

                {/* Overloaded Nodes Warning */}
                {percentileResult.overloadedNodes && percentileResult.overloadedNodes.length > 0 && (
                  <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg p-5 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h4 className="font-bold text-white">Overloaded Nodes Detected</h4>
                      <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded">
                        {percentileResult.overloadedNodes.length} node(s)
                      </span>
                    </div>
                    <div className="space-y-3">
                      {percentileResult.overloadedNodes.map((node) => (
                        <div
                          key={node.nodeId}
                          className="bg-surface/50 rounded-lg p-4 border border-red-500/20"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-white font-semibold mb-1">{node.nodeId}</div>
                              <div className="text-xs text-secondary">
                                Capacity: {node.capacity.toFixed(0)} req/s
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-red-500 font-bold text-lg">
                                {(node.loadFactor * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs text-secondary">Load Factor</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-secondary text-xs">Actual Load</div>
                              <div className="text-white font-medium">
                                {node.actualLoad.toFixed(2)} req/s
                              </div>
                            </div>
                            <div>
                              <div className="text-secondary text-xs">Avg Queuing Delay</div>
                              <div className="text-orange-500 font-bold">
                                +{node.avgQueueingDelayMs.toFixed(2)} ms
                              </div>
                            </div>
                          </div>
                          {/* Load Bar */}
                          <div className="mt-3">
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all"
                                style={{ width: `${Math.min(node.loadFactor * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-secondary bg-surface/50 p-3 rounded border border-border">
                      <strong className="text-orange-500">⚠️ Impact:</strong> Overloaded nodes cause exponential queuing delays, 
                      affecting all downstream services in the path.
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface-hover">
          <div className="text-sm text-secondary">
            Simulation completed at {new Date().toLocaleString()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
