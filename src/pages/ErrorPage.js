import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-12">
      <div className="text-6xl text-primary mb-6">⚠️</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
      <p className="text-lg text-gray-700 mb-8">We couldn't find the page you're looking for.</p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
      >
        Go back home
      </button>
    </div>
  );
};

export default ErrorPage;