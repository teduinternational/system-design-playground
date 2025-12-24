import React from 'react';
import { 
  MousePointer2, 
  Hand, 
  Undo2, 
  Redo2, 
  Minus, 
  Plus 
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-full shadow-xl flex items-center p-1 z-30">
      <button className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-hover text-white transition-colors tooltip" title="Select">
        <MousePointer2 className="w-4 h-4" />
      </button>
      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover text-secondary hover:text-white transition-colors" title="Hand Tool">
        <Hand className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-border mx-1"></div>
      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover text-secondary hover:text-white transition-colors">
        <Undo2 className="w-4 h-4" />
      </button>
      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover text-secondary hover:text-white transition-colors">
        <Redo2 className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-border mx-1"></div>
      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover text-secondary hover:text-white transition-colors">
        <Minus className="w-4 h-4" />
      </button>
      <span className="text-xs font-mono w-12 text-center text-secondary">100%</span>
      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover text-secondary hover:text-white transition-colors">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};