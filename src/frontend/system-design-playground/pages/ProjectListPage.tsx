import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, MoreVertical, Folder, Loader2 } from 'lucide-react';
import { useApiDiagramPersistence } from '@/hooks/useApiDiagramPersistence';
import type { DiagramDto } from '@/services/api';

export const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAllDiagrams, isLoading, error } = useApiDiagramPersistence();
  const [diagrams, setDiagrams] = useState<DiagramDto[]>([]);
  
  // Load diagrams from API on mount
  useEffect(() => {
    const loadDiagrams = async () => {
      const data = await getAllDiagrams();
      setDiagrams(data);
    };
    loadDiagrams();
  }, [getAllDiagrams]);
  
  const handleOpenDiagram = (id: string) => {
    navigate(`/editor?id=${id}`);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getNodeCount = (jsonData: string): number => {
    try {
      const data = JSON.parse(jsonData);
      return data.nodes?.length || 0;
    } catch {
      return 0;
    }
  };
  
  const getTags = (jsonData: string): string[] => {
    try {
      const data = JSON.parse(jsonData);
      return data.metadata?.tags || [];
    } catch {
      return [];
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Projects</h2>
            <p className="text-secondary text-sm">Manage your system architecture diagrams</p>
          </div>
          <button 
            onClick={() => navigate('/editor')}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-secondary">Loading diagrams...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Diagrams Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Existing Diagrams from API */}
            {diagrams.map((diagram) => {
              const nodeCount = getNodeCount(diagram.jsonData);
              const tags = getTags(diagram.jsonData);
              
              return (
                <div 
                  key={diagram.id}
                  onClick={() => handleOpenDiagram(diagram.id)}
                  className="group bg-surface border border-border hover:border-primary/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-surface-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Folder className="w-5 h-5" />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add menu for edit/delete
                      }}
                      className="text-secondary hover:text-white p-1 rounded hover:bg-white/5"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">
                    {diagram.name}
                  </h3>
                  <p className="text-xs text-secondary mb-3 line-clamp-2">
                    {diagram.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-secondary mt-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(diagram.updatedAt || diagram.createdAt)}
                    </span>
                    <span className="bg-background px-2 py-0.5 rounded border border-border">
                      v{diagram.version}.0
                    </span>
                    <span>{nodeCount} nodes</span>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tags.slice(0, 3).map((tag) => (
                        <span 
                          key={tag} 
                          className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Create New Placeholder */}
            <button 
            onClick={() => navigate('/editor')}
            className="border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-secondary hover:text-primary hover:border-primary hover:bg-primary/5 transition-all min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Create from Template</span>
          </button>
          </div>
        )}
      </div>
    </div>
  );
};
