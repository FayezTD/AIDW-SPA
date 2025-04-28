import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import CitationsList from './CitationsList';
import TableRenderer from './TableRenderer';
import GraphRenderer from './GraphRenderer';
import ResponseFormatter from '../../utils/formatters'


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

// Component to handle all content formatting
const FormattedContent = ({ content }) => {
  // Clean up the content by removing unnecessary markdown
  const cleanedContent = content
    // Replace <br> tags with newlines
    .replace(/<br>/g, '\n')
    // Clean up any consecutive newlines to a maximum of two
    .replace(/\n{3,}/g, '\n\n');

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      components={{
        // Override list items to ensure proper spacing
        li: ({node, ...props}) => <li className="my-1" {...props} />,
        // Override paragraphs to ensure proper spacing
        p: ({node, ...props}) => <p className="my-2" {...props} />,
        // Improve table rendering
        table: ({node, ...props}) => <table className="border-collapse w-full my-4" {...props} />,
        th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />,
        td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />
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

const ChatMessage = ({ message, isLoading, onCitationClick, onFirstUserMessage }) => {
  let { role, content, timestamp, citations, hyperlinks, intent } = message;

  // Handle the case where content might be nested in an object structure
  if (typeof content === 'object') {
    const parsedContent = ResponseFormatter.parseResponseText(content);
    content = ResponseFormatter.cleanResponseText(parsedContent);
  } else if (typeof content === 'string') {
    content = ResponseFormatter.cleanResponseText(content);
  }

  const isUser = role === 'user';
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const speechSynthRef = useRef(null);

  // Format citations properly, ensuring they're arrays
  if (citations && !Array.isArray(citations)) {
    citations = [citations];
  }
  if (hyperlinks && !Array.isArray(hyperlinks)) {
    hyperlinks = [hyperlinks];
  }

  const formattedCitations = useMemo(() => {
    return citations && citations.length > 0 
      ? ResponseFormatter.formatCitations(citations, hyperlinks)
      : [];
  }, [citations, hyperlinks]);

  const formattedTime = timestamp
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : '';

  // Check if the content contains special markers
  const hasSpecialContent = content && (
    content.includes('%%TABLE_JSON%%') || 
    content.includes('%%GRAPH_JSON%%')
  );

  // Call onFirstUserMessage when this is a user message (to capture first message for sidebar)
  useEffect(() => {
    if (isUser && onFirstUserMessage && content) {
      onFirstUserMessage(content);
    }
  }, [isUser, content, onFirstUserMessage]);

  // Get available voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    // Load voices right away
    loadVoices();

    // Chrome requires waiting for voiceschanged event
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const showToast = (message) => {
    setToast({ visible: true, message });
  };

  const hideToast = () => {
    setToast({ visible: false, message: '' });
  };

  const handleCopy = () => {
    // Extract plain text content without markdown and special formatting
    const textToCopy = content
      .replace(/%%TABLE_JSON%%.*?%%END_TABLE%%/gs, '[Table]')
      .replace(/%%GRAPH_JSON%%.*?%%END_GRAPH%%/gs, '[Graph]')
      .replace(/<br>/g, '\n')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace markdown links with just the text
      .replace(/#+\s(.+)/g, '$1') // Replace markdown headers with just the text
      .replace(/`([^`]+)`/g, '$1') // Replace inline code with just the text
      .replace(/```[\s\S]*?```/g, '[Code Block]'); // Replace code blocks
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Copied to clipboard');
    });
  };

  // Format text for better speech reading
  const formatTextForSpeech = (text) => {
    return text
      // Replace special content blocks
      .replace(/%%TABLE_JSON%%.*?%%END_TABLE%%/gs, 'Here is a table with data.')
      .replace(/%%GRAPH_JSON%%.*?%%END_GRAPH%%/gs, 'Here is a graph visualization.')
      // Handle HTML tags and line breaks
      .replace(/<br>/g, '. ')
      .replace(/<[^>]*>/g, '') 
      // Handle markdown formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      // Handle links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Handle headers
      .replace(/#+\s(.+)/g, '$1. ')
      // Handle code blocks
      .replace(/```[\s\S]*?```/g, 'Here is some code. ')
      .replace(/`([^`]+)`/g, '$1')
      // Handle lists
      .replace(/^\s*[-*]\s+(.+)/gm, '. $1')
      .replace(/^\s*\d+\.\s+(.+)/gm, '. $1')
      // Handle excessive whitespace and periods
      .replace(/\s{2,}/g, ' ')
      .replace(/\.{2,}/g, '.')
      .replace(/\.\s*\./g, '.')
      // Add natural pauses
      .replace(/([.!?])\s+/g, '$1. ');
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
      // Format text for better speech
      const textToSpeak = formatTextForSpeech(content);
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Find a female voice with appropriate characteristics
      let selectedVoice = null;
      
      // Try to find an ideal female voice
      const femaleVoices = voices.filter(voice => 
        voice.name.includes('female') || 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Ava') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Google UK English Female') ||
        voice.name.includes('Microsoft Zira')
      );
      
      if (femaleVoices.length > 0) {
        // Prioritize high-quality voices
        const preferredVoices = ['Google UK English Female', 'Samantha', 'Microsoft Zira', 'Ava'];
        const preferred = femaleVoices.find(voice => 
          preferredVoices.some(name => voice.name.includes(name))
        );
        
        selectedVoice = preferred || femaleVoices[0];
      } else if (voices.length > 0) {
        // Fallback to any available voice
        selectedVoice = voices.find(v => v.lang.startsWith('en-')) || voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Optimize voice parameters for clarity and natural sound
      utterance.pitch = 1.5;      
      utterance.rate = 1.10;      
      utterance.volume = 3.0;     
      
      // Add natural pauses at punctuation
      utterance.onboundary = function(event) {
        if (event.name === 'sentence') {
          // Add slight pause at sentence boundaries
          const pause = new SpeechSynthesisUtterance('.');
          pause.volume = 0;
          pause.rate = 0.1;
        }
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      showToast('Speech synthesis not supported in your browser');
    }
  };

  // Handler for citation clicks - opens links in a new tab
  const handleCitationClick = (citation) => {
    // If citation is a string, check if it has a corresponding hyperlink
    if (typeof citation === 'string' && hyperlinks && hyperlinks.length > 0) {
      // Find index of citation in citations array
      const index = citations.findIndex(c => c === citation);
      
      // If found and there's a corresponding hyperlink at the same index
      if (index !== -1 && index < hyperlinks.length) {
        window.open(hyperlinks[index], '_blank');
        return;
      }
    }
    
    // If citation is an object with a URL property
    if (citation && citation.url) {
      window.open(citation.url, '_blank');
      return;
    }
    
    // Fallback to original behavior if onCitationClick is provided
    if (onCitationClick) {
      onCitationClick(citation);
    }
  };

  // Cleanup speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis && isPlaying) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  // Check if we have content to display
  const hasContent = content && content.trim().length > 0;

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
          {intent && <div className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{intent}</div>}
        </div>
        <div className="prose max-w-full">
          {isLoading && role === "assistant" ? (
            <ReasoningLoader />
          ) : hasContent ? (
            <>
              {hasSpecialContent ? (
                <RichContent content={content} />
              ) : (
                <FormattedContent content={content} />
              )}
            </>
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )}
        </div>
        {!isUser && formattedCitations && formattedCitations.length > 0 && (
          <div className="mt-3 w-full citation-list">
            <CitationsList 
              citations={formattedCitations} 
              onCitationClick={handleCitationClick}
            />
          </div>
        )}
        
        {/* Action buttons for assistant messages */}
        {!isUser && !isLoading && hasContent && (
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
          </div>
        )}
      </div>
      
      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        visible={toast.visible} 
        onClose={hideToast} 
      />
    </div>
  );
};

export default ChatMessage;