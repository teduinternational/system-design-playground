import React, { useState, useEffect } from 'react';
import { Clock, Tag, GitBranch, Eye, RotateCcw, Trash2, GitCompare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scenarioApi, diagramApi, type ScenarioDto } from '@/services/api';
import { useDiagramStore } from '@/stores/useDiagramStore';
import { toast } from './Toast';

interface VersionHistoryProps {
  diagramId: string;
  onClose: () => void;
}

/**
 * Component hiển thị version history và quản lý scenarios
 */
export const VersionHistory: React.FC<VersionHistoryProps> = ({ diagramId, onClose }) => {
  const [scenarios, setScenarios] = useState<ScenarioDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDto | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const loadDiagram = useDiagramStore((state) => state.loadDiagram);
  const serializeDiagram = useDiagramStore((state) => state.serializeDiagram);

  // Load all scenarios
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const data = await scenarioApi.getByDiagram(diagramId);
        setScenarios(data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (error) {
        console.error('Failed to load scenarios:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadScenarios();
  }, [diagramId]);

  // Preview scenario (read-only)
  const handlePreview = async (scenario: ScenarioDto) => {
    try {
      const content = JSON.parse(scenario.contentJson);
      setSelectedScenario(scenario);
      // TODO: Open in preview modal or side panel
      console.log('Preview scenario:', scenario.versionTag);
    } catch (error) {
      console.error('Failed to preview scenario:', error);
    }
  };

  // Restore scenario to working copy
  const handleRestore = async (scenario: ScenarioDto) => {
    if (!confirm(`Restore to version ${scenario.versionTag}? Current changes will be lost.`)) {
      return;
    }
    
    try {
      // Get current diagram info
      const diagram = await diagramApi.getById(diagramId);
      
      // Update diagram with scenario content
      await diagramApi.update(diagramId, {
        name: diagram.name,
        description: diagram.description,
        jsonData: scenario.contentJson
      });
      
      // Reload canvas
      const restored = JSON.parse(scenario.contentJson);
      loadDiagram(restored);
      
      toast.success(`Successfully restored to ${scenario.versionTag}`);
      onClose();
    } catch (error) {
      console.error('Failed to restore scenario:', error);
      toast.error('Failed to restore version');
    }
  };

  // Toggle scenario selection for comparison
  const toggleScenarioForCompare = (scenarioId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      }
      if (prev.length >= 2) {
        toast.warning('You can only compare 2 versions at a time');
        return prev;
      }
      return [...prev, scenarioId];
    });
  };

  // Navigate to compare page
  const handleCompare = () => {
    if (selectedForCompare.length !== 2) {
      toast.warning('Please select exactly 2 versions to compare');
      return;
    }
    navigate(`/compare?scenario1=${selectedForCompare[0]}&scenario2=${selectedForCompare[1]}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Version History</h2>
            <p className="text-sm text-secondary">
              {compareMode ? 'Select 2 versions to compare' : 'View and restore previous versions'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {compareMode ? (
              <>
                <button
                  onClick={handleCompare}
                  disabled={selectedForCompare.length !== 2}
                  className="px-3 py-1.5 bg-primary hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <GitCompare className="w-4 h-4" />
                  Compare ({selectedForCompare.length}/2)
                </button>
                <button
                  onClick={() => {
                    setCompareMode(false);
                    setSelectedForCompare([]);
                  }}
                  className="px-3 py-1.5 bg-surface-hover hover:bg-border text-white rounded text-sm transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setCompareMode(true)}
                disabled={scenarios.length < 2}
                className="px-3 py-1.5 bg-surface-hover hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors flex items-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                Compare Versions
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-secondary hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-secondary">Loading versions...</div>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="w-12 h-12 mx-auto text-secondary mb-3" />
              <p className="text-secondary">No saved versions yet</p>
              <p className="text-xs text-secondary mt-1">
                Click "Save Version" to create your first snapshot
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((scenario, index) => (
                <div 
                  key={scenario.id}
                  className={`bg-background border rounded-lg p-4 transition-all ${
                    compareMode && selectedForCompare.includes(scenario.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${compareMode ? 'cursor-pointer' : ''}`}
                  onClick={() => compareMode && toggleScenarioForCompare(scenario.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {compareMode && (
                        <input
                          type="checkbox"
                          checked={selectedForCompare.includes(scenario.id)}
                          onChange={() => toggleScenarioForCompare(scenario.id)}
                          className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <div className={`w-2 h-2 rounded-full ${
                        scenario.isSnapshot ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{scenario.name}</h3>
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded border border-primary/20">
                            {scenario.versionTag}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-secondary mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDate(scenario.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    {!compareMode && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePreview(scenario)}
                          className="p-1.5 text-secondary hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRestore(scenario)}
                          className="p-1.5 text-secondary hover:text-green-500 hover:bg-green-500/10 rounded transition-colors"
                          title="Restore this version"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {scenario.changeLog && (
                    <p className="text-sm text-secondary mt-2 pl-5">
                      {scenario.changeLog}
                    </p>
                  )}
                  
                  {scenario.parentScenarioId && (
                    <div className="flex items-center gap-1 text-xs text-secondary mt-2 pl-5">
                      <GitBranch className="w-3 h-3" />
                      <span>Branched from parent version</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
