import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleClear = () => {
    setMessage('');
    textareaRef.current.focus();
  };

  // Add ESC key handler to clear input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && document.activeElement === textareaRef.current) {
        handleClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full p-3 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="Type your message here..."
          rows="3"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        {/* Clear button - bottom left with squircle shape */}
        {message && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-3 bottom-3 p-1 rounded-md bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors flex items-center"
            title="Clear message (ESC)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-xs ml-1">ESC</span>
          </button>
        )}
        
        {/* Submit button - bottom right */}
        <button
          type="submit"
          className={`absolute right-3 bottom-3 p-2 rounded-lg ${
            isLoading || !message.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-secondary'
          } transition-colors`}
          disabled={isLoading || !message.trim()}
          title="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-16 bottom-3 text-gray-500">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
    </form>
  );
};

export default ChatInput;