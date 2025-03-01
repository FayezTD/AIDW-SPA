/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Define scopes consistently across the component
  const authScopes = ['user.read', 'openid', 'profile'];

  useEffect(() => {
    const handleAccounts = async () => {
      // Only process if we have accounts and aren't in the middle of another operation
      if (accounts.length > 0 && inProgress === 'none') {
        const currentAccount = accounts[0];
        try {
          const response = await instance.acquireTokenSilent({
            scopes: authScopes,
            account: currentAccount,
          });
          
          setUser({
            email: currentAccount.username,
            accessToken: response.accessToken,
            name: currentAccount.name || currentAccount.username,
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token acquisition failed:", error);
          if (error instanceof InteractionRequiredAuthError) {
            // User interaction required, but we'll let the user initiate it
            setIsAuthenticated(false);
          }
        } finally {
          setLoading(false);
        }
      } else if (inProgress === 'none') {
        // No accounts and no operation in progress
        setLoading(false);
        setIsAuthenticated(false);
      }
    };

    // Process accounts when they change or when MSAL operations complete
    handleAccounts();
  }, [accounts, inProgress, instance]);

  // Handle redirect response on component mount
  useEffect(() => {
    const handleRedirectResponse = async () => {
      try {
        await instance.handleRedirectPromise();
      } catch (error) {
        console.error("Error handling redirect:", error);
      }
    };

    handleRedirectResponse();
  }, [instance]);

  const login = async () => {
    setLoading(true);
    try {
      // Using redirect instead of popup to avoid hash handling issues
      await instance.loginRedirect({
        scopes: authScopes,
        redirectStartPage: window.location.href, // Return to the same page
      });
    } catch (error) {
      console.error('Login redirect failed:', error);
      // Try popup as fallback
      try {
        await instance.loginPopup({
          scopes: authScopes,
        });
      } catch (popupError) {
        console.error('Login popup failed:', popupError);
        setLoading(false);
      }
    }
  };

  const logout = () => {
    try {
      instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      instance.logoutPopup();
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};