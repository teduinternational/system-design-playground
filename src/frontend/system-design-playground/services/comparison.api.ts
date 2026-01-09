import { fetchAPI } from './api';

// Comparison Types
export interface CompareScenarioRequest {
  scenarioIds: string[];
}

export interface ScenarioMetrics {
  scenarioId: string;
  scenarioName: string;
  totalLatencyMs: number;
  throughputRps: number;
  estimatedCostUsd: number;
}

export interface ComparisonDifferences {
  latencyDiff: number;
  latencyPercent: number;
  throughputDiff: number;
  throughputPercent: number;
  costDiff: number;
  costPercent: number;
}

export interface ComparisonResult {
  scenario1: ScenarioMetrics;
  scenario2: ScenarioMetrics;
  differences: ComparisonDifferences;
}

/**
 * Comparison API Service
 */
export const comparisonApi = {
  /**
   * So sánh 2 scenarios
   */
  async compare(scenario1Id: string, scenario2Id: string): Promise<ComparisonResult> {
    return fetchAPI<ComparisonResult>('/api/comparison/compare', {
      method: 'POST',
      body: JSON.stringify({
        scenarioIds: [scenario1Id, scenario2Id],
      }),
    });
  },
};
