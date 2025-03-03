/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { instance, accounts } = useMsal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      if (accounts.length > 0) {
        await acquireAccessToken(accounts[0]);
      } else {
        setLoading(false);
      }
    };
    
    checkAccount();
  }, [accounts]);

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
        try {
          await instance.acquireTokenRedirect({
            scopes: ['user.read', 'openid', 'profile'],
          });
        } catch (redirectError) {
          console.error('Redirect error:', redirectError);
        }
      } else {
        console.error('Token acquisition failed:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      // Change from loginPopup to loginRedirect to avoid hash handling issues
      await instance.loginRedirect({
        scopes: ['user.read', 'openid', 'profile'],
        redirectStartPage: window.location.href
      });
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const logout = () => {
    instance.logoutRedirect(); // Change to redirect mode
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