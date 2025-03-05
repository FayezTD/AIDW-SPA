import { PublicClientApplication } from '@azure/msal-browser';

// Validate required environment variables
if (!process.env.REACT_APP_AZURE_CLIENT_ID || !process.env.REACT_APP_AZURE_TENANT_ID) {
  throw new Error("Missing required environment variables: REACT_APP_AZURE_CLIENT_ID or REACT_APP_AZURE_TENANT_ID.");
}

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID, 
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`, 
    redirectUri: process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/',
    postLogoutRedirectUri: process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/',
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
  system: {
    allowRedirectInIframe: true,
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          console.log(message);
        }
      },
      logLevel: "Verbose", // Increase logging level for detailed troubleshooting
      piiLoggingEnabled: false
    }
  }
};

// Create the MSAL instance but don't call initialize() or handleRedirectPromise() here
// These will be called explicitly in index.js
export const msalInstance = new PublicClientApplication(msalConfig);