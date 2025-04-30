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
      const modelValue = typeof model === 'string' && model ? model : 'o1-mini';
      
      console.log(`Sending message to model: ${modelValue}`);

      // Check if the message might request visualization
      // This helps prime the model for expected output format
      const visualizationKeywords = ['chart', 'graph', 'visualize', 'plot', 'trend','trends','metric','plot','analytics', 'analyze','tabulate' ,'number','how many'];
      const mightRequestVisualization = visualizationKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );

      // Add visualization hint to the message if relevant
      let enhancedMessage = message;
      if (mightRequestVisualization) {
        console.log('Visualization request detected, enhancing prompt');
        enhancedMessage += '\n\nIf data visualization line and bar chart  is needed,also see if the u can tabulate the data  ';
      }

      // Create the payload according to the new format
      const payload = {
        question: enhancedMessage,
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
    
    if (!data) {
      return {
        answer: 'An unexpected error occurred.',
        citations: [],
        hyperlinks: [],
        error: true
      };
    }
    
    // Handle nested response structure
    if (data.error) {
      return {
        answer: data.error,
        citations: [],
        hyperlinks: [],
        error: true
      };
    }
    
    // Handle nested answer object
    let finalAnswer = '';
    if (typeof data.answer === 'object' && data.answer !== null) {
      finalAnswer = data.answer.answer || '';
    } else {
      finalAnswer = data.answer || '';
    }

    // Process for visualizations in the response
    finalAnswer = this.processVisualizationData(finalAnswer);
  
    // Extract citations and hyperlinks if they exist in the response
    let citations = [];
    if (data.citation) {
      citations = Array.isArray(data.citation) ? data.citation : [data.citation];
    }
    
    let hyperlinks = [];
    if (data.hyperlink) {
      hyperlinks = Array.isArray(data.hyperlink) ? data.hyperlink : [data.hyperlink];
    }
    
    // Filter out empty citations and hyperlinks
    citations = citations.filter(item => item && item.trim() !== '');
    hyperlinks = hyperlinks.filter(item => item && item.trim() !== '');
    
    // Process citations and hyperlinks
    const processedCitations = this.processCitationStrings(citations);
    const processedHyperlinks = this.processCitationStrings(hyperlinks);
    
    console.log('Processed citations:', processedCitations);
    console.log('Processed hyperlinks:', processedHyperlinks);
    
    // Process map_data if present
    let mapData = null;
    if (data.map_data) {
      console.log('Found map_data in response:', data.map_data);
      mapData = data.map_data;
    }
    
    // Include intent and map_data in the return object if they exist
    return {
      answer: finalAnswer,
      citations: processedCitations,
      hyperlinks: processedHyperlinks,
      intent: data.intent || null,
      map_data: mapData,
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

  processVisualizationData(text) {
    if (!text) return text;

    try {
      // Look for JSON data in the response that might be graph data
      const jsonRegex = /```(?:json)?\s*({[\s\S]*?})```/g;
      const matches = [...text.matchAll(jsonRegex)];
      
      // Process each match to see if it's valid graph data
      for (const match of matches) {
        try {
          const jsonStr = match[1].trim();
          const parsedJson = JSON.parse(jsonStr);
          
          // Check if this looks like a graph configuration
          if (
            parsedJson && 
            (
              (parsedJson.chartType && parsedJson.datasets) ||
              (parsedJson.datasets && Array.isArray(parsedJson.datasets) && parsedJson.labels)
            )
          ) {
            console.log('Found valid graph data:', parsedJson);
            
            // Replace the markdown JSON with our special graph tag
            const graphTag = `%%GRAPH_JSON%%${JSON.stringify(parsedJson)}%%END_GRAPH%%`;
            text = text.replace(match[0], graphTag);
          }
        } catch (parseError) {
          console.warn('Failed to parse potential JSON data:', parseError);
          // Continue checking other matches if this one failed
        }
      }

      return text;
    } catch (error) {
      console.error('Error processing visualization data:', error);
      return text; // Return original text if processing fails
    }
  }
}