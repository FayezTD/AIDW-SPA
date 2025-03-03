import { PublicClientApplication } from '@azure/msal-browser';

// Validate required environment variables
if (!process.env.REACT_APP_AZURE_CLIENT_ID || !process.env.REACT_APP_AZURE_TENANT_ID) {
  throw new Error("Missing required environment variables: REACT_APP_AZURE_CLIENT_ID or REACT_APP_AZURE_TENANT_ID.");
}

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID, 
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`, 
    redirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://salmon-plant-0706ca50f.4.azurestaticapps.net',
    postLogoutRedirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://salmon-plant-0706ca50f.4.azurestaticapps.net',
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage', // Changed from sessionStorage to localStorage
    storeAuthStateInCookie: true, // This helps with IE11, Safari and issues with popups
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          console.log(message);
        }
      },
      logLevel: "Info", // Enable more detailed logging for troubleshooting
      piiLoggingEnabled: false
    }
  }
};

// Export MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Handle redirect promise on page load to properly handle the hash fragment
msalInstance.handleRedirectPromise().catch(error => {
  console.error("Redirect handling error:", error);
});