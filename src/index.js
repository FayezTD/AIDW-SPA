import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { msalInstance } from './components/auth/msalConfig';

// Initialize MSAL before rendering the app
msalInstance.initialize().then(() => {
  // Only after initialization, try to handle any redirects
  msalInstance.handleRedirectPromise()
    .catch(error => {
      console.error("Redirect handling error:", error);
    })
    .finally(() => {
      // Always render the app, even if there's an error
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    });
}).catch(error => {
  console.error("MSAL initialization error:", error);
  // Still render the app even if MSAL fails to initialize
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

reportWebVitals();