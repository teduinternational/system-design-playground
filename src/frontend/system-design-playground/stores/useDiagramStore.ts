import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Edge, Node } from 'reactflow';
import { NodeSpecs, SimulationProps, SystemEdge, SystemNode } from '@/diagram.schema';

/**
 * Diagram Store State Interface
 */
interface DiagramState {
  // State
  nodes: SystemNode[];
  edges: SystemEdge[];
  selectedNode: SystemNode | null;

  // Actions
  setNodes: (nodes: SystemNode[]) => void;
  setEdges: (edges: SystemEdge[]) => void;
  addNode: (node: SystemNode) => void;
  addEdge: (edge: SystemEdge) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, updates: Partial<SystemNode['data']>) => void;
  updateNodeSpecs: (nodeId: string, specs: Partial<NodeSpecs>) => void;
  updateNodeSimulation: (nodeId: string, simulation: Partial<SimulationProps>) => void;
  selectNode: (nodeId: string | null) => void;
  clearDiagram: () => void;

  // React Flow Handlers
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
}

/**
 * Zustand Store for Diagram Management
 */
export const useDiagramStore = create<DiagramState>()(
  devtools(
    (set, get) => ({
      // Initial State
      nodes: [],
      edges: [],
      selectedNode: null,

      // Set all nodes
      setNodes: (nodes) => set({ nodes }),

      // Set all edges
      setEdges: (edges) => set({ edges }),

      // Add single node
      addNode: (node) =>
        set((state) => ({
          nodes: [...state.nodes, node],
        })),

      // Add single edge
      addEdge: (edge) =>
        set((state) => ({
          edges: [...state.edges, edge],
        })),

      // Remove node by ID
      removeNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== nodeId),
          edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
          selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
        })),

      // Remove edge by ID
      removeEdge: (edgeId) =>
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== edgeId),
        })),

      // Update node position
      updateNodePosition: (nodeId, position) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? { ...node, position } : node
          ),
        })),

      // Update node data (props, simulation, etc.)
      updateNodeData: (nodeId, updates) =>
        set((state) => {
          const nodes = state.nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...updates,
                },
              };
            }
            return node;
          });

          // Update selectedNode if it's the updated node
          const selectedNode =
            state.selectedNode?.id === nodeId
              ? nodes.find((n) => n.id === nodeId) || null
              : state.selectedNode;

          return { nodes, selectedNode };
        }),

      // Update node specs (latency, throughput, reliability)
      updateNodeSpecs: (nodeId, specs) =>
        set((state) => {
          const nodes = state.nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  props: {
                    ...(node.data.props || {}),
                    ...specs,
                  },
                },
              };
            }
            return node;
          });

          // Update selectedNode if it's the updated node
          const selectedNode =
            state.selectedNode?.id === nodeId
              ? nodes.find((n) => n.id === nodeId) || null
              : state.selectedNode;

          return { nodes, selectedNode };
        }),

      // Update node simulation props (processingTimeMs, failureRate, etc.)
      updateNodeSimulation: (nodeId, simulation) =>
        set((state) => {
          const nodes = state.nodes.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  simulation: {
                    ...node.data.simulation,
                    processingTimeMs: node.data.simulation?.processingTimeMs ?? 0,
                    failureRate: node.data.simulation?.failureRate ?? 0,
                    ...simulation,
                  },
                },
              };
            }
            return node;
          });

          // Update selectedNode if it's the updated node
          const selectedNode =
            state.selectedNode?.id === nodeId
              ? nodes.find((n) => n.id === nodeId) || null
              : state.selectedNode;

          return { nodes, selectedNode };
        }),

      // Select node by ID
      selectNode: (nodeId) =>
        set((state) => ({
          selectedNode: nodeId ? state.nodes.find((n) => n.id === nodeId) || null : null,
        })),

      // Clear entire diagram
      clearDiagram: () =>
        set({
          nodes: [],
          edges: [],
          selectedNode: null,
        }),

      // React Flow onChange handlers
      onNodesChange: (changes) => {
        // Handle React Flow internal changes (selection, position, etc.)
        set((state) => {
          let nodes = [...state.nodes];
          let removedNodeIds: string[] = [];

          changes.forEach((change: any) => {
            if (change.type === 'position' && change.position) {
              nodes = nodes.map((node) =>
                node.id === change.id ? { ...node, position: change.position } : node
              );
            } else if (change.type === 'remove') {
              nodes = nodes.filter((node) => node.id !== change.id);
              removedNodeIds.push(change.id);
            }
          });

          // Update selectedNode if it was updated or removed
          let selectedNode = state.selectedNode;
          if (selectedNode) {
            if (removedNodeIds.includes(selectedNode.id)) {
              selectedNode = null;
            } else {
              selectedNode = nodes.find((n) => n.id === selectedNode!.id) || null;
            }
          }

          return { nodes, selectedNode };
        });
      },

      onEdgesChange: (changes) => {
        set((state) => {
          let edges = [...state.edges];

          changes.forEach((change: any) => {
            if (change.type === 'remove') {
              edges = edges.filter((edge) => edge.id !== change.id);
            }
          });

          return { edges };
        });
      },
    }),
    { name: 'DiagramStore' }
  )
);

/**
 * Helper hook to get specific node by ID
 */
export const useNode = (nodeId: string | null) => {
  return useDiagramStore((state) =>
    nodeId ? state.nodes.find((n) => n.id === nodeId) : null
  );
};

/**
 * Helper hook to get edges connected to a specific node
 */
export const useNodeEdges = (nodeId: string) => {
  return useDiagramStore((state) =>
    state.edges.filter((e) => e.source === nodeId || e.target === nodeId)
  );
};
