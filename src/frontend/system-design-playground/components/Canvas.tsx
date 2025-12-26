import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import { Toolbar } from './Toolbar';
import { CustomNode } from './CustomNode';
import { useDiagramStore } from '../stores/useDiagramStore';
import { NodeCategory } from '../diagram.schema';

interface CanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  isSimulating: boolean;
}

interface CanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  isSimulating: boolean;
}

const CanvasInner: React.FC<CanvasProps> = ({ 
  onNodeSelect, 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect,
  isSimulating
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const addNode = useDiagramStore((state) => state.addNode);
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  // Generate unique node ID
  const getNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Map node type to category
  const getNodeCategory = (nodeType: string): NodeCategory => {
    const mapping: Record<string, NodeCategory> = {
      'compute': NodeCategory.COMPUTE,
      'storage': NodeCategory.STORAGE,
      'networking': NodeCategory.TRAFFIC_MANAGER,
      'messaging': NodeCategory.MIDDLEWARE,
    };
    return mapping[nodeType.toLowerCase()] || NodeCategory.COMPUTE;
  };

  // Handle drop event
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/label');

      if (!nodeType || !reactFlowWrapper.current) return;

      // Get the bounds of the canvas
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Calculate position in React Flow coordinates
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create new node
      const newNode = {
        id: getNodeId(),
        type: 'custom',
        position,
        data: {
          category: getNodeCategory(nodeType),
          technologies: [label],
          props: {
            instanceCount: 1,
            region: 'us-east-1',
          },
          simulation: {
            processingTimeMs: 10,
            failureRate: 0.001,
            currentLoad: 0.0,
          },
          iconName: 'Server',
          status: 'idle' as const,
        },
      };

      addNode(newNode as any);
    },
    [project, addNode]
  );

  // Allow drop by preventing default
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  return (
    <main className="flex-1 bg-background relative overflow-hidden group/canvas h-full w-full">
      <Toolbar />
      
      {/* Simulation Overlay Badge */}
      {isSimulating && (
        <div className="absolute top-6 right-6 z-40 bg-surface/90 backdrop-blur border border-green-500/50 text-green-400 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs font-mono font-bold tracking-wider">LIVE SIMULATION ACTIVE</span>
        </div>
      )}

      <div ref={reactFlowWrapper} className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onSelectionChange={({ nodes }) => onNodeSelect(nodes[0]?.id || null)}
          onPaneClick={() => onNodeSelect(null)}
          snapToGrid={true}
          snapGrid={[15, 15]}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 2, stroke: '#565A75' },
            animated: isSimulating, // Animate edges when simulating
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#565A75',
            }
          }}
        >
          <Background 
            variant={BackgroundVariant.Lines} 
            gap={15} 
            size={1} 
            color="#2a2d3a" 
            style={{ backgroundColor: '#0b0c10' }}
          />
          <Controls 
            className="!bottom-4 !left-4 !top-auto bg-surface border border-border rounded-lg shadow-lg overflow-hidden"
            showInteractive={false}
          />
          <MiniMap 
            nodeColor="#2b4bee" 
            maskColor="rgba(11, 12, 16, 0.8)"
            className="!bottom-4 !right-4 !top-auto bg-surface border border-border rounded-lg overflow-hidden shadow-lg" 
            style={{ width: 200, height: 150 }}
          />
        </ReactFlow>
      </div>
    </main>
  );
};

// Wrapper component with ReactFlowProvider
export const Canvas: React.FC<CanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
};