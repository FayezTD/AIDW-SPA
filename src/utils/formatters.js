import { v4 as uuidv4 } from 'uuid';

export default class ResponseFormatter {
  static DOCUMENT_TYPES = {
    'report': '📊',
    'case': '📱',
    'study': '📚',
    'analysis': '📈',
    'default': '📄'
  };

  /**
   * Determine the appropriate emoji based on filename
   * @param {string} filename - The filename to analyze
   * @return {string} - Appropriate emoji
   */
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

  /**
   * Clean and format the filename
   * @param {string} filename - The filename to clean
   * @return {string} - Cleaned filename
   */
  static cleanFilename(filename) {
    if (!filename) return 'Unknown Source';
    
    // Remove common unwanted patterns
    let cleaned = filename.replace(/[_-]+/g, ' ');
    
    // Split on double underscores and take first part if exists
    if (cleaned.includes('__')) {
      cleaned = cleaned.split('__')[0];
    }
    
    // Convert to title case for better readability
    cleaned = cleaned.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
      
    return cleaned.trim() || 'Unknown Source';
  }

  /**
   * Format citations and hyperlinks into markdown
   * @param {Array<string>} citations - List of citation sources
   * @param {Array<string>} hyperlinks - List of corresponding hyperlinks
   * @return {Array<object>} - Formatted citations with IDs
   */
  static formatCitations(citations, hyperlinks) {
    console.log('Formatting citations:', { citations, hyperlinks });
    
    if (!citations || citations.length === 0) {
      return [];
    }

    const formattedCitations = [];

    citations.forEach((citation, index) => {
      if (!citation) {
        return;
      }

      try {
        // Get clean filename
        const filename = this.cleanFilename(citation);
        
        // Get appropriate emoji
        const emoji = this.getDocumentEmoji(filename);
        
        // Determine URL (use hyperlink if available, otherwise use citation as fallback)
        const url = (hyperlinks && hyperlinks[index]) ? hyperlinks[index] : citation;

        formattedCitations.push({
          id: uuidv4(),
          text: filename,
          emoji,
          url,
          originalSource: citation
        });
        
      } catch (error) {
        console.error(`Citation formatting error for index ${index}:`, error);
        // Add a fallback citation format
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

  /**
   * Process and format table data in the response text
   * @param {string} text - The response text that might contain table data
   * @return {string} - Text with table markers added
   */
  static formatTables(text) {
    // Look for markdown tables or special table markers from the API
    if (!text) return text;

    // Option 1: Handle JSON table data from API with custom tags
    // Example: Your API might return something like: {{TABLE_DATA:{"headers":["Name","Age"],"rows":[["John",30],["Jane",25]]}}}
    text = text.replace(/{{TABLE_DATA:(.*?)}}/g, (match, jsonStr) => {
      try {
        // eslint-disable-next-line no-unused-vars
        const tableData = JSON.parse(jsonStr);
        return `%%TABLE_JSON%%${jsonStr}%%END_TABLE%%`;
      } catch (e) {
        console.error('Failed to parse table data:', e);
        return match; // Keep the original if parsing fails
      }
    });

    // Option 2: Convert markdown tables to our JSON format
    // This is more complex and would require parsing markdown tables
    // This is a simplified example - a real parser would be more robust
    const markdownTablePattern = /\n\|([^\n]+)\|\n\|([-\s|]+)\|\n((?:\|[^\n]+\|\n)+)/g;
    text = text.replace(markdownTablePattern, (match, headerRow, separatorRow, bodyRows) => {
      try {
        // Parse headers
        const headers = headerRow.split('|')
          .map(h => h.trim())
          .filter(h => h !== '');
        
        // Parse rows
        const rows = [];
        bodyRows.split('\n').forEach(row => {
          if (row.trim() === '') return;
          
          const cells = row.split('|')
            .map(cell => cell.trim())
            .filter((cell, index) => index > 0 && index <= headers.length);
          
          if (cells.length > 0) {
            // Create object with header keys
            const rowObj = {};
            headers.forEach((header, i) => {
              rowObj[header] = cells[i] || '';
            });
            rows.push(rowObj);
          }
        });
        
        // Create JSON for our table renderer
        const tableJson = JSON.stringify(rows);
        return `%%TABLE_JSON%%${tableJson}%%END_TABLE%%`;
      } catch (e) {
        console.error('Failed to parse markdown table:', e);
        return match; // Keep the original if parsing fails
      }
    });

    return text;
  }
}