import { v4 as uuidv4 } from 'uuid';

export default class ResponseFormatter {
  static DOCUMENT_TYPES = {
    'report': '📊',
    'case': '📱',
    'study': '📚',
    'analysis': '📈',
    'article': '📃',
    'paper': '📄',
    'survey': '📋',
    'data': '📈',
    'document': '📝',
    'default': '📄'
  };

  // Visualization-related keywords to detect potential chart content
  static VISUALIZATION_KEYWORDS = [
    'trend', 'stats', 'chart', 'graph', 'visualization', 'plot', 'data', 'analytics',
    'metrics', 'statistics', 'figures', 'numbers', 'comparison', 'dashboard', 
    'report', 'analysis', 'patterns', 'measure', 'tracking', 'insights',
    'indicators', 'dimensions', 'variables', 'dataset', 'quantitative', 'distribution',
    'average', 'mean', 'median', 'percentage', 'ratio', 'proportion', 'frequency',
    'historical', 'timeline', 'projection', 'forecast', 'prediction', 'correlate',
    'series', 'scatter', 'bar', 'line', 'pie', 'radar', 'area', 'histogram'
  ];

  static hasVisualizationKeywords(text) {
    if (!text || typeof text !== 'string') return false;
    
    const lowerText = text.toLowerCase();
    return this.VISUALIZATION_KEYWORDS.some(keyword => lowerText.includes(keyword));
  }

  static getDocumentEmoji(filename) {
    if (!filename) return this.DOCUMENT_TYPES.default;
    
    const lowerFilename = filename.toLowerCase();
    for (const [docType, emoji] of Object.entries(this.DOCUMENT_TYPES)) {
      if (lowerFilename.includes(docType)) {
        return emoji;
      }
    }
    return this.DOCUMENT_TYPES.default;
  }

  // Format citations with better error handling
  static formatCitations(citations, hyperlinks) {
    console.log('Formatting citations:', { citations, hyperlinks });
    
    if (!citations || !Array.isArray(citations) || citations.length === 0) {
      return [];
    }

    const formattedCitations = [];

    citations.forEach((citation, index) => {
      if (!citation) {
        return;
      }

      try {
        // Use original citation name without cleaning
        const filename = typeof citation === 'string' ? citation : 
                         citation.title ? citation.title : 
                         citation.name ? citation.name : 
                         `Source ${index + 1}`;
        
        const emoji = this.getDocumentEmoji(filename);
        
        // Determine URL with flexible fallbacks
        let url = '#';
        if (hyperlinks && hyperlinks[index]) {
          url = hyperlinks[index];
        } else if (citation.url) {
          url = citation.url;
        } else if (citation.link) {
          url = citation.link;
        } else if (citation.href) {
          url = citation.href;
        }

        formattedCitations.push({
          id: uuidv4(),
          text: filename,
          emoji,
          url,
          originalSource: citation
        });
        
      } catch (error) {
        console.error(`Citation formatting error for index ${index}:`, error);
        // Fallback for any errors
        formattedCitations.push({
          id: uuidv4(),
          text: `Source ${index + 1}`,
          emoji: '📄',
          url: hyperlinks?.[index] || '#',
          originalSource: citation
        });
      }
    });

    console.log('Formatted citations:', formattedCitations);
    return formattedCitations;
  }

