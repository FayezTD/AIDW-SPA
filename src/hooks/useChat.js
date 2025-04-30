import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import ChatService from '../services/chatService';
import VisualizationService from '../services/visualizationService';
import ResponseFormatter from '../utils/formatters';

// STARTER_QUESTIONS constant remains unchanged
export const STARTER_QUESTIONS = [
  {
    id: 'azure-data-lake',
    question: 'Visualize the hierarchical namespace for azure data lake?'
  },
  {
    id: 'azure-kubernetes-service',
    question: 'Explain the Use Azure Kubernetes Service to host GPU-based workloads?'
  },
  {
    id: 'azure-form-recognizer',
    question: 'What are the resiliency patterns mentioned in Azure architectural designs? Tabularise the response.'
  }
]; 

export function useChat(selectedModel) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatService] = useState(() => new ChatService());
  
  // Maximum number of chat history entries to include
  const MAX_CHAT_HISTORY_ENTRIES = 5;

  // Helper function to convert internal message format to the chat_history format
  // Modified to limit history to the most recent 5 exchanges
  const convertMessagesToHistory = useCallback((messages) => {
    if (!messages || messages.length === 0) return [];
    
    const chatHistory = [];
    
    // Process messages in sequence, looking for user-assistant pairs
    for (let i = 0; i < messages.length - 1; i++) {
      // Find user message
      if (messages[i].role !== 'user') continue;
      
      // Look for corresponding assistant message
      if (i+1 < messages.length && messages[i+1].role === 'assistant') {
        const userMessage = messages[i];
        const assistantMessage = messages[i+1];
        
        const historyEntry = {
          response: {
            user: userMessage.content,
            bot: assistantMessage.content
          },
          intent: assistantMessage.intent || 'General',
          time: formatTime(userMessage.timestamp)
        };
        
        // Explicitly exclude map_data from chat history
        // (map_data is already not included in this conversion function)
        
        chatHistory.push(historyEntry);
        i++; // Skip the assistant message we just processed
      }
    }
    
    // Only return the most recent MAX_CHAT_HISTORY_ENTRIES entries
    const limitedHistory = chatHistory.slice(-MAX_CHAT_HISTORY_ENTRIES);
    
    console.log(`Chat history limited to ${limitedHistory.length} entries (max: ${MAX_CHAT_HISTORY_ENTRIES})`);
    
    // If we have exactly MAX_CHAT_HISTORY_ENTRIES entries, reset the history
    // This ensures the next message after 5 exchanges will have an empty history
    if (limitedHistory.length >= MAX_CHAT_HISTORY_ENTRIES) {
      console.log('Reached max chat history entries, returning empty history for reset');
      return [];
    }
    
    return limitedHistory;
  }, [MAX_CHAT_HISTORY_ENTRIES]);
  
  // Helper function to format timestamp to HH:MM:SS
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toTimeString().split(' ')[0];
  };

  // Function to detect if a message potentially needs a visualization
  const potentiallyNeedsVisualization = (message) => {
    if (!message || typeof message !== 'string') return false;
    
    const visualTerms = [
      'chart', 'graph', 'plot', 'visualize', 'visualization', 'trend',
      'compare', 'comparison', 'statistic', 'data', 'metrics', 'analytics',
      'dashboard', 'report'
    ];
    
    const messageLower = message.toLowerCase();
    return visualTerms.some(term => messageLower.includes(term));
  };

  // Helper function to extract graph data from response
  const extractGraphData = useCallback((content) => {
    if (!content) return content;
    
    try {
      // Look for JSON in the response that might be graph data
      const jsonRegex = /```(?:json)?\s*({[\s\S]*?})```/g;
      const matches = [...content.matchAll(jsonRegex)];
      
      for (const match of matches) {
        try {
          const jsonStr = match[1].trim();
          const parsedJson = JSON.parse(jsonStr);
          
          // Validate that this looks like graph data
          if (
            parsedJson && 
            parsedJson.datasets && 
            Array.isArray(parsedJson.datasets) &&
            (parsedJson.chartType || parsedJson.labels)
          ) {
            console.log('Found valid graph data in response');
            
            // Replace the markdown JSON with our special graph tag
            const graphTag = `%%GRAPH_JSON%%${JSON.stringify(parsedJson)}%%END_GRAPH%%`;
            content = content.replace(match[0], graphTag);
          }
        } catch (parseError) {
          console.warn('Failed to parse potential JSON:', parseError);
        }
      }
      
      return content;
    } catch (error) {
      console.error('Error extracting graph data:', error);
      return content; // Return original content if processing fails
    }
  }, []);

  // Function to clean and process the response content
  const processResponseContent = useCallback((content) => {
    try {
      // Apply table formatting
      let processedContent = ResponseFormatter.formatTables(content);
      
      // Apply visualization processing
      processedContent = VisualizationService.processAllVisualizations(processedContent);
      
      // Apply additional graph extraction
      processedContent = extractGraphData(processedContent);
      
      return processedContent;
    } catch (error) {
      console.error('Error processing response content:', error);
      return content; // Return original content if processing fails
    }
  }, [extractGraphData]);

  const sendMessage = useCallback(async (content, model) => {
    if (!content.trim() || !isAuthenticated) return;
 
    const reasoningPayload = "Discuss in Details or Show in Tabular form or give reasoning";
    
    // Add visualization hint if it seems like a visualization request
    let finalContent = content;
    if (potentiallyNeedsVisualization(content)) {
      finalContent += "\n\nanswer in detailed response if necessary tabulate the response";
    }
    
    // Add reasoning payload for o1-Preview model
    if (selectedModel === 'o1-Preview') {
      finalContent = `${finalContent}\n${reasoningPayload}`;
    }
 
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      sender: user?.email || 'Anonymous',
      timestamp: new Date()
    };
 
    // Add user message to state first
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
 
    try {
      // Convert current messages to chat history format
      const currentMessages = [...messages, userMessage];
      const chatHistory = convertMessagesToHistory(currentMessages);
      
      // Log chat history size for debugging
      console.log(`Sending chat history with ${chatHistory.length} entries`);
      
      // Send message to service
      const response = await chatService.sendMessage(finalContent, model || selectedModel, chatHistory);

      if (response.error) {
        console.error("API error:", response.answer || response.error);
        setError(response.answer || "Error processing request");
      } else if (response.cancelled) {
        // Handle cancelled request gracefully
        console.log("Request was cancelled");
      } else {
        // Process response
        let processedAnswer = response.answer || "I'm sorry, I couldn't generate a complete response at this time.";
        
        // Process the content for various types of visualizations
        processedAnswer = processResponseContent(processedAnswer);
 
        // Ensure we have arrays for citations and hyperlinks, even if empty
        const citations = response.citations || [];
        const hyperlinks = response.hyperlinks || [];

        // Process map_data from response
        let processedMapData = null;
        if (response.map_data) {
          console.log('Received map_data from API:', response.map_data);
          processedMapData = response.map_data;
        }
 
        // Create assistant message
        const assistantMessage = {
          id: Date.now().toString() + '-response',
          role: 'assistant',
          content: processedAnswer,
          citations: citations,
          hyperlinks: hyperlinks,
          intent: response.intent || 'General',
          mapData: processedMapData, // Include processed mapData in the UI message
          timestamp: new Date()
        };

        // Extra logging when mapData is present
        if (processedMapData) {
          console.log('Assistant message created with mapData:', {
            intent: assistantMessage.intent,
            mapDataKeys: Object.keys(processedMapData)
          });
        }
 
        // Update messages with assistant response
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, chatService, isAuthenticated, user, selectedModel, convertMessagesToHistory, processResponseContent]);
 
  const handleStarterQuestion = useCallback((question) => {
    sendMessage(question);
  }, [sendMessage]);
 
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // Cancel pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (chatService && typeof chatService.cancelAllRequests === 'function') {
        chatService.cancelAllRequests();
      }
    };
  }, [chatService]);
  
  return {
    messages,
    isLoading: isLoading || authLoading,
    error,
    sendMessage,
    handleStarterQuestion,
    clearChat,
    starterQuestions: STARTER_QUESTIONS
  };
}