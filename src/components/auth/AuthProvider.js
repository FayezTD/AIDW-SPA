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

  useEffect(() => {
    const checkAndHandleAccount = async () => {
      // Don't do anything while MSAL is busy with a redirect
      if (inProgress !== 'none') {
        return;
      }
      
      if (accounts.length > 0) {
        try {
          await acquireAccessToken(accounts[0]);
        } catch (error) {
          console.error("Token acquisition failed:", error);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkAndHandleAccount();
  }, [accounts, inProgress]);

  const acquireAccessToken = async (account) => {
    try {
      const response = await instance.acquireTokenSilent({
        scopes: ['user.read', 'openid', 'profile'],
        account,
      });
      
      setUser({
        email: account.username,
        accessToken: response.accessToken,
      });
      setIsAuthenticated(true);
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Instead of immediately redirecting, set a flag or state
        console.log("Interactive login required");
        setIsAuthenticated(false);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      console.log("Initiating login redirect...");
      // Make sure we're using the fully initialized instance
      await instance.loginRedirect({
        scopes: ['user.read', 'openid', 'profile'],
        // Make sure the app remembers where the user was trying to go
        redirectStartPage: window.location.origin + (window.location.pathname || '/'),
      });
      // The page will redirect, so we don't need to do anything else here
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Logout failed:', error);
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