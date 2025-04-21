import React from 'react';

const StarterQuestions = ({ questions, onSelectQuestion }) => {
  return (
    <div className="my-6 px-2">
      <h2 className="text-lg font-bold text-cyan-100 mb-3">Query Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {questions.map((question) => (
          <button
            key={question.id}
            className="text-left py-2 px-3 border border-cyan-700 bg-cyan-900/50 rounded-lg hover:bg-cyan-800/60 hover:border-cyan-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onClick={() => onSelectQuestion(question.question)}
          >
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-sm text-cyan-200">{question.question}</div>
              </div>
              <div className="ml-2 text-cyan-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarterQuestions;