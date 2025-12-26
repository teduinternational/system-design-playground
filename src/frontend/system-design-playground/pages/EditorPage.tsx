import React, { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { Canvas } from '../components/Canvas';
import { MetricsPanel } from '../components/MetricsPanel';
import { useDiagramStore } from '../stores/useDiagramStore';
import sampleDiagram from '../mock-data/sample-diagram.json';

interface EditorPageProps {
  isSimulating: boolean;
}

export const EditorPage: React.FC<EditorPageProps> = ({ isSimulating }) => {
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);
  const onNodesChange = useDiagramStore((state) => state.onNodesChange);
  const onEdgesChange = useDiagramStore((state) => state.onEdgesChange);
  const addEdge = useDiagramStore((state) => state.addEdge);
  const selectNode = useDiagramStore((state) => state.selectNode);

  // Initialize store with sample diagram data on mount
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(sampleDiagram.nodes as any);
      setEdges(sampleDiagram.edges as any);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = (params: any) => {
    addEdge({
      id: `e${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
    } as any);
  };

  // Simulation Logic Loop
  useEffect(() => {
    if (!isSimulating) return;
    
    const interval = setInterval(() => {
      // Get fresh state and update
      const store = useDiagramStore.getState();
      store.nodes.forEach((node) => {
        store.updateNodeData(node.id, {
          isSimulating: true,
          status: Math.random() > 0.9 ? 'warning' : 'healthy',
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Canvas 
          nodes={nodes as any}
          edges={edges as any}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeSelect={(nodeId) => selectNode(nodeId)}
          isSimulating={isSimulating}
        />
        <MetricsPanel />
      </div>
      <PropertiesPanel /> 
    </div>
  );
};
