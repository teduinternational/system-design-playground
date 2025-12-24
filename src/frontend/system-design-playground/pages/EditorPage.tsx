import React, { useState, useEffect, useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection } from 'reactflow';
import { Sidebar } from '../components/Sidebar';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { Canvas } from '../components/Canvas';
import { MetricsPanel } from '../components/MetricsPanel';
import { Node, NodeType, Edge } from '../types';

// Initial Nodes for React Flow with Custom Type and Icon Mapping
const INITIAL_NODES: Node[] = [
  { 
    id: 'lb-01', 
    position: { x: 400, y: 100 }, 
    data: { id: 'lb-01', label: 'Load Balancer', subLabel: 'Nginx Proxy', type: NodeType.NETWORKING, iconName: 'Network' },
    type: 'custom',
  },
  { 
    id: 'app-srv-01', 
    position: { x: 250, y: 300 }, 
    data: { id: 'app-srv-01', label: 'Auth Service', subLabel: 'Node.js Cluster', type: NodeType.COMPUTE, iconName: 'Server' },
    type: 'custom',
  },
  { 
    id: 'app-srv-02', 
    position: { x: 550, y: 300 }, 
    data: { id: 'app-srv-02', label: 'Payment API', subLabel: 'Go Microservice', type: NodeType.COMPUTE, iconName: 'Zap' },
    type: 'custom',
  },
  { 
    id: 'db-01', 
    position: { x: 400, y: 500 }, 
    data: { id: 'db-01', label: 'Primary DB', subLabel: 'PostgreSQL', type: NodeType.STORAGE, iconName: 'Database' },
    type: 'custom',
  }
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1-2', source: 'lb-01', target: 'app-srv-01', animated: false },
  { id: 'e1-3', source: 'lb-01', target: 'app-srv-02', animated: false },
  { id: 'e2-4', source: 'app-srv-01', target: 'db-01', animated: false },
  { id: 'e3-4', source: 'app-srv-02', target: 'db-01', animated: false },
];

interface EditorPageProps {
  isSimulating: boolean;
}

export const EditorPage: React.FC<EditorPageProps> = ({ isSimulating }) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Simulation Logic Loop
  useEffect(() => {
    let interval: any;

    if (isSimulating) {
      // Set edges to animated when simulation starts
      setEdges((eds) => eds.map(e => ({ ...e, animated: true, style: { ...e.style, stroke: '#10B981' } })));
      
      interval = setInterval(() => {
        setNodes((nds) => 
          nds.map((node) => ({
            ...node,
            data: {
              ...node.data,
              isSimulating: true,
              stats: {
                cpu: Math.floor(Math.random() * 60) + 20, // Random 20-80%
                memory: Math.floor(Math.random() * 40) + 30,
                requests: Math.floor(Math.random() * 500) + 100,
                latency: Math.floor(Math.random() * 50) + 10,
              }
            }
          }))
        );
      }, 1000);
    } else {
      // Reset state when simulation stops
      setEdges((eds) => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: undefined } })));
      setNodes((nds) => 
        nds.map((node) => ({
          ...node,
          data: { ...node.data, isSimulating: false }
        }))
      );
    }

    return () => clearInterval(interval);
  }, [isSimulating, setNodes, setEdges]);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Canvas 
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeSelect={(node) => setSelectedNode(node)}
          isSimulating={isSimulating}
        />
        <MetricsPanel />
      </div>
      <PropertiesPanel selectedNode={selectedNode as any} /> 
    </div>
  );
};
