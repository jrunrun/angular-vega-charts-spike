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
    // Clone spec to avoid side effects and apply custom formatting
    const clonedSpec = JSON.parse(JSON.stringify(spec));
    applyFormatConfig(clonedSpec);

    // Compile Vega-Lite spec to Vega spec
    const compiled = vegaLite.compile(clonedSpec).spec;
    
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

// Generate expression function name
// NOTE: Must start with letter and only contain alphanumeric characters
const generateExpressionFunctionName = () => `chart${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;

// Register vega-lite custom formatter functions using customFormatterMaps on spec
const registerCustomFormatters = (vizId: string, customFormatterMaps: any) => {
  vega.expressionFunction(vizId, (datum: any, formatterName: string) => {
    const valueMap = customFormatterMaps[formatterName];
    if (!valueMap) {
      console.warn(`Unable to find custom formatter map for: '${formatterName}'`);
      return datum;
    }
    return valueMap[datum] || datum;
  });
}

function _applyFormatConfig(obj: any, formatterFunctionName: string) {
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      if (k === 'format' && 'custom' in obj[k]) {
        const { mapName } = obj[k];
        obj.format = mapName;
        obj.formatType = formatterFunctionName;
      }
      _applyFormatConfig(obj[k], formatterFunctionName);
    }
  }
}

export const applyFormatConfig = (spec: any) => {
  const { customFormatterMaps } = spec;
  if (!customFormatterMaps) { return; }

  const functionName = generateExpressionFunctionName();
  registerCustomFormatters(functionName, customFormatterMaps);
  _applyFormatConfig(spec, functionName);
}
