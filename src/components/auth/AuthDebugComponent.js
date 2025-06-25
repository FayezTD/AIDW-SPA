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
      padding: '15px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '350px',
      fontFamily: 'monospace',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>🔍 Auth Debug Info</h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>MSAL Status:</strong>
        <div style={{ marginLeft: '10px' }}>
          <div>• InProgress: <span style={{ color: inProgress === 'none' ? 'green' : 'orange' }}>{inProgress}</span></div>
          <div>• Accounts: <span style={{ color: accounts.length > 0 ? 'green' : 'red' }}>{accounts.length}</span></div>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Auth State:</strong>
        <div style={{ marginLeft: '10px' }}>
          <div>• Authenticated: <span style={{ color: isAuthenticated ? 'green' : 'red' }}>{isAuthenticated ? 'Yes' : 'No'}</span></div>
          <div>• Loading: <span style={{ color: loading ? 'orange' : 'green' }}>{loading ? 'Yes' : 'No'}</span></div>
          <div>• User: <span style={{ color: user ? 'green' : 'red' }}>{user ? user.email : 'None'}</span></div>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Current URL:</strong>
        <div style={{ 
          wordBreak: 'break-all', 
          fontSize: '10px', 
          backgroundColor: '#fff', 
          padding: '4px', 
          borderRadius: '3px',
          marginTop: '2px'
        }}>
          {window.location.href}
        </div>
      </div>
      
      <button 
        onClick={clearCacheAndRetry} 
        style={{ 
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          marginBottom: '10px',
          width: '100%'
        }}
      >
        🗑️ Clear Cache & Reload
      </button>
      
      {accounts.length > 0 && (
        <div>
          <h5 style={{ margin: '5px 0', fontSize: '12px' }}>👤 Account Details:</h5>
          <pre style={{ 
            fontSize: '9px', 
            overflow: 'auto', 
            maxHeight: '120px',
            backgroundColor: '#fff',
            padding: '6px',
            borderRadius: '3px',
            margin: '0'
          }}>
            {JSON.stringify(accounts[0], null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        marginTop: '10px', 
        fontSize: '10px', 
        color: '#666',
        borderTop: '1px solid #ddd',
        paddingTop: '8px'
      }}>
        💡 Add REACT_APP_DEBUG_MSAL=true to .env to enable this debug panel
      </div>
    </div>
  );
};

// Make sure to export as default
export default AuthDebugComponent;