import { PublicClientApplication, LogLevel } from '@azure/msal-browser';

// Validate required environment variables
if (!process.env.REACT_APP_AZURE_CLIENT_ID || !process.env.REACT_APP_AZURE_TENANT_ID) {
  console.error("Missing required environment variables: REACT_APP_AZURE_CLIENT_ID or REACT_APP_AZURE_TENANT_ID.");
}

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || "4bfb95dc-d50c-47a5-bc82-c1899c60a199",
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || "3d7a3f90-1d2c-4d91-9b49-52e098cf9eb8"}`,
    redirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://salmon-plant-0706ca50f.4.azurestaticapps.net',
    postLogoutRedirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://salmon-plant-0706ca50f.4.azurestaticapps.net',
    navigateToLoginRequestUrl: true, // Critical for hash handling
  },
  cache: {
    cacheLocation: 'localStorage', // Changed from sessionStorage for better persistence
    storeAuthStateInCookie: true, // Essential for cross-page auth flows
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              break;
            case LogLevel.Warning:
              console.warn(message);
              break;
            case LogLevel.Info:
              console.info(message);
              break;
            default:
              console.log(message);
              break;
          }
        }
      },
      logLevel: LogLevel.Verbose, // Verbose logging for debugging
      piiLoggingEnabled: false
    }
  }
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Handle initial redirect promise - this is critical to avoid hash_empty_error
msalInstance.handleRedirectPromise().catch(error => {
  console.error("Error handling redirect on initial msalConfig setup:", error);
});