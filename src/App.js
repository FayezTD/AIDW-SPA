import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import ErrorPage from './pages/ErrorPage';
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './components/auth/AuthProvider';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './components/auth/msalConfig';  // Import instance

import './index.css';

const App = () => {
  return (
    <MsalProvider instance={msalInstance}>  {/* Wrap with MsalProvider */}
      <AuthProvider>
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
