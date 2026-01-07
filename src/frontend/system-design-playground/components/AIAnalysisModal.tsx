import React, { useState } from 'react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useDiagramStore } from '@/stores/useDiagramStore';
import { convertToBackendFormat } from '@/utils/convertDiagram';
import type { AIAnalysisType } from '@/services/types/ai.types';

/**
 * Modal hiển thị kết quả AI Analysis
 */
interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState<AIAnalysisType>('architecture');
  const [projectName, setProjectName] = useState('My Project');
  const [expectedTraffic, setExpectedTraffic] = useState(1000000);
  
  const { nodes, edges } = useDiagramStore();
  const { status, result, error, analyze, reset } = useAIAnalysis();

  const handleAnalyze = async () => {
    const diagramData = convertToBackendFormat(nodes, edges);

    try {
      await analyze(selectedType, diagramData, {
        projectName: selectedType === 'documentation' ? projectName : undefined,
        expectedTrafficPerDay: selectedType === 'cost' ? expectedTraffic : undefined,
      });
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const analysisTypes: { value: AIAnalysisType; label: string; description: string }[] = [
    {
      value: 'architecture',
      label: '🏗️ Architecture Analysis',
      description: 'Phân tích tổng thể, điểm mạnh, vấn đề tiềm ẩn',
    },
    {
      value: 'performance',
      label: '⚡ Performance Optimization',
      description: 'Đề xuất cải thiện latency, throughput, scalability',
    },
    {
      value: 'security',
      label: '🔒 Security Audit',
      description: 'Phát hiện lỗ hổng bảo mật và đề xuất khắc phục',
    },
    {
      value: 'patterns',
      label: '📐 Design Patterns',
      description: 'So sánh với các patterns phổ biến',
    },
    {
      value: 'documentation',
      label: '📄 Generate Documentation',
      description: 'Tạo tài liệu kiến trúc chi tiết (Markdown)',
    },
    {
      value: 'cost',
      label: '💰 Cost Estimation',
      description: 'Ước tính chi phí vận hành hệ thống',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">AI Architecture Analysis</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Analysis Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Analysis Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysisTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 text-left border-2 rounded-lg transition-all ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium text-gray-900 mb-1">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          {selectedType === 'documentation' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>
          )}

          {selectedType === 'cost' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Traffic (requests/day)
              </label>
              <input
                type="number"
                value={expectedTraffic}
                onChange={(e) => setExpectedTraffic(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1000000"
                min="0"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={status === 'loading'}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-6"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              'Run Analysis'
            )}
          </button>

          {/* Results */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Analysis Failed</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Result</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-white p-4 rounded border border-gray-200">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          {result && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(result);
                alert('Copied to clipboard!');
              }}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Copy Result
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
