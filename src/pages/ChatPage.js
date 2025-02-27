import React, { useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import StarterQuestions from '../components/chat/StarterQuestions';
import { useChat } from '../hooks/useChat';
import Header from '../components/layout/Header';
import { useAuth } from '../components/auth/AuthProvider';

const ChatPage = () => {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    handleStarterQuestion, 
    clearChat,
    starterQuestions 
  } = useChat();

  const { isAuthenticated, login } = useAuth();
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">You must be signed in to chat.</h2>
          <button 
            onClick={login} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onNewChat={clearChat} activeChatId="current" />
        <main className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
          <div className="p-4 flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <>
                <div className="text-center my-8">
                  <h1 className="text-3xl font-bold text-gray-900">Welcome to AIDW Assistant</h1>
                  <p className="mt-3 text-lg text-gray-600">
                    I can help you with AI-driven workplace solutions.
                    <br />Select a starter question below or ask your own question.
                  </p>
                </div>
                <StarterQuestions 
                  questions={starterQuestions} 
                  onSelectQuestion={handleStarterQuestion} 
                />
              </>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 p-4 bg-white">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
