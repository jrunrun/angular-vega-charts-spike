import * as vega from 'vega';
import * as vegaLite from 'vega-lite';
import { VisualizationSpec } from 'vega-embed';

/**
 * Compiles a Vega-Lite spec to a Vega spec and generates an SVG string.
 * 
 * @param spec - The Vega-Lite specification (can include custom properties)
 * @returns A Promise that resolves to the SVG string representation of the chart
 */
export async function compileToSvg(spec: VisualizationSpec | any): Promise<string> {
  try {
    // Compile Vega-Lite spec to Vega spec
    const compiled = vegaLite.compile(spec).spec;
    
    // Parse the compiled Vega spec into a runtime specification
    const runtime = vega.parse(compiled);
    
    // Create a view with no renderer (we only need the SVG string)
    const view = new vega.View(runtime, { renderer: 'none' });
    
    // Initialize the view
    await view.runAsync();
    
    // Generate and return the SVG string
    const svgString = await view.toSVG();
    
    // Finalize the view to clean up
    view.finalize();
    
    return svgString;
  } catch (error) {
    console.error('Error compiling spec to SVG:', error);
    throw error;
  }
}

/**
 * Downloads an SVG string as a file named 'chart.svg'
 * 
 * @param svgString - The SVG string to download
 * @param filename - Optional filename (defaults to 'chart.svg')
 */
export function downloadSvgFile(svgString: string, filename: string = 'chart.svg'): void {
  try {
    // Create a Blob with the SVG content
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Revoke the URL to free up memory
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading SVG file:', error);
    throw error;
  }
}

