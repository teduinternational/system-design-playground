// ============================================
// Simulation Types
// ============================================

export interface SimulationNode {
  id: string;
  type: string;
  latencyMs: number;
  isEntryPoint?: boolean;
}

export interface SimulationEdge {
  id: string;
  source: string;
  target: string;
  latencyMs: number;
}

export interface SimulationRequest {
  nodes: SimulationNode[];
  edges: SimulationEdge[];
}

export interface SimulationResult {
  entryNode: string;
  endNode: string;
  path: string[];
  totalLatencyMs: number;
  pathLength: number;
  summary: string;
}

export interface LongestPathsResponse {
  totalPaths: number;
  paths: SimulationResult[];
}

export interface AnalyzeResponse {
  systemOverview: {
    totalNodes: number;
    totalEdges: number;
    entryPointsCount: number;
  };
  criticalPath: {
    from: string;
    to: string;
    totalLatencyMs: number;
    path: string[];
    pathLength: number;
  };
  statistics: {
    averagePathLatencyMs: number;
    maxPathLatencyMs: number;
    minPathLatencyMs: number;
    totalPaths: number;
  };
  allPaths: Array<{
    entryNode: string;
    endNode: string;
    latencyMs: number;
    nodeCount: number;
  }>;
}

// ============================================
// Run Types
// ============================================

export interface CreateRunDto {
  scenarioId: string;
  runName: string;
  environmentParams?: string; // JSON string, not object
}

export interface UpdateRunStatusDto {
  status: 0 | 1 | 2 | 3 | 4; // RunStatus enum: Pending=0, Processing=1, Completed=2, Failed=3, Cancelled=4
  averageLatencyMs?: number;
  throughputRps?: number;
  successfulRequests?: number;
  failedRequests?: number;
  errorRate?: number;
  resultJson?: string;
  errorMessage?: string;
}

export interface RunDto {
  id: string;
  scenarioId: string;
  runName: string;
  status: 0 | 1 | 2 | 3 | 4; // RunStatus enum: Pending=0, Processing=1, Completed=2, Failed=3, Cancelled=4
  startedAt: string;
  completedAt?: string;
  averageLatencyMs?: number;
  throughputRps?: number;
  successfulRequests?: number;
  failedRequests?: number;
  errorRate?: number;
  resultJson?: string;
  errorMessage?: string;
  environmentParams?: string; // JSON string, not object
}
