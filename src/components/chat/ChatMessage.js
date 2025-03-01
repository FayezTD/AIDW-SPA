import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import CitationsList from './CitationsList';

const ChatMessage = ({ message }) => {
  const { role, content, timestamp, citations } = message;
  const isUser = role === 'user';
  
  const formattedTime = timestamp 
    ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    : '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
      <div className={`max-w-3xl w-full rounded-lg p-4 ${isUser ? 'bg-blue-400 text-white' : 'bg-gray-100'}`}>
        <div className="flex items-center mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-400' : 'bg-blue-100'}`}>
            {isUser ? 'U' : 'AI'}
          </div>
          <div className="ml-2 font-medium">{isUser ? 'You' : 'Assistant'}</div>
          {timestamp && <div className="ml-auto text-xs opacity-75">{formattedTime}</div>}
        </div>
        <div className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
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