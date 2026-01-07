import { useState, useCallback } from 'react';
import { aiApi } from '@/services/ai.service';
import type { AIAnalysisStatus, AIAnalysisType, BackendDiagramContent } from '@/services/types/ai.types';

/**
 * Hook để sử dụng AI analysis features
 */
export function useAIAnalysis() {
  const [status, setStatus] = useState<AIAnalysisStatus>('idle');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Phân tích kiến trúc theo loại
   */
  const analyze = useCallback(async (
    type: AIAnalysisType,
    diagramData: BackendDiagramContent,
    options?: {
      projectName?: string;
      expectedTrafficPerDay?: number;
    }
  ) => {
    setStatus('loading');
    setError(null);
    setResult(null);

    try {
      let response: any;

      switch (type) {
        case 'architecture':
          response = await aiApi.analyzeArchitecture(diagramData);
          setResult(response.analysis || '');
          break;

        case 'performance':
          response = await aiApi.suggestPerformance(diagramData);
          setResult(response.suggestions || '');
          break;

        case 'security':
          response = await aiApi.detectSecurityIssues(diagramData);
          setResult(response.securityReport || '');
          break;

        case 'patterns':
          response = await aiApi.compareWithPatterns(diagramData);
          setResult(response.comparison || '');
          break;

        case 'documentation':
          if (!options?.projectName) {
            throw new Error('Project name is required for documentation generation');
          }
          response = await aiApi.generateDocumentation(diagramData, options.projectName);
          setResult(response.documentation || '');
          break;

        case 'cost':
          if (!options?.expectedTrafficPerDay) {
            throw new Error('Expected traffic per day is required for cost estimation');
          }
          response = await aiApi.estimateCost(diagramData, options.expectedTrafficPerDay);
          setResult(response.costEstimate || '');
          break;

        default:
          throw new Error(`Unknown analysis type: ${type}`);
      }

      setStatus('success');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setStatus('error');
      throw err;
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    analyze,
    reset,
  };
}

/**
 * Hook đơn giản để chat với AI
 */
export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chat = useCallback(async (userPrompt: string, systemPrompt?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiApi.chat({ userPrompt, systemPrompt });
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chat failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    chat,
    isLoading,
    error,
  };
}

/**
 * Hook để batch multiple AI analyses
 */
export function useBatchAIAnalysis() {
  const [status, setStatus] = useState<AIAnalysisStatus>('idle');
  const [results, setResults] = useState<Map<AIAnalysisType, string>>(new Map());
  const [errors, setErrors] = useState<Map<AIAnalysisType, string>>(new Map());

  const analyzeMultiple = useCallback(async (
    types: AIAnalysisType[],
    diagramData: BackendDiagramContent,
    options?: {
      projectName?: string;
      expectedTrafficPerDay?: number;
    }
  ) => {
    setStatus('loading');
    setResults(new Map());
    setErrors(new Map());

    const promises = types.map(async (type) => {
      try {
        let response: any;

        switch (type) {
          case 'architecture':
            response = await aiApi.analyzeArchitecture(diagramData);
            return { type, result: response.analysis };

          case 'performance':
            response = await aiApi.suggestPerformance(diagramData);
            return { type, result: response.suggestions };

          case 'security':
            response = await aiApi.detectSecurityIssues(diagramData);
            return { type, result: response.securityReport };

          case 'patterns':
            response = await aiApi.compareWithPatterns(diagramData);
            return { type, result: response.comparison };

          case 'documentation':
            if (!options?.projectName) {
              throw new Error('Project name required');
            }
            response = await aiApi.generateDocumentation(diagramData, options.projectName);
            return { type, result: response.documentation };

          case 'cost':
            if (!options?.expectedTrafficPerDay) {
              throw new Error('Expected traffic required');
            }
            response = await aiApi.estimateCost(diagramData, options.expectedTrafficPerDay);
            return { type, result: response.costEstimate };

          default:
            throw new Error(`Unknown type: ${type}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
        return { type, error: errorMessage };
      }
    });

    const responses = await Promise.all(promises);

    const newResults = new Map<AIAnalysisType, string>();
    const newErrors = new Map<AIAnalysisType, string>();

    responses.forEach((response) => {
      if ('result' in response && response.result) {
        newResults.set(response.type, response.result);
      } else if ('error' in response && response.error) {
        newErrors.set(response.type, response.error);
      }
    });

    setResults(newResults);
    setErrors(newErrors);
    setStatus(newErrors.size > 0 ? 'error' : 'success');

    return { results: newResults, errors: newErrors };
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResults(new Map());
    setErrors(new Map());
  }, []);

  return {
    status,
    results,
    errors,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    analyzeMultiple,
    reset,
  };
}
