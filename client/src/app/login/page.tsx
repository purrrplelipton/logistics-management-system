'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@iconify-icon/react';
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
    <main
      role="main"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-md space-y-8">
        <header className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Icon
                icon="solar:delivery-outline"
                className="text-5xl text-blue-600"
                aria-hidden="true"
              />
              <span className="text-3xl font-bold text-gray-900">LogiTrack</span>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500 focus:underline focus:outline-none"
            >
              create an account
            </Link>
          </p>
        </header>

        <section aria-labelledby="login-form-heading">
          <h2 id="login-form-heading" className="sr-only">
            Login Form
          </h2>

          <form
            className="mt-8 space-y-6 rounded-lg bg-white p-8 shadow-lg"
            onSubmit={handleSubmit}
            role="form"
          >
            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-4"
                aria-live="polite"
              >
                <div className="flex items-start">
                  <Icon
                    icon="solar:danger-triangle-outline"
                    className="mt-0.5 flex-shrink-0 text-xl text-red-400"
                    aria-hidden="true"
                  />
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
                startElement={<Icon icon="solar:letter-outline" className="text-xl" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
              <div className="mt-4 text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:underline focus:outline-none"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
