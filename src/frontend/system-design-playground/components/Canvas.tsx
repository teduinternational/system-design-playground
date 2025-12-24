import React, { useCallback, useEffect, useMemo } from 'react';
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
  NodeTypes
} from 'reactflow';
import { Toolbar } from './Toolbar';
import { CustomNode } from './CustomNode';

interface CanvasProps {
  onNodeSelect: (node: Node | null) => void;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (params: Connection) => void;
  isSimulating: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  onNodeSelect, 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect,
  isSimulating
}) => {

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

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

      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onSelectionChange={({ nodes }) => onNodeSelect(nodes[0] || null)}
          onPaneClick={() => onNodeSelect(null)}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 2, stroke: '#565A75' },
            animated: isSimulating // Animate edges when simulating
          }}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#3b3f54" 
          />
          <Controls className="bg-surface border-border fill-secondary text-secondary" />
          <MiniMap 
            nodeColor="#2b4bee" 
            maskColor="rgba(11, 12, 16, 0.8)"
            className="bg-surface border border-border rounded-lg overflow-hidden" 
          />
        </ReactFlow>
      </div>
    </main>
  );
};