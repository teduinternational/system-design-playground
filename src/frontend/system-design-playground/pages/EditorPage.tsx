import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { Canvas } from '../components/Canvas';
import { MetricsPanel } from '../components/MetricsPanel';
import { VersionHistory } from '../components/VersionHistory';
import { SaveDiagramModal } from '../components/SaveDiagramModal';
import { SaveVersionModal } from '../components/SaveVersionModal';
import { SimulationResultModal } from '../components/SimulationResultModal';
import { AIAnalysisModal } from '../components/AIAnalysisModal';
import { toast } from '../components/Toast';
import { useDiagramStore } from '../stores/useDiagramStore';
import { useDiagramPersistence } from '../hooks/useDiagramPersistence';
import { useApiDiagramPersistence } from '../hooks/useApiDiagramPersistence';
import { useSimulation } from '../hooks/useSimulation';
import { scenarioApi } from '../services/api';
import { exportCanvasToPng } from '../utils/exportCanvas';
import type { SimulationRequest, SimulationNode, SimulationEdge } from '../services/types/simulation.types';
import sampleDiagram from '../mock-data/sample-diagram.json';

interface EditorPageProps {
  isSimulating: boolean;
  setIsSimulating: React.Dispatch<React.SetStateAction<boolean>>;
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
  setIsSimulating, 
  setExportHandlers 
}) => {
  const [searchParams] = useSearchParams();
  const diagramId = searchParams.get('id');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
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

  // Simulation hook
  const { runSimulation, simulationResult, percentileResult } = useSimulation({
    diagramId: diagramId || undefined,
    onSimulationComplete: (result, percentile) => {
      console.log('🎯 Simulation completed:', result);
      if (percentile) {
        console.log('📊 Percentile results:', percentile);
      } else {
        console.warn('⚠️ No percentile results returned');
      }
      // Show result modal (state will be stopped in handleSimulate after await)
      setShowResultModal(true);
    },
    onSimulationError: (error) => {
      console.error('❌ Simulation error:', error);
    },
  });

  // Debug: Log percentileResult changes
  useEffect(() => {
    console.log('🔄 percentileResult state changed:', percentileResult);
  }, [percentileResult]);

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

  // Handle simulation
  const handleSimulate = async () => {
    if (isSimulating) {
      // Stop simulation
      setIsSimulating(false);
      return;
    }

    // Convert diagram to SimulationRequest
    const simulationNodes: SimulationNode[] = nodes.map((node) => ({
      id: node.id,
      type: node.data.label || node.type || 'Unknown',
      latencyMs: node.data.latency || node.data.simulation?.processingTimeMs || 10,
      jitterMs: node.data.jitterMs || node.data.simulation?.jitterMs || 0,
      capacity: node.data.capacity || node.data.simulation?.capacity,
      isEntryPoint: node.data.isEntryPoint || node.data.nodeCategory === 'entry',
    }));

    console.log('🔍 All simulation nodes:', simulationNodes);
    console.log('🎯 Entry nodes:', simulationNodes.filter(n => n.isEntryPoint));

    // Fallback: If no entry point, mark the first node as entry
    const hasEntryPoint = simulationNodes.some(n => n.isEntryPoint);
    if (!hasEntryPoint && simulationNodes.length > 0) {
      console.warn('⚠️ No entry point found, marking first node as entry');
      simulationNodes[0].isEntryPoint = true;
    }

    const simulationEdges: SimulationEdge[] = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      latencyMs: edge.data?.latency || 5,
      jitterMs: edge.data?.jitterMs || 0,
    }));

    const request: SimulationRequest = {
      nodes: simulationNodes,
      edges: simulationEdges,
      concurrentRequests: 100, // Default concurrent requests để simulate load
    };

    console.log('📦 Full simulation request:', request);

    try {
      // Start visual simulation
      setIsSimulating(true);
      
      // Run backend simulation and save to database
      await runSimulation(request);
      
      // Stop visual simulation after completion
      setIsSimulating(false);
    } catch (error) {
      console.error('Failed to run simulation:', error);
      // Stop visual simulation on error
      setIsSimulating(false);
    }
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

  // Expose simulation handler to parent
  useEffect(() => {
    (window as any).__handleSimulate = handleSimulate;
    return () => {
      delete (window as any).__handleSimulate;
    };
  }, [nodes, edges, isSimulating]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <MetricsPanel percentileResult={percentileResult} />
        </div>
        <PropertiesPanel /> 
      </div>

      {/* Floating AI Analysis Button */}
      <button
        onClick={() => setShowAIModal(true)}
        disabled={nodes.length === 0}
        className="fixed bottom-8 right-8 z-40 inline-flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
        title="AI Architecture Analysis"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <span className="font-bold">AI Analysis</span>
      </button>
      
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

      {/* Simulation Result Modal */}
      {simulationResult && (
        <SimulationResultModal
          isOpen={showResultModal}
          onClose={() => {
            console.log('🔴 Closing modal');
            setShowResultModal(false);
          }}
          result={simulationResult}
          percentileResult={percentileResult || undefined}
        />
      )}
      {showVersionHistory && diagramId && (
        <VersionHistory 
          diagramId={diagramId}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
      />
    </>
  );
};
