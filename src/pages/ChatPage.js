import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { useChat } from '../hooks/useChat';
import Header from '../components/layout/Header';
import { useAuth } from '../components/auth/AuthProvider';
import '../styles/chatBackground.css';

// Starter questions with large 3D professional gradient icon components
export const STARTER_QUESTIONS = [
  {
    id: 'change-management',
    title: 'Change Management Approach',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="globe-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="globe-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4776E6" />
            <stop offset="1" stopColor="#8E54E9" />
          </linearGradient>
          <radialGradient id="globe-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#globe-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#globe-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#globe-shine)" />
          <path d="M40 8C23.4 8 10 21.4 10 38C10 54.6 23.4 68 40 68C56.6 68 70 54.6 70 38C70 21.4 56.6 8 40 8ZM37 61.8C23.5 60.2 13 50.2 13 38C13 36.2 13.2 34.4 13.6 32.7L30 49V52C30 55.3 33 58 37 58V61.8ZM57.7 54.2C57 51.8 54.7 50 52 50H49V41C49 39.3 47.7 38 46 38H28V32H34C35.7 32 37 30.7 37 29V23H43C46.3 23 49 20.3 49 17V14.8C57.8 18.4 64 27.2 64 38C64 44.2 61.6 49.9 57.7 54.2Z" fill="white" />
        </g>
      </svg>
    ),
    question: 'Can you outline the change management approach recommended for the organizational restructuring?'
  },
  {
    id: 'data-security',
    title: 'Data Security Compliance',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="money-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="money-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#11998e" />
            <stop offset="1" stopColor="#38ef7d" />
          </linearGradient>
          <radialGradient id="money-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#money-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#money-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#money-shine)" />
          <path d="M40 20C43 20 45.5 22.1 46.2 25H52V31H46.2C45.5 33.9 43 36 40 36C37 36 34.5 33.9 33.8 31H22V25H33.8C34.5 22.1 37 20 40 20ZM40 44C43 44 45.5 46.1 46.2 49H58V55H46.2C45.5 57.9 43 60 40 60C37 60 34.5 57.9 33.8 55H22V49H33.8C34.5 46.1 37 44 40 44ZM40 50C38.9 50 38 50.9 38 52C38 53.1 38.9 54 40 54C41.1 54 42 53.1 42 52C42 50.9 41.1 50 40 50ZM40 26C38.9 26 38 26.9 38 28C38 29.1 38.9 30 40 30C41.1 30 42 29.1 42 28C42 26.9 41.1 26 40 26Z" fill="white" />
        </g>
      </svg>
    ),
    question: 'How does the document address data security compliance requirements for cross-border operations?'
  },
  {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction Metrics',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="chart-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="chart-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6a3093" />
            <stop offset="1" stopColor="#a044ff" />
          </linearGradient>
          <radialGradient id="chart-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#chart-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#chart-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#chart-shine)" />
          <path d="M58 55L58 25L52 25L52 55L58 55ZM46 55L46 35L40 35L40 55L46 55ZM34 55L34 31L28 31L28 55L34 55ZM22 55L22 43L16 43L16 55L22 55ZM16 61L58 61L58 58L16 58L16 61ZM16 22L58 22L58 19L16 19L16 22Z" fill="white" />
          <path d="M16 25L22 33L28 21L34 29L40 25L46 31L52 25L58 31" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    ),
    question: 'What metrics are being used to measure customer satisfaction in the new service model?'
  },
  {
    id: 'processing-time',
    title: 'Complaints Letter Processing Time',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="document-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="document-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF512F" />
            <stop offset="1" stopColor="#F09819" />
          </linearGradient>
          <radialGradient id="document-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#document-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#document-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#document-shine)" />
          <path d="M46 14H25C22.8 14 21 15.8 21 18V62C21 64.2 22.8 66 25 66H55C57.2 66 59 64.2 59 62V28L46 14ZM53 54H27V50H53V54ZM53 46H27V42H53V46ZM44 31V16.5L58.5 31H44Z" fill="white" />
          <circle cx="40" cy="30" r="12" fill="white" fillOpacity="0.2" />
          <path d="M40 20V30L45 35" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    ),
    question: 'How many minutes does it now take to produce a complaints letter after the integration of Azure OpenAI, compared to the previous time?'
  },
  {
    id: 'azure-integration',
    title: 'Azure OpenAI Integration Benefits',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="integration-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="integration-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2193b0" />
            <stop offset="1" stopColor="#6dd5ed" />
          </linearGradient>
          <radialGradient id="integration-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#integration-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#integration-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#integration-shine)" />
          <path d="M31 46H16V54H31V60L41 48L31 36V46ZM49 34V28H64V20H49V14L39 26L49 34Z" fill="white" />
          <path d="M33 25C33 28.3137 30.3137 31 27 31C23.6863 31 21 28.3137 21 25C21 21.6863 23.6863 19 27 19C30.3137 19 33 21.6863 33 25Z" fill="white" fillOpacity="0.2" />
          <path d="M59 55C59 58.3137 56.3137 61 53 61C49.6863 61 47 58.3137 47 55C47 51.6863 49.6863 49 53 49C56.3137 49 59 51.6863 59 55Z" fill="white" fillOpacity="0.2" />
        </g>
      </svg>
    ),
    question: 'How does the integration of Azure OpenAI with Logic Apps and Cosmos DB enhance the marketing capabilities of AB InBev?'
  },
  {
    id: 'tech-solutions',
    title: 'Finance Process Automation',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="comparison-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="4"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
          </filter>
          <linearGradient id="comparison-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5614B0" />
            <stop offset="1" stopColor="#DBD65C" />
          </linearGradient>
          <radialGradient id="comparison-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.3"/>
            <stop offset="1" stopColor="white" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g filter="url(#comparison-shadow)">
          <circle cx="40" cy="40" r="32" fill="url(#comparison-gradient)" />
          <circle cx="40" cy="40" r="32" fill="url(#comparison-shine)" />
          <path d="M16 58H24V22H16V58ZM56 58H64V22H56V58ZM26 58H54V22H26V58ZM34 30H46V26H34V30ZM34 38H46V34H34V38ZM34 46H46V42H34V46ZM34 54H46V50H34V54Z" fill="white" />
        </g>
      </svg>
    ),
    question: 'What technology solutions were identified as critical for automating the manual processes in finance?'
  }
];
 
