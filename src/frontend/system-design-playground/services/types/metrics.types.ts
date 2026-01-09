/**
 * Metrics Types
 * Type definitions for metrics calculation and KPI dashboard
 */

import { DiagramContent } from './diagram.types';

// Re-export all diagram types from the main diagram types file
export type {
  DiagramMetadata,
  NodeSpecs,
  TechnicalProps,
  SimulationProps,
  NodeLogic,
  NodeMetadata,
  Position,
  NodeModel,
  EdgeData,
  EdgeModel,
  DiagramContent
} from './diagram.types';

// System Metrics Response
export interface SystemMetrics {
  monthlyCost: number;
  overallErrorRate: number;
  healthScore: number;
  efficiencyRating: string;
  availabilityPercentage: number;
  costBreakdown?: Record<string, number>;
  bottlenecks?: string[];
}

// What-if Request
export interface WhatIfRequest {
  diagramContent: DiagramContent;
  nodeId: string;
  newInstanceCount: number;
}

// Metrics Diff for Impact Display
export interface MetricsDiff {
  costDelta: number;
  errorRateDelta: number;
  healthScoreDelta: number;
  availabilityDelta: number;
}
