/**
 * API Client Service
 * Common utilities cho tất cả HTTP requests tới backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7074';

/**
 * Generic fetch wrapper với error handling
 * Sử dụng bởi tất cả service layers
 */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Re-export types
export type {
  DiagramDto,
  CreateDiagramDto,
  UpdateDiagramDto,
} from './types/diagram.types';

export type {
  ScenarioDto,
  CreateScenarioDto,
  UpdateScenarioDto,
} from './types/scenario.types';

// Re-export services
export { diagramApi } from './diagram.service';
export { scenarioApi } from './scenario.service';
