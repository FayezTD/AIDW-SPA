import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Generate initials from user email
  const getInitials = (email) => {
    if (!email) return "?";
    
    // Split the email by @ and then by non-word characters
    const nameParts = email.split('@')[0].split(/[^a-zA-Z0-9]/);
    
    // Get first character of each part (up to 2)
    return nameParts
      .filter(part => part.length > 0)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <header 
      className="bg-gradient-to-r from-white to-white w-full shadow-md"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 text-xl sm:text-2xl font-bold text-black">
            AIDW Assistant
          </div>

          <div className="flex-grow"></div>
          
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center focus:outline-none"
                aria-label="Open user menu"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
              >
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-black font-medium hover:bg-cyan-400 transition-colors duration-200">
                  {getInitials(user.email)}
                </div>
              </button>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    tabIndex={4}
                    aria-label="Sign Out"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;