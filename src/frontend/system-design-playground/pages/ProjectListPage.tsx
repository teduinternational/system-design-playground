import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, MoreVertical, Folder } from 'lucide-react';
import sampleDiagram from '../mock-data/sample-diagram.json';

// Generate project from sample diagram metadata
const PROJECT = {
  id: sampleDiagram.metadata.id,
  name: sampleDiagram.metadata.name,
  updated: new Date(sampleDiagram.metadata.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }),
  version: `v${sampleDiagram.metadata.version}.0`,
  nodes: sampleDiagram.nodes.length,
  description: sampleDiagram.metadata.description,
  tags: sampleDiagram.metadata.tags
};

export const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample Project from Mock Data */}
          <div 
            onClick={() => navigate('/editor')}
            className="group bg-surface border border-border hover:border-primary/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-surface-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Folder className="w-5 h-5" />
              </div>
              <button className="text-secondary hover:text-white p-1 rounded hover:bg-white/5">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">{PROJECT.name}</h3>
            <p className="text-xs text-secondary mb-3 line-clamp-2">{PROJECT.description}</p>
            
            <div className="flex items-center gap-4 text-xs text-secondary mt-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {PROJECT.updated}
              </span>
              <span className="bg-background px-2 py-0.5 rounded border border-border">
                {PROJECT.version}
              </span>
              <span>{PROJECT.nodes} nodes</span>
            </div>
            
            {PROJECT.tags && PROJECT.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {PROJECT.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
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
      </div>
    </div>
  );
};
