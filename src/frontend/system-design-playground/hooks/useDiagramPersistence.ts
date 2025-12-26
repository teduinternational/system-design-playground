import { useEffect, useRef } from 'react';
import { useDiagramStore } from '@/stores/useDiagramStore';

const STORAGE_KEY = 'system-design-diagram';
const DEBOUNCE_DELAY = 1000; // 1 second

/**
 * Hook to persist diagram to localStorage with debouncing
 */
export function useDiagramPersistence() {
  const serializeDiagram = useDiagramStore((state) => state.serializeDiagram);
  const loadDiagram = useDiagramStore((state) => state.loadDiagram);
  const nodes = useDiagramStore((state) => state.nodes);
  const edges = useDiagramStore((state) => state.edges);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (isInitialLoad.current) {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const diagram = JSON.parse(savedData);
          loadDiagram(diagram);
          console.log('✅ Diagram loaded from localStorage');
        } catch (error) {
          console.error('❌ Failed to load diagram from localStorage:', error);
        }
      }
      isInitialLoad.current = false;
    }
  }, [loadDiagram]);

  // Auto-save to localStorage with debouncing
  useEffect(() => {
    // Skip save on initial load
    if (isInitialLoad.current) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      try {
        const diagram = serializeDiagram();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(diagram, null, 2));
        console.log('💾 Diagram auto-saved to localStorage');
      } catch (error) {
        console.error('❌ Failed to save diagram to localStorage:', error);
      }
    }, DEBOUNCE_DELAY);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, serializeDiagram]);

  // Manual save function
  const saveDiagram = () => {
    try {
      const diagram = serializeDiagram();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(diagram, null, 2));
      console.log('💾 Diagram manually saved to localStorage');
      return true;
    } catch (error) {
      console.error('❌ Failed to save diagram:', error);
      return false;
    }
  };

  // Manual load function
  const loadSavedDiagram = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const diagram = JSON.parse(savedData);
        loadDiagram(diagram);
        console.log('✅ Diagram manually loaded from localStorage');
        return true;
      } catch (error) {
        console.error('❌ Failed to load diagram:', error);
        return false;
      }
    }
    return false;
  };

  // Export diagram as JSON file
  const exportDiagram = (filename: string = 'diagram.json') => {
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
    } catch (error) {
      console.error('❌ Failed to export diagram:', error);
      return false;
    }
  };

  // Import diagram from JSON file
  const importDiagram = (file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const json = e.target?.result as string;
          const diagram = JSON.parse(json);
          loadDiagram(diagram);
          console.log('📤 Diagram imported from file:', file.name);
          resolve(true);
        } catch (error) {
          console.error('❌ Failed to import diagram:', error);
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ Failed to read file:', file.name);
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  };

  // Clear saved diagram
  const clearSavedDiagram = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Saved diagram cleared from localStorage');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear saved diagram:', error);
      return false;
    }
  };

  return {
    saveDiagram,
    loadSavedDiagram,
    exportDiagram,
    importDiagram,
    clearSavedDiagram,
  };
}
