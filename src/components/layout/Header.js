import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: user?.email || '',
    organization: '',
    initials: ''
  });
  
  useEffect(() => {
    if (user?.email) {
      // Get user display name from email (before the @ symbol)
      const displayName = user.email.split('@')[0]
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      
      // Get organization from email domain
      const organization = user.email.split('@')[1]?.split('.')[0] || '';
      
      // Generate initials from name
      const initials = getInitials(user.email);
      
      setUserInfo({
        name: displayName,
        email: user.email,
        organization: organization.charAt(0).toUpperCase() + organization.slice(1),
        initials
      });
    }
  }, [user]);
  
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

  const handleSignOut = (e) => {
    e.preventDefault();
    logout();
    setShowProfileMenu(false);
  };

  return (
    <header className="bg-gradient-to-r from-white to-white w-full shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 text-xl sm:text-2xl font-bold text-black">
            AIDW Assistant
          </div>

          <div className="flex-grow"></div>
          
          {isAuthenticated && (
            <div className="relative flex items-center">
              {/* Profile button */}
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center focus:outline-none mr-4"
                aria-label="Open user menu"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
              >
                <div 
                  className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-black font-medium hover:bg-cyan-400 transition-colors duration-200"
                  title={userInfo.email}
                >
                  {userInfo.initials}
                </div>
              </button>

              {/* Simple Sign Out Icon Button */}
              <button 
                onClick={handleSignOut}
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors duration-200"
                aria-label="Sign Out"
                title="Sign Out"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div 
                  className="absolute right-0 top-12 w-64 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  {/* User info section */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium mr-3">
                        {userInfo.initials}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-900">{userInfo.name}</p>
                        <p className="text-sm text-gray-500 truncate">{userInfo.email}</p>
                      </div>
                    </div>
                    {userInfo.organization && (
                      <div className="text-xs text-gray-500 mt-1 bg-gray-50 py-1 px-2 rounded">
                        Organization: {userInfo.organization}
                      </div>
                    )}
                  </div>
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