import { useState, useCallback } from 'react';
import { diagramApi, type DiagramDto, type CreateDiagramDto, type UpdateDiagramDto } from '@/services/api';
import { useDiagramStore, type SerializedDiagram } from '@/stores/useDiagramStore';

/**
 * Hook to manage diagram persistence with backend API
 */
export function useApiDiagramPersistence() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const serializeDiagram = useDiagramStore((state) => state.serializeDiagram);
  const loadDiagram = useDiagramStore((state) => state.loadDiagram);

  /**
   * Convert DiagramDto from API to SerializedDiagram format
   */
  const convertApiToSerialized = (dto: DiagramDto): SerializedDiagram => {
    const parsedData = JSON.parse(dto.jsonData);
    return {
      metadata: {
        id: dto.id,
        name: dto.name,
        description: dto.description || '',
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt || dto.createdAt,
        version: dto.version,
        createdBy: dto.createdBy || 'unknown',
        tags: parsedData.metadata?.tags || [],
      },
      nodes: parsedData.nodes || [],
      edges: parsedData.edges || [],
    };
  };

  /**
   * Convert SerializedDiagram to API format
   */
  const convertSerializedToApi = (diagram: SerializedDiagram): string => {
    return JSON.stringify({
      metadata: diagram.metadata,
      nodes: diagram.nodes,
      edges: diagram.edges,
    });
  };

  /**
   * Load diagram from API by ID
   */
  const loadDiagramFromApi = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dto = await diagramApi.getById(id);
      const serializedDiagram = convertApiToSerialized(dto);
      loadDiagram(serializedDiagram);
      console.log('✅ Diagram loaded from API:', id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load diagram';
      setError(errorMessage);
      console.error('❌ Failed to load diagram from API:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadDiagram]);

  /**
   * Save current diagram to API (create new)
   */
  const saveDiagramToApi = useCallback(async (
    name?: string,
    description?: string,
    createdBy?: string
  ): Promise<DiagramDto | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const diagram = serializeDiagram();
      const jsonData = convertSerializedToApi(diagram);
      
      const createDto: CreateDiagramDto = {
        name: name || diagram.metadata.name || 'Untitled Diagram',
        description: description || diagram.metadata.description,
        jsonData,
        createdBy: createdBy || diagram.metadata.createdBy,
      };
      
      const result = await diagramApi.create(createDto);
      console.log('✅ Diagram saved to API:', result.id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save diagram';
      setError(errorMessage);
      console.error('❌ Failed to save diagram to API:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [serializeDiagram]);

  /**
   * Update existing diagram on API
   */
  const updateDiagramOnApi = useCallback(async (
    id: string,
    name?: string,
    description?: string
  ): Promise<DiagramDto | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const diagram = serializeDiagram();
      const jsonData = convertSerializedToApi(diagram);
      
      const updateDto: UpdateDiagramDto = {
        name: name || diagram.metadata.name || 'Untitled Diagram',
        description: description || diagram.metadata.description,
        jsonData,
      };
      
      const result = await diagramApi.update(id, updateDto);
      console.log('✅ Diagram updated on API:', id);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update diagram';
      setError(errorMessage);
      console.error('❌ Failed to update diagram on API:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [serializeDiagram]);

  /**
   * Delete diagram from API
   */
  const deleteDiagramFromApi = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await diagramApi.delete(id);
      console.log('✅ Diagram deleted from API:', id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete diagram';
      setError(errorMessage);
      console.error('❌ Failed to delete diagram from API:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all diagrams from API
   */
  const getAllDiagrams = useCallback(async (userId?: string, search?: string): Promise<DiagramDto[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const diagrams = await diagramApi.getAll(userId, search);
      console.log(`✅ Loaded ${diagrams.length} diagrams from API`);
      return diagrams;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load diagrams';
      setError(errorMessage);
      console.error('❌ Failed to load diagrams from API:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Export diagram as JSON file
   */
  const exportDiagram = useCallback((filename: string = 'diagram.json') => {
    try {
      const diagram = serializeDiagram();
      const json = JSON.stringify(diagram, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('📥 Diagram exported to file:', filename);
      return true;
    } catch (err) {
      console.error('❌ Failed to export diagram:', err);
      return false;
    }
  }, [serializeDiagram]);

  /**
   * Import diagram from JSON file
   */
  const importDiagram = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const diagram = JSON.parse(json) as SerializedDiagram;
          loadDiagram(diagram);
          console.log('📤 Diagram imported from file:', file.name);
          resolve(true);
        } catch (err) {
          console.error('❌ Failed to import diagram:', err);
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ Failed to read file:', file.name);
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  }, [loadDiagram]);

  return {
    isLoading,
    error,
    loadDiagramFromApi,
    saveDiagramToApi,
    updateDiagramOnApi,
    deleteDiagramFromApi,
    getAllDiagrams,
    exportDiagram,
    importDiagram,
  };
}
