import React from 'react';
import { useAuth } from '../auth/AuthProvider';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 text-2xl font-bold text-primary">
            AIDW Assistant
          </div>
          <div className="flex-grow"></div> {/* Spacer to push items apart */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <button 
                onClick={logout} 
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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