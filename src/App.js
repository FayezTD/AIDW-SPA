import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './components/auth/AuthProvider';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './components/auth/msalConfig';

import './index.css';

// Make sure MSAL instance is initialized before rendering
msalInstance.initialize().catch(error => {
  console.error("MSAL initialization error:", error);
});

const App = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<ChatPage />} />
            </Route>
            {/* Add a catch-all route that redirects to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </MsalProvider>
  );
};

export default App;