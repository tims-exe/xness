import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SigninResponse {
  success: boolean;
  token?: string;
  message?: string;
}

const Signin = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Check if user already has valid token when component loads
  useEffect(() => {
    const checkExistingToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Try to use existing token to make a request
        try {
          await axios.get(`${BACKEND_URL}/api/v1/user/profile`, {
            headers: {
              'Authorization': token // Just the token, no Bearer
            }
          });
          // If successful, user is already logged in
          navigate('/home');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
    };
    
    checkExistingToken();
  }, [BACKEND_URL, navigate]);

  const handleSignin = async (): Promise<void> => {
    if (!email || !password) return;
    setLoading(true);
    
    try {
      const response = await axios.post<SigninResponse>(`${BACKEND_URL}/api/v1/user/signin`, {
        email,
        password
      });
      
      const data = response.data;
      
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        alert('Sign in successful!');
        navigate('/home');
      } else {
        alert(data.message || 'Sign in failed');
      }
    } catch (error) {
      alert(`Network error ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800"
      >
      </button>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-800">Welcome back</h2>
          <p className="text-gray-600 mt-2">Sign in to your xness account</p>
        </div>
        
        <div className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleSignin}
            disabled={loading || !email || !password}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-md transition-colors duration-200"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        
        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-green-500 hover:text-green-600"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signin;