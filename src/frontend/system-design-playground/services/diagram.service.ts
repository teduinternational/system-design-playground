import { fetchAPI } from './api';
import type { DiagramDto, CreateDiagramDto, UpdateDiagramDto } from './types/diagram.types';

/**
 * Diagram API Service
 */
export const diagramApi = {
  /**
   * Lấy tất cả diagrams
   */
  getAll: async (userId?: string, search?: string): Promise<DiagramDto[]> => {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (search) params.append('search', search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchAPI<DiagramDto[]>(`/api/diagrams${query}`);
  },

  /**
   * Lấy diagram theo ID
   */
  getById: async (id: string): Promise<DiagramDto> => {
    return fetchAPI<DiagramDto>(`/api/diagrams/${id}`);
  },

  /**
   * Tạo diagram mới
   */
  create: async (data: CreateDiagramDto): Promise<DiagramDto> => {
    return fetchAPI<DiagramDto>('/api/diagrams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật diagram
   */
  update: async (id: string, data: UpdateDiagramDto): Promise<DiagramDto> => {
    return fetchAPI<DiagramDto>(`/api/diagrams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Xóa diagram (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/api/diagrams/${id}`, {
      method: 'DELETE',
    });
  },
};
