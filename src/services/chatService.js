import api from './api';

export default class ChatService {
  constructor(getAccessToken = null) {
    // Make getAccessToken optional
    this.getAccessToken = getAccessToken;
    
    // Get the API endpoint from environment variables
    this.apiEndpoint = process.env.REACT_APP_API_URL || 'https://mango-hill-0032f541e.6.azurestaticapps.net/api/ConversationalOrchestration?';
  }

  async sendMessage(message, model, chatHistory = []) {
    try {
      // Create a config object that might or might not include getAccessToken
      const config = {};
      if (this.getAccessToken) {
        config.getAccessToken = this.getAccessToken;
      }

      // Ensure model is passed correctly and not transformed to default value
      // Force it to be one of our supported models
      let modelValue = model;
      
      // Validation step - if model isn't one of our valid options, use a default
      const validModels = ['o1-mini', 'gpt-4o-mini'];
      if (!validModels.includes(modelValue)) {
        console.warn(`Invalid model: ${modelValue}. Defaulting to gpt-4o-mini.`);
        modelValue = 'gpt-4o-mini';
      }
      
      console.log(`ChatService: Sending message to API with model: ${modelValue}`);

      // Use the endpoint from environment variable with model as a string
      const response = await api.post(this.apiEndpoint, {
        question: message,
        model: modelValue, // The fixed model value
        // chat_history: chatHistory
      }, config);

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