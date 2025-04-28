import { useState, useCallback } from 'react';
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
 
  // Create chat service instance once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chatService = new ChatService();

  // Helper function to convert internal message format to the new chat_history format
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
        
        chatHistory.push(historyEntry);
        i++; // Skip the assistant message we just processed
      }
    }
    
    return chatHistory;
  }, []);
  
  // Helper function to format timestamp to HH:MM:SS
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toTimeString().split(' ')[0];
  };

  const sendMessage = useCallback(async (content, model) => {
    if (!content.trim() || !isAuthenticated) return;
 
    const reasoningPayload = "Discuss in Details or Show in Tabular form or give reasoning";
    const finalContent = selectedModel === 'o1-Preview'
      ? `${content}\n${reasoningPayload}`
      : content;
 
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
      
      // Send message to service
      const response = await chatService.sendMessage(finalContent, model || selectedModel, chatHistory);

      if (response.error) {
        console.error("API error:", response.answer || response.error);
        setError(response.answer || "Error processing request");
      } else {
        // Process response
        let processedAnswer = response.answer || "I'm sorry, I couldn't generate a complete response at this time.";
        
        // Apply formatters
        processedAnswer = ResponseFormatter.formatTables(processedAnswer);
        processedAnswer = VisualizationService.processAllVisualizations(processedAnswer);
 
        // Ensure we have arrays for citations and hyperlinks, even if empty
        const citations = response.citations || [];
        const hyperlinks = response.hyperlinks || [];
 
        // Create assistant message
        const assistantMessage = {
          id: Date.now().toString() + '-response',
          role: 'assistant',
          content: processedAnswer,
          citations: citations,
          hyperlinks: hyperlinks,
          intent: response.intent || 'General',
          timestamp: new Date()
        };
 
        // Update messages with assistant response
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, chatService, isAuthenticated, user, selectedModel, convertMessagesToHistory]);
 
  const handleStarterQuestion = useCallback((question) => {
    sendMessage(question);
  }, [sendMessage]);
 
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);
  
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