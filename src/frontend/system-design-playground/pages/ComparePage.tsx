import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CompareView } from '../components/CompareView';
import { scenarioApi, comparisonApi } from '../services/api';
import type { ScenarioDto } from '../services/types/scenario.types';
import type { ComparisonResult } from '../services/comparison.api';
import type { DiagramContent } from '../services/types/diagram.types';
import { Node, Edge } from 'reactflow';
import { toast } from '../components/Toast';

export const ComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const scenario1Id = searchParams.get('scenario1');
  const scenario2Id = searchParams.get('scenario2');

  const [scenario1, setScenario1] = useState<ScenarioDto | null>(null);
  const [scenario2, setScenario2] = useState<ScenarioDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadScenarios = async () => {
      if (!scenario1Id || !scenario2Id) {
        setError('Missing scenario IDs in URL. Please provide scenario1 and scenario2 query parameters.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [s1, s2] = await Promise.all([
          scenarioApi.getById(scenario1Id),
          scenarioApi.getById(scenario2Id),
        ]);

        setScenario1(s1);
        setScenario2(s2);
        setError(null);
      } catch (err) {
        console.error('Failed to load scenarios:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scenarios');
        toast.error('Failed to load scenarios for comparison');
      } finally {
        setIsLoading(false);
      }
    };

    loadScenarios();
  }, [scenario1Id, scenario2Id]);

  const parseScenarioContent = (contentJson: string): { nodes: Node[]; edges: Edge[] } => {
    try {
      const diagram: DiagramContent = JSON.parse(contentJson);
      
      // Convert NodeModel[] to SystemNode[] (React Flow format)
      const nodes: Node[] = (diagram.nodes || []).map((node) => ({
        id: node.id,
        type: node.type || 'custom',
        position: node.position || { x: 0, y: 0 },
        data: {
          label: node.metadata.label || node.id,
          category: node.metadata.category,
          technologies: node.metadata.technologies || [],
          specs: node.metadata.specs || {
            latencyBase: 10,
            maxThroughput: 1000,
            reliability: 0.99,
          },
          provider: node.metadata.provider,
          props: node.metadata.props || {},
          simulation: node.metadata.simulation || {
            processingTimeMs: 10,
            failureRate: 0.001,
          },
          iconName: node.metadata.iconName || 'Server',
          status: node.metadata.status || 'idle',
        },
      }));

      // Convert EdgeModel[] to SystemEdge[] (React Flow format)
      const edges: Edge[] = (diagram.edges || []).map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'smoothstep',
        data: edge.data,
      }));

      return { nodes, edges };
    } catch (err) {
      console.error('Failed to parse scenario content:', err);
      return { nodes: [], edges: [] };
    }
  };

  const handleRunComparison = async (
    scenario1Id: string,
    scenario2Id: string
  ): Promise<ComparisonResult> => {
    try {
      toast.info('Running dual simulation...');
      const result = await comparisonApi.compare(scenario1Id, scenario2Id);
      toast.success('Comparison completed!');
      return result;
    } catch (err) {
      console.error('Comparison failed:', err);
      toast.error('Comparison failed. Please try again.');
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  if (error || !scenario1 || !scenario2) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Cannot Load Comparison</h2>
          <p className="text-secondary mb-4">
            {error || 'Failed to load one or both scenarios'}
          </p>
          <a
            href="/projects"
            className="inline-block px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Back to Projects
          </a>
        </div>
      </div>
    );
  }

  const scenario1Data = parseScenarioContent(scenario1.contentJson);
  const scenario2Data = parseScenarioContent(scenario2.contentJson);

  return (
    <CompareView
      scenario1={{
        id: scenario1.id,
        name: scenario1.name,
        nodes: scenario1Data.nodes,
        edges: scenario1Data.edges,
      }}
      scenario2={{
        id: scenario2.id,
        name: scenario2.name,
        nodes: scenario2Data.nodes,
        edges: scenario2Data.edges,
      }}
      onRunComparison={handleRunComparison}
    />
  );
};
