import React, { useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { Canvas } from '../components/Canvas';
import { MetricsPanel } from '../components/MetricsPanel';
import { useDiagramStore } from '../stores/useDiagramStore';
import { useDiagramPersistence } from '../hooks/useDiagramPersistence';
import { exportCanvasToPng } from '../utils/exportCanvas';
import sampleDiagram from '../mock-data/sample-diagram.json';

interface EditorPageProps {
  isSimulating: boolean;
  setExportHandlers: (handlers: {
    onExportPng?: () => void;
    onExportJson?: () => void;
  }) => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ 
  isSimulating, 
  setExportHandlers 
}) => {
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);
  const onNodesChange = useDiagramStore((state) => state.onNodesChange);
  const onEdgesChange = useDiagramStore((state) => state.onEdgesChange);
  const addEdge = useDiagramStore((state) => state.addEdge);
  const selectNode = useDiagramStore((state) => state.selectNode);
  const loadDiagram = useDiagramStore((state) => state.loadDiagram);

  // Enable auto-persistence to localStorage and get export functions
  const { exportDiagram } = useDiagramPersistence();

  // Initialize store with sample diagram data on mount (if no saved data)
  useEffect(() => {
    // Check if there's saved data in localStorage
    const savedData = localStorage.getItem('system-design-diagram');
    
    if (!savedData && nodes.length === 0) {
      // Load sample diagram if no saved data exists
      loadDiagram(sampleDiagram as any);
      console.log('📦 Loaded sample diagram');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = (params: any) => {
    addEdge({
      id: `e${params.source}-${params.target}`,
      source: params.source,
      target: params.target,
    } as any);
  };

  // Export handlers
  const handleExportPng = async () => {
    const success = await exportCanvasToPng('system-diagram.png');
    if (success) {
      // Could show a success toast notification here
      console.log('🎉 Diagram exported successfully!');
    }
  };

  const handleExportJson = () => {
    const success = exportDiagram('system-diagram.json');
    if (success) {
      console.log('🎉 JSON exported successfully!');
    }
  };

  // Register export handlers with parent component
  useEffect(() => {
    setExportHandlers({
      onExportPng: handleExportPng,
      onExportJson: handleExportJson,
    });
  }, [setExportHandlers]); // eslint-disable-line react-hooks/exhaustive-deps

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
