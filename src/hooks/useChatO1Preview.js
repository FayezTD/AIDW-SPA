/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback} from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatServiceO1 from '../services/chatServiceO1';
import { useAuth } from '../components/auth/AuthProvider';

export const useChatO1Preview = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAccessToken } = useAuth();
  const chatService = new ChatServiceO1(getAccessToken);

  // Sample starter questions
  const starterQuestions = [
    "How many countries does AB InRev operate in, and what is the potential market size for the ConnectAI solution in these regions?",
    "Please compare how Bajaj and Starbucks use the AIDW to enhance their business, cite both the documents.",
    "How does the integration of Azure OpenAI with Logic Apps and Cosmos DB enhance the marketing capabilities of AB InRev?",
    "What are the key benefits of implementing AI-driven workplace solutions?",
  ];
    
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMessageId = uuidv4();
    const botMessageId = uuidv4();

    // Add user message
    const userMessage = {
      id: userMessageId,
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Convert messages to the format expected by the API
      const chatHistory = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Send message to API
      const response = await chatService.sendMessage(content, chatHistory);

      // Add bot response
      const botMessage = {
        id: botMessageId,
        content: response.answer,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        citations: response.citations || [],
        hyperlinks: response.hyperlinks || [],
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (err) {
      console.error('Error in chat:', err);
      setError(err.message || 'An error occurred while sending your message');
    } finally {
      setIsLoading(false);
    }
  }, [messages, chatService]);

  const handleStarterQuestion = useCallback((question) => {
    sendMessage(question);
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    handleStarterQuestion,
    clearChat,
    starterQuestions,
  };
};