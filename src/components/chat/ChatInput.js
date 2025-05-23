import React, { useState, useRef, useEffect } from 'react';
import ModelSelector from './ModelSelector';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const textareaRef = useRef(null);
  const sendButtonRef = useRef(null);
  const voiceButtonRef = useRef(null);
  const clearButtonRef = useRef(null);
  const recognitionRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const isRecognitionActiveRef = useRef(false); // Track actual recognition state

  // Debugging selectedModel changes
  useEffect(() => {
    console.log(`ChatInput: Current selected model: ${selectedModel}`);
  }, [selectedModel]);

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
    initializeSpeechRecognition();
    
    // Cleanup on unmount
    return () => {
      cleanupSpeechRecognition();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    // Clean up any existing instance first
    cleanupSpeechRecognition();
    
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      recognitionRef.current = new window.SpeechRecognition();
    } else {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    if (recognitionRef.current) {
      // Configure recognition for better performance
      recognitionRef.current.continuous = true; // Enable continuous mode for longer recordings
      recognitionRef.current.interimResults = true; // Get interim results for more responsive feedback
      recognitionRef.current.lang = 'en-US';
      
      // Handle results - improved to handle both interim and final results
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Debug logging
        if (finalTranscript) {
          console.log('Final recognized text:', finalTranscript);
        }
        
        // Update message with any final transcripts
        if (finalTranscript) {
          setMessage(prevMessage => {
            const separator = prevMessage ? ' ' : '';
            return prevMessage + separator + finalTranscript;
          });
        }
        
        // Handle interim results for visual feedback (could add UI indicator)
        if (interimTranscript) {
          // Could implement visual feedback for interim results
          console.log('Interim text:', interimTranscript);
        }
      };
      
      // Handle end of speech recognition
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        isRecognitionActiveRef.current = false;
        setIsListening(false);
        
        // Clear any recording timeout
        if (recordingTimeoutRef.current) {
          clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        
        // Focus the textarea after recognition ends
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      };
      
      // Handle errors with improved error reporting
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Provide more detailed error logging
        switch (event.error) {
          case 'no-speech':
            console.log('No speech detected');
            break;
          case 'audio-capture':
            console.error('Audio capture failed - please check microphone');
            break;
          case 'not-allowed':
            console.error('Microphone permission denied');
            break;
          case 'network':
            console.error('Network error occurred during recognition');
            break;
          default:
            console.error(`Unknown error: ${event.error}`);
        }
        
        isRecognitionActiveRef.current = false;
        setIsListening(false);
      };
    }
  };

  // Clean up speech recognition
  const cleanupSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        if (isRecognitionActiveRef.current) {
          recognitionRef.current.stop();
          isRecognitionActiveRef.current = false;
        }
      } catch (err) {
        // Ignore errors on cleanup
        console.log('Cleanup error (non-critical):', err.message);
      }
    }
    
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  // Toggle voice recognition (start/stop) - New implementation for push-to-record
  const toggleVoiceRecording = () => {
    if (isLoading) return;
    
    if (isListening) {
      // If we're listening, stop and submit the message
      stopListening();
      if (message.trim()) {
        handleSubmit();
      }
    } else {
      // If we're not listening, start listening
      startListening();
    }
  };

  // Start voice recognition
  const startListening = () => {
    if (!recognitionRef.current || isLoading) return;
    
    // If already listening, don't try to start again
    if (isRecognitionActiveRef.current) {
      console.log('Recognition already active, not starting again');
      return;
    }
    
    try {
      // Make sure recognition is properly initialized
      if (!recognitionRef.current) {
        initializeSpeechRecognition();
      }
      
      // Start new recognition session
      recognitionRef.current.start();
      isRecognitionActiveRef.current = true;
      setIsListening(true);
      
      // Set a timeout for automatic end after 60 seconds (as a safety net)
      recordingTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 60000); // 60 seconds max recording time
      
      console.log('Voice recording started');
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      isRecognitionActiveRef.current = false;
      setIsListening(false);
      
      // If we got an "already started" error, try to reset the recognition
      if (err.name === 'InvalidStateError') {
        console.log('Attempting to reset recognition after InvalidStateError');
        cleanupSpeechRecognition();
        initializeSpeechRecognition();
      }
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      // Only try to stop if we believe it's active
      if (isRecognitionActiveRef.current) {
        recognitionRef.current.stop();
        isRecognitionActiveRef.current = false;
        console.log('Voice recording stopped');
      } else {
        console.log('Recognition not active, no need to stop');
      }
      
      // Clear timeout regardless of state
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      // Always update UI state
      setIsListening(false);
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
      isRecognitionActiveRef.current = false;
      setIsListening(false);
    }
  };

  // Handle model change
  const handleModelChange = (newModel) => {
    console.log(`ChatInput: Model changed to: ${newModel}`);
    setSelectedModel(newModel);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (message.trim() && !isLoading) {
      // Stop listening if active
      if (isListening) {
        stopListening();
      }
      
      // Debug right before sending
      console.log(`ChatInput: Submitting message with model: ${selectedModel}`);
      
      // Send message with the selected model
      onSendMessage(message, selectedModel);
      
      // Clear the message
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle clearing the input
  const handleClear = () => {
    setMessage('');
    textareaRef.current.focus();
  };

  // Handle stop generation
  // const handleStopGeneration = () => {
  //   if (onStopGeneration && isLoading) {
  //     onStopGeneration();
  //   }
  // };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // ESC key handling
    if (e.key === 'Escape') {
      if (document.activeElement === textareaRef.current && message) {
        handleClear();
        if (isListening) {
          stopListening();
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
      }
    }
    
    // Left arrow key handling
    if (e.key === 'ArrowLeft') {
      const activeElement = document.activeElement;
      
      if (activeElement === sendButtonRef.current) {
        voiceButtonRef.current?.focus();
        e.preventDefault();
      } else if (activeElement === voiceButtonRef.current) {
        textareaRef.current?.focus();
        e.preventDefault();
      }
    }
    
    // Handle Enter key for submit only when not in textarea with shift key
    if (e.key === 'Enter' && document.activeElement !== textareaRef.current) {
      if (message.trim() && !isLoading) {
        e.preventDefault();
        handleSubmit();
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
  }, [isListening, message, isLoading]);

  // Handle manual typing
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Separate handler for textarea Enter key
  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        handleSubmit();
      }
    }
  };

  // Handle keyboard support for voice button
  const handleVoiceButtonKeyDown = (e) => {
    // Space or Enter press should toggle recording
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleVoiceRecording();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4" data-testid="chat-input-form">
      <div className="relative">
        <textarea
          ref={textareaRef}
          className="w-full p-3 pb-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          placeholder="Type your message here..."
          value={message}
          onChange={handleInputChange}
          disabled={isLoading}
          aria-label="Message input"
          onKeyDown={handleTextareaKeyDown}
          data-testid="message-textarea"
        />

        <div className="absolute bottom-3 right-3 flex space-x-2">
          {/* Voice Button - Changed to toggle behavior */}
          <button
            type="button"
            ref={voiceButtonRef}
            className={`p-2 rounded-lg ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } transition-colors focus:ring-2 focus:ring-primary focus:outline-none`}
            onClick={toggleVoiceRecording}
            disabled={isLoading}
            title={isListening ? "Recording in progress (click to stop and send)" : "Click to start recording voice"}
            aria-label={isListening ? "Stop recording and send" : "Start recording voice"}
            aria-pressed={isListening}
            data-testid="voice-button"
            onKeyDown={handleVoiceButtonKeyDown}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Send Button */}
          {!isLoading && (
            <button
              type="button"
              ref={sendButtonRef}
              onClick={handleSubmit}
              className={`p-2 rounded-lg ${
                isLoading || !message.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'
              } transition-colors focus:ring-2 focus:ring-[#20B2AA] focus:outline-none`}
              disabled={isLoading || !message.trim()}
              title="Send message"
              aria-label="Send message"
              data-testid="send-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'rotate(45deg)'}}>
                <path d="M22 2L11 13"></path>
                <polygon points="22 2 2 9 11 13 15 22 22 2"></polygon>
              </svg>
            </button>
          )}

          {/* Stop Generation Button - Only appears when loading */}
          {/* {isLoading && (
            <button
              type="button"
              onClick={handleStopGeneration}
              className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
              title="Stop generation"
              aria-label="Stop generation"
              data-testid="stop-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            </button>
          )} */}
        </div>
        
        <div className="absolute left-3 bottom-3 flex space-x-2 items-center">
          {message && (
            <button
              type="button"
              ref={clearButtonRef}
              onClick={handleClear}
              className="p-1 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors flex items-center justify-center focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
              title="Clear message (ESC)"
              aria-label="Clear message"
              data-testid="clear-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-xs ml-1">Clear</span>
            </button>
          )}

          {/* Model Selector Component */}
          <ModelSelector 
            selectedModel={selectedModel} 
            onModelChange={handleModelChange} 
            isLoading={isLoading} 
          />
        </div>
      </div>
      
      {/* Recording indicator without animation */}
      {isListening && (
        <div className="mt-1 text-xs text-black flex items-center" role="status" aria-live="assertive">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
          <span className="font-medium">Recording...</span> <span className="ml-1">(click to stop and send)</span>
        </div>
      )}
      
      {/* Accessibility instructions */}
      <div className="sr-only" aria-live="polite">
        {isListening ? 'Voice recording active. Click again to stop recording and send.' : 'Click voice button to start recording.'}
        Use arrow keys to navigate between input field and buttons.
        Current Model selected: {selectedModel}
      </div>
      
      {/* Hidden field to debug model value */}
      <input type="hidden" data-testid="selected-model-debug" value={selectedModel} />
    </form>
  );
};

export default ChatInput;