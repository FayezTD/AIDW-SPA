// Service for processing visualization elements in markdown content
class VisualizationService {
    /**
     * Process all visualizations in the response
     * @param {string} answer - The response text
     * @return {string} - Processed response with visualization tags
     */
    static processAllVisualizations(answer) {
      if (!answer) return '';
      
      // Log the raw answer for debugging
      console.log('Processing visualizations for answer:', answer);
      
      try {
        let processedAnswer = answer;
        processedAnswer = this.processTables(processedAnswer);
        processedAnswer = this.processMarkdown(processedAnswer);
        return processedAnswer;
      } catch (error) {
        console.error('Error processing visualizations:', error);
        return answer; // Return original answer if processing fails
      }
    }
  
    /**
     * Process table markup and convert to markdown tables
     * @param {string} text - Input text with table placeholders
     * @return {string} - Processed text with markdown tables
     */
    static processTables(text) {
      if (!text) return '';
      
      const tablePattern = /{table:(.*?)}/gs;
      let processedText = text;
      let matches = [...text.matchAll(tablePattern)];
      
      if (matches.length > 0) {
        console.log(`Found ${matches.length} table patterns to process`);
      }
      
      matches.forEach((match, index) => {
        try {
          console.log(`Processing table ${index + 1}:`, match[1]);
          const tableData = JSON.parse(match[1]);
          const markdownTable = this.generateMarkdownTable(tableData);
          processedText = processedText.replace(match[0], markdownTable);
        } catch (error) {
          console.error(`Error processing table ${index + 1}:`, error);
          processedText = processedText.replace(match[0], '');
        }
      });
      
      return processedText;
    }
  
    /**
     * Process general markdown formatting
     * @param {string} text - Input text
     * @return {string} - Processed text with proper markdown
     */
    static processMarkdown(text) {
      if (!text) return '';
      
      // Convert any **Text** that isn't already in a proper markdown format
      const boldPattern = /\*\*(.*?)\*\*/g;
      let processedText = text;
      
      // Handle citations if they're in the text but not properly formatted
      if (text.includes('**Citations:**')) {
        const citationsSection = text.split('**Citations:**')[1];
        if (citationsSection && !citationsSection.trim().startsWith('\n')) {
          processedText = processedText.replace('**Citations:**', '**Citations:**\n');
        }
      }
      
      return processedText;
    }
  
    /**
     * Convert table JSON data to markdown format
     * @param {Object} tableData - Table data object
     * @return {string} - Markdown table
     */
    static generateMarkdownTable(tableData) {
      const headers = tableData.headers || [];
      const rows = tableData.rows || [];
      
      if (headers.length === 0) {
        console.warn('Table has no headers');
        return '';
      }
      
      let markdownTable = '| ' + headers.join(' | ') + ' |\n';
      markdownTable += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
      
      rows.forEach(row => {
        markdownTable += '| ' + row.map(cell => String(cell || '')).join(' | ') + ' |\n';
      });
      
      return markdownTable;
    }
  }
  
  export default VisualizationService;