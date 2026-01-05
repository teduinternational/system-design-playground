import { fetchAPI } from './api';
import type { 
  SimulationRequest, 
  LongestPathsResponse, 
  SimulationResult,
  AnalyzeResponse,
  PercentileSimulationResult
} from './types/simulation.types';

/**
 * Simulation API Service
 * Handles simulation and performance analysis
 */
export const simulationApi = {
  /**
   * Calculate longest paths from all entry points
   */
  calculateLongestPaths: async (request: SimulationRequest): Promise<LongestPathsResponse> => {
    return fetchAPI<LongestPathsResponse>('/api/simulation/longest-paths', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Calculate longest path from a specific node
   */
  calculateFromNode: async (nodeId: string, request: SimulationRequest): Promise<SimulationResult> => {
    return fetchAPI<SimulationResult>(`/api/simulation/longest-path/${nodeId}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Analyze system performance (critical path, statistics)
   */
  analyze: async (request: SimulationRequest): Promise<AnalyzeResponse> => {
    return fetchAPI<AnalyzeResponse>('/api/simulation/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Run percentile simulation with jitter and queuing delay (1000 iterations)
   */
  simulateWithPercentiles: async (nodeId: string, request: SimulationRequest): Promise<PercentileSimulationResult> => {
    return fetchAPI<PercentileSimulationResult>(`/api/simulation/percentiles/${nodeId}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
