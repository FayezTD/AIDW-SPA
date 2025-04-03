import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import CitationsList from './CitationsList';
import TableRenderer from './TableRenderer';
import GraphRenderer from './GraphRenderer';

// Toast notification component with improved z-index
const Toast = ({ message, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div 
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white px-6 py-3 rounded-full shadow-lg z-50"
      style={{ zIndex: 9999 }}
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

const ReasoningLoader = () => {
  const [message, setMessage] = useState("Analyzing query...");

  const loadingSteps = useMemo(() => [
    "Analyzing your query...",
    "Fetching relevant data...",
    "Processing response...",
    "Finalizing answer..."
  ], []);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      setMessage(loadingSteps[step % loadingSteps.length]);
      step++;
    }, 1500);
    
    return () => clearInterval(interval);
  }, [loadingSteps]);

  return <div className="animate-pulse text-gray-500 italic">{message}</div>;
};

const ChatMessage = ({ message, isLoading }) => {
  const { role, content, timestamp, citations } = message;
  const isUser = role === 'user';
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSynthRef = useRef(null);

  const formattedTime = timestamp
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : '';

  // Check if the content contains special markers
  const hasTable = content && content.includes('%%TABLE_JSON%%');
  const hasGraph = content && content.includes('%%GRAPH_JSON%%');

  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '' });
  };

  const handleCopy = () => {
    // Extract plain text content without markdown
    const textToCopy = content.replace(/%%TABLE_JSON%%.*?%%END_TABLE%%/gs, '[Table]')
                             .replace(/%%GRAPH_JSON%%.*?%%END_GRAPH%%/gs, '[Graph]')
                             .replace(/<br>/g, '\n')
                             .replace(/\*\*([^*]+)\*\*/g, '$1');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Copied to clipboard');
    });
  };

  const handlePlay = () => {
    if (isPlaying) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      showToast('Stopped');
      return;
    }

    if (window.speechSynthesis) {
      // Extract plain text for speech
      const textToSpeak = content.replace(/%%TABLE_JSON%%.*?%%END_TABLE%%/gs, 'Table data')
                                .replace(/%%GRAPH_JSON%%.*?%%END_GRAPH%%/gs, 'Graph data')
                                .replace(/<br>/g, '\n')
                                .replace(/\*\*([^*]+)\*\*/g, '$1');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      showToast('Playing');
    } else {
      showToast('Speech synthesis not supported in your browser');
    }
  };

  const handleFeedback = (isPositive) => {
    // Here you would typically send feedback to your backend
    showToast(isPositive ? 'Thank you for your feedback!' : 'We\'ll improve based on your feedback');
  };

  // Cleanup speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis && isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full relative`}>
      <div className={`max-w-3xl w-full rounded-lg p-4 ${
        isUser 
          ? 'bg-cyan-600 bg-opacity-80 text-white shadow-md' 
          : 'bg-white bg-opacity-95 shadow text-gray-800'
      }`}>
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-cyan-700 text-white' 
              : 'bg-cyan-100 text-cyan-600'
          }`}>
            {isUser ? 'U' : 'AI'}
          </div>
          <div className="ml-2 font-medium">{isUser ? 'You' : 'Assistant'}</div>
          {timestamp && <div className="ml-auto text-xs opacity-75">{formattedTime}</div>}
        </div>
        <div className="prose max-w-full">
          {isLoading && role === "assistant" ? (
            <ReasoningLoader />
          ) : (
            <>
              {hasTable || hasGraph ? (
                <RichContent content={content} />
              ) : (
                <FormattedContent content={content} />
              )}
            </>
          )}
        </div>
        {!isUser && citations && citations.length > 0 && (
          <div className="mt-3 w-full citation-list">
            <CitationsList citations={citations} />
          </div>
        )}
        
        {/* Action buttons for assistant messages */}
        {!isUser && !isLoading && (
          <div className="mt-3 flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="text-xs rounded-md bg-gray-100 p-1 px-2 hover:bg-gray-200 transition-colors"
              aria-label="Copy message"
              title="Copy message"
            >
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </span>
            </button>
            
            <button 
              onClick={handlePlay}
              className={`text-xs rounded-md ${isPlaying ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-gray-100 hover:bg-gray-200'} p-1 px-2 transition-colors`}
              aria-label={isPlaying ? "Stop speaking" : "Speak message"}
              title={isPlaying ? "Stop speaking" : "Speak message"}
            >
              <span className="flex items-center gap-1">
                {isPlaying ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                    </svg>
                    Speak
                  </>
                )}
              </span>
            </button>
            
            <div className="ml-auto flex items-center gap-2">
              <button 
                onClick={() => handleFeedback(true)}
                className="text-xs rounded-md bg-gray-100 p-1 hover:bg-green-100 transition-colors"
                aria-label="Thumbs up"
                title="Helpful response"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </button>
              <button 
                onClick={() => handleFeedback(false)}
                className="text-xs rounded-md bg-gray-100 p-1 hover:bg-red-100 transition-colors"
                aria-label="Thumbs down"
                title="Unhelpful response"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      <Toast 
        message={toast.message} 
        visible={toast.visible} 
        onClose={hideToast} 
      />
    </div>
  );
};

// Component to handle all content formatting
const FormattedContent = ({ content }) => {
  // Clean up the content by removing unnecessary markdown
  const cleanedContent = content
    // Replace <br> tags with newlines
    .replace(/<br>/g, '\n')
    // Remove excessive asterisks (bold formatting)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Clean up any consecutive newlines to a maximum of two
    .replace(/\n{3,}/g, '\n\n');

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        // Override list items to ensure proper spacing
        li: ({node, ...props}) => <li className="my-1" {...props} />,
        // Override paragraphs to ensure proper spacing
        p: ({node, ...props}) => <p className="my-2" {...props} />
      }}
    >
      {cleanedContent}
    </ReactMarkdown>
  );
};

// Component to handle mixed content with tables and graphs
const RichContent = ({ content }) => {
  // Split content by all special markers
  const parts = content.split(/(%%TABLE_JSON%%.*?%%END_TABLE%%|%%GRAPH_JSON%%.*?%%END_GRAPH%%)/s);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('%%TABLE_JSON%%')) {
          // Extract the JSON string for tables
          const jsonString = part.replace('%%TABLE_JSON%%', '').replace('%%END_TABLE%%', '');
          try {
            const tableData = JSON.parse(jsonString);
            return <TableRenderer key={index} data={tableData} />;
          } catch (e) {
            console.error('Failed to parse table JSON:', e);
            return <div key={index} className="text-red-500">Error rendering table</div>;
          }
        } else if (part.startsWith('%%GRAPH_JSON%%')) {
          // Extract the JSON string for graphs
          const jsonString = part.replace('%%GRAPH_JSON%%', '').replace('%%END_GRAPH%%', '');
          try {
            const graphData = JSON.parse(jsonString);
            return <GraphRenderer key={index} data={graphData} />;
          } catch (e) {
            console.error('Failed to parse graph JSON:', e);
            return <div key={index} className="text-red-500">Error rendering graph</div>;
          }
        } else if (part.trim()) {
          // Render regular markdown content with cleanup
          return <FormattedContent key={index} content={part} />;
        }
        return null;
      })}
    </>
  );
};

export default ChatMessage;