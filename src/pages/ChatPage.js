import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { useChat ,STARTER_QUESTIONS } from '../hooks/useChat';
import Header from '../components/layout/Header';
import { useAuth } from '../components/auth/AuthProvider';
import '../styles/chatBackground.css';

// Starter questions with large 3D professional gradient icon components
// export const STARTER_QUESTIONS = [
//   {
//     id: 'fabric-reports-limitations',
//     title: 'Microsoft Fabric Report Limitations',
//     icon: (
//       <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <filter id="report-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
//             <feFlood floodOpacity="0" result="BackgroundImageFix"/>
//             <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
//             <feOffset dy="4"/>
//             <feGaussianBlur stdDeviation="4"/>
//             <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
//             <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
//             <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
//           </filter>
//           <linearGradient id="report-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#4776E6" />
//             <stop offset="1" stopColor="#8E54E9" />
//           </linearGradient>
//           <radialGradient id="report-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
//             <stop stopColor="white" stopOpacity="0.3"/>
//             <stop offset="1" stopColor="white" stopOpacity="0"/>
//           </radialGradient>
//         </defs>
//         <g filter="url(#report-shadow)">
//           <circle cx="40" cy="40" r="32" fill="url(#report-gradient)" />
//           <circle cx="40" cy="40" r="32" fill="url(#report-shine)" />
//           <path d="M16 20V60H64V20H16ZM60 56H20V24H60V56Z" fill="white" />
//           <path d="M24 44H32V52H24V44ZM36 36H44V52H36V36ZM48 28H56V52H48V28Z" fill="white" />
//           <path d="M30 36L38 32L50 36L58 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//           <path d="M24 32H32" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M24 28H32" stroke="white" strokeWidth="2" strokeLinecap="round" />
//         </g>
//       </svg>
//     ),
//     question: 'What are the limitations of creating reports from tasks in Microsoft Fabric?'
//   },
//   {
//     id: 'fabric-task-flow',
//     title: 'Microsoft Fabric Task Flow',
//     icon: (
//       <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <filter id="flow-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
//             <feFlood floodOpacity="0" result="BackgroundImageFix"/>
//             <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
//             <feOffset dy="4"/>
//             <feGaussianBlur stdDeviation="4"/>
//             <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
//             <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
//             <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
//           </filter>
//           <linearGradient id="flow-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#11998e" />
//             <stop offset="1" stopColor="#38ef7d" />
//           </linearGradient>
//           <radialGradient id="flow-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
//             <stop stopColor="white" stopOpacity="0.3"/>
//             <stop offset="1" stopColor="white" stopOpacity="0"/>
//           </radialGradient>
//         </defs>
//         <g filter="url(#flow-shadow)">
//           <circle cx="40" cy="40" r="32" fill="url(#flow-gradient)" />
//           <circle cx="40" cy="40" r="32" fill="url(#flow-shine)" />
//           <path d="M20 26H32V38H20V26Z" fill="white" />
//           <path d="M48 26H60V38H48V26Z" fill="white" />
//           <path d="M34 42H46V54H34V42Z" fill="white" />
//           <path d="M32 32H48" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M40 38V42" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M33 44L20 54" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M47 44L60 54" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <circle cx="20" cy="54" r="4" fill="white" />
//           <circle cx="60" cy="54" r="4" fill="white" />
//         </g>
//       </svg>
//     ),
//     question: 'What is a task flow in Microsoft Fabric?'
//   },
//   {
//     id: 'azure-security-best-practices',
//     title: 'Azure Security Best Practices',
//     icon: (
//       <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <filter id="security-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
//             <feFlood floodOpacity="0" result="BackgroundImageFix"/>
//             <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
//             <feOffset dy="4"/>
//             <feGaussianBlur stdDeviation="4"/>
//             <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
//             <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
//             <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
//           </filter>
//           <linearGradient id="security-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#6a3093" />
//             <stop offset="1" stopColor="#a044ff" />
//           </linearGradient>
//           <radialGradient id="security-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
//             <stop stopColor="white" stopOpacity="0.3"/>
//             <stop offset="1" stopColor="white" stopOpacity="0"/>
//           </radialGradient>
//         </defs>
//         <g filter="url(#security-shadow)">
//           <circle cx="40" cy="40" r="32" fill="url(#security-gradient)" />
//           <circle cx="40" cy="40" r="32" fill="url(#security-shine)" />
//           <path d="M40 16L22 24V36C22 47.1 29.4 57.5 40 60C50.6 57.5 58 47.1 58 36V24L40 16ZM40 39.8H54C52.9 47.7 47.5 54.7 40 56.9V40H26V26.9L40 20.5V39.8Z" fill="white" />
//           <path d="M36 32H44V36H36V32Z" fill="white" />
//           <path d="M32 44H48V48H32V44Z" fill="white" />
//           <path d="M30 38H50V42H30V38Z" fill="white" />
//         </g>
//       </svg>
//     ),
//     question: 'What are the best practices for security architecture in Azure?'
//   },
//   {
//     id: 'azure-threat-detection',
//     title: 'Azure Threat Detection Services',
//     icon: (
//       <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <filter id="threat-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
//             <feFlood floodOpacity="0" result="BackgroundImageFix"/>
//             <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
//             <feOffset dy="4"/>
//             <feGaussianBlur stdDeviation="4"/>
//             <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
//             <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
//             <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
//           </filter>
//           <linearGradient id="threat-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#FF512F" />
//             <stop offset="1" stopColor="#F09819" />
//           </linearGradient>
//           <radialGradient id="threat-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
//             <stop stopColor="white" stopOpacity="0.3"/>
//             <stop offset="1" stopColor="white" stopOpacity="0"/>
//           </radialGradient>
//         </defs>
//         <g filter="url(#threat-shadow)">
//           <circle cx="40" cy="40" r="32" fill="url(#threat-gradient)" />
//           <circle cx="40" cy="40" r="32" fill="url(#threat-shine)" />
//           <path d="M40 20C30.1 20 22 28.1 22 38C22 47.9 30.1 56 40 56C49.9 56 58 47.9 58 38C58 28.1 49.9 20 40 20ZM40 52C32.3 52 26 45.7 26 38C26 30.3 32.3 24 40 24C47.7 24 54 30.3 54 38C54 45.7 47.7 52 40 52Z" fill="white" />
//           <path d="M40 28V42" stroke="white" strokeWidth="4" strokeLinecap="round" />
//           <path d="M40 46V48" stroke="white" strokeWidth="4" strokeLinecap="round" />
//           <path d="M22 60L26 56" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M58 60L54 56" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M16 36H20" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M60 36H64" stroke="white" strokeWidth="2" strokeLinecap="round" />
//         </g>
//       </svg>
//     ),
//     question: 'Which Azure services are commonly used in threat detection and response?'
//   },
//   {
//     id: 'azure-resiliency-patterns',
//     title: 'Azure Resiliency Patterns',
//     icon: (
//       <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <filter id="resilience-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
//             <feFlood floodOpacity="0" result="BackgroundImageFix"/>
//             <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
//             <feOffset dy="4"/>
//             <feGaussianBlur stdDeviation="4"/>
//             <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
//             <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
//             <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
//           </filter>
//           <linearGradient id="resilience-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#2193b0" />
//             <stop offset="1" stopColor="#6dd5ed" />
//           </linearGradient>
//           <radialGradient id="resilience-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
//             <stop stopColor="white" stopOpacity="0.3"/>
//             <stop offset="1" stopColor="white" stopOpacity="0"/>
//           </radialGradient>
//         </defs>
//         <g filter="url(#resilience-shadow)">
//           <circle cx="40" cy="40" r="32" fill="url(#resilience-gradient)" />
//           <circle cx="40" cy="40" r="32" fill="url(#resilience-shine)" />
//           <path d="M28 24V34H18V46H28V56H52V46H62V34H52V24H28ZM48 52H32V44H48V52ZM58 42H52V38H48V34H32V38H28V42H22V38H28V34H32V30H48V34H52V38H58V42Z" fill="white" />
//           <circle cx="40" cy="34" r="2" fill="white" />
//           <circle cx="40" cy="46" r="2" fill="white" />
//           <circle cx="52" cy="40" r="2" fill="white" />
//           <circle cx="28" cy="40" r="2" fill="white" />
//         </g>
//       </svg>
//     ),
//     question: 'What are the resiliency patterns mentioned in Azure architectural designs?'
//   },
//   {
//     id: 'azure-form-recognizer',
//     title: 'Azure Form Recognizer',
//     icon: (
//       <svg className="w-16 h-16" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <defs>
//           <filter id="form-shadow" x="-8" y="-8" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
//             <feFlood floodOpacity="0" result="BackgroundImageFix"/>
//             <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
//             <feOffset dy="4"/>
//             <feGaussianBlur stdDeviation="4"/>
//             <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
//             <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
//             <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
//           </filter>
//           <linearGradient id="form-gradient" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
//             <stop stopColor="#5614B0" />
//             <stop offset="1" stopColor="#DBD65C" />
//           </linearGradient>
//           <radialGradient id="form-shine" cx="24" cy="24" r="28" gradientUnits="userSpaceOnUse">
//             <stop stopColor="white" stopOpacity="0.3"/>
//             <stop offset="1" stopColor="white" stopOpacity="0"/>
//           </radialGradient>
//         </defs>
//         <g filter="url(#form-shadow)">
//           <circle cx="40" cy="40" r="32" fill="url(#form-gradient)" />
//           <circle cx="40" cy="40" r="32" fill="url(#form-shine)" />
//           <path d="M24 16H56C58.2 16 60 17.8 60 20V60C60 62.2 58.2 64 56 64H24C21.8 64 20 62.2 20 60V20C20 17.8 21.8 16 24 16Z" fill="white" fillOpacity="0.2" />
//           <path d="M24 16H56C58.2 16 60 17.8 60 20V60C60 62.2 58.2 64 56 64H24C21.8 64 20 62.2 20 60V20C20 17.8 21.8 16 24 16ZM24 20V60H56V20H24Z" fill="white" />
//           <path d="M28 28H40" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M28 36H52" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M28 44H48" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <path d="M28 52H44" stroke="white" strokeWidth="2" strokeLinecap="round" />
//           <circle cx="49" cy="28" r="5" stroke="white" strokeWidth="2" />
//           <path d="M52 31L56 35" stroke="white" strokeWidth="2" strokeLinecap="round" />
//         </g>
//       </svg>
//     ),
//     question: 'What is the role of Azure Form Recognizer in document automation?'
//   }
// ];
 
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
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // State for sidebar collapsed status
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Get from localStorage or default to collapsed on mobile, expanded on desktop
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) return savedState === 'true';
    return window.innerWidth < 768; // Default to collapsed on mobile
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

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);
 
  // Handle sending messages
  const handleSendMessage = (message, model) => {
    sendMessage(message, model ); // Pass the model as metadata to the sendMessage function
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header fixed at top */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden chat-background">
        {/* 3D Dynamic Shapes */}
        <div className="shape-container">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
        
        {/* Sidebar - fixed position on desktop, slide-in on mobile */}
        <div 
          className={`fixed top-0 h-full z-20 transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'md:w-16 w-0' : 'md:w-1/4 lg:w-1/5 w-64'}
            ${sidebarCollapsed && window.innerWidth < 768 ? '-translate-x-full' : 'translate-x-0'}
          `}
          style={{ paddingTop: '64px' }} // Height of the header
        >
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
        
        {/* Mobile sidebar toggle button - only visible on small screens */}
        {sidebarCollapsed && (
          <button 
            className="md:hidden fixed left-4 top-20 z-30 bg-gray-800 text-white p-2 rounded-full shadow-lg"
            onClick={handleSidebarToggle}
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {/* Main content with dynamic margin based on sidebar state */}
        <main 
          className={`flex-1 flex flex-col relative h-full z-10 transition-all duration-300 pt-16
            ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-1/4 lg:ml-1/5'}
          `} 
          role="main" 
          aria-label="Chat interface"
        >
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto pb-32 px-4 sm:px-6 lg:px-8 scroll-container"
          >
            {messages.length === 0 && (
              <div className="max-w-5xl mx-auto text-center py-8 welcome-section">
                <h1 className="welcome-title mt-4">
                  AI Design Wins - Assistant
                </h1>
                
                <div className="mb-8 mt-8">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    className="w-full"
                    placeholder="Use everyday words to describe what your app should collect, track, list, or manage ..."
                  />
                </div>
                
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-cyan-700 mb-8 text-left transform translate-z-10">Choose your query type</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    {STARTER_QUESTIONS.map((question) => (
                      <button
                        key={question.id}
                        onClick={() => handleStarterQuestion(question.question)}
                        className="starter-question flex flex-col items-center p-4 md:p-6 text-left bg-black bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white border-opacity-20"
                        style={{ minHeight: '180px' }}
                      >
                        <div className="w-full flex items-center mb-4">
                          <div className="flex-shrink-0 transform hover:rotate-6 transition-transform duration-300">
                            {question.icon}
                          </div>
                          <h3 className="text-lg md:text-xl font-bold ml-4 text-cyan-900">{question.title}</h3>
                        </div>
                        <p className="text-black text-sm md:text-md">
                          {question.question.length > 100 ? `${question.question.substring(0, 100)}...` : question.question}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
           
            {messages.length > 0 && (
              <div
                className="max-w-5xl mx-auto space-y-6 md:space-y-8 mt-4"
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
                    <span className="text-gray-600 text-md font-medium mr-2">Please Wait</span>
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