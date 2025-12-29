/**
 * Scenario DTOs - Match với backend DTOs
 */

export interface ScenarioDto {
  id: string;
  diagramId: string;
  name: string;
  versionTag: string;
  contentJson: string;
  changeLog?: string;
  parentScenarioId?: string;
  isSnapshot: boolean;
  createdAt: string;
}

/**
 * DTO để tạo Scenario mới
 * Note: diagramId được lấy từ URL route, không gửi trong body
 */
export interface CreateScenarioDto {
  name: string;
  versionTag: string;
  contentJson: string;
  changeLog?: string;
  parentScenarioId?: string;
  isSnapshot: boolean;
}

export interface UpdateScenarioDto {
  name: string;
  contentJson: string;
  changeLog?: string;
}
