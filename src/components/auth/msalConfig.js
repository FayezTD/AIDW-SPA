import { PublicClientApplication } from '@azure/msal-browser';

// Validate required environment variables
if (!process.env.REACT_APP_AZURE_CLIENT_ID || !process.env.REACT_APP_AZURE_TENANT_ID) {
  throw new Error("Missing required environment variables: REACT_APP_AZURE_CLIENT_ID or REACT_APP_AZURE_TENANT_ID.");
}

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID, 
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`, 
    redirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://aidw-ai-assistant.azurewebsites.net',
    postLogoutRedirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://aidw-ai-assistant.azurewebsites.net',
  },
  cache: {
    cacheLocation: 'sessionStorage', // Try changing to 'localStorage' if issues persist
    storeAuthStateInCookie: true, // Helps with issues in Safari & incognito mode
  },
};

// Ensure MSAL instance is created only once
export const msalInstance = new PublicClientApplication(msalConfig);
