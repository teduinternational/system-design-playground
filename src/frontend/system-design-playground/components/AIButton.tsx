import React from 'react';

/**
 * AI Button Component - Nút để mở AI Analysis Modal
 */
interface AIButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const AIButton: React.FC<AIButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      title="AI Analysis - Analyze your architecture with AI"
    >
      <svg
        className="w-5 h-5"
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
      <span>AI Analysis</span>
    </button>
  );
};

/**
 * Quick AI Actions Dropdown
 */
interface QuickAIActionsProps {
  onAnalyze: (type: 'architecture' | 'performance' | 'security') => void;
}

export const QuickAIActions: React.FC<QuickAIActionsProps> = ({ onAnalyze }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const actions = [
    {
      type: 'architecture' as const,
      icon: '🏗️',
      label: 'Architecture Review',
      description: 'Get overall architecture assessment',
    },
    {
      type: 'performance' as const,
      icon: '⚡',
      label: 'Performance Tips',
      description: 'Optimize speed and throughput',
    },
    {
      type: 'security' as const,
      icon: '🔒',
      label: 'Security Audit',
      description: 'Check for vulnerabilities',
    },
  ];

  const handleAction = (type: 'architecture' | 'performance' | 'security') => {
    onAnalyze(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        title="Quick AI Actions"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
        <span className="text-sm">Quick AI</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              {actions.map((action) => (
                <button
                  key={action.type}
                  onClick={() => handleAction(action.type)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {action.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
