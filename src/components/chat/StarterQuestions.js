import React from 'react';

const StarterQuestions = ({ questions, onSelectQuestion }) => {
  return (
    <div className="my-6">
      <h2 className="text-lg font-medium mb-3">Starter Questions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {questions.map((question) => (
          <button
            key={question.id}
            className="text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => onSelectQuestion(question.question)}
          >
            <div className="font-medium">{question.title}</div>
            <div className="text-sm text-gray-600 mt-1">{question.question}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarterQuestions;