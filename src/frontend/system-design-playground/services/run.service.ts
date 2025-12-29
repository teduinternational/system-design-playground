import { fetchAPI } from './api';
import type { CreateRunDto, UpdateRunStatusDto, RunDto } from './types/simulation.types';

/**
 * Run API Service
 * Handles simulation run history and status tracking
 */
export const runApi = {
  /**
   * Create a new simulation run
   */
  create: async (dto: CreateRunDto): Promise<RunDto> => {
    return fetchAPI<RunDto>('/api/runs', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Get all runs for a specific scenario
   */
  getByScenario: async (scenarioId: string): Promise<RunDto[]> => {
    return fetchAPI<RunDto[]>(`/api/scenarios/${scenarioId}/runs`, {
      method: 'GET',
    });
  },

  /**
   * Get a specific run by ID
   */
  getById: async (id: string): Promise<RunDto> => {
    return fetchAPI<RunDto>(`/api/runs/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update run status and metrics
   */
  updateStatus: async (id: string, dto: UpdateRunStatusDto): Promise<RunDto> => {
    return fetchAPI<RunDto>(`/api/runs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },
};
