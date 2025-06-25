import React from 'react';
import { useMsal } from '@azure/msal-react';
import { useAuth } from './AuthProvider';

const AuthDebugComponent = () => {
  const { instance, accounts, inProgress } = useMsal();
  const { user, isAuthenticated, loading } = useAuth();

  const clearCacheAndRetry = async () => {
    try {
      await instance.clearCache();
      console.log('Cache cleared');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  // Only show this component if debugging is enabled
  if (!process.env.REACT_APP_DEBUG_MSAL) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Auth Debug Info</h4>
      <p><strong>InProgress:</strong> {inProgress}</p>
      <p><strong>Accounts Count:</strong> {accounts.length}</p>
      <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>User:</strong> {user ? user.email : 'None'}</p>
      <p><strong>Current URL:</strong> {window.location.href}</p>
      
      <button onClick={clearCacheAndRetry} style={{ marginTop: '5px' }}>
        Clear Cache & Retry
      </button>
      
      {accounts.length > 0 && (
        <div>
          <h5>Account Details:</h5>
          <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '100px' }}>
            {JSON.stringify(accounts[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AuthDebugComponent;