/* useChat.js - Enhanced to auto-append reasoning payload */

import { useState, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import ChatService from '../services/chatService';
import VisualizationService from '../services/visualizationService';
import ResponseFormatter from '../utils/formatters';

export const STARTER_QUESTIONS = [
  {
    id: 'market-size',
    title: '🌍 Potential market size of AB InBev Operation',
    question: 'How many countries does AB InBev operate in, and what is the potential market size for the ConnectAI solution in these regions?'
  },
  {
    id: 'cost-savings',
    title: '💰 Annual cost savings for PepsiCo',
    question: 'What is the anticipated annual cost savings for PepsiCo by optimizing costs through shared resources and standardized practices with the PepGenX platform?'
  },
  {
    id: 'monthly-acr',
    title: '📊 Monthly ACR for AI services at ABN AMRO',
    question: 'How much has the monthly ACR for AI services contributed to the overall operational efficiency of the ECM department at ABN AMRO?'
  },
  {
    id: 'processing-time',
    title: '📝 Complaints letter processing time',
    question: 'How many minutes does it now take to produce a complaints letter after the integration of Azure OpenAI, compared to the previous time?'
  },
  {
    id: 'azure-integration',
    title: '🔄 Azure OpenAI Integration Benefits',
    question: 'How does the integration of Azure OpenAI with Logic Apps and Cosmos DB enhance the marketing capabilities of AB InBev?'
  },
  {
    id: 'implementation-comparison',
    title: '🔄 Bajaj vs Starbucks AIDW Implementation',
    question: 'Please compare how Bajaj and Starbucks use the AIDW to enhance their business, cite both the documents'
  }
];

export function useChat(selectedModel) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chatService = new ChatService();

  const sendMessage = useCallback(async (content) => {
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
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await chatService.sendMessage(finalContent, chatHistory);

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
  }, [messages, chatService, isAuthenticated, user, selectedModel]);

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
