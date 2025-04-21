/* useChat.js - Enhanced to auto-append reasoning payload */
 
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import ChatService from '../services/chatService';
import VisualizationService from '../services/visualizationService';
import ResponseFormatter from '../utils/formatters';

// STARTER_QUESTIONS constant omitted for brevity but should remain unchanged
export const STARTER_QUESTIONS = [
  {
    id: 'fabric-reports-limitations',
    question: 'What is a task flow in Microsoft Fabric?'
  },
  {
    id: 'fabric-task-flow',
    question: 'What are the best practices for security architecture in Azure?'
  },
  {
    id: 'azure-security-best-practices',
    question: 'What is the role of Azure Form Recognizer in document automation?'
  },
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
  const [sessionId, setSessionId] = useState(null);
 
  // Creating chat service instance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chatService = new ChatService();

  // Initialize or retrieve session ID on component mount
  useEffect(() => {
    // Try to get session ID from localStorage if available
    const savedSessionId = localStorage.getItem('chat_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      chatService.setSessionId(savedSessionId);
    } else {
      // Generate a new session ID if none exists
      const newSessionId = Date.now().toString();
      setSessionId(newSessionId);
      chatService.setSessionId(newSessionId);
      localStorage.setItem('chat_session_id', newSessionId);
    }
  }, [chatService]);
 
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
      // Set the session ID in the chat service before sending
      if (sessionId) {
        chatService.setSessionId(sessionId);
      }
      
      const response = await chatService.sendMessage(finalContent, model || selectedModel);
 
      // Update session ID if returned in the response
      if (response.session_id) {
        setSessionId(response.session_id);
        localStorage.setItem('chat_session_id', response.session_id);
      }

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
  }, [messages, chatService, isAuthenticated, user, selectedModel, sessionId]);
 
  const handleStarterQuestion = useCallback((question) => {
    sendMessage(question);
  }, [sendMessage]);
 
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    
    // Generate a new session ID when clearing the chat
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    chatService.setSessionId(newSessionId);
    localStorage.setItem('chat_session_id', newSessionId);
  }, [chatService]);
 
  return {
    messages,
    isLoading: isLoading || authLoading,
    error,
    sendMessage,
    handleStarterQuestion,
    clearChat,
    sessionId,
    starterQuestions: STARTER_QUESTIONS
  };
}