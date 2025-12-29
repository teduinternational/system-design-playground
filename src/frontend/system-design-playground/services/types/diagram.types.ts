/**
 * Diagram DTOs - Match với backend DTOs
 */

export interface DiagramDto {
  id: string;
  name: string;
  description?: string;
  jsonData: string;
  version: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDiagramDto {
  name: string;
  description?: string;
  jsonData: string;
  createdBy?: string;
}

export interface UpdateDiagramDto {
  name: string;
  description?: string;
  jsonData: string;
}
