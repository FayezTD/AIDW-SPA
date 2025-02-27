import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { msalInstance } from './msalConfig'; // Import instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { instance, accounts } = useMsal();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (accounts.length > 0) {
      acquireAccessToken(accounts[0]);
    } else {
      setLoading(false);
    }
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
        instance.acquireTokenRedirect({
          scopes: ['user.read', 'openid', 'profile'],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      await instance.loginPopup({ scopes: ['user.read', 'openid', 'profile'] });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    instance.logoutPopup();
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
