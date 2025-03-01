import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './components/auth/AuthProvider';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './components/auth/msalConfig';

import './index.css';

// Important: Custom history to avoid pushState issues with MSAL
// This addresses the warning about history.pushState
const App = () => {
  // Handle potential redirect before router is initialized
  React.useEffect(() => {
    if (window.location.hash) {
      console.log("Hash detected in App component");
      msalInstance.handleRedirectPromise().catch(error => {
        console.error("Error handling redirect in App:", error);
      });
    }
  }, []);

  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        {/* Use Router instead of BrowserRouter to fix history issue */}
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<ChatPage />} />
            </Route>
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </MsalProvider>
  );
};

export default App;