const ChatPage = () => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    handleStarterQuestion,
    clearChat,
  } = useChat();
 
  const { isAuthenticated, login } = useAuth();
  const [setSelectedModel] = useState('GPT-4o');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // State for sidebar collapsed status
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
 
  // Smooth scroll to bottom when messages change, with a slight delay to ensure content is rendered
  useEffect(() => {
    if (messagesEndRef.current && !userScrolled) {
      // Small timeout to ensure content is rendered before scrolling
      const timeoutId = setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

  // Effect to sync sidebar collapsed state with localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Prevent automatic scrolling when user has manually scrolled up
  const [userScrolled, setUserScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        // User has scrolled up if they're not near the bottom
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
        setUserScrolled(isScrolledUp);
      }
    };
    
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);
 
  // Handle sending messages with model selection
  const handleSendMessage = (message, model) => {
    setSelectedModel(model); // Update the selected model at the page level
    sendMessage(message, { model }); // Pass the model as metadata to the sendMessage function
    // Reset userScrolled when sending a new message to ensure we scroll to the new message
    setUserScrolled(false);
  };

  // Handle sidebar collapse/expand
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
 
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex justify-center items-center px-4 text-center chat-background">
        <div className="shape-container">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">You must be signed in to chat.</h2>
          <button
            onClick={login}
            className="login-button"
            aria-label="Sign in with Microsoft"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden chat-background">
        {/* 3D Dynamic Shapes */}
        <div className="shape-container">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
        
        {/* Sidebar with collapsible functionality */}
        <div className={`hidden md:block h-full fixed left-0 top-0 pt-16 z-10 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-1/4 lg:w-1/5'
        }`}>
          <Sidebar
            onNewChat={clearChat}
            activeChatId="current"
            starterQuestions={STARTER_QUESTIONS.slice(0, 4)}
            onSelectQuestion={handleStarterQuestion}
            questionStyle="text-white font-bold"
            className="h-full bg-gray-800 shadow-inner overflow-y-auto"
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={handleSidebarToggle}
          />
        </div>
        
        {/* Main content with dynamic margin based on sidebar state */}
        <main 
          className={`flex-1 flex flex-col relative h-full z-10 transition-all duration-300 ${
            sidebarCollapsed ? 'md:ml-16' : 'md:ml-1/4 lg:ml-1/5'
          }`} 
          role="main" 
          aria-label="Chat interface"
        >
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto pt-8 pb-32 px-4 sm:px-6 lg:px-8 scroll-container"
          >
            {messages.length === 0 && (
              <div className="max-w-5xl mx-auto text-center py-8 welcome-section">
                <h1 className="welcome-title">
                  AI Design Wins - Assistant
                </h1>
                
                <div className="mb-8">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    className="w-full"
                    placeholder="Use everyday words to describe what your app should collect, track, list, or manage ..."
                  />
                </div>
                
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-cyan-700 mb-8 text-left transform translate-z-10">Choose your query type</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {STARTER_QUESTIONS.map((question) => (
                      <button
                        key={question.id}
                        onClick={() => handleStarterQuestion(question.question)}
                        className="starter-question flex flex-col items-center p-6 text-left bg-black bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white border-opacity-20"
                        style={{ minHeight: '200px' }}
                      >
                        <div className="w-full flex items-center mb-4">
                          <div className="flex-shrink-0 transform hover:rotate-6 transition-transform duration-300">
                            {question.icon}
                          </div>
                          <h3 className="text-xl font-bold ml-4 text-cyan-900">{question.title}</h3>
                        </div>
                        <p className="text-black text-md">
                          {question.question.length > 120 ? `${question.question.substring(0, 120)}...` : question.question}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
           
            {messages.length > 0 && (
              <div
                className="max-w-5xl mx-auto space-y-8"
                role="log"
                aria-label="Chat messages"
                aria-live="polite"
              >
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center justify-center w-full p-5">
                  <div className="relative inline-flex items-center">
                    <span className="text-gray-600 text-md font-medium mr-2">Wait</span>
                    <div className="flex space-x-1">
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" 
                        style={{ 
                          animationDelay: '0ms',
                          animationDuration: '1.4s'
                        }}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" 
                        style={{ 
                          animationDelay: '200ms',
                          animationDuration: '1.4s'
                        }}
                      ></div>
                      <div 
                        className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" 
                        style={{ 
                          animationDelay: '400ms',
                          animationDuration: '1.4s'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                )}
                {error && (
                  <div className="error-message p-5" role="alert">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" /> {/* Space at end for scrolling */}
              </div>
            )}
          </div>
 
          {messages.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 p-5 bottom-fade">
              <div className="max-w-5xl mx-auto">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  className="w-full"
                />
                <p className="text-xs text-center text-gray-500 mt-3">
                  AI generated content may be incomplete or factually incorrect.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
 
export default ChatPage;