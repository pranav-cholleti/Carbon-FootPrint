'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = window.localStorage.getItem('imprint_current_user');
      if (!user) {
        router.push('/login');
        return;
      }
      setIsAuthed(true);
      setIsLoading(false);
    }
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{
              borderColor: 'var(--border-light)',
              borderTopColor: 'var(--accent-green)',
              borderWidth: '3px',
              borderStyle: 'solid',
            }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main
        className="min-h-screen"
        style={{
          paddingBottom: '80px', /* space for mobile bottom nav */
        }}
      >
        {/* Content wrapper — offset by sidebar on desktop */}
        <div
          className="lg:ml-[260px] transition-all"
          style={{
            minHeight: '100vh',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
