
export type AppView = 'projects' | 'editor' | 'settings' | 'simulate' | 'compare';

export enum NodeType {
  COMPUTE = 'COMPUTE',
  STORAGE = 'STORAGE',
  NETWORKING = 'NETWORKING',
  MESSAGING = 'MESSAGING'
}

export interface NodeStats {
  cpu: number;
  memory: number;
  requests: number;
  latency: number;
}

export interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  subLabel?: string;
  iconName?: string; // Tên icon để map với Lucide
  status?: 'healthy' | 'warning' | 'error' | 'idle';
  config?: Record<string, any>;
  isSimulating?: boolean; // Cờ bật chế độ mô phỏng
  stats?: NodeStats; // Dữ liệu thống kê realtime
}

export interface Node {
  id: string;
  position: { x: number; y: number };
  data: NodeData;
  type?: string;
  selected?: boolean;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: any;
  label?: string; // Hiển thị thông số trên dây
}

export interface LibraryItem {
  type: NodeType;
  label: string;
  iconName: string;
  color: string;
}

export interface LibraryCategory {
  title: string;
  items: LibraryItem[];
}
