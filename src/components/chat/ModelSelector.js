import React, { useState, useEffect } from 'react';

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
      className="fixed bottom-[1020px] left-1/2 transform -translate-x-1/2 bg-gray-400 text-white px-6 py-3 rounded-full shadow-lg z-[9999]"
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

const ModelSelector = ({ selectedModel, onSelectModel }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
  });

  // Define model options
  const models = [
    { id: 'GPT-4o', label: 'Search' },
    { id: 'o1-Preview', label: 'Deep Search' }
  ];

  const handleModelSelect = (model) => {
    onSelectModel(model);

    // Show appropriate toast message based on the selected model
    if (model === 'GPT-4o') {
      setToast({
        visible: true,
        message: 'You are using GPT-4o for Search',
      });
    } else if (model === 'o1-Preview') {
      setToast({
        visible: true,
        message: 'You are using o1-Preview for Deep Search',
      });
    }
  };

  const closeToast = () => {
    setToast({ ...toast, visible: false });
  };

  return (
    <>
      <div className="flex flex-col space-y-2">
        <span id="model-selector-label" className="sr-only">
          Select search model
        </span>

        {/* Slider with space between options */}
        <div
          className="flex items-center bg-gray-100 rounded-full p-1 w-fit space-x-2"
          role="tablist"
          aria-labelledby="model-selector-label"
        >
          {models.map((model) => (
            <button
              key={model.id}
              role="tab"
              aria-selected={selectedModel === model.id}
              onClick={() => handleModelSelect(model.id)}
              tabIndex={selectedModel === model.id ? 0 : -1}
              className={`
                py-1 px-3 rounded-full text-xs font-medium transition-all
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${selectedModel === model.id
                  ? 'bg-gradient-to-r from-cyan-700 to-cyan-500 text-white shadow-sm'
                  : 'text-cyan-900 hover:bg-gray-200'
                }
              `}
            >
              {model.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toast component */}
      <Toast
        message={toast.message}
        visible={toast.visible}
        onClose={closeToast}
      />
    </>
  );
};

export default ModelSelector;