  // Enhanced graph data handling
  static formatGraphData(data) {
    if (!data) return null;
    
    try {
      let graphData;
      
      // Handle string input (JSON parsing)
      if (typeof data === 'string') {
        try {
          graphData = JSON.parse(data);
        } catch (e) {
          console.error('Failed to parse graph JSON data:', e);
          return null;
        }
      } else {
        graphData = data;
      }
      
      // Validate required graph fields
      if (!graphData.datasets || !Array.isArray(graphData.datasets)) {
        console.error('Invalid graph data: Missing or invalid datasets array');
        return null;
      }
      
      // Ensure chartType exists (default to 'bar' if missing)
      if (!graphData.chartType) {
        graphData.chartType = 'bar';
      }
      
      // Ensure labels exist
      if (!graphData.labels && graphData.datasets.length > 0 && graphData.datasets[0].data) {
        // Create default labels if missing
        graphData.labels = graphData.datasets[0].data.map((_, i) => `Item ${i+1}`);
      }
      
      // Clean color values by removing backticks if present
      graphData.datasets = graphData.datasets.map(dataset => {
        if (dataset.borderColor && typeof dataset.borderColor === 'string') {
          dataset.borderColor = dataset.borderColor.replace(/`/g, '');
        }
        if (dataset.backgroundColor && typeof dataset.backgroundColor === 'string') {
          dataset.backgroundColor = dataset.backgroundColor.replace(/`/g, '');
        }
        
        // For array of colors
        if (dataset.backgroundColor && Array.isArray(dataset.backgroundColor)) {
          dataset.backgroundColor = dataset.backgroundColor.map(color => 
            typeof color === 'string' ? color.replace(/`/g, '') : color
          );
        }
        
        return dataset;
      });
      
      return graphData;
    } catch (error) {
      console.error('Error formatting graph data:', error);
      return null;
    }
  }

  // Format tables with enhanced error handling
  static formatTables(text) {
    if (!text) return text;

    // Process tables wrapped in {{TABLE_DATA:...}} markers
    text = text.replace(/{{TABLE_DATA:(.*?)}}/g, (match, jsonStr) => {
      try {
        // Basic validation to ensure it's valid JSON
        const parsed = JSON.parse(jsonStr);
        if (!Array.isArray(parsed) && !parsed.datasets && !parsed.rows) {
          throw new Error('Invalid table format');
        }
        
        return `%%TABLE_JSON%%${jsonStr}%%END_TABLE%%`;
      } catch (e) {
        console.error('Failed to parse table data:', e);
        return match; // Keep original if parsing fails
      }
    });

    // Process tables wrapped in {{GRAPH_DATA:...}} markers
    text = text.replace(/{{GRAPH_DATA:(.*?)}}/g, (match, jsonStr) => {
      try {
        const graphData = this.formatGraphData(jsonStr);
        if (!graphData) {
          throw new Error('Invalid graph format');
        }
        
        return `%%GRAPH_JSON%%${JSON.stringify(graphData)}%%END_GRAPH%%`;
      } catch (e) {
        console.error('Failed to parse graph data:', e);
        return match; // Keep original if parsing fails
      }
    });

    // Convert markdown tables to our custom format
    const markdownTablePattern = /\n\|([^\n]+)\|\n\|([-\s|]+)\|\n((?:\|[^\n]+\|\n)+)/g;
    text = text.replace(markdownTablePattern, (match, headerRow, separatorRow, bodyRows) => {
      try {
        const headers = headerRow.split('|')
          .map(h => h.trim())
          .filter(h => h !== '');
        
        if (headers.length === 0) {
          throw new Error('No headers found in markdown table');
        }
        
        const rows = [];
        bodyRows.split('\n').forEach(row => {
          if (row.trim() === '') return;
          
          const cells = row.split('|')
            .map(cell => cell.trim())
            .filter((cell, index) => index > 0 && index <= headers.length);
          
          if (cells.length > 0) {
            const rowObj = {};
            headers.forEach((header, i) => {
              rowObj[header] = cells[i] || '';
            });
            rows.push(rowObj);
          }
        });
        
        if (rows.length === 0) {
          throw new Error('No rows found in markdown table');
        }
        
        const tableJson = JSON.stringify(rows);
        return `%%TABLE_JSON%%${tableJson}%%END_TABLE%%`;
      } catch (e) {
        console.error('Failed to parse markdown table:', e);
        return match; // Keep original if parsing fails
      }
    });

    return text;
  }

  // Look for potential graph data in the text and attempt to convert it
  static extractGraphData(text) {
    if (!text) return text;
    
    // Try to find JSON-like structures that might be graph data
    const jsonPattern = /```json\s*({[\s\S]*?})\s*```/g;
    return text.replace(jsonPattern, (match, jsonStr) => {
      try {
        const data = JSON.parse(jsonStr);
        
        // Check if this JSON looks like chart data
        if (data && 
            ((data.datasets && Array.isArray(data.datasets)) || 
             (data.chartType && data.data) ||
             (data.labels && Array.isArray(data.labels) && data.datasets))) {
          
          const graphData = this.formatGraphData(data);
          if (graphData) {
            return `%%GRAPH_JSON%%${JSON.stringify(graphData)}%%END_GRAPH%%`;
          }
        }
        return match;
      } catch (e) {
        return match;
      }
    });
  }

  // Process responses that might contain graph-like data markers
  static processGraphMarkers(text) {
    if (!text) return text;
    
    // Replace various formats of graph markers
    const patterns = [
      /\[CHART:([^[\]]*)\]/g,
      /\{GRAPH:([^{}]*)\}/g,
      /\(VISUALIZATION:([^()]*)\)/g,
      /\[DISPLAY_CHART:([^[\]]*)\]/g,
      /\[VISUALIZATION:([^[\]]*)\]/g
    ];
    
    patterns.forEach(pattern => {
      text = text.replace(pattern, (match, graphDescriptor) => {
        // Check if it's already JSON
        if (graphDescriptor.trim().startsWith('{') && graphDescriptor.trim().endsWith('}')) {
          try {
            const graphData = this.formatGraphData(graphDescriptor);
            if (graphData) {
              return `%%GRAPH_JSON%%${JSON.stringify(graphData)}%%END_GRAPH%%`;
            }
          } catch (e) {
            console.error('Failed to parse graph descriptor:', e);
          }
        }
        return match;
      });
    });
    
    return text;
  }

  // Main response parsing function
  static parseResponseText(response) {
    if (!response) return "";
    
    try {
      // Handle string responses
      if (typeof response === 'string') {
        return response;
      }
      
      // Handle object responses
      if (typeof response === 'object') {
        // Check for structured graph data
        if (response.chartType && response.datasets) {
          // This looks like graph data, wrap it for rendering
          const graphData = this.formatGraphData(response);
          if (graphData) {
            return `Here's a visualization of the data:\n\n%%GRAPH_JSON%%${JSON.stringify(graphData)}%%END_GRAPH%%`;
          }
        }
        
        // Check for nested content structures
        if (response.answer) {
          // If answer is nested object, extract it recursively
          if (typeof response.answer === 'object') {
            return this.parseResponseText(response.answer);
          }
          return response.answer;
        }
        
        if (response.content) {
          if (typeof response.content === 'object') {
            return this.parseResponseText(response.content);
          }
          return response.content;
        }
        
        if (response.text) {
          return response.text;
        }
        
        // For visualization data
        if (response.visualization || response.chart || response.graph) {
          const vizData = response.visualization || response.chart || response.graph;
          const graphData = this.formatGraphData(vizData);
          if (graphData) {
            return `Here's a visualization of the data:\n\n%%GRAPH_JSON%%${JSON.stringify(graphData)}%%END_GRAPH%%`;
          }
        }
        
        // Last resort: stringify the object
        return JSON.stringify(response);
      }
      
      return String(response);
    } catch (error) {
      console.error('Error parsing response text:', error);
      return String(response || "");
    }
  }

  // Comprehensive content processing
  static processContent(content) {
    if (!content) return "";
    
    try {
      // First clean up any encoding issues
      let processedContent = this.cleanResponseText(content);
      
      // Process tables
      processedContent = this.formatTables(processedContent);
      
      // Try to extract graph data from code blocks
      processedContent = this.extractGraphData(processedContent);
      
      // Process any graph markers
      processedContent = this.processGraphMarkers(processedContent);
      
      return processedContent;
    } catch (error) {
      console.error('Error processing content:', error);
      return content;
    }
  }

  // Clean response text with enhanced handling
  static cleanResponseText(text) {
    if (!text) return "";
    
    try {
      // Handle escaped unicode characters (like \u2019 - right single quotation mark)
      text = text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      
      // Handle surrogate pairs for emojis (like \ud83d\udd0d - 🔍)
      text = text.replace(/\\ud([0-9a-fA-F]{3})\\ud([0-9a-fA-F]{3})/g, (match, high, low) => {
        const highSurrogate = parseInt(high, 16);
        const lowSurrogate = parseInt(low, 16);
        return String.fromCodePoint((highSurrogate << 10) + lowSurrogate - 0x35FDC00);
      });
      
      // Clean up other special characters
      text = text.replace(/\\n/g, '\n');
      text = text.replace(/\\t/g, '\t');
      text = text.replace(/\\"/g, '"');
      text = text.replace(/\\'/g, "'");
      text = text.replace(/\\\\/g, "\\");
      
      // Fix for incomplete markdown formatting (like dangling ** at the end)
      text = text.replace(/\*\*$/g, '');
      
      // Handle unbalanced markdown formatting
      const boldCount = (text.match(/\*\*/g) || []).length;
      if (boldCount % 2 !== 0) {
        // If there's an odd number of bold markers, remove the last one
        const lastBoldIndex = text.lastIndexOf('**');
        if (lastBoldIndex !== -1) {
          text = text.substring(0, lastBoldIndex) + text.substring(lastBoldIndex + 2);
        }
      }
      
      // If the text is a JSON string that was mistakenly stringified twice
      if (text.startsWith('"') && text.endsWith('"') && 
          (text.includes('\\n') || text.includes('\\"'))) {
        try {
          const parsed = JSON.parse(text);
          // Make sure we don't return an object
          return typeof parsed === 'string' ? parsed : text;
        } catch (e) {
          // If parsing fails, keep the original with escapes replaced
        }
      }
      
      return text;
    } catch (error) {
      console.error('Error cleaning response text:', error);
      return text;
    }
  }
}