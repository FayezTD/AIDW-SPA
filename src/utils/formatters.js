import { v4 as uuidv4 } from 'uuid';

export default class ResponseFormatter {
  static DOCUMENT_TYPES = {
    'report': '📊',
    'case': '📱',
    'study': '📚',
    'analysis': '📈',
    'default': '📄'
  };

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

  // Modified to keep original filename without cleaning
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
        const filename = citation;
        const emoji = this.getDocumentEmoji(filename);
        const url = (hyperlinks && hyperlinks[index]) ? hyperlinks[index] : '#';

        formattedCitations.push({
          id: uuidv4(),
          text: filename,
          emoji,
          url,
          originalSource: citation
        });
        
      } catch (error) {
        console.error(`Citation formatting error for index ${index}:`, error);
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

  static formatTables(text) {
    if (!text) return text;

    text = text.replace(/{{TABLE_DATA:(.*?)}}/g, (match, jsonStr) => {
      try {
        return `%%TABLE_JSON%%${jsonStr}%%END_TABLE%%`;
      } catch (e) {
        console.error('Failed to parse table data:', e);
        return match;
      }
    });

    const markdownTablePattern = /\n\|([^\n]+)\|\n\|([-\s|]+)\|\n((?:\|[^\n]+\|\n)+)/g;
    text = text.replace(markdownTablePattern, (match, headerRow, separatorRow, bodyRows) => {
      try {
        const headers = headerRow.split('|')
          .map(h => h.trim())
          .filter(h => h !== '');
        
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
        
        const tableJson = JSON.stringify(rows);
        return `%%TABLE_JSON%%${tableJson}%%END_TABLE%%`;
      } catch (e) {
        console.error('Failed to parse markdown table:', e);
        return match;
      }
    });

    return text;
  }

  static parseResponseText(response) {
    if (!response) return "";
    
    try {
      if (typeof response === 'string') {
        return response;
      }
      
      if (typeof response === 'object') {
        // Fix: Enhanced handling of nested object structures
        if (response.answer) {
          // Check for nested answer structure recursively
          if (typeof response.answer === 'object') {
            // If answer is nested object, extract it recursively
            return this.parseResponseText(response.answer);
          }
          return response.answer;
        }
        
        return JSON.stringify(response);
      }
      
      return String(response);
    } catch (error) {
      console.error('Error parsing response text:', error);
      return String(response || "");
    }
  }

  static cleanResponseText(text) {
    if (!text) return "";
    
    try {
      // Fix 2: Better handling of escaped characters
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
          return JSON.parse(text);
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