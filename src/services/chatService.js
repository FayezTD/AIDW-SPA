// Remove the unused api import since we're using fetch directly
// import api from './api';

export default class ChatService {
  constructor(getAccessToken = null) {
    // Make getAccessToken optional
    this.getAccessToken = getAccessToken;
    
    // Get the API endpoint from environment variables or use the provided one
    this.apiEndpoint = process.env.REACT_APP_API_URL || 
      'https://fn-aidw-wu2-conversationflow.azurewebsites.net/api/ConversationalOrchestration';
  }

  async sendMessage(message, model, chatHistory = []) {
    try {
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization if we have a token getter
      if (this.getAccessToken) {
        const token = await this.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Ensure model is a string and use exactly as provided from the selector
      const modelValue = model || 'o1-mini'; // Fallback to o1-mini only if model is null/undefined
      
      // Create the request payload according to your specified format
      const payload = {
        question: message,
        model: modelValue // Use the exact model string from the dropdown
      };
      
      // You can add chat history if needed
      if (chatHistory && chatHistory.length > 0) {
        payload.chat_history = chatHistory;
      }

      console.log('Sending request to:', this.apiEndpoint);
      console.log('With payload:', payload);

      // Make the API request
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return this.processResponse(data);
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
    
    if (!data) {
      return {
        answer: 'No data received from the API.',
        citations: [],
        hyperlinks: [],
        error: true
      };
    }
    
    if (data.error) {
      return {
        answer: data.error,
        citations: [],
        hyperlinks: [],
        error: true
      };
    }

    // Extract answer, handling different possible response formats
    const answer = data.answer || data.response || data.result || '';
    
    // Extract citations and hyperlinks, handling different formats
    const citations = this.extractArrayField(data, 'citation');
    const hyperlinks = this.extractArrayField(data, 'hyperlink');
    
    // Process citations and hyperlinks
    const processedCitations = this.processCitationStrings(citations);
    const processedHyperlinks = this.processCitationStrings(hyperlinks);
    
    console.log('Processed citations:', processedCitations);
    console.log('Processed hyperlinks:', processedHyperlinks);

    return {
      answer: answer,
      citations: processedCitations,
      hyperlinks: processedHyperlinks,
      error: false
    };
  }

  extractArrayField(data, field) {
    if (!data[field]) return [];
    
    // Handle array or single value
    return Array.isArray(data[field]) ? data[field] : [data[field]];
  }

  processCitationStrings(items) {
    // Handle case where citations/hyperlinks might be comma-separated strings
    const result = [];
    items.forEach(item => {
      if (typeof item === 'string' && item.includes(',')) {
        const split = item.split(',').map(s => s.trim()).filter(s => s);
        result.push(...split);
      } else if (item) {
        result.push(item);
      }
    });
    return result;
  }
}