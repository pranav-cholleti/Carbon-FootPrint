'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, User, Mail, Lock, Globe, ArrowRight } from 'lucide-react';

const REGIONS = [
  { value: 'IN-TG', label: '🇮🇳 India (Telangana)' },
  { value: 'US-CA', label: '🇺🇸 USA (California)' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'EU-AVG', label: '🇪🇺 European Union (Avg)' },
  { value: 'NO', label: '🇳🇴 Norway' },
];

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [region, setRegion] = useState('IN-TG');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const user = {
      id: crypto.randomUUID(),
      email,
      displayName,
      region,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('imprint_current_user', JSON.stringify(user));
    }

    router.push('/onboarding');
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
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, var(--accent-green-bg) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background:
              'radial-gradient(circle, var(--accent-purple-bg) 0%, transparent 70%)',
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
            Join Imprint
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Start tracking your carbon footprint today
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="input-label">
                Display name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="displayName"
                  type="text"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="input-label">
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-tertiary)' }}
                />
                <input
                  id="confirmPassword"
                  type="password"
                  className="input"
                  style={{ paddingLeft: '36px' }}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="input-label">
                <Globe
                  className="inline w-3.5 h-3.5 mr-1"
                  style={{ color: 'var(--text-tertiary)', marginBottom: '1px' }}
                />
                Region
              </label>
              <select
                id="region"
                className="select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
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
              style={{ marginTop: '20px' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    style={{ display: 'inline-block' }}
                  />
                  Creating account…
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p
          className="text-center mt-6 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--accent-green)' }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
