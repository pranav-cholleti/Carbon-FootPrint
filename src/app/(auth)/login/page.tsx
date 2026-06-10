'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setEmail('demo@imprint.app');
    setPassword('demo123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    // Simulate brief loading
    await new Promise((r) => setTimeout(r, 400));

    const user = {
      id: crypto.randomUUID(),
      email,
      displayName: email === 'demo@imprint.app' ? 'Demo User' : email.split('@')[0],
      region: 'IN-TG',
      createdAt: new Date().toISOString(),
      isDemo: email === 'demo@imprint.app',
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('imprint_current_user', JSON.stringify(user));
    }

    router.push('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, var(--accent-green-bg) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background:
              'radial-gradient(circle, var(--accent-blue-bg) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'var(--accent-green)',
              boxShadow: '0 8px 24px rgba(45, 106, 79, 0.3)',
            }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Sign in to your Imprint account
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="password"
                  type="password"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="text-sm font-medium px-3 py-2 rounded-lg animate-slide-down"
                style={{
                  color: 'var(--accent-coral)',
                  background: 'var(--accent-coral-bg)',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: '24px' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    style={{ display: 'inline-block' }}
                  />
                  Signing in…
                </span>
              ) : (
                <>
                  Log in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            className="flex items-center gap-3 my-6"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <div
              className="flex-1 h-px"
              style={{ background: 'var(--border-light)' }}
            />
            <span className="text-xs font-medium uppercase tracking-wider">
              or
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: 'var(--border-light)' }}
            />
          </div>

          {/* Demo Account */}
          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={fillDemo}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
            Use Demo Account
          </button>
        </div>

        {/* Sign up link */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent-green)' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
