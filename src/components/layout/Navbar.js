import React, { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const Navbar = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout } = useAuth();
    const userMenuRef = useRef(null);

    // Comprehensive function to extract initials from any user data format
    const extractInitials = () => {
        // If no user data exists
        if (!user) return 'U';
        
        // Check for name in user object
        if (user.name) {
            const nameParts = user.name.trim().split(/\s+/);
            if (nameParts.length === 0 || !nameParts[0]) return 'U';
            if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
            return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
        }
        
        // Try firstName and lastName if available
        if (user.firstName || user.lastName) {
            const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
            const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
            return first + last || 'U';
        }
        
        // Try fullName if available
        if (user.fullName) {
            const nameParts = user.fullName.trim().split(/\s+/);
            if (nameParts.length === 0 || !nameParts[0]) return 'U';
            if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
            return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
        }
        
        // Try displayName if available
        if (user.displayName) {
            const nameParts = user.displayName.trim().split(/\s+/);
            if (nameParts.length === 0 || !nameParts[0]) return 'U';
            if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
            return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
        }
        
        // Use email as last resort
        if (user.email) {
            const emailParts = user.email.split('@');
            if (emailParts[0]) {
                // Handle email usernames with dots or underscores
                const nameParts = emailParts[0].split(/[._-]/);
                if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
                if (nameParts.length > 1) {
                    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
                }
                return emailParts[0].charAt(0).toUpperCase();
            }
        }
        
        // Absolute fallback
        return 'U';
    };

    // Generate a consistent color based on user email or name
    const getBackgroundColor = () => {
        const colorOptions = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
            'bg-red-500', 'bg-yellow-500',
            'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
        ];
        
        if (!user) return colorOptions[0];
        
        // Create a simple hash from user email or name
        const str = user.email || user.name || user.displayName || 'user';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Use the hash to select a color
        const index = Math.abs(hash) % colorOptions.length;
        return colorOptions[index];
    };

    // Get user's display name for the menu
    const getUserDisplayName = () => {
        if (!user) return 'Guest';
        
        return user.name || 
               (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
               user.fullName || 
               user.displayName ||
               user.email?.split('@')[0] ||
               'Guest';
    };

    // Get user's organization
    const getUserOrganization = () => {
        if (!user) return null;
        
        return user.organization || 
               user.company || 
               user.dept ||
               user.team ||
               null;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const initials = extractInitials();
    const bgColor = getBackgroundColor();
    const displayName = getUserDisplayName();
    const organization = getUserOrganization();

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 pl-5">AIDW Assistant</h1>

                <div className="flex items-center">
                    {/* User Menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            title={displayName}
                            aria-label="User Menu"
                            className="focus:outline-none"
                        >
                            {user?.profilePicture ? (
                                <img 
                                    src={user.profilePicture} 
                                    alt="Profile" 
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold text-sm`}>
                                    {initials}
                                </div>
                            )}
                        </button>

                        {showUserMenu && (
                            <div
                                className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                                role="menu"
                                aria-label="User dropdown"
                            >
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <div className="flex items-center">
                                        <div className="mr-2">
                                            {user?.profilePicture ? (
                                                <img 
                                                    src={user.profilePicture} 
                                                    alt="Profile" 
                                                    className="w-7 h-7 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-7 h-7 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold text-xs`}>
                                                    {initials}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-900">{displayName}</p>
                                            <p className="text-xs text-gray-700 truncate">{user?.email || ''}</p>
                                            {organization && (
                                                <p className="text-xs text-gray-500">{organization}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    role="menuitem"
                                    className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-gray-50 transition"
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;