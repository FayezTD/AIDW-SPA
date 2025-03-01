import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { msalInstance } from './components/auth/msalConfig';

// Critical: Handle hash early before any other code can clear it
if (window.location.hash) {
  console.log("Authentication hash detected in URL");
  msalInstance.handleRedirectPromise().catch(error => {
    console.error("Error handling redirect on initial load:", error);
  });
}

// Add event listener to ensure hash processing
window.addEventListener('load', () => {
  if (window.location.hash) {
    console.log("Processing authentication hash on page load");
    
    // Give it a tick to ensure hash is processed
    setTimeout(() => {
      msalInstance.handleRedirectPromise().catch(error => {
        console.error("Error handling redirect on page load:", error);
      });
    }, 0);
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();