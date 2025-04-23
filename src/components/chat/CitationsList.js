import React from 'react';

const CitationsList = ({ citations, onCitationClick, hyperlinks = [] }) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  // Function to extract file name from URL or use citation text
  const extractFileName = (citation, index) => {
    // If citation is a string, use it directly
    if (typeof citation === 'string') {
      return citation || `Document ${index + 1}`;
    }
    
    // If citation is an object with text property
    if (citation && citation.text) {
      return citation.text;
    }
    
    // If citation is an object with URL
    if (citation && citation.url) {
      try {
        const url = new URL(citation.url);
        const pathSegments = url.pathname.split('/');
        
        // Find the segment that contains the file name (usually has .pdf extension)
        const fileNameSegment = pathSegments.find(segment => 
          segment.toLowerCase().includes('.pdf')
        );
        
        if (fileNameSegment) {
          // Remove URL encoding and return clean filename
          return decodeURIComponent(fileNameSegment);
        }
      } catch (e) {
        console.log('Error parsing citation URL:', e);
      }
    }
    
    // Default fallback
    return `Document ${index + 1}`;
  };

  const handleCitationClick = (citation, hyperlink, index, e) => {
    e.preventDefault();
    
    if (onCitationClick) {
      // If we have a matching hyperlink for this citation, pass it along
      if (hyperlinks && hyperlinks[index]) {
        onCitationClick({
          text: typeof citation === 'string' ? citation : citation.text,
          url: hyperlinks[index],
          id: `citation-${index}`
        });
      } else {
        // Otherwise, pass the citation as is
        onCitationClick(citation);
      }
    }
  };

  return (
    <div className="citations my-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-full">
      <h3 className="text-lg font-medium mb-3">Citations</h3>
      <div className="space-y-2">
        {citations.map((citation, index) => {
          const fileName = extractFileName(citation, index);
          
          return (
            <div
              key={`citation-${index}`}
              className="citation-item flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              onClick={(e) => handleCitationClick(citation, hyperlinks[index], index, e)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCitationClick(citation, hyperlinks[index], index, e);
                }
              }}
              aria-label={`View document: ${fileName}`}
            >
              <span className="citation-emoji text-2xl mr-2 flex-shrink-0">
                📄
              </span>
              <div className="citation-content flex-1 min-w-0 overflow-hidden">
                <div className="citation-title font-medium break-words">
                  {fileName}
                </div>
                {/* URL is intentionally hidden */}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CitationsList;