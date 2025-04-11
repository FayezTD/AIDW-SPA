import React from 'react';

const ModelSelector = ({ selectedModel, onModelChange, isLoading }) => {
  const models = [
    { id: 'o1-mini', name: 'o1-mini', color: 'from-cyan-700 to-cyan-500' },
    { id: 'gpt-4o-mini', name: 'gpt-4o-mini', color: 'from-green-700 to-green-500' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="model-selector" className="text-xs text-gray-500 font-medium">
        Model:
      </label>
      <div className="relative">
        <select
          id="model-selector"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={isLoading}
          className="text-xs font-medium pr-8 pl-3 py-1 border border-gray-300 rounded-full 
                    focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          aria-label="Select AI model"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {/* Visual indicator for selected model */}
      <div className={`bg-gradient-to-r ${models.find(m => m.id === selectedModel)?.color} 
                    text-white py-1 px-3 rounded-full text-xs font-medium shadow-sm hidden sm:block`}>
        {selectedModel}
      </div>
    </div>
  );
};

export default ModelSelector;