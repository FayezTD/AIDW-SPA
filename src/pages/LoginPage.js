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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-xl p-12 space-y-10 bg-white rounded-2xl shadow-xl border border-gray-400">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-black">AIDW Assistant</h1>
          <p className="text-gray-700 mt-3 text-lg">Your personal AI workspace companion</p>
        </div>

        <div>
          <button
            onClick={login}
            disabled={loading}
            className="w-full py-5 bg-black text-white text-lg rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-7 w-7 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="h-7 w-7 mr-2" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                </svg>
                <span>Sign in with Microsoft</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 pt-6 border-t border-gray-300">
          © {new Date().getFullYear()} AIDW
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
