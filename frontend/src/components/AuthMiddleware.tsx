import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthMiddlewareProps {
  children: React.ReactNode;
  requireAuth?: boolean; 
}

const AuthMiddleware = ({ children, requireAuth = false }: AuthMiddlewareProps) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        if (requireAuth) {
          navigate('/signin');
        }
        return;
      }

      setLoading(false);
      
      if (!requireAuth && (location.pathname === '/signin' || location.pathname === '/signup')) {
        navigate('/home');
      }
    };

    checkAuth();
  }, [requireAuth, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthMiddleware;