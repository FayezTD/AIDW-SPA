import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { useChat, STARTER_QUESTIONS } from '../hooks/useChat';
import Header from '../components/layout/Header';
import { useAuth } from '../components/auth/AuthProvider';
import ChatService from '../services/chatService'; // Import ChatService
import '../styles/chatBackground.css';

const ChatPage = () => {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    handleStarterQuestion,
    clearChat,
    chatService, // Extract chatService from useChat if available
  } = useChat();
 
  // Create a reference to the ChatService instance if not provided by useChat
  const chatServiceRef = useRef(chatService || new ChatService());
  
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
    sendMessage(message, model); // Pass the model as metadata to the sendMessage function
    // Reset userScrolled when sending a new message to ensure we scroll to the new message
    setUserScrolled(false);
  };

  // Handle sidebar collapse/expand
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Handle new chat with request cancellation
  const handleNewChat = () => {
    // Cancel any ongoing requests
    if (chatServiceRef.current && typeof chatServiceRef.current.cancelAllRequests === 'function') {
      chatServiceRef.current.cancelAllRequests();
    }
    // Then clear the chat
    clearChat();
  };
 
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex justify-center items-center px-4 text-center chat-background">
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
        {/* Sidebar - fixed position on desktop, slide-in on mobile */}
        <div 
          className={`fixed top-0 h-full z-20 transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'md:w-16 w-0' : 'md:w-1/4 lg:w-1/5 w-64'}
            ${sidebarCollapsed && window.innerWidth < 768 ? '-translate-x-full' : 'translate-x-0'}
          `}
          style={{ paddingTop: '64px' }} // Height of the header
        >
          <Sidebar
            onNewChat={handleNewChat} // Use the enhanced new chat handler
            chatService={chatServiceRef.current} // Pass chatService to Sidebar
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
                  {/* <h3 className="text-2xl font-bold text-cyan-700 mb-8 text-left transform translate-z-8">Choose your query type</h3> */}
                  
                  {/* V-shaped arrangement (2-1) of starter questions */}
                  <div className="flex flex-col items-center space-y-6">
                    {/* First row - 2 cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
                      {STARTER_QUESTIONS.slice(0, 2).map((question) => (
                        <button
                          key={question.id}
                          onClick={() => handleStarterQuestion(question.question)}
                          className="starter-question flex flex-col items-center p-4 md:p-6 text-left bg-black bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border border-gray-200 border-opacity-20"
                          style={{ minHeight: '70px', height: '80px' }}
                        >
                          <div className="w-full flex items-center">
                            <div className="flex-shrink-0 transform hover:rotate-6 transition-transform duration-300 mr-4">
                              {question.icon}
                            </div>
                            <p className="text-black text-sm md:text-md">
                              {question.question.length > 100 ? `${question.question.substring(0, 100)}...` : question.question}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Second row - 1 card */}
                    <div className="w-3/5">
                      <button
                        key={STARTER_QUESTIONS[2].id}
                        onClick={() => handleStarterQuestion(STARTER_QUESTIONS[2].question)}
                        className="starter-question flex flex-col items-center p-4 md:p-6 text-left bg-black bg-opacity-5 backdrop-filter backdrop-blur-lg rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border border-gray-200 border-opacity-20 w-full"
                        style={{ minHeight: '70px', height: '80px' }}
                      >
                        <div className="w-full flex items-center">
                          <div className="flex-shrink-0 transform hover:rotate-6 transition-transform duration-300 mr-4">
                            {STARTER_QUESTIONS[2].icon}
                          </div>
                          <p className="text-black text-sm md:text-md">
                            {STARTER_QUESTIONS[2].question.length > 120 ? `${STARTER_QUESTIONS[2].question.substring(0, 100)}...` : STARTER_QUESTIONS[2].question}
                          </p>
                        </div>
                      </button>
                    </div>
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