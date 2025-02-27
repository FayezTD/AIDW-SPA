import React from 'react';

const CitationsList = ({ citations }) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="citations my-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-full">
      <h3 className="text-lg font-medium mb-3">Citations</h3>
      <div className="space-y-2">
        {citations.map((citation) => (
          <div
            key={citation.id}
            className="citation-item flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span className="citation-emoji text-2xl mr-2 flex-shrink-0">{citation.emoji}</span>
            <div className="citation-content flex-1 min-w-0 overflow-hidden">
              <div className="citation-title font-medium break-words">{citation.text}</div>
              <div className="citation-url text-sm text-gray-500 truncate">{citation.url}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitationsList;