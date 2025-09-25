'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@iconify/react';
import truckIcon from '@iconify-icons/solar/delivery-outline';
import mailIcon from '@iconify-icons/solar/letter-outline';
import alertIcon from '@iconify-icons/solar/danger-triangle-outline';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main role="main" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Icon icon={truckIcon} className="h-12 w-12 text-blue-600" aria-hidden="true" />
              <span className="text-3xl font-bold text-gray-900">LogiTrack</span>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              create a new account
            </Link>
          </p>
        </header>
        
        <section aria-labelledby="login-form-heading">
          <h2 id="login-form-heading" className="sr-only">Login Form</h2>
          
          <form 
            className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" 
            onSubmit={handleSubmit}
            role="form"
          >
            {error && (
              <div 
                role="alert" 
                className="bg-red-50 border border-red-200 rounded-md p-4"
                aria-live="polite"
              >
                <div className="flex items-start">
                  <Icon icon={alertIcon} className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                label="Email Address"
                placeholder="Enter your email"
                startElement={<Icon icon={mailIcon} className="w-5 h-5" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                label="Password"
                placeholder="Enter your password"
                showStrengthIndicator={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}