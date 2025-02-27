import React, { useState, useEffect } from 'react';

const Sidebar = ({ onNewChat, activeChatId }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className={`border-r w-64 flex flex-col h-full transition-all ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}>
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition duration-150 ${
            darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-primary hover:bg-secondary text-black'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Placeholder for chat history - can be expanded in the future */}
        <div className={`p-2 rounded-md cursor-pointer transition ${
          activeChatId === 'current' ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
        }`}>
          <div className="text-sm font-medium truncate">Current Chat</div>
          <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI-driven workplace assistant</div>
        </div>
      </div>

      <div className="p-4 border-t transition ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between">
        <div className={`text-xs transition ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          AIDW Assistant v1.0
        </div>
        
        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-md transition hover:bg-opacity-20"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a8 8 0 107.938 6.732A7 7 0 0110 18a8 8 0 000-16z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zM4.222 5.222a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm11-6a1 1 0 011 1v1a1 1 0 11-2 0V4a1 1 0 011-1zm3.778 1.778a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM16 10a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-3.778 6.222a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM4.222 14.778a1 1 0 000 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
