export default class ChatService {
  constructor(getAccessToken = null) {
    // Make getAccessToken optional
    this.getAccessToken = getAccessToken;
    
    // Get the API endpoint from environment variables or use the provided one
    this.apiEndpoint = process.env.REACT_APP_API_URL || 
      'https://mango-hill-0032f541e.6.azurestaticapps.net/api/ConversationalOrchestration?';
  }

  async sendMessage(message, model, chatHistory = []) {
    try {
      // Log what model we're receiving - helps with debugging
      console.log('ChatService received model:', model);
      
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

      // IMPORTANT: Use the exact model string that was passed in
      // Only fall back to default if model is explicitly undefined/null
      const modelValue = model !== undefined && model !== null ? model : 'o1-mini';
      
      // Create the request payload
      const payload = {
        question: message,
        model: modelValue // This will be exactly what was passed in
      };
      
      // Optionally add chat history
      if (chatHistory && chatHistory.length > 0) {
        payload.chat_history = chatHistory;
      }

      // Enhanced logging to better track what's happening
      console.log('Sending API request:');
      console.log('- Endpoint:', this.apiEndpoint);
      console.log('- Headers:', JSON.stringify(headers));
      console.log('- Payload:', JSON.stringify(payload));

      // Make the API request
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        try {
          // Try to get more detailed error info
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (e) {
          // Ignore if we can't parse error response
        }
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return this.processResponse(data);
    } catch (error) {
      console.error(`Error sending message:`, error);
      return {
        answer: `An error occurred while processing your message with ${model || 'the selected model'}. Please try again later.`,
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