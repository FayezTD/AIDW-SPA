import React, { useState, useRef } from 'react';

const ModelSelector = ({ selectedModel, onModelChange, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const models = [
    { id: 'o1-mini', name: 'o1-mini', color: 'from-cyan-700 to-cyan-500' },
    { id: 'gpt-4o-mini', name: 'gpt-4o-mini', color: 'from-green-700 to-green-500' }
  ];

  const handleToggleDropdown = () => {
    if (!isLoading) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelectModel = (modelId) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get selected model info
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggleDropdown}
        disabled={isLoading}
        className="flex items-center space-x-1 text-xs font-medium px-3 py-1 border border-gray-300 rounded-full 
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary bg-white
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select AI model"
      >
        <span className="mr-1">Model:</span>
        <span className="font-medium">{currentModel.name}</span>
        
        {/* Up/down arrow icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-3 w-3 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-full z-10 shadow-lg rounded-md bg-white border border-gray-200 py-1 focus:outline-none">
          <ul role="listbox" className="max-h-60 overflow-auto" tabIndex={-1}>
            {models.map((model) => (
              <li
                key={model.id}
                role="option"
                aria-selected={model.id === selectedModel}
                onClick={() => handleSelectModel(model.id)}
                className={`cursor-pointer px-3 py-2 text-xs hover:bg-gray-100 flex items-center justify-between
                          ${model.id === selectedModel ? 'bg-gray-50 font-medium' : ''}`}
              >
                <span>{model.name}</span>
                {model.id === selectedModel && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;