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
    title: 'Microsoft Fabric Report Limitations',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="report-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="report-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4776E6" />
            <stop offset="1" stopColor="#8E54E9" />
          </linearGradient>
          <radialGradient id="report-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#report-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#report-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#report-shine)" />
          <path d="M16 20V60H64V20H16ZM60 56H20V24H60V56Z" fill="white" />
          <path d="M24 44H32V52H24V44ZM36 36H44V52H36V36ZM48 28H56V52H48V28Z" fill="white" />
          <path d="M30 36L38 32L50 36L58 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 32H32" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M24 28H32" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    ),
    question: 'What are the limitations of creating reports from tasks in Microsoft Fabric?'
  },
  {
    id: 'fabric-task-flow',
    title: 'Microsoft Fabric Task Flow',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="flow-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="flow-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#11998e" />
            <stop offset="1" stopColor="#38ef7d" />
          </linearGradient>
          <radialGradient id="flow-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#flow-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#flow-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#flow-shine)" />
          <path d="M20 26H32V38H20V26Z" fill="white" />
          <path d="M48 26H60V38H48V26Z" fill="white" />
          <path d="M34 42H46V54H34V42Z" fill="white" />
          <path d="M32 32H48" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M40 38V42" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M33 44L20 54" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M47 44L60 54" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="54" r="4" fill="white" />
          <circle cx="60" cy="54" r="4" fill="white" />
        </g>
      </svg>
    ),
    question: 'What is a task flow in Microsoft Fabric?'
  },
  {
    id: 'azure-security-best-practices',
    title: 'Azure Security Best Practices',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="security-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="security-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6a3093" />
            <stop offset="1" stopColor="#a044ff" />
          </linearGradient>
          <radialGradient id="security-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#security-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#security-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#security-shine)" />
          <path d="M40 16L22 24V36C22 47.1 29.4 57.5 40 60C50.6 57.5 58 47.1 58 36V24L40 16ZM40 39.8H54C52.9 47.7 47.5 54.7 40 56.9V40H26V26.9L40 20.5V39.8Z" fill="white" />
          <path d="M36 32H44V36H36V32Z" fill="white" />
          <path d="M32 44H48V48H32V44Z" fill="white" />
          <path d="M30 38H50V42H30V38Z" fill="white" />
        </g>
      </svg>
    ),
    question: 'What are the best practices for security architecture in Azure?'
  },
  {
    id: 'azure-threat-detection',
    title: 'Azure Threat Detection Services',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="threat-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="threat-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF512F" />
            <stop offset="1" stopColor="#F09819" />
          </linearGradient>
          <radialGradient id="threat-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#threat-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#threat-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#threat-shine)" />
          <path d="M40 20C30.1 20 22 28.1 22 38C22 47.9 30.1 56 40 56C49.9 56 58 47.9 58 38C58 28.1 49.9 20 40 20ZM40 52C32.3 52 26 45.7 26 38C26 30.3 32.3 24 40 24C47.7 24 54 30.3 54 38C54 45.7 47.7 52 40 52Z" fill="white" />
          <path d="M40 28V42" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <path d="M40 46V48" stroke="white" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 60L26 56" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M58 60L54 56" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 36H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 36H64" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    ),
    question: 'Which Azure services are commonly used in threat detection and response?'
  },
  {
    id: 'azure-resiliency-patterns',
    title: 'Azure Resiliency Patterns',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="resilience-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="resilience-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2193b0" />
            <stop offset="1" stopColor="#6dd5ed" />
          </linearGradient>
          <radialGradient id="resilience-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#resilience-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#resilience-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#resilience-shine)" />
          <path d="M28 24V34H18V46H28V56H52V46H62V34H52V24H28ZM48 52H32V44H48V52ZM58 42H52V38H48V34H32V38H28V42H22V38H28V34H32V30H48V34H52V38H58V42Z" fill="white" />
          <circle cx="40" cy="34" r="2" fill="white" />
          <circle cx="40" cy="46" r="2" fill="white" />
          <circle cx="52" cy="40" r="2" fill="white" />
          <circle cx="28" cy="40" r="2" fill="white" />
        </g>
      </svg>
    ),
    question: 'What are the resiliency patterns mentioned in Azure architectural designs? Please tabulate the response. '
  },
  {
    id: 'azure-form-recognizer',
    title: 'Azure Form Recognizer',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="form-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="form-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5614B0" />
            <stop offset="1" stopColor="#DBD65C" />
          </linearGradient>
          <radialGradient id="form-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#form-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#form-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#form-shine)" />
          <path d="M24 16H56C58.2 16 60 17.8 60 20V60C60 62.2 58.2 64 56 64H24C21.8 64 20 62.2 20 60V20C20 17.8 21.8 16 24 16Z" fill="white" fillOpacity="0.2" />
          <path d="M24 16H56C58.2 16 60 17.8 60 20V60C60 62.2 58.2 64 56 64H24C21.8 64 20 62.2 20 60V20C20 17.8 21.8 16 24 16ZM24 20V60H56V20H24Z" fill="white" />
          <path d="M28 28H40" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M28 36H52" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M28 44H48" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M28 52H44" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="49" cy="28" r="5" stroke="white" strokeWidth="2" />
          <path d="M52 31L56 35" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    ),
    question: 'What is the role of Azure Form Recognizer in document automation?'
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