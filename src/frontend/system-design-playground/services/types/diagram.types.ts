// ============================================
// Diagram Models - Khớp 100% với C# Backend Models
// ============================================

/**
 * Node Specs - Thông số kỹ thuật cho mô phỏng node
 * Khớp với C# NodeSpecs
 */
export interface NodeSpecs {
  latencyBase: number;
  maxThroughput: number;
  reliability: number;
}

/**
 * Node Logic - Logic routing và dependencies
 * Khớp với C# NodeLogic
 */
export interface NodeLogic {
  canReceiveFrom: string[];
  canSendTo: string[];
}

/**
 * Technical Props - Cấu hình kỹ thuật của node
 * Khớp với C# TechnicalProps
 */
export interface TechnicalProps {
  instanceCount?: number;
  isClustered?: boolean;
  backupPolicy?: string;
  region?: string;
  additionalProps?: Record<string, any>;
}

/**
 * Simulation Props - Thông số mô phỏng
 * Khớp với C# SimulationProps
 */
export interface SimulationProps {
  processingTimeMs: number;
  failureRate: number;
  queueSize?: number;
  currentLoad?: number;
}

/**
 * Node Metadata - Đầy đủ metadata của node
 * Khớp với C# NodeMetadata
 */
export interface NodeMetadata {
  label: string;
  category: string;
  specs: NodeSpecs;
  technologies?: string[];
  provider?: string;
  logic?: NodeLogic;
  props?: TechnicalProps;
  simulation?: SimulationProps;
  iconName?: string;
  status?: string;
}

/**
 * Position - Vị trí node trên canvas
 * Khớp với C# Position
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Node Model - Model node đầy đủ
 * Khớp với C# NodeModel
 */
export interface NodeModel {
  id: string;
  type: string;
  metadata: NodeMetadata;
  position?: Position;
}

/**
 * Edge Data - Dữ liệu edge (connection) giữa các nodes
 * Khớp với C# EdgeData
 */
export interface EdgeData {
  protocol: string;
  auth?: string;
  trafficWeight?: number;
  networkLatency?: number;
}

/**
 * Edge Model - Model edge đầy đủ
 * Khớp với C# EdgeModel
 */
export interface EdgeModel {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: EdgeData;
}

/**
 * Diagram Metadata - Thông tin về diagram
 * Khớp với C# DiagramMetadata
 */
export interface DiagramMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  createdBy?: string;
  tags?: string[];
}

/**
 * Diagram Content - Nội dung đầy đủ của diagram
 * Khớp hoàn toàn với C# DiagramContent
 * ĐÂY LÀ FORMAT CHÍNH THỨC để trao đổi dữ liệu giữa backend và frontend
 */
export interface DiagramContent {
  metadata: DiagramMetadata;
  nodes: NodeModel[];
  edges: EdgeModel[];
}

// ============================================
// API DTOs
// ============================================

export interface DiagramDto {
  id: string;
  name: string;
  description?: string;
  jsonData: string; // JSON string of DiagramContent
  version: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDiagramDto {
  name: string;
  description?: string;
  jsonData: string; // JSON string of DiagramContent
  createdBy?: string;
}

export interface UpdateDiagramDto {
  name: string;
  description?: string;
  jsonData: string; // JSON string of DiagramContent
}
