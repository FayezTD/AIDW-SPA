import React, { useState, useRef, useEffect } from 'react';
import ModelSelector from './ModelSelector';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const textareaRef = useRef(null);
  const sendButtonRef = useRef(null);
  const voiceButtonRef = useRef(null);
  const clearButtonRef = useRef(null);
  const recognitionRef = useRef(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate new height (with a maximum height)
      const maxHeight = 150; // Maximum height in pixels
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Enable scrolling if content exceeds maximum height
      textareaRef.current.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [message]);

  // Initialize speech recognition once on component mount
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      recognitionRef.current = new window.SpeechRecognition();
    } else {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    if (recognitionRef.current) {
      // Configure recognition
      recognitionRef.current.continuous = false; // Changed to false for better reliability
      recognitionRef.current.interimResults = false; // Changed to false for final results only
      recognitionRef.current.lang = 'en-US'; // Set language explicitly
      
      // Handle results
      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        console.log('Recognized text:', transcript);
        
        // Append to existing message rather than replace
        setMessage(prevMessage => {
          const newMessage = prevMessage ? `${prevMessage} ${transcript}` : transcript;
          return newMessage;
        });
      };
      
      // Handle end of speech recognition
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        
        // Focus the textarea after recognition ends
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      };
      
      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  // Handle toggling voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      // Stop listening if active
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
        } catch (err) {
          // Ignore errors when stopping
        }
      }
      
      // Include the selected model in the message metadata
      onSendMessage(message, selectedModel);
      
      // Clear the message
      setMessage('');
    }
  };

  // Handle clearing the input
  const handleClear = () => {
    setMessage('');
    textareaRef.current.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // ESC key handling
    if (e.key === 'Escape') {
      if (document.activeElement === textareaRef.current && message) {
        handleClear();
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            setIsListening(false);
          } catch (err) {
            // Ignore errors when stopping
          }
        }
      }
    }
    
    // Right arrow key handling
    if (e.key === 'ArrowRight') {
      const activeElement = document.activeElement;
      
      if (activeElement === textareaRef.current) {
        if (message.trim()) {
          sendButtonRef.current?.focus();
        } else {
          voiceButtonRef.current?.focus();
        }
        e.preventDefault();
      } else if (activeElement === voiceButtonRef.current) {
        if (message.trim()) {
          sendButtonRef.current?.focus();
        }
        e.preventDefault();
      } else if (activeElement === clearButtonRef.current) {
        // Focus the first model selector option
        const modelSelectorOptions = document.querySelectorAll('[role="radio"]');
        if (modelSelectorOptions.length > 0) {
          modelSelectorOptions[0].focus();
        }
        e.preventDefault();
      }
    }
    
    // Left arrow key handling
    if (e.key === 'ArrowLeft') {
      const activeElement = document.activeElement;
      
      if (activeElement === sendButtonRef.current) {
        voiceButtonRef.current?.focus();
        e.preventDefault();
      } else if (activeElement === voiceButtonRef.current) {
        if (message) {
          // Focus the last model selector option
          const modelSelectorOptions = document.querySelectorAll('[role="radio"]');
          if (modelSelectorOptions.length > 0) {
            modelSelectorOptions[modelSelectorOptions.length - 1].focus();
          }
        } else {
          textareaRef.current?.focus();
        }
        e.preventDefault();
      } else if (activeElement.getAttribute('role') === 'radio') {
        if (message) {
          clearButtonRef.current?.focus();
        }
        e.preventDefault();
      }
    }
    
    // Enter key handling (submit form)
    if (e.key === 'Enter') {
      if (!e.shiftKey && document.activeElement !== textareaRef.current) {
        if (message.trim() && !isLoading) {
          e.preventDefault();
          handleSubmit(e);
        }
      }
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, message, isLoading]);  // Added isLoading dependency

  // Handle manual typing
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full p-3 pb-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="Type your message here..."
          value={message}
          onChange={handleInputChange}
          disabled={isLoading}
          aria-label="Message input"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <div className="absolute bottom-3 right-3 flex space-x-2">
          <button
            type="button"
            ref={voiceButtonRef}
            onClick={toggleListening}
            className={`p-2 rounded-lg ${
              isListening 
                ? 'bg-red-500 text-black animate-pulse' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } transition-colors focus:ring-2 focus:ring-primary focus:outline-none`}
            disabled={isLoading}
            title={isListening ? "Stop listening" : "Start voice input"}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={isListening}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>

          <button
   type="submit"
   ref={sendButtonRef}
   className={`p-2 rounded-lg ${
     isLoading || !message.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'
   } transition-colors focus:ring-2 focus:ring-[#20B2AA] focus:outline-none`}
   disabled={isLoading || !message.trim()}
   title="Send message"
   aria-label="Send message"
>
   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'rotate(45deg)'}}>
       <path d="M22 2L11 13"></path>
       <polygon points="22 2 2 9 11 13 15 22 22 2"></polygon>
   </svg>
</button>
        </div>
        
        <div className="absolute left-3 bottom-3 flex space-x-2">
          {message && (
            <button
              type="button"
              ref={clearButtonRef}
              onClick={handleClear}
              className="p-1 rounded-md bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors flex items-center focus:ring-2 focus:ring-primary focus:outline-none"
              title="Clear message (ESC)"
              aria-label="Clear message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-xs ml-1">Clear</span>
            </button>
          )}

          <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
        </div>
      </div>
      
      {isListening && (
        <div className="mt-1 text-xs text-black flex items-center" role="status" aria-live="assertive">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
          Listening... (speak clearly)
        </div>
      )}
      
      {/* Accessibility instructions */}
      <div className="sr-only" aria-live="polite">
        {isListening ? 'Voice input is active. Speak clearly.' : 'Voice input is off.'}
        Use arrow keys to navigate between input field, model selection, and send button.
      </div>
    </form>
  );
};

export default ChatInput;