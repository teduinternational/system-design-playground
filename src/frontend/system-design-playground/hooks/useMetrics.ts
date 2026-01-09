/**
 * Custom hook to manage metrics calculation
 * Automatically recalculates metrics when diagram changes
 */

import { useState, useEffect, useCallback } from 'react';
import { calculateMetrics } from '../services/metrics.service';
import type { SystemMetrics, DiagramContent } from '../services/types/metrics.types';
import { useDiagramStore } from '../stores/useDiagramStore';
import { debounce } from '../utils/debounce';

export function useMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);

  // Convert store nodes/edges to API format
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
          specs: node.data.specs || { 
            latencyBase: 10, 
            maxThroughput: 1000, 
            reliability: 0.99 
          },
          technologies: node.data.technologies || [],
          provider: node.data.provider,
          props: node.data.props,
          simulation: node.data.simulation || { 
            processingTimeMs: 10, 
            failureRate: 0.001 
          },
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

  // Debounced metrics calculation
  const calculateMetricsDebounced = useCallback(
    debounce(async () => {
      const diagramContent = convertToDiagramContent();
      if (!diagramContent) {
        setMetrics(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await calculateMetrics(diagramContent);
        setMetrics(result);
      } catch (err) {
        console.error('Metrics calculation failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate metrics');
      } finally {
        setLoading(false);
      }
    }, 1000),
    [convertToDiagramContent]
  );

  // Recalculate metrics when diagram changes
  useEffect(() => {
    calculateMetricsDebounced();
  }, [nodes, edges, calculateMetricsDebounced]);

  // Manual refresh function
  const refreshMetrics = useCallback(async () => {
    const diagramContent = convertToDiagramContent();
    if (!diagramContent) {
      setMetrics(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await calculateMetrics(diagramContent);
      setMetrics(result);
    } catch (err) {
      console.error('Metrics calculation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate metrics');
    } finally {
      setLoading(false);
    }
  }, [convertToDiagramContent]);

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
  };
}
