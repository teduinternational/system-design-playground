import { toPng } from 'html-to-image';

/**
 * Export React Flow canvas as PNG image
 */
export async function exportCanvasToPng(
  filename: string = 'system-diagram.png'
): Promise<boolean> {
  try {
    // Find the React Flow container
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    
    if (!reactFlowElement) {
      console.error('❌ React Flow container not found');
      return false;
    }

    console.log('📸 Capturing diagram as PNG...');

    // Generate PNG from the React Flow element
    const dataUrl = await toPng(reactFlowElement, {
      backgroundColor: '#0b0c10', // Match the canvas background
      cacheBust: true,
      pixelRatio: 2, // Higher quality (2x resolution)
      filter: (node) => {
        // Exclude controls and minimap from the export
        const exclusionClasses = ['react-flow__controls', 'react-flow__minimap'];
        return !exclusionClasses.some(className => 
          node.classList?.contains(className)
        );
      },
    });

    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Diagram exported as PNG:', filename);
    return true;
  } catch (error) {
    console.error('❌ Failed to export diagram as PNG:', error);
    return false;
  }
}

/**
 * Export React Flow canvas as high-quality PNG with custom settings
 */
export async function exportCanvasToPngHighQuality(
  filename: string = 'system-diagram-hq.png',
  options?: {
    pixelRatio?: number;
    backgroundColor?: string;
    width?: number;
    height?: number;
  }
): Promise<boolean> {
  try {
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    
    if (!reactFlowElement) {
      console.error('❌ React Flow container not found');
      return false;
    }

    console.log('📸 Capturing high-quality diagram...');

    const dataUrl = await toPng(reactFlowElement, {
      backgroundColor: options?.backgroundColor || '#0b0c10',
      cacheBust: true,
      pixelRatio: options?.pixelRatio || 3, // 3x resolution for high quality
      width: options?.width,
      height: options?.height,
      filter: (node) => {
        const exclusionClasses = ['react-flow__controls', 'react-flow__minimap'];
        return !exclusionClasses.some(className => 
          node.classList?.contains(className)
        );
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ High-quality diagram exported:', filename);
    return true;
  } catch (error) {
    console.error('❌ Failed to export high-quality diagram:', error);
    return false;
  }
}

/**
 * Copy diagram to clipboard as PNG
 */
export async function copyCanvasToClipboard(): Promise<boolean> {
  try {
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    
    if (!reactFlowElement) {
      console.error('❌ React Flow container not found');
      return false;
    }

    console.log('📋 Copying diagram to clipboard...');

    const blob = await toPng(reactFlowElement, {
      backgroundColor: '#0b0c10',
      cacheBust: true,
      pixelRatio: 2,
      filter: (node) => {
        const exclusionClasses = ['react-flow__controls', 'react-flow__minimap'];
        return !exclusionClasses.some(className => 
          node.classList?.contains(className)
        );
      },
    }).then(dataUrl => {
      return fetch(dataUrl).then(res => res.blob());
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);

    console.log('✅ Diagram copied to clipboard');
    return true;
  } catch (error) {
    console.error('❌ Failed to copy diagram to clipboard:', error);
    return false;
  }
}
