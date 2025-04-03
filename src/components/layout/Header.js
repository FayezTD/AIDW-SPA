import React from 'react';
import { useAuth } from '../auth/AuthProvider';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header 
      className="bg-gradient-to-r from-white to-white w-full"
      style={{
        // Add outward shadow to bottom edge
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 text-xl sm:text-2xl font-bold text-black">
            AIDW Assistant
          </div>
          <div className="flex-grow"></div>
          {isAuthenticated && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-black font-bold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">{user.email}</span>
              <button 
                onClick={logout} 
                className="bg-yellow-100 font-bold text-black px-3 py-1 rounded hover:bg-cyan-400 text-sm sm:text-base"
                tabIndex={4} // Assigning tabIndex 4 to match your screenshot's numbering
                aria-label="Sign Out"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;