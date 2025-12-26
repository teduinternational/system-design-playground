import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Share2, Settings, Network, Square, Download, ChevronDown, Image, FileJson, Copy } from 'lucide-react';

interface HeaderProps {
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onExportPng?: () => void;
  onExportJson?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isSimulating, 
  onToggleSimulate,
  onExportPng,
  onExportJson
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const isEditor = currentPath === '/editor';
  const isSettings = currentPath === '/settings';
  
  return (
    <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0 z-20 relative">
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center gap-2 text-white cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/projects')}
        >
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center shadow-[0_0_20px_-5px_rgba(43,75,238,0.3)]">
            <Network className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-sm tracking-tight">SystemPlay</h1>
        </div>
        
        <div className="h-4 w-px bg-border mx-2"></div>
        
        {isEditor ? (
          <div className="flex items-center gap-2 text-sm">
             <button 
              onClick={() => navigate('/projects')}
              className="text-secondary hover:text-white transition-colors flex items-center gap-1"
            >
              Projects <span>/</span>
            </button>
            <span className="font-medium">E-Commerce Architecture</span>
            <span className="bg-surface-hover text-xs px-1.5 py-0.5 rounded border border-border text-secondary">v2.4</span>
          </div>
        ) : (
          <span className="text-sm font-medium text-white capitalize">
            {currentPath.replace('/', '')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isEditor && (
          <button 
            onClick={onToggleSimulate}
            className={`
              h-8 px-4 rounded text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mr-2 transition-all
              ${isSimulating 
                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                : 'bg-success hover:bg-green-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]'}
            `}
          >
            {isSimulating ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white" />
                Simulate Flow
              </>
            )}
          </button>
        )}
        
        {isEditor && (
          <div className="flex -space-x-2 mr-2">
            <div className="w-7 h-7 rounded-full border-2 border-surface bg-gray-600"></div>
            <div className="w-7 h-7 rounded-full border-2 border-surface bg-gray-500"></div>
            <div className="w-7 h-7 rounded-full border-2 border-surface bg-surface-hover flex items-center justify-center text-[10px] font-medium text-secondary">+3</div>
          </div>
        )}

        {isEditor && (
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-primary hover:bg-blue-600 transition-colors text-white h-8 px-3 rounded text-xs font-medium flex items-center gap-1.5 shadow-[0_0_20px_-5px_rgba(43,75,238,0.3)]"
            >
              <Download className="w-3.5 h-3.5" />
              Export
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showExportMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowExportMenu(false)}
                />
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onExportPng?.();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-hover transition-colors flex items-center gap-3 text-white"
                    >
                      <Image className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-medium">Export as PNG</div>
                        <div className="text-xs text-secondary">High-quality image for docs</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        onExportJson?.();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-hover transition-colors flex items-center gap-3 text-white"
                    >
                      <FileJson className="w-4 h-4 text-green-400" />
                      <div>
                        <div className="font-medium">Export as JSON</div>
                        <div className="text-xs text-secondary">Save diagram data</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        <button 
          onClick={() => navigate('/settings')}
          className={`h-8 w-8 flex items-center justify-center rounded hover:bg-surface-hover transition-colors ${isSettings ? 'bg-surface-hover text-white' : 'text-secondary'}`}
        >
          <Settings className="w-4 h-4" />
        </button>
        
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-border"></div>
      </div>
    </header>
  );
};