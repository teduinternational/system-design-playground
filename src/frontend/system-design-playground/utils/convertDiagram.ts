import type { SystemNode, SystemEdge } from '@/diagram.schema';
import type { BackendDiagramContent } from '@/services/types/ai.types';

/**
 * Map frontend NodeCategory enum values to backend format (without spaces)
 */
function mapCategoryToBackendFormat(category: string): string {
  const categoryMap: Record<string, string> = {
    'Entry Point': 'EntryPoint',
    'Traffic Manager': 'TrafficManager',
    'Compute': 'Compute',
    'Storage': 'Storage',
    'Middleware': 'Middleware',
  };
  
  return categoryMap[category] || 'Compute';
}

/**
 * Convert React Flow diagram data to Backend API format
 */
export function convertToBackendFormat(
  nodes: SystemNode[],
  edges: SystemEdge[]
): BackendDiagramContent {
  return {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type || 'custom',
      metadata: {
        label: node.data.category || 'Unknown',
        category: mapCategoryToBackendFormat(node.data.category || 'Compute'),
        specs: {
          latencyBase: 10,
          maxThroughput: 1000,
          reliability: 0.99,
        },
        technologies: node.data.technologies,
        props: node.data.props,
        simulation: node.data.simulation,
      },
      position: node.position ? { x: node.position.x, y: node.position.y } : undefined,
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      data: edge.data,
    })),
  };
}
