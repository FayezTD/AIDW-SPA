/* useChat.js - Enhanced to handle new chat history format */
 
import { useState, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import ChatService from '../services/chatService';
import VisualizationService from '../services/visualizationService';
import ResponseFormatter from '../utils/formatters';

// STARTER_QUESTIONS constant remains unchanged
export const STARTER_QUESTIONS = [
  {
    id: 'azure-threat-detection',
    question: 'Which Azure services are commonly used in threat detection and response?'
  },
  {
    id: 'azure-resiliency-patterns',
    question: 'What are the limitations of creating reports from tasks in Microsoft Fabric?'
  },
  {
    id: 'azure-form-recognizer',
    question: 'What are the resiliency patterns mentioned in Azure architectural designs? Please tabulate the response.'
  }
]; 

export function useChat(selectedModel) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
 
  // Creating chat service instance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chatService = new ChatService();

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
 
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
 
    try {
      // Convert messages to the new chat_history format
      const chatHistory = convertMessagesToHistory(messages);
      
      const response = await chatService.sendMessage(finalContent, model || selectedModel, chatHistory);

      if (response.error) {
        setError(response.answer);
      } else {
        let processedAnswer = response.answer || "I'm sorry, I couldn't generate a complete response at this time.";
        processedAnswer = ResponseFormatter.formatTables(processedAnswer);
        processedAnswer = VisualizationService.processAllVisualizations(processedAnswer);
 
        const formattedCitations = ResponseFormatter.formatCitations(
          response.citations || [],
          response.hyperlinks || []
        );
 
        const assistantMessage = {
          id: Date.now().toString() + '-response',
          role: 'assistant',
          content: processedAnswer,
          citations: formattedCitations,
          intent: response.intent || 'General', // Store intent from response
          timestamp: new Date()
        };
 
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, chatService, isAuthenticated, user, selectedModel]);
 
  const handleStarterQuestion = useCallback((question) => {
    sendMessage(question);
  }, [sendMessage]);
 
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);
  
  // Helper function to convert internal message format to the new chat_history format
  const convertMessagesToHistory = (messages) => {
    if (!messages || messages.length === 0) return [];
    
    const chatHistory = [];
    
    // Process messages in pairs (user->assistant)
    for (let i = 0; i < messages.length; i += 2) {
      const userMessage = messages[i];
      const assistantMessage = messages[i + 1];
      
      // Skip if we don't have a complete pair
      if (!userMessage || userMessage.role !== 'user') continue;
      if (!assistantMessage || assistantMessage.role !== 'assistant') continue;
      
      const historyEntry = {
        response: {
          user: userMessage.content,
          bot: assistantMessage.content
        },
        intent: assistantMessage.intent || 'General',
        time: formatTime(userMessage.timestamp)
      };
      
      chatHistory.push(historyEntry);
    }
    
    return chatHistory;
  };
  
  // Helper function to format timestamp to HH:MM:SS
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toTimeString().split(' ')[0];
  };
 
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