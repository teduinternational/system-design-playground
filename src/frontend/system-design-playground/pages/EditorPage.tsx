import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { Canvas } from '../components/Canvas';
import { MetricsPanel } from '../components/MetricsPanel';
import { VersionHistory } from '../components/VersionHistory';
import { SaveDiagramModal } from '../components/SaveDiagramModal';
import { SaveVersionModal } from '../components/SaveVersionModal';
import { toast } from '../components/Toast';
import { useDiagramStore } from '../stores/useDiagramStore';
import { useDiagramPersistence } from '../hooks/useDiagramPersistence';
import { useApiDiagramPersistence } from '../hooks/useApiDiagramPersistence';
import { scenarioApi } from '../services/api';
import { exportCanvasToPng } from '../utils/exportCanvas';
import sampleDiagram from '../mock-data/sample-diagram.json';

interface EditorPageProps {
  isSimulating: boolean;
  setExportHandlers: (handlers: {
    onExportPng?: () => void;
    onExportJson?: () => void;
    onSave?: () => void;
    onSaveVersion?: () => void;
    onShowVersionHistory?: () => void;
  }) => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ 
  isSimulating, 
  setExportHandlers 
}) => {
  const [searchParams] = useSearchParams();
  const diagramId = searchParams.get('id');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  const setNodes = useDiagramStore((state) => state.setNodes);
  const setEdges = useDiagramStore((state) => state.setEdges);
  const onNodesChange = useDiagramStore((state) => state.onNodesChange);
  const onEdgesChange = useDiagramStore((state) => state.onEdgesChange);
  const addEdge = useDiagramStore((state) => state.addEdge);
  const selectNode = useDiagramStore((state) => state.selectNode);
  const loadDiagram = useDiagramStore((state) => state.loadDiagram);
  const serializeDiagram = useDiagramStore((state) => state.serializeDiagram);

  // Enable auto-persistence to localStorage and get export functions
  const { exportDiagram } = useDiagramPersistence();
  
  // API persistence hooks
  const { 
    loadDiagramFromApi, 
    saveDiagramToApi, 
    updateDiagramOnApi,
    isLoading 
  } = useApiDiagramPersistence();

  // Load diagram from API if ID is provided, otherwise load sample or localStorage
  useEffect(() => {
    const loadInitialData = async () => {
      if (diagramId) {
        // Load from API if ID is in URL
        const success = await loadDiagramFromApi(diagramId);
        if (success) {
          console.log('📦 Loaded diagram from API:', diagramId);
        }
      } else {
        // Check if there's saved data in localStorage
        const savedData = localStorage.getItem('system-design-diagram');
        
        if (!savedData && nodes.length === 0) {
          // Load sample diagram if no saved data exists
          loadDiagram(sampleDiagram as any);
          console.log('📦 Loaded sample diagram');
        }
      }
    };
    
    loadInitialData();
  }, [diagramId]); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.log('🎉 Diagram exported successfully!');
      toast.success('Diagram exported as PNG!');
    }
  };

  const handleExportJson = () => {
    const success = exportDiagram('system-diagram.json');
    if (success) {
      console.log('🎉 JSON exported successfully!');
      toast.success('Diagram exported as JSON!');
    }
  };

  // Save diagram to API
  const handleSave = async () => {
    if (diagramId) {
      // Update existing diagram
      const result = await updateDiagramOnApi(diagramId);
      if (result) {
        toast.success('Diagram saved successfully!');
      } else {
        toast.error('Failed to save diagram');
      }
    } else {
      // Show modal for new diagram
      setShowSaveModal(true);
    }
  };

  // Handle save from modal
  const handleSaveFromModal = async (name: string, description: string) => {
    const result = await saveDiagramToApi(name, description);
    if (result) {
      console.log('✅ New diagram created on API');
      toast.success(`Diagram "${name}" created successfully!`);
      // Update URL with new diagram ID
      window.history.replaceState({}, '', `/editor?id=${result.id}`);
    } else {
      toast.error('Failed to create diagram');
      throw new Error('Failed to create diagram');
    }
  };

  // Save version (create scenario)
  const handleSaveVersion = () => {
    if (!diagramId) {
      toast.warning('Please save the diagram first before creating a version');
      return;
    }
    setShowVersionModal(true);
  };

  // Handle save version from modal
  const handleSaveVersionFromModal = async (
    versionTag: string,
    versionName: string,
    changeLog: string
  ) => {
    try {
      const diagram = serializeDiagram();
      const contentJson = JSON.stringify({
        metadata: diagram.metadata,
        nodes: diagram.nodes,
        edges: diagram.edges,
      });
      
      await scenarioApi.create(diagramId!, {
        name: versionName,
        versionTag,
        contentJson,
        changeLog,
        isSnapshot: true
      });
      
      toast.success(`Version ${versionTag} saved successfully!`);
    } catch (error) {
      console.error('Failed to save version:', error);
      toast.error('Failed to save version');
      throw error;
    }
  };

  // Show version history
  const handleShowVersionHistory = () => {
    if (!diagramId) {
      toast.warning('Please save the diagram first to view version history');
      return;
    }
    setShowVersionHistory(true);
  };

  // Register export handlers with parent component
  useEffect(() => {
    setExportHandlers({
      onExportPng: handleExportPng,
      onExportJson: handleExportJson,
      onSave: handleSave,
      onSaveVersion: handleSaveVersion,
      onShowVersionHistory: handleShowVersionHistory,
    });
  }, [setExportHandlers, diagramId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <>
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
      
      {/* Save Diagram Modal */}
      <SaveDiagramModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveFromModal}
        title="Create New Diagram"
        mode="create"
      />

      {/* Save Version Modal */}
      <SaveVersionModal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        onSave={handleSaveVersionFromModal}
      />

      {/* Version History Modal */}
      {showVersionHistory && diagramId && (
        <VersionHistory 
          diagramId={diagramId}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </>
  );
};
