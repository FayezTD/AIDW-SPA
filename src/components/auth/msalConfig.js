// import { PublicClientApplication } from '@azure/msal-browser';

// // Validate required environment variables
// if (!process.env.REACT_APP_AZURE_CLIENT_ID || !process.env.REACT_APP_AZURE_TENANT_ID) {
//   throw new Error("Missing required environment variables: REACT_APP_AZURE_CLIENT_ID or REACT_APP_AZURE_TENANT_ID.");
// }

// export const msalConfig = {
//   auth: {
//     clientId: process.env.REACT_APP_AZURE_CLIENT_ID, 
//     authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`, 
//     redirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://aidw-web-application-daaggeafcbfteuhc.westus2-01.azurewebsites.net/',
//     postLogoutRedirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://aidw-web-application-daaggeafcbfteuhc.westus2-01.azurewebsites.net/',
//     navigateToLoginRequestUrl: true,
//   },
//   cache: {
//     cacheLocation: 'localStorage',
//     storeAuthStateInCookie: true,
//   },
//   system: {
//     allowRedirectInIframe: true,
//     loggerOptions: {
//       loggerCallback: (level, message, containsPii) => {
//         if (!containsPii) {
//           console.log(message);
//         }
//       },
//       logLevel: "Verbose", // Increase logging level for detailed troubleshooting
//       piiLoggingEnabled: false
//     }
//   }
// };

// // Create the MSAL instance but don't call initialize() or handleRedirectPromise() here
// // These will be called explicitly in index.js
// export const msalInstance = new PublicClientApplication(msalConfig);

import { PublicClientApplication } from '@azure/msal-browser';

// Validate required environment variables
if (!process.env.REACT_APP_AZURE_CLIENT_ID || !process.env.REACT_APP_AZURE_TENANT_ID) {
  throw new Error("Missing required environment variables: REACT_APP_AZURE_CLIENT_ID or REACT_APP_AZURE_TENANT_ID.");
}

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID, 
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`, 
    redirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://aidw-web-application-daaggeafcbfteuhc.westus2-01.azurewebsites.net/',
    postLogoutRedirectUri: process.env.REACT_APP_REDIRECT_URI || 'https://aidw-web-application-daaggeafcbfteuhc.westus2-01.azurewebsites.net/',
    navigateToLoginRequestUrl: false, // Changed from true to false
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
  system: {
    allowRedirectInIframe: false, // Changed from true to false for security
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          console.log(message);
        }
      },
      logLevel: "Info", // Reduced from "Verbose" for production
      piiLoggingEnabled: false
    }
  }
};

// Create the MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);