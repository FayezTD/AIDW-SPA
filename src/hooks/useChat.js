/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import ChatService from '../services/chatService';
import VisualizationService from '../services/visualizationService';
import ResponseFormatter from '../utils/formatters';

// Import NLP helper library if available, or use a simplified version
import { extractEntities, classifyQuestionIntent } from '../utils/nlpUtils';

// Define STARTER_QUESTIONS
export const STARTER_QUESTIONS = [
  {
    id: 'market-size',
    title: '🌍 Potential market size of AB InBev Operation',
    question: 'How many countries does AB InBev operate in, and what is the potential market size for the ConnectAI solution in these regions?'
  },
  {
    id: 'implementation-comparison',
    title: '🔄 Bajaj vs Starbucks AIDW Implementation',
    question: 'Please compare how Bajaj and Starbucks use the AIDW to enhance their business, cite both the documents'
  },
  {
    id: 'ai-patterns-comparison',
    title: '🤖 AI Patterns: Coca-Cola, CaixaBank & PepsiCo',
    question: 'Compare the primary technical patterns used by Coca-Cola, CaixaBank, and PepsiCo in their AI implementations.'
  },
  {
    id: 'roi-ab-inbev',
    title: '📈 AB InBev ROI Projection',
    question: 'Given the monthly revenue of $18,500 and the total monthly ACR for AI services ($1,000), App services ($500), and Data services ($500), what is the projected ROI for AB InBev after implementing ConnectAI over the next 12 months?'
  },
  {
    id: 'bath-body-metrics',
    title: '📊 Bath & Body Works: Key Metrics Analysis',
    question: 'Bath & Body Works aims to impact key business metrics and will analyze launch metrics post-implementation to assess additional business effects. These include what?'
  },
  {
    id: 'customer-service-improvements',
    title: '💬 AI-Driven Customer Service: Starbucks, Ooredoo & Bajaj Finserv',
    question: 'What similarities can be observed in the AI-driven customer service improvements implemented by Starbucks, Ooredoo, and Bajaj Finserv?'
  }
];


// Enhanced message class to store metadata
class MessageWithContext {
  constructor(role, content, sender = 'Anonymous') {
    this.id = Date.now().toString() + Math.random().toString(36).substring(2, 10);
    this.role = role;
    this.content = content;
    this.sender = sender;
    this.timestamp = new Date();
    this.entities = [];
    this.intent = null;
    this.topics = [];
    this.citations = [];
    this.isFollowUp = false;
    this.referencedMessageIds = [];
  }
}

