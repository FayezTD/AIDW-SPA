import api from './api';

export default class ChatService {
  constructor(getAccessToken = null) {
    // Make getAccessToken optional
    this.getAccessToken = getAccessToken;
  }

  async sendMessage(message, chatHistory = []) {
    try {
      // Create a config object that might or might not include getAccessToken
      const config = {};
      if (this.getAccessToken) {
        config.getAccessToken = this.getAccessToken;
      }

      // The correct endpoint path that matches the Azure Function URL pattern
      const response = await api.post('/api/aidw_chat_bot', {
        query: message,
        chat_history: chatHistory
      }, config);

      return this.processResponse(response.data);
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        answer: 'An error occurred while processing your message. Please try again later.',
        citations: [],
        hyperlinks: [],
        error: true
      };
    }
  }

  processResponse(data) {
    console.log('Raw API response:', data);
    
    if (!data || data.error) {
      return {
        answer: data?.error || 'An unexpected error occurred.',
        citations: [],
        hyperlinks: [],
        error: true
      };
    }

    // Extract citations and hyperlinks
    const citations = data.citation ? 
      (Array.isArray(data.citation) ? data.citation : [data.citation]) : [];
    
    const hyperlinks = data.hyperlink ? 
      (Array.isArray(data.hyperlink) ? data.hyperlink : [data.hyperlink]) : [];
    
    // Split citations and hyperlinks if they're comma-separated strings
    const processedCitations = this.processCitationStrings(citations);
    const processedHyperlinks = this.processCitationStrings(hyperlinks);
    
    console.log('Processed citations:', processedCitations);
    console.log('Processed hyperlinks:', processedHyperlinks);

    return {
      answer: data.answer || '',
      citations: processedCitations,
      hyperlinks: processedHyperlinks,
      error: false
    };
  }

  processCitationStrings(items) {
    // Handle case where citations/hyperlinks might be comma-separated strings
    const result = [];
    items.forEach(item => {
      if (typeof item === 'string' && item.includes(',')) {
        const split = item.split(',').map(s => s.trim());
        result.push(...split);
      } else if (item) {
        result.push(item);
      }
    });
    return result;
  }
}