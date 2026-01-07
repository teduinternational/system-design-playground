/**
 * AI Service Types
 */

/**
 * Backend API DiagramContent format (không phải React Flow format)
 */
export interface BackendDiagramContent {
  nodes: Array<{
    id: string;
    type: string;
    metadata: {
      label: string;
      category: string;
      specs: {
        latencyBase: number;
        maxThroughput: number;
        reliability: number;
      };
      technologies?: string[];
      provider?: string;
      props?: Record<string, any>;
      simulation?: {
        processingTimeMs: number;
        failureRate: number;
        queueSize?: number;
        currentLoad?: number;
      };
      logic?: {
        canReceiveFrom: string[];
        canSendTo: string[];
      };
    };
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    data?: {
      protocol: string;
      auth?: string;
      trafficWeight?: number;
      networkLatency?: number;
    };
  }>;
}

/**
 * Request cho chat endpoint
 */
export interface ChatRequest {
  userPrompt: string;
  systemPrompt?: string;
}

/**
 * Response từ chat endpoint
 */
export interface ChatResponse {
  question: string;
  answer: string;
  timestamp: string;
}

/**
 * Request cho architecture documentation
 */
export interface ArchitectureDocumentationRequest {
  diagramData: BackendDiagramContent;
  projectName: string;
}

/**
 * Response cho architecture documentation
 */
export interface ArchitectureDocumentationResponse {
  documentation: string;
  projectName: string;
  timestamp: string;
}

/**
 * Request cho cost estimation
 */
export interface CostEstimationRequest {
  diagramData: BackendDiagramContent;
  expectedTrafficPerDay: number;
}

/**
 * Response cho cost estimation
 */
export interface CostEstimationResponse {
  costEstimate: string;
  expectedTrafficPerDay: number;
  timestamp: string;
}

/**
 * Generic AI Response
 */
export interface AIAnalysisResponse {
  analysis?: string;
  suggestions?: string;
  securityReport?: string;
  comparison?: string;
  timestamp: string;
}

/**
 * AI Analysis Type
 */
export type AIAnalysisType = 
  | 'architecture'
  | 'performance'
  | 'security'
  | 'patterns'
  | 'documentation'
  | 'cost';

/**
 * Status của AI analysis
 */
export type AIAnalysisStatus = 'idle' | 'loading' | 'success' | 'error';
