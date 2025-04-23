import React, { useState, useEffect, useRef } from 'react';

const SecureDocumentViewer = ({ url, onClose, filename }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewerMode, setViewerMode] = useState('sharepoint-office');
  const viewerRef = useRef(null);
  const iframeRef = useRef(null);
  
  // Determine if URL is from SharePoint
  const isSharePointUrl = url?.toLowerCase().includes('sharepoint.com') || 
                          url?.toLowerCase().includes('/_layouts/') || 
                          url?.toLowerCase().includes('/_api/') ||
                          url?.toLowerCase().includes('/sites/');
  
  // Determine document type and appropriate viewer
  useEffect(() => {
    if (url) {
      const lowerUrl = url.toLowerCase();
      
      // Always default to SharePoint office viewer for SharePoint URLs
      if (isSharePointUrl) {
        if (lowerUrl.endsWith('.pdf')) {
          setViewerMode('sharepoint-pdf');
        } else {
          setViewerMode('sharepoint-office');
        }
      } else {
        // For non-SharePoint URLs, use PDF.js for PDFs
        if (lowerUrl.endsWith('.pdf')) {
          setViewerMode('pdfjs');
        } else {
          // Always default to SharePoint Office viewer for other file types
          setViewerMode('sharepoint-office');
        }
      }
    }
  }, [url, isSharePointUrl]);
  
  // Reset states when modal is shown
  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setErrorMessage('');
    
    // Add security measures
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Prevent print screen and other shortcuts
      if ((e.ctrlKey && (e.key === 'p' || e.key === 's')) || 
          e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [url]);
  
  // Monitor iframe for redirect to login page
  useEffect(() => {
    if (iframeRef.current && isSharePointUrl) {
      try {
        // Check if iframe is redirected to login page
        const checkLoginRedirect = setInterval(() => {
          try {
            const iframe = iframeRef.current;
            // If we can access the iframe's location and it contains 'login'
            // This will throw an error if the iframe has navigated to a different origin due to CORS
            const currentLocation = iframe.contentWindow.location.href;
            if (currentLocation.includes('login.microsoftonline') || 
                currentLocation.includes('login.windows.net')) {
              clearInterval(checkLoginRedirect);
              setError(true);
              setErrorMessage('Authentication required. Please log in to SharePoint in a new tab first.');
            }
          } catch (e) {
            // CORS error - can't access iframe content
            // This is normal and expected when iframe loads cross-origin content
          }
        }, 1000);
        
        return () => clearInterval(checkLoginRedirect);
      } catch (e) {
        // Initial access error - ignore
      }
    }
  }, [isSharePointUrl, viewerMode]);
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = (e) => {
    console.error("Document viewer error:", e);
    
    // Improved error handling
    if (viewerMode === 'sharepoint-pdf') {
      // If SharePoint PDF viewer fails, try PDF.js viewer
      setViewerMode('pdfjs');
      setIsLoading(true);
    } else if (viewerMode === 'sharepoint-office') {
      // If SharePoint Office viewer fails and it's a PDF, try PDF.js
      if (url?.toLowerCase().endsWith('.pdf')) {
        setViewerMode('pdfjs');
        setIsLoading(true);
      } else {
        // For non-PDF files, just show error
        setIsLoading(false);
        setError(true);
        setErrorMessage('Unable to display document. The file might require authentication or does not exist.');
      }
    } else if (viewerMode === 'pdfjs') {
      // If PDF.js fails, show error
      setIsLoading(false);
      setError(true);
      setErrorMessage('Unable to display PDF document with available viewers.');
    } else {
      setIsLoading(false);
      setError(true);
      setErrorMessage('Unable to display document with available viewers.');
    }
  };
  
  // Extract the actual document URL from SharePoint web URL
  const extractDocumentUrl = (sharePointUrl) => {
    try {
      // Check if it's an AllItems.aspx URL with id and parent parameters
      if (sharePointUrl.includes('AllItems.aspx') && sharePointUrl.includes('id=')) {
        // Extract the file path from the id parameter
        const idMatch = sharePointUrl.match(/id=([^&]+)/);
        if (idMatch && idMatch[1]) {
          // Decode the URL-encoded path
          let filePath = decodeURIComponent(idMatch[1]);
          
          // Extract the domain
          const domainMatch = sharePointUrl.match(/(https?:\/\/[^\/]+)/);
          const domain = domainMatch ? domainMatch[1] : '';
          
          if (domain && filePath) {
            // Remove any double quotes that might be in the path
            filePath = filePath.replace(/"/g, '');
            
            // Construct the direct document URL
            return `${domain}${filePath}`;
          }
        }
      }
      // If we can't parse it as an AllItems.aspx URL, return the original
      return sharePointUrl;
    } catch (e) {
      console.error("Error extracting document URL:", e);
      return sharePointUrl;
    }
  };
  
  // Get the viewer source based on current mode
  const getViewerSrc = () => {
    if (!url) return '';
    
    // First extract the actual document URL if it's a SharePoint web interface URL
    const documentUrl = isSharePointUrl ? extractDocumentUrl(url) : url;
    
    switch (viewerMode) {
      case 'sharepoint-pdf': {
        // Use SharePoint's built-in PDF viewer which maintains authentication
        // Extract the site URL and document path
        let baseUrl = '';
        let docPath = '';
        
        if (documentUrl.includes('/_layouts/')) {
          // Already in a special SharePoint URL format
          return documentUrl;
        } else if (documentUrl.includes('/sites/')) {
          // Extract the site URL up to '/sites/sitename'
          const siteMatch = documentUrl.match(/(https?:\/\/.*?\/sites\/[^\/]+)/);
          if (siteMatch) {
            baseUrl = siteMatch[1];
            // Get the document path after the site URL
            docPath = documentUrl.substring(siteMatch[1].length);
          }
        } else if (documentUrl.includes('.sharepoint.com')) {
          // Extract the SharePoint domain
          const domainMatch = documentUrl.match(/(https?:\/\/.*?\.sharepoint\.com)/);
          if (domainMatch) {
            baseUrl = domainMatch[1];
            // Get the document path after the domain
            docPath = documentUrl.substring(domainMatch[1].length);
          }
        }
        
        if (baseUrl && docPath) {
          // Construct SharePoint PDF viewer URL
          return `${baseUrl}/_layouts/15/pdfviewer.aspx?file=${encodeURIComponent(docPath)}`;
        }
        
        // Fallback to direct URL if parsing fails
        return documentUrl;
      }
      case 'sharepoint-office': {
        // Use SharePoint's built-in Office viewer which maintains authentication
        let baseUrl = '';
        let docPath = '';
        
        if (documentUrl.includes('/_layouts/')) {
          // Already in a special SharePoint URL format
          return documentUrl;
        } else if (documentUrl.includes('/sites/')) {
          // Extract the site URL up to '/sites/sitename'
          const siteMatch = documentUrl.match(/(https?:\/\/.*?\/sites\/[^\/]+)/);
          if (siteMatch) {
            baseUrl = siteMatch[1];
            // Get the document path after the site URL
            docPath = documentUrl.substring(siteMatch[1].length);
          }
        } else if (documentUrl.includes('.sharepoint.com')) {
          // Extract the SharePoint domain
          const domainMatch = documentUrl.match(/(https?:\/\/.*?\.sharepoint\.com)/);
          if (domainMatch) {
            baseUrl = domainMatch[1];
            // Get the document path after the domain
            docPath = documentUrl.substring(domainMatch[1].length);
          }
        }
        
        if (baseUrl && docPath) {
          // Construct SharePoint Office Web Apps URL
          return `${baseUrl}/_layouts/15/WopiFrame.aspx?sourcedoc=${encodeURIComponent(docPath)}&action=view`;
        }
        
        // For non-SharePoint URLs, try to use Office Web Viewer
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`;
      }
      case 'pdfjs':
        return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(documentUrl)}`;
      default:
        return documentUrl;
    }
  };

  // Get display filename
  const displayName = filename || url?.split('/').pop().split('?')[0] || 'Document';
  
  // Get a human-readable viewer mode name
  const getViewerModeName = () => {
    switch (viewerMode) {
      case 'sharepoint-pdf': return 'SharePoint PDF';
      case 'sharepoint-office': return 'SharePoint Office';
      case 'pdfjs': return 'PDF';
      default: return 'Document';
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <h3 className="font-medium truncate">{displayName}</h3>
            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded-full">
              {getViewerModeName()}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="relative w-full h-[70vh]" ref={viewerRef}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
              <span className="ml-3 text-gray-600">
                Loading document...
              </span>
            </div>
          )}
          
          {error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center p-6">
                <div className="text-red-500 text-4xl mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium mb-2">Unable to load document</h4>
                <p className="text-gray-600 mb-4">
                  {errorMessage || (isSharePointUrl ? 
                    'Could not access this SharePoint document. You may need to check your permissions or authentication.' : 
                    'The file might not exist or cannot be displayed in your browser.')}
                </p>
                <div className="flex flex-col md:flex-row gap-3 justify-center">
                  <button 
                    className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    onClick={() => window.open(url, '_blank')}
                  >
                    Open in new tab
                  </button>
                  {url.toLowerCase().endsWith('.pdf') && viewerMode !== 'pdfjs' && (
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => {
                        setError(false);
                        setIsLoading(true);
                        setViewerMode('pdfjs');
                      }}
                    >
                      Try PDF viewer
                    </button>
                  )}
                  {viewerMode === 'pdfjs' && (
                    <button 
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => {
                        setError(false);
                        setIsLoading(true);
                        window.open(extractDocumentUrl(url), '_blank');
                        setError(true);
                        setErrorMessage('Document opened in a new tab for direct viewing.');
                      }}
                    >
                      Open PDF directly
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <iframe 
              ref={iframeRef}
              src={getViewerSrc()}
              title={displayName}
              className="w-full h-full border-none"
              style={{ display: isLoading ? 'none' : 'block' }}
              onLoad={handleLoad}
              onError={handleError}
              sandbox={viewerMode !== 'sharepoint-pdf' && viewerMode !== 'sharepoint-office'
                      ? "allow-scripts allow-same-origin" 
                      : "allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"}
            />
          )}
          
          {/* Security overlay - only when document is loaded */}
          {!isLoading && !error && (
            <>
              {/* Security overlay */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.01)',
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
              
              {/* Watermark overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-10 z-10 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center transform rotate-45">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="text-gray-400 text-xl font-bold whitespace-nowrap"
                      style={{ 
                        position: 'absolute', 
                        transform: `translateY(${i * 50 - 500}px)` 
                      }}
                    >
                      PROTECTED DOCUMENT • DO NOT COPY • PROTECTED DOCUMENT • DO NOT COPY •
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          {!error && url.toLowerCase().endsWith('.pdf') && (
            <button 
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
              onClick={() => {
                // Toggle between SharePoint PDF viewer and PDF.js
                const nextMode = viewerMode === 'sharepoint-pdf' ? 'pdfjs' : 'sharepoint-pdf';
                setViewerMode(nextMode);
                setIsLoading(true);
              }}
            >
              {viewerMode === 'sharepoint-pdf' ? 'Try PDF.js viewer' : 'Try SharePoint viewer'}
            </button>
          )}
          <div className="ml-auto">
            <button 
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded mr-2"
              onClick={onClose}
            >
              Close
            </button>
            {isSharePointUrl && (
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => window.open(url, '_blank')}
              >
                Open in SharePoint
              </button>
            )}
          </div>
        </div>
        <div className="text-center p-2 border-t bg-gray-100">
          <small className="text-gray-500 text-xs">This document is protected. Screenshots and downloads are disabled.</small>
        </div>
      </div>
    </div>
  );
};

export default SecureDocumentViewer;