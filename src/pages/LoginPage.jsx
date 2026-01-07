import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, employeeLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Determine login method based on email
      if (email === 'admin@elitehosters.com') {
        await login(email, password); // Admin login
      } else {
        await employeeLogin(email, password); // Employee login
      }
      
      // Redirect based on user role
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && (storedUser.role === 'admin' || storedUser.role === 'employee')) {
        navigate('/dashboard');
      } else {
        navigate('/companies'); // Default for other user types
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      
      <div className="max-w-md w-full space-y-8 z-10 relative">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">EO</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to EliteOutreach
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 ease-in-out text-gray-900 placeholder-gray-500"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 ease-in-out text-gray-900 placeholder-gray-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6 text-sm text-gray-600 bg-white/80 p-4 rounded-xl backdrop-blur-sm border border-gray-100">
          <p className="font-medium text-gray-900 mb-2">Demo credentials:</p>
          <div className="space-y-1">
            <p className="text-xs bg-gray-100 rounded px-2 py-1 inline-block">Admin: admin@elitehosters.com / Admin@123</p>
            <p className="text-xs bg-gray-100 rounded px-2 py-1 inline-block mt-1">Employee: amad@example.com / Password123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;