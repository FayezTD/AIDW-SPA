import { PublicClientApplication } from '@azure/msal-browser';

// Validate required environment variables
if (!process.env.REACT_APP_AZURE_CLIENT_ID || !process.env.REACT_APP_AZURE_TENANT_ID) {
  console.error("Missing required environment variables for MSAL configuration");
}

// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || "4bfb95dc-d50c-47a5-bc82-c1899c60a199",
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID || "3d7a3f90-1d2c-4d91-9b49-52e098cf9eb8"}`,
    redirectUri: window.location.origin, // Use the current origin for redirects
    postLogoutRedirectUri: window.location.origin, // Return to app root after logout
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for token caching
    storeAuthStateInCookie: true, // Required for IE11 and helpful for redirect flows
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          switch (level) {
            case 0: // Error
              console.error(message);
              break;
            case 1: // Warning
              console.warn(message);
              break;
            case 2: // Info
              console.info(message);
              break;
            case 3: // Verbose
              console.debug(message);
              break;
            default:
              console.log(message);
              break;
          }
        }
      },
      logLevel: 2, // Info level
    }
  }
};

// Create and export MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Handle redirect response early to prevent hash parsing issues
msalInstance.handleRedirectPromise().catch(error => {
  console.error("Error handling redirect:", error);
});