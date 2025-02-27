/**
 * Utility functions for processing markdown content
 */

/**
 * Extract code blocks from markdown content
 * @param {string} markdown - Markdown content
 * @return {Array<{language: string, code: string}>} - Extracted code blocks
 */
export function extractCodeBlocks(markdown) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;
  
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2]
      });
    }
  
    return blocks;
}
  
/**
 * Check if markdown contains mentions of data visualization
 * @param {string} markdown - Markdown content
 * @return {boolean} - Whether the content has visualizations
 */
export function containsVisualizations(markdown) {
    return markdown.includes('{chart:') || 
           markdown.includes('{table:') || 
           markdown.includes('{flowchart:');
}
  
/**
 * Convert plain URLs to clickable markdown links
 * @param {string} text - Text content
 * @return {string} - Text with URLs converted to markdown links
 */
export function linkifyUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      // Avoid double-linking already linked URLs
      if (url.match(/\[.*\]\(.*\)/)) return url;
      return `[${url}](${url})`;
    });
}
