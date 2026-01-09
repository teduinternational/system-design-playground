/**
 * Metrics API Service
 * Handles all metrics calculation and what-if analysis API calls
 */

import { fetchAPI } from './api';
import { DiagramContent, SystemMetrics, WhatIfRequest } from './types/metrics.types';

/**
 * Calculate system metrics for a diagram
 */
export async function calculateMetrics(diagramContent: DiagramContent): Promise<SystemMetrics> {
  return fetchAPI<SystemMetrics>('/api/metrics/calculate', {
    method: 'POST',
    body: JSON.stringify(diagramContent),
  });
}

/**
 * Calculate what-if scenario when changing node configuration
 */
export async function calculateWhatIf(request: WhatIfRequest): Promise<SystemMetrics> {
  return fetchAPI<SystemMetrics>('/api/metrics/what-if', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
