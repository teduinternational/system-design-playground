import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

interface SaveDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  defaultName?: string;
  defaultDescription?: string;
  title?: string;
  mode?: 'create' | 'update';
}

export const SaveDiagramModal: React.FC<SaveDiagramModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName = '',
  defaultDescription = '',
  title = 'Save Diagram',
  mode = 'create'
}) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(name.trim(), description.trim());
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg w-full max-w-md p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Diagram Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Diagram Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter diagram name"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-secondary focus:outline-none focus:border-primary transition-colors"
                autoFocus
                required
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)"
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-secondary focus:outline-none focus:border-primary transition-colors resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface-hover hover:bg-background border border-border rounded-md text-white transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !name.trim()}
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
