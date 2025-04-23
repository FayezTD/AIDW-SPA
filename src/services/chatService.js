import api from './api';

export default class ChatService {
  constructor(getAccessToken = null) {
    // Make getAccessToken optional
    this.getAccessToken = getAccessToken;
    
    // Get the API endpoint from environment variables
    this.apiEndpoint = process.env.REACT_APP_API_URL;
    
    // Store active AbortController instances
    this.activeRequests = new Set();
  }

  /**
   * Cancel all ongoing API requests
   */
  cancelAllRequests() {
    console.log(`Cancelling ${this.activeRequests.size} active requests`);
    this.activeRequests.forEach(controller => {
      controller.abort();
    });
    this.activeRequests.clear();
  }

  async sendMessage(message, model, chatHistory = []) {
    try {
      // Create an AbortController for this request
      const abortController = new AbortController();
      
      // Add this controller to our active requests set
      this.activeRequests.add(abortController);
      
      // Create a config object that might or might not include getAccessToken
      const config = {
        signal: abortController.signal // Add abort signal to request config
      };
      
      if (this.getAccessToken) {
        config.getAccessToken = this.getAccessToken;
      }

      // Ensure model is a string and set a default if not valid
      const modelValue = typeof model === 'string' && model ? model : 'gpt-4o-mini';
      
      console.log(`Sending message to model: ${modelValue}`);

      // Create the payload according to the new format
      const payload = {
        question: message,
        model: modelValue,
        chat_history: chatHistory // Now expecting the proper chat_history format
      };
      
      console.log('Sending payload:', payload);

      // Use the endpoint from environment variable
      const response = await api.post(this.apiEndpoint, payload, config);
      
      // Remove this controller from active requests as it completed successfully
      this.activeRequests.delete(abortController);
      
      return this.processResponse(response.data);
    } catch (error) {
      // Check if this was caused by our abort controller
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        console.log('Request was cancelled');
        return {
          answer: '',
          citations: [],
          hyperlinks: [],
          error: false,
          cancelled: true
        };
      }
      
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
  
    // Handle the new response format
    // The new response appears to be simpler: {"answer": "...", "intent": "..."}
    // We'll still maintain backwards compatibility with the old format
    
    // Extract citations and hyperlinks if they exist in the response
    let citations = data.citation ? 
      (Array.isArray(data.citation) ? data.citation : [data.citation]) : [];
    
    let hyperlinks = data.hyperlink ? 
      (Array.isArray(data.hyperlink) ? data.hyperlink : [data.hyperlink]) : [];
    
    // Filter out empty citations and hyperlinks
    citations = citations.filter(item => item && item.trim() !== '');
    hyperlinks = hyperlinks.filter(item => item && item.trim() !== '');
    
    // Process citations and hyperlinks
    const processedCitations = this.processCitationStrings(citations);
    const processedHyperlinks = this.processCitationStrings(hyperlinks);
    
    console.log('Processed citations:', processedCitations);
    console.log('Processed hyperlinks:', processedHyperlinks);
    
    // Include intent in the return object if it exists
    return {
      answer: data.answer || '',
      citations: processedCitations,
      hyperlinks: processedHyperlinks,
      intent: data.intent || null,
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