export function useChat() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversationGraph, setConversationGraph] = useState({
    topics: {},       // Topic -> relevance score
    entities: {},     // Entity -> last message reference
    messageLinks: {}, // Message ID -> related message IDs
    lastActiveTopicId: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatServiceRef = useRef(new ChatService());
  
  // Conversation topic tracking
  const activeTopicRef = useRef(null);
  const sessionEntitiesRef = useRef({});
  
  const analyzeMessage = useCallback((content) => {
    // Extract all possible entities from the message
    const entities = extractEntities ? extractEntities(content) : extractBasicEntities(content);
    
    // Determine the message intent
    const intent = classifyQuestionIntent ? classifyQuestionIntent(content) : classifyBasicIntent(content);
    
    // Check if this is likely a follow-up
    const isFollowUp = isLikelyFollowUp(content, entities, conversationGraph);
    
    // Extract topics
    const topics = extractTopicsFromMessage(content);
    
    return {
      entities,
      intent,
      isFollowUp,
      topics
    };
  }, [conversationGraph]);
  
  // Simple entity extraction if no NLP util available
  const extractBasicEntities = (content) => {
    const entities = [];
    
    // Company names
    const companyRegex = /\b(Bajaj|Starbucks|AB InBev|PepsiCo|ABN AMRO|AIDW)\b/gi;
    let match;
    while ((match = companyRegex.exec(content)) !== null) {
      entities.push({
        type: 'company',
        value: match[0],
        confidence: 1.0
      });
    }
    
    // Technical terms
    const techRegex = /\b(Azure|OpenAI|AI|ConnectAI|PepGenX|ECM|integration)\b/gi;
    while ((match = techRegex.exec(content)) !== null) {
      entities.push({
        type: 'technology',
        value: match[0],
        confidence: 1.0
      });
    }
    
    return entities;
  };
  
  // Simple intent classification if no NLP util available
  const classifyBasicIntent = (content) => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('compare') || lowerContent.includes('versus') || lowerContent.includes(' vs ')) {
      return 'comparison';
    } else if (lowerContent.match(/\bin\s+(points|table|list|bullet)/i)) {
      return 'formatting';
    } else if (lowerContent.startsWith('how') || lowerContent.includes('explain')) {
      return 'explanation';
    } else if (lowerContent.startsWith('what') || lowerContent.startsWith('who') || lowerContent.startsWith('when')) {
      return 'information';
    } else if (lowerContent.startsWith('can') || lowerContent.startsWith('could') || lowerContent.startsWith('would')) {
      return 'capability';
    } else {
      return 'general';
    }
  };
  
  // Extract topics from message
  const extractTopicsFromMessage = (content) => {
    const topics = [];
    
    if (content.includes('AIDW') && content.includes('business')) {
      topics.push({
        name: 'AIDW business enhancement',
        confidence: 0.9
      });
    }
    
    if (content.includes('Azure') && content.includes('OpenAI')) {
      topics.push({
        name: 'Azure OpenAI integration',
        confidence: 0.85
      });
    }
    
    if (content.includes('market') && content.includes('size')) {
      topics.push({
        name: 'market analysis',
        confidence: 0.8
      });
    }
    
    return topics;
  };
  
  // Determine if message is likely a follow-up
  const isLikelyFollowUp = (content, entities, graph) => {
    const lowerContent = content.toLowerCase();
    
    // Direct references
    if (lowerContent.includes('them') || 
        lowerContent.includes('these') || 
        lowerContent.includes('those') ||
        lowerContent.includes('previous') ||
        lowerContent.startsWith('and') ||
        lowerContent.startsWith('but') ||
        lowerContent.startsWith('so')) {
      return true;
    }
    
    // Short messages are often follow-ups
    if (content.length < 20 && messages.length > 0) {
      return true;
    }
    
    // Format change requests without specific entities
    if (lowerContent.match(/\bin\s+(points|table|list|bullet)/i) && entities.length === 0) {
      return true;
    }
    
    return false;
  };
  
  // Update conversation graph
  const updateConversationGraph = (messageWithContext) => {
    setConversationGraph(prevGraph => {
      const newGraph = {
        topics: { ...prevGraph.topics },
        entities: { ...prevGraph.entities },
        messageLinks: { ...prevGraph.messageLinks },
        lastActiveTopicId: prevGraph.lastActiveTopicId
      };
      
      // Update topics
      messageWithContext.topics.forEach(topic => {
        newGraph.topics[topic.name] = (newGraph.topics[topic.name] || 0) + topic.confidence;
      });
      
      // If this is a significant message with topics, update active topic
      if (messageWithContext.topics.length > 0) {
        const primaryTopic = messageWithContext.topics.reduce(
          (max, topic) => topic.confidence > max.confidence ? topic : max, 
          messageWithContext.topics[0]
        );
        
        newGraph.lastActiveTopicId = primaryTopic.name;
        activeTopicRef.current = primaryTopic.name;
      }
      
      // Update entities
      messageWithContext.entities.forEach(entity => {
        newGraph.entities[entity.value] = {
          type: entity.type,
          lastMessageId: messageWithContext.id,
          confidence: entity.confidence
        };
        
        // Also store in session ref for quick access
        sessionEntitiesRef.current[entity.value] = {
          type: entity.type,
          lastMessageId: messageWithContext.id
        };
      });
      
      // Update message links
      if (messageWithContext.isFollowUp && messageWithContext.referencedMessageIds.length > 0) {
        newGraph.messageLinks[messageWithContext.id] = messageWithContext.referencedMessageIds;
      }
      
      return newGraph;
    });
  };
  
  // Find related messages for context
  const findRelatedMessages = (messageContext) => {
    // If this is a follow-up, try to link it to relevant previous messages
    if (!messageContext.isFollowUp) {
      return [];
    }
    
    // First check if there are entities mentioned and find messages with those entities
    const relatedMessagesIds = messageContext.entities
      .map(entity => {
        const entityRef = conversationGraph.entities[entity.value];
        return entityRef ? entityRef.lastMessageId : null;
      })
      .filter(id => id !== null);
    
    // If no related messages found through entities but seems like follow-up,
    // use the most recent messages
    if (relatedMessagesIds.length === 0 && messages.length > 0) {
      // Get the last two messages
      const recentMessages = messages.slice(-2);
      relatedMessagesIds.push(...recentMessages.map(msg => msg.id));
    }
    
    return [...new Set(relatedMessagesIds)]; // Remove duplicates
  };
  
  // Enhance message with contextual information
  const enhanceMessageWithContext = useCallback((originalContent, messageContext) => {
    // If not a follow-up, return original
    if (!messageContext.isFollowUp) {
      return originalContent;
    }
    
    // If no entities detected in this message but we have session entities and this is a follow-up
    if (messageContext.entities.length === 0 && Object.keys(sessionEntitiesRef.current).length > 0) {
      const relevantEntities = Object.keys(sessionEntitiesRef.current)
        .filter(entity => {
          // Only use company or major tech entities
          const info = sessionEntitiesRef.current[entity];
          return info.type === 'company' || (info.type === 'technology' && ['AIDW', 'OpenAI', 'Azure'].includes(entity));
        })
        .join(' and ');
      
      if (relevantEntities) {
        // Is this a formatting request?
        if (messageContext.intent === 'formatting') {
          return `${originalContent} for ${relevantEntities} based on our previous conversation about ${activeTopicRef.current || "that topic"}`;
        } else {
          return `${originalContent} regarding ${relevantEntities}`;
        }
      }
    }
    
    return originalContent;
  }, []);

  // Send a new message
  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || !isAuthenticated) return;
    
    // Analyze the message content
    const messageContext = analyzeMessage(content);
    
    // Create user message with context
    const userMessage = new MessageWithContext('user', content, user?.email || 'Anonymous');
    userMessage.entities = messageContext.entities;
    userMessage.intent = messageContext.intent;
    userMessage.topics = messageContext.topics;
    userMessage.isFollowUp = messageContext.isFollowUp;
    
    // Find related messages for context
    userMessage.referencedMessageIds = findRelatedMessages(messageContext);
    
    // Add to messages
    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation graph
    updateConversationGraph(userMessage);
    
    setIsLoading(true);
    setError(null);

    try {
      // Create simplified chat history for API
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Enhance message with contextual information if needed
      const enhancedContent = enhanceMessageWithContext(content, messageContext);
      
      console.log('Original message:', content);
      console.log('Enhanced message for API:', enhancedContent);
      console.log('Message context:', messageContext);
      console.log('With chat history:', chatHistory);

      const response = await chatServiceRef.current.sendMessage(enhancedContent, chatHistory);

      console.log('Received API response:', response);

      if (response.error) {
        console.error('Error in response:', response.answer);
        setError(response.answer);
      } else {
        let processedAnswer = response.answer || "I'm sorry, I couldn't generate a complete response at this time.";
        processedAnswer = VisualizationService.processAllVisualizations(processedAnswer);

        const formattedCitations = ResponseFormatter.formatCitations(
          response.citations || [],
          response.hyperlinks || []
        );

        // Create assistant message with context
        const assistantMessage = new MessageWithContext('assistant', processedAnswer, 'AI Assistant');
        assistantMessage.citations = formattedCitations;
        
        // Extract entities and topics from the assistant's response too
        const assistantContext = analyzeMessage(processedAnswer);
        assistantMessage.entities = assistantContext.entities;
        assistantMessage.topics = assistantContext.topics;
        
        // If assistant response references entities from user message, create message links
        assistantMessage.referencedMessageIds = [userMessage.id];
        
        // Add to messages
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update conversation graph with assistant's message
        updateConversationGraph(assistantMessage);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isAuthenticated, user, analyzeMessage, enhanceMessageWithContext]);

  // Handle starter questions
  const handleStarterQuestion = useCallback((question) => {
    // Reset context for new conversation thread
    activeTopicRef.current = null;
    sessionEntitiesRef.current = {};
    
    sendMessage(question);
  }, [sendMessage]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setConversationGraph({
      topics: {},
      entities: {},
      messageLinks: {},
      lastActiveTopicId: null
    });
    activeTopicRef.current = null;
    sessionEntitiesRef.current = {};
  }, []);

  // Persist conversation state across rerenders
  useEffect(() => {
    try {
      // Optional: Save to localStorage for persistence
      if (messages.length > 0) {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        localStorage.setItem('chatGraph', JSON.stringify(conversationGraph));
      }
    } catch (e) {
      console.error('Error saving chat state:', e);
    }
  }, [messages, conversationGraph]);
  
  // Initialize from localStorage if available
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      const savedGraph = localStorage.getItem('chatGraph');
      
      if (savedMessages && savedGraph && isAuthenticated) {
        setMessages(JSON.parse(savedMessages));
        setConversationGraph(JSON.parse(savedGraph));
        
        // Restore refs
        const graph = JSON.parse(savedGraph);
        if (graph.lastActiveTopicId) {
          activeTopicRef.current = graph.lastActiveTopicId;
        }
        
        // Rebuild session entities
        Object.entries(graph.entities).forEach(([entityValue, entityInfo]) => {
          sessionEntitiesRef.current[entityValue] = {
            type: entityInfo.type,
            lastMessageId: entityInfo.lastMessageId
          };
        });
      }
    } catch (e) {
      console.error('Error loading saved chat state:', e);
    }
  }, [isAuthenticated]);

  // Reset chat when user authentication changes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      clearChat();
    }
  }, [isAuthenticated, authLoading, clearChat]);

  // Create visualization if there's a request for it in the message
  const generateVisualization = useCallback((message) => {
    // Check for visualization requests
    if (message.role === 'user' && message.content.toLowerCase().includes('visualize')) {
      // This could be integrated with the VisualizationService
      // For now, let's log that we detected a visualization request
      console.log('Visualization request detected:', message.content);
    }
  }, []);

  // Process all messages for visualizations
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      generateVisualization(latestMessage);
    }
  }, [messages, generateVisualization]);

  // Expose topic and entity information for UI components
  const getConversationInsights = useCallback(() => {
    // Sort topics by relevance
    const sortedTopics = Object.entries(conversationGraph.topics)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);
    
    // Get most mentioned entities
    const topEntities = Object.entries(conversationGraph.entities)
      .map(([value, info]) => ({ 
        value, 
        type: info.type,
        lastMessageId: info.lastMessageId 
      }))
      .filter(entity => entity.type === 'company' || entity.type === 'technology');
    
    return {
      topics: sortedTopics,
      entities: topEntities,
      activeTopicId: conversationGraph.lastActiveTopicId
    };
  }, [conversationGraph]);

  // Suggest follow-up questions based on the conversation context
  const suggestFollowUpQuestions = useCallback(() => {
    if (messages.length === 0) return [];
    
    const insights = getConversationInsights();
    const suggestions = [];
    
    // Use the most recent message and entities to generate suggestions
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage.role === 'assistant') {
      // Suggestion based on comparing companies if multiple companies are mentioned
      const companies = insights.entities
        .filter(entity => entity.type === 'company')
        .map(entity => entity.value);
        
      if (companies.length >= 2) {
        suggestions.push({
          id: 'compare-companies',
          question: `Compare how ${companies.slice(0, 2).join(' and ')} implement their solutions`
        });
      }
      
      // Suggestion based on active topic
      if (insights.activeTopicId) {
        suggestions.push({
          id: 'deep-dive',
          question: `Can you provide more details about ${insights.activeTopicId}?`
        });
      }
      
      // Suggestion for visualization if there are metrics or numbers in the conversation
      if (latestMessage.content.match(/\d+%|\d+\s*(million|billion|dollars|euros)/i)) {
        suggestions.push({
          id: 'visualize',
          question: `Can you visualize this data?`
        });
      }
      
      // Suggestion to summarize current conversation
      if (messages.length > 4) {
        suggestions.push({
          id: 'summarize',
          question: 'Summarize what we have discussed so far'
        });
      }
    }
    
    return suggestions.slice(0, 3); // Return at most 3 suggestions
  }, [messages, getConversationInsights]);

  // Detect and handle conversation topic changes
  const handleConversationTopicChange = useCallback((newTopicId) => {
    if (newTopicId !== conversationGraph.lastActiveTopicId) {
      console.log(`Topic changed from ${conversationGraph.lastActiveTopicId} to ${newTopicId}`);
      
      // Update the active topic
      setConversationGraph(prevGraph => ({
        ...prevGraph,
        lastActiveTopicId: newTopicId
      }));
      
      activeTopicRef.current = newTopicId;
    }
  }, [conversationGraph.lastActiveTopicId]);

  return {
    messages,
    isLoading: isLoading || authLoading,
    error,
    sendMessage,
    handleStarterQuestion,
    clearChat,
    starterQuestions: STARTER_QUESTIONS,
    conversationInsights: getConversationInsights(),
    suggestedQuestions: suggestFollowUpQuestions(),
    handleTopicChange: handleConversationTopicChange,
    activeTopicId: conversationGraph.lastActiveTopicId,
    isAuthenticated
  };
}