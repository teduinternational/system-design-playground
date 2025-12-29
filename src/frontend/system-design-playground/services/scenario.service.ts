import { fetchAPI } from './api';
import type { ScenarioDto, CreateScenarioDto, UpdateScenarioDto } from './types/scenario.types';

/**
 * Scenario API Service
 */
export const scenarioApi = {
  /**
   * Lấy tất cả scenarios của một diagram
   */
  getByDiagram: async (diagramId: string): Promise<ScenarioDto[]> => {
    return fetchAPI<ScenarioDto[]>(`/api/diagrams/${diagramId}/scenarios`);
  },

  /**
   * Lấy scenario theo ID
   */
  getById: async (id: string): Promise<ScenarioDto> => {
    return fetchAPI<ScenarioDto>(`/api/scenarios/${id}`);
  },

  /**
   * Tạo scenario mới
   */
  create: async (diagramId: string, data: CreateScenarioDto): Promise<ScenarioDto> => {
    return fetchAPI<ScenarioDto>(`/api/diagrams/${diagramId}/scenarios`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật scenario
   */
  update: async (id: string, data: UpdateScenarioDto): Promise<ScenarioDto> => {
    return fetchAPI<ScenarioDto>(`/api/scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
