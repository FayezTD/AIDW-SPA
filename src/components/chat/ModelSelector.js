import React, { useState, useEffect } from 'react';
import './ModelSelector.css'; // Import CSS if you have any styling

const ModelSelector = ({ onModelChange, initialModel = 'o1-mini' }) => {
  const [selectedModel, setSelectedModel] = useState(initialModel);

  // Only include the two models specified
  const models = [
    { id: 'o1-mini', name: 'O1-Mini' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
  ];

  // When initialModel prop changes, update the state
  useEffect(() => {
    if (initialModel && initialModel !== selectedModel) {
      setSelectedModel(initialModel);
    }
  }, [initialModel]);

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    
    // Call the parent component's handler with the new model
    if (onModelChange) {
      onModelChange(newModel);
    }
    
    console.log('Model selected:', newModel);
  };

  return (
    <div className="model-selector">
      <label htmlFor="model-select" className="model-selector-label">AI Model:</label>
      <select 
        id="model-select"
        value={selectedModel}
        onChange={handleModelChange}
        className="model-dropdown"
        data-testid="model-selector"
      >
        {models.map(model => (
          <option key={model.id} value={model.id} data-testid={`model-option-${model.id}`}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;