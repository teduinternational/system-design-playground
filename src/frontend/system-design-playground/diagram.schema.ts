import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

/**
 * Node Categories - phân loại theo 5 nhóm chính
 */
export enum NodeCategory {
  ENTRY_POINT = 'Entry Point',
  TRAFFIC_MANAGER = 'Traffic Manager',
  COMPUTE = 'Compute',
  STORAGE = 'Storage',
  MIDDLEWARE = 'Middleware'
}

/**
 * Thông số kỹ thuật của node
 */
export interface NodeSpecs {
  latencyBase: number;         // Độ trễ cơ bản (ms)
  maxThroughput: number;        // Throughput tối đa (req/s)
  reliability: number;          // Độ tin cậy (0.0 - 1.0)
}

/**
 * Logic routing và dependencies của node
 */
export interface NodeLogic {
  canReceiveFrom: string[];     // Các loại node có thể nhận từ
  canSendTo: string[];          // Các loại node có thể gửi tới
}

/**
 * Technical Props - Cấu hình kỹ thuật của node
 */
export interface TechnicalProps {
  instanceCount?: number;
  isClustered?: boolean;
  backupPolicy?: string;
  region?: string;
  [key: string]: any;           // Cho phép props tùy biến
}

/**
 * Simulation Props - Thông số mô phỏng
 */
export interface SimulationProps {
  processingTimeMs: number;     // Thời gian xử lý (ms)
  failureRate: number;          // Tỷ lệ lỗi (0.0 - 1.0)
  queueSize?: number;           // Kích thước hàng đợi
  currentLoad?: number;         // Tải hiện tại (0.0 - 1.0)
}

/**
 * Node Metadata - Thông tin đầy đủ của node
 */
export interface NodeMetadata {
  label: string;
  category: NodeCategory;
  technologies?: string[];      // Ví dụ: ["SQL Server", "PostgreSQL"]
  provider?: string;            // Ví dụ: "mssql", "redis", "aws"
  specs: NodeSpecs;
  logic?: NodeLogic;
  props?: TechnicalProps;       // Technical configuration
  simulation?: SimulationProps; // Simulation parameters
}

/**
 * Custom Node Data - Dữ liệu trong node của React Flow
 */
export interface CustomNodeData {
  category: NodeCategory;
  technologies?: string[];
  props?: TechnicalProps;
  simulation?: SimulationProps;
  // Visual properties
  iconName?: string;
  status?: 'healthy' | 'warning' | 'error' | 'idle';
  isSimulating?: boolean;
}

/**
 * System Node - Node theo chuẩn React Flow
 */
export type SystemNode = ReactFlowNode & {
  id: string;
  type: string;                 // "custom" hoặc loại khác của React Flow
  position: { x: number; y: number };
  data: CustomNodeData;
};

/**
 * Edge Data - Dữ liệu kết nối giữa các nodes
 */
export interface EdgeData {
  protocol: string;             // "https", "grpc", "tcp", etc.
  auth?: string;                // "JWT", "OAuth2", "API Key", etc.
  trafficWeight?: number;       // Trọng số tải (1.0 = normal)
  networkLatency?: number;      // Độ trễ mạng (ms)
}

/**
 * System Edge - Edge theo chuẩn React Flow
 */
export type SystemEdge = ReactFlowEdge & {
  id: string;
  source: string;
  target: string;
  label?: string;               // Nhãn hiển thị trên edge
  data?: EdgeData;
};

/**
 * Diagram Metadata - Thông tin về diagram
 */
export interface DiagramMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;            // ISO 8601 format
  updatedAt: string;
  version: number;
  createdBy?: string;
  tags?: string[];
}

/**
 * System Diagram - Cấu trúc đầy đủ của diagram
 */
export interface SystemDiagram {
  metadata: DiagramMetadata;
  nodes: SystemNode[];
  edges: SystemEdge[];
}

/**
 * Diagram Content - Chỉ chứa nodes và edges (dùng để lưu trữ)
 */
export interface DiagramContent {
  nodes: SystemNode[];
  edges: SystemEdge[];
}
