import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';

const LoginPage = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center shadow-md">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-10 h-10"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="10" r="2"></circle>
              <path d="M12 14v2"></path>
              <path d="M16 10h.01"></path>
              <path d="M8 10h.01"></path>
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">AIDW Assistant</h1>
        <p className="text-gray-600 mb-8 text-center">Your intelligent workplace companion</p>
        
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-800">Sign in to access personalized AI assistance for your workplace needs</p>
          </div>
          
          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150 flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>Sign in with Microsoft</span>
              </>
            )}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            AI-Driven Workplace Assistant<br />
            © {new Date().getFullYear()} AIDW
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;