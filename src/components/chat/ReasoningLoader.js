import React, { useState, useEffect } from "react";

const ReasoningLoader = () => {
  const [message, setMessage] = useState("Thinking...");
  const loadingSteps = [
    "Analyzing your query...",
    "Gathering relevant information...",
    "Processing response...",
    "Almost there..."
  ];
  
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      setMessage(loadingSteps[step % loadingSteps.length]);
      step++;
    }, 1500);
    
    return () => clearInterval(interval);
  }, [loadingSteps]);

  return (
    <div className="reasoning-loader">
      <span className="dot-flash">{message}</span>
    </div>
  );
};

export default ReasoningLoader;
