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

  // Auth scopes
  const authScopes = ['user.read', 'openid', 'profile'];

  // Handle redirect on initial load
  useEffect(() => {
    const handleInitialRedirect = async () => {
      try {
        // Process any redirect response
        const response = await instance.handleRedirectPromise();
        if (response) {
          console.log("Redirect successfully handled");
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      } finally {
        // Check for accounts regardless of redirect result
        if (accounts.length > 0) {
          acquireAccessToken(accounts[0]);
        } else {
          setLoading(false);
        }
      }
    };

    handleInitialRedirect();
  }, []);

  // Monitor for account changes
  useEffect(() => {
    if (inProgress === 'none' && accounts.length > 0) {
      acquireAccessToken(accounts[0]);
    } else if (inProgress === 'none') {
      setLoading(false);
    }
  }, [accounts, inProgress]);

  const acquireAccessToken = async (account) => {
    try {
      const response = await instance.acquireTokenSilent({
        scopes: authScopes,
        account,
      });
      setUser({
        email: account.username,
        accessToken: response.accessToken,
        name: account.name || account.username,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Token acquisition error:", error);
      if (error instanceof InteractionRequiredAuthError) {
        try {
          // Use redirect for more reliable hash handling
          await instance.acquireTokenRedirect({
            scopes: authScopes,
          });
        } catch (redirectError) {
          console.error("Redirect error:", redirectError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      // Important: Use redirect instead of popup to avoid hash issues
      await instance.loginRedirect({
        scopes: authScopes,
        prompt: 'select_account', // Force account selection
      });
      
      // Code won't continue here due to redirect
    } catch (error) {
      console.error('Login redirect failed:', error);
      
      // Fallback to popup only if redirect fails
      try {
        await instance.loginPopup({
          scopes: authScopes,
        });
      } catch (popupError) {
        console.error('Popup login failed:', popupError);
      } finally {
        setLoading(false);
      }
    }
  };

  const logout = () => {
    // Try redirect logout
    try {
      instance.logoutRedirect();
    } catch (error) {
      console.error('Logout redirect failed:', error);
      // Fallback to popup
      instance.logoutPopup();
    }
    
    // Clear local state
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