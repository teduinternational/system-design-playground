import React, { useState } from 'react';
import { GitBranch, X } from 'lucide-react';

interface SaveVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (versionTag: string, versionName: string, changeLog: string) => Promise<void>;
}

export const SaveVersionModal: React.FC<SaveVersionModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [versionTag, setVersionTag] = useState('');
  const [versionName, setVersionName] = useState('');
  const [changeLog, setChangeLog] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!versionTag.trim() || !versionName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(versionTag.trim(), versionName.trim(), changeLog.trim());
      onClose();
      // Reset form
      setVersionTag('');
      setVersionName('');
      setChangeLog('');
    } catch (error) {
      console.error('Save version failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill version name based on tag
  const handleVersionTagChange = (value: string) => {
    setVersionTag(value);
    if (value && !versionName) {
      setVersionName(`Version ${value}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg w-full max-w-md p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Save Version</h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-secondary mb-4">
          Create a snapshot of the current diagram state
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Version Tag */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Version Tag *
              </label>
              <input
                type="text"
                value={versionTag}
                onChange={(e) => handleVersionTagChange(e.target.value)}
                placeholder="e.g., v1.0.0, v2.1.3"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-secondary focus:outline-none focus:border-primary transition-colors"
                autoFocus
                required
                disabled={isLoading}
              />
              <p className="text-xs text-secondary mt-1">
                Follow semantic versioning (e.g., v1.0.0)
              </p>
            </div>

            {/* Version Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Version Name *
              </label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="e.g., Initial Release"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-secondary focus:outline-none focus:border-primary transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            {/* Change Log */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Change Log
              </label>
              <textarea
                value={changeLog}
                onChange={(e) => setChangeLog(e.target.value)}
                placeholder="Describe the changes made in this version..."
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-white placeholder-secondary focus:outline-none focus:border-primary transition-colors resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-secondary mt-1">
                Optional: Document what changed in this version
              </p>
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
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !versionTag.trim() || !versionName.trim()}
            >
              <GitBranch className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
