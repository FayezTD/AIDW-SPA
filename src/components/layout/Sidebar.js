import React, { useState, useEffect } from 'react';

const Sidebar = ({ onNewChat, chatService, activeChatId, className, sidebarCollapsed, setSidebarCollapsed }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Default to open on larger screens, closed on mobile
    return window.innerWidth >= 768;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);
  
  // Listen for window resize to automatically adjust sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Handler for new chat button that first cancels ongoing requests
  const handleNewChat = () => {
    // Cancel all ongoing API requests if chatService is available
    if (chatService && typeof chatService.cancelAllRequests === 'function') {
      chatService.cancelAllRequests();
    }
    // Then call the original onNewChat function
    onNewChat();
  };

  return (
    <>
      {/* Sidebar with inward shadow on right edge */}
      <div 
        className={`fixed md:static h-full z-40 transition-all duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } bg-white border-gray-200 text-black border-r ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } flex flex-col ${className || ''}`}
        role="navigation"
        aria-label="Main Navigation"
        style={{
          // Add inward shadow on right edge
          boxShadow: 'inset -8px 0 10px -10px rgba(0,0,0,0.4)'
        }}
      >
        <div className={`p-4 flex justify-between items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <button
            onClick={handleNewChat}
            onKeyDown={(e) => handleKeyDown(e, handleNewChat)}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition duration-150 bg-gray-500 hover:bg-gray-700 text-white"
            tabIndex={1}
            aria-label="New Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${sidebarCollapsed ? '' : 'mr-2'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {!sidebarCollapsed && "New Chat"}
          </button>
        </div>
        
        <div className="flex-1 p-3 space-y-2">
          {/* Current Chat - Add tabIndex and keyboard handling */}
          <div 
            className={`p-2 rounded-md cursor-pointer transition ${
              activeChatId === 'current' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
            tabIndex={3}
            role="button"
            aria-label="Current Chat"
            aria-current={activeChatId === 'current' ? 'page' : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Add your chat selection logic here
              }
            }}
          >
            {sidebarCollapsed ? (
              <div className="flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <>
                <div className="text-sm font-medium truncate">Current Chat</div>
                <div className="text-xs truncate text-[#0f0f0f]">AI-driven workplace assistant</div>
              </>
            )}
          </div>
        </div>

        <div className={`p-4 border-t flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`} style={{ borderColor: 'rgb(229, 231, 235)' }}>
          {!sidebarCollapsed && (
            <div className="text-xs transition text-gray-900">
              AIDW Assistant v1.0
            </div>
          )}
          
          {/* Rectangular Collapse/Expand button like Claude's sidebar */}
          <button 
      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      onKeyDown={(e) => handleKeyDown(e, () => setSidebarCollapsed(!sidebarCollapsed))}
      className="px-3 py-1 rounded border-2 border-gray-400 bg-white text-gray-600 flex items-center justify-center text-xs font-medium hover:bg-gray-50 transition-colors"
      aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      tabIndex={2}
    >
      {sidebarCollapsed ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="hidden md:inline"></span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span></span>
        </>
      )}
    </button>
        </div>
      </div>
      
      {/* Overlay to close sidebar when clicking outside (mobile only) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}
    </>
  );
};

export default Sidebar;