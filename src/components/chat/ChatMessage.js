import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import CitationsList from './CitationsList';

const ReasoningLoader = () => {
  const [message, setMessage] = React.useState("Analyzing query...");
  const loadingSteps = [
    "Analyzing your query...",
    "Fetching relevant data...",
    "Processing response...",
    "Finalizing answer..."
  ];

  React.useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      setMessage(loadingSteps[step % loadingSteps.length]);
      step++;
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-gray-500 italic animate-pulse">{message}</div>
  );
};

const ChatMessage = ({ message, isLoading }) => {
  const { role, content, timestamp, citations } = message;
  const isUser = role === 'user';

  const formattedTime = timestamp
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
      <div className={`max-w-3xl w-full rounded-lg p-4 ${isUser ? 'bg-blue-400/75 text-white' : 'bg-gray-100'}`}>
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-400' : 'bg-blue-100'}`}>
            {isUser ? 'U' : 'AI'}
          </div>
          <div className="ml-2 font-medium">{isUser ? 'You' : 'Assistant'}</div>
          {timestamp && <div className="ml-auto text-xs opacity-75">{formattedTime}</div>}
        </div>
        <div className="prose">
          {isLoading && role === "assistant" ? (
            <ReasoningLoader />
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
        {!isUser && citations && citations.length > 0 && (
          <div className="mt-3 w-full">
            <CitationsList citations={citations} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
