import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SignupResponse {
  sucess: boolean; // Note: keeping the typo from your backend
  userId?: string;
  message?: string;
}

const Signup = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSignup = async (): Promise<void> => {
    if (!email || !password) return;
    setLoading(true);
    
    try {
      const response = await axios.post<SignupResponse>(`${BACKEND_URL}/api/v1/user/signup`, {
        email,
        password
      });
      
      const data = response.data;
      
      if (data.sucess && data.userId) {
        alert('Account created successfully! Please sign in.');
        navigate('/signin');
      } else {
        alert(data.message || 'Sign up failed');
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
          <h2 className="text-3xl font-light text-gray-800">Create account</h2>
          <p className="text-gray-600 mt-2">Join xness today</p>
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
            onClick={handleSignup}
            disabled={loading || !email || !password}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-md transition-colors duration-200"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
        
        <p className="text-center text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/signin')}
            className="text-green-500 hover:text-green-600"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;