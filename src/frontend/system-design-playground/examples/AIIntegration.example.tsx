/**
 * Example: Integrating AI Analysis into EditorPage
 * 
 * File này minh họa cách tích hợp AI Analysis vào EditorPage
 * hoặc bất kỳ component nào khác trong ứng dụng.
 */

import React, { useState } from 'react';
import { AIAnalysisModal } from '@/components/AIAnalysisModal';
import { AIButton, QuickAIActions } from '@/components/AIButton';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useDiagramStore } from '@/stores/useDiagramStore';
import { convertToBackendFormat } from '@/utils/convertDiagram';
import type { AIAnalysisType } from '@/services/types/ai.types';

/**
 * CÁCH 1: Thêm AI Button vào Toolbar
 * ===================================
 * 
 * Trong file components/Toolbar.tsx, thêm:
 */
export function ToolbarWithAI() {
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <div className="flex items-center gap-2 p-4 bg-white border-b">
      {/* Các buttons khác... */}
      
      {/* AI Analysis Button */}
      <AIButton onClick={() => setShowAIModal(true)} />
      
      {/* AI Analysis Modal */}
      <AIAnalysisModal 
        isOpen={showAIModal} 
        onClose={() => setShowAIModal(false)} 
      />
    </div>
  );
}

/**
 * CÁCH 2: Thêm Quick AI Actions Dropdown
 * ========================================
 * 
 * Nếu muốn quick actions không cần mở modal:
 */
export function ToolbarWithQuickAI() {
  const { analyze } = useAIAnalysis();
  const { nodes, edges } = useDiagramStore();

  const handleQuickAnalyze = async (type: 'architecture' | 'performance' | 'security') => {
    const diagramData = convertToBackendFormat(nodes, edges);

    try {
      await analyze(type, diagramData);
      alert('Analysis completed! Check the console for results.');
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-white border-b">
      {/* Quick AI Actions */}
      <QuickAIActions onAnalyze={handleQuickAnalyze} />
    </div>
  );
}

/**
 * CÁCH 3: Tích hợp vào EditorPage với state management
 * =====================================================
 * 
 * Thêm vào EditorPage.tsx:
 */
export function EditorPageWithAI() {
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysisType, setAIAnalysisType] = useState<AIAnalysisType>('architecture');

  // Expose AI handlers to parent
  React.useEffect(() => {
    // setExportHandlers({
    //   ...otherHandlers,
    //   onAIAnalysis: () => setShowAIModal(true),
    // });
  }, []);

  return (
    <div>
      {/* Existing Editor UI */}
      
      {/* AI Analysis Modal */}
      <AIAnalysisModal 
        isOpen={showAIModal} 
        onClose={() => setShowAIModal(false)} 
      />
    </div>
  );
}

/**
 * CÁCH 4: Programmatic AI Analysis
 * ==================================
 * 
 * Sử dụng trực tiếp trong code:
 */
export function ProgrammaticAIExample() {
  const { analyze, status, result, error } = useAIAnalysis();
  const { nodes, edges } = useDiagramStore();

  const runAnalysis = async () => {
    const diagramData = convertToBackendFormat(nodes, edges);

    try {
      // Architecture analysis
      await analyze('architecture', diagramData);
      console.log('Architecture Analysis:', result);

      // Performance suggestions
      await analyze('performance', diagramData);
      console.log('Performance Suggestions:', result);

      // Security audit
      await analyze('security', diagramData);
      console.log('Security Report:', result);

      // Generate documentation
      await analyze('documentation', diagramData, { 
        projectName: 'My System' 
      });
      console.log('Documentation:', result);

      // Cost estimation
      await analyze('cost', diagramData, { 
        expectedTrafficPerDay: 1000000 
      });
      console.log('Cost Estimate:', result);

      // Compare patterns
      await analyze('patterns', diagramData);
      console.log('Pattern Comparison:', result);

    } catch (err) {
      console.error('AI Analysis failed:', err);
    }
  };

  return (
    <div>
      <button onClick={runAnalysis} disabled={status === 'loading'}>
        {status === 'loading' ? 'Analyzing...' : 'Run All Analyses'}
      </button>

      {error && <div className="error">{error}</div>}
      {result && <pre>{result}</pre>}
    </div>
  );
}

/**
 * CÁCH 5: Batch Analysis với useBatchAIAnalysis
 * ===============================================
 */
import { useBatchAIAnalysis } from '@/hooks/useAIAnalysis';

export function BatchAIExample() {
  const { analyzeMultiple, results, errors, status } = useBatchAIAnalysis();
  const { nodes, edges } = useDiagramStore();

  const runBatchAnalysis = async () => {
    const diagramData = convertToBackendFormat(nodes, edges);

    // Run multiple analyses at once
    const { results, errors } = await analyzeMultiple(
      ['architecture', 'performance', 'security'],
      diagramData
    );

    // Process results
    results.forEach((result, type) => {
      console.log(`${type}:`, result);
    });

    // Handle errors
    errors.forEach((error, type) => {
      console.error(`${type} failed:`, error);
    });
  };

  return (
    <button onClick={runBatchAnalysis}>
      Run Batch Analysis
    </button>
  );
}

/**
 * API USAGE EXAMPLES
 * ==================
 */

// Direct API calls (without hooks)
import { aiApi } from '@/services/ai.service';
import type { BackendDiagramContent } from '@/services/types/ai.types';

export async function directApiExample() {
  const diagramData: BackendDiagramContent = { 
    nodes: [], 
    edges: [] 
  };

  // Test AI service
  const testResult = await aiApi.test('What is Clean Architecture?');
  console.log(testResult);

  // Chat
  const chatResult = await aiApi.chat({
    userPrompt: 'How can I improve my microservices architecture?',
    systemPrompt: 'You are a senior architect.',
  });
  console.log(chatResult);

  // Architecture analysis
  const analysis = await aiApi.analyzeArchitecture(diagramData);
  console.log(analysis);

  // Performance suggestions
  const perf = await aiApi.suggestPerformance(diagramData);
  console.log(perf);

  // Security audit
  const security = await aiApi.detectSecurityIssues(diagramData);
  console.log(security);

  // Documentation
  const docs = await aiApi.generateDocumentation(diagramData, 'MyProject');
  console.log(docs);

  // Pattern comparison
  const patterns = await aiApi.compareWithPatterns(diagramData);
  console.log(patterns);

  // Cost estimation
  const cost = await aiApi.estimateCost(diagramData, 1000000);
  console.log(cost);
}
