import { fetchAPI } from './api';
import type {
  ChatRequest,
  ChatResponse,
  ArchitectureDocumentationRequest,
  ArchitectureDocumentationResponse,
  CostEstimationRequest,
  CostEstimationResponse,
  AIAnalysisResponse,
  BackendDiagramContent,
} from './types/ai.types';

/**
 * AI Service
 * Tích hợp với các AI endpoints để phân tích và tư vấn kiến trúc hệ thống
 */
export const aiApi = {
  /**
   * Test AI service với câu hỏi đơn giản
   */
  test: async (question?: string): Promise<{ question: string; answer: string; timestamp: string }> => {
    const params = question ? `?question=${encodeURIComponent(question)}` : '';
    return fetchAPI<{ question: string; answer: string; timestamp: string }>(`/api/ai/test${params}`);
  },

  /**
   * Chat với AI sử dụng custom prompts
   */
  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    return fetchAPI<ChatResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Phân tích kiến trúc hệ thống tổng thể
   * Đưa ra đánh giá, điểm mạnh, vấn đề tiềm ẩn và đề xuất cải thiện
   */
  analyzeArchitecture: async (diagramData: BackendDiagramContent): Promise<AIAnalysisResponse> => {
    return fetchAPI<AIAnalysisResponse>('/api/ai/analyze-architecture', {
      method: 'POST',
      body: JSON.stringify(diagramData),
    });
  },

  /**
   * Đề xuất cải thiện performance
   * Tập trung vào latency, throughput, scalability, resource usage
   */
  suggestPerformance: async (diagramData: BackendDiagramContent): Promise<AIAnalysisResponse> => {
    return fetchAPI<AIAnalysisResponse>('/api/ai/suggest-performance', {
      method: 'POST',
      body: JSON.stringify(diagramData),
    });
  },

  /**
   * Phát hiện các vấn đề bảo mật tiềm ẩn
   * Xác định lỗ hổng, điểm yếu trong auth/authz, data security
   */
  detectSecurityIssues: async (diagramData: BackendDiagramContent): Promise<AIAnalysisResponse> => {
    return fetchAPI<AIAnalysisResponse>('/api/ai/detect-security-issues', {
      method: 'POST',
      body: JSON.stringify(diagramData),
    });
  },

  /**
   * Tạo tài liệu kiến trúc chi tiết (Markdown format)
   * Bao gồm executive summary, system overview, technical specs, v.v.
   */
  generateDocumentation: async (
    diagramData: BackendDiagramContent,
    projectName: string
  ): Promise<ArchitectureDocumentationResponse> => {
    const request: ArchitectureDocumentationRequest = {
      diagramData,
      projectName,
    };
    
    return fetchAPI<ArchitectureDocumentationResponse>('/api/ai/generate-documentation', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * So sánh kiến trúc với các design patterns phổ biến
   * Xác định pattern đang sử dụng, so sánh với best practices, đề xuất patterns phù hợp hơn
   */
  compareWithPatterns: async (diagramData: BackendDiagramContent): Promise<AIAnalysisResponse> => {
    return fetchAPI<AIAnalysisResponse>('/api/ai/compare-patterns', {
      method: 'POST',
      body: JSON.stringify(diagramData),
    });
  },

  /**
   * Ước tính chi phí vận hành hệ thống
   * Dựa trên cấu hình và traffic dự kiến
   */
  estimateCost: async (
    diagramData: BackendDiagramContent,
    expectedTrafficPerDay: number
  ): Promise<CostEstimationResponse> => {
    const request: CostEstimationRequest = {
      diagramData,
      expectedTrafficPerDay,
    };
    
    return fetchAPI<CostEstimationResponse>('/api/ai/estimate-cost', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
