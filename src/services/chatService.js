import api from './api';

export default class ChatService {
  constructor(getAccessToken = null) {
    // Make getAccessToken optional
    this.getAccessToken = getAccessToken;
    
    // Get the API endpoint from environment variables
    this.apiEndpoint = process.env.REACT_APP_API_URL;
    
    // Initialize session ID to null, can be set later
    this.sessionId = null;
  }

  /**
   * Set the session ID for the chat
   * @param {string} sessionId - The session ID to use for this chat instance
   */
  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }

  /**
   * Get the current session ID
   * @returns {string|null} The current session ID or null if not set
   */
  getSessionId() {
    return this.sessionId;
  }

  async sendMessage(message, model, chatHistory = []) {
    try {
      // Create a config object that might or might not include getAccessToken
      const config = {};
      if (this.getAccessToken) {
        config.getAccessToken = this.getAccessToken;
      }

      // Ensure model is a string and set a default if not valid
      const modelValue = typeof model === 'string' && model ? model : 'gpt-4o-mini';
      
      console.log(`Sending message to model: ${modelValue}`);

      // Create the payload exactly as required
      const payload = {
        session_id: this.sessionId || "",
        question: message,
        model: modelValue
      };
      
      // Only include chat_history if needed and not empty
      if (chatHistory && chatHistory.length > 0) {
        payload.chat_history = chatHistory;
      }

      console.log('Sending payload:', payload);

      // Use the endpoint from environment variable
      const response = await api.post(this.apiEndpoint, payload, config);
      
      return this.processResponse(response.data);
    } catch (error) {
      console.error(`Error sending message to ${model}:`, error);
      return {
        answer: `An error occurred while processing your message with ${model}. Please try again later.`,
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

    // Store the session ID if it was returned from the API
    if (data.session_id) {
      this.sessionId = data.session_id;
    }

    return {
      answer: data.answer || '',
      citations: processedCitations,
      hyperlinks: processedHyperlinks,
      session_id: data.session_id || this.sessionId,
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