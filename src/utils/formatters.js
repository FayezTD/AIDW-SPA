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
}