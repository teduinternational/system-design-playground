/**
 * API Client Service
 * Common utilities cho tất cả HTTP requests tới backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7074';

/**
 * Get JWT token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Generic fetch wrapper với error handling và JWT authentication
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

  // Automatically attach JWT token if available
  const token = getAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

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

export type {
  ComparisonResult,
  ScenarioMetrics,
  ComparisonDifferences,
} from './comparison.api';

// Re-export services
export { diagramApi } from './diagram.service';
export { scenarioApi } from './scenario.service';
export { simulationApi } from './simulation.service';
export { runApi } from './run.service';
export { comparisonApi } from './comparison.api';
export { authService } from './auth.service';
