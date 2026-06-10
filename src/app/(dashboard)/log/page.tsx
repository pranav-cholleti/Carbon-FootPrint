'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ActivityLogForm from '@/components/forms/ActivityLogForm';
import ActivityResultCard from '@/components/cards/ActivityResultCard';
import { ArrowLeft, History } from 'lucide-react';
import Link from 'next/link';
import type { ActivityLog } from '@/types/domain';

export default function LogPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [resultLog, setResultLog] = useState<{
    activity: ActivityLog;
    equivalency: string;
    alternative: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFormSubmit = useCallback(
    (log: ActivityLog, equivalency: string, alternative: string) => {
      setResultLog({ activity: log, equivalency, alternative });
    },
    []
  );

  const handleCloseResult = useCallback(() => {
    setResultLog(null);
  }, []);

  return (
    <div
      className={mounted ? 'animate-fade-in' : 'opacity-0'}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto' }}
    >
      {/* Header with Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => router.back()}
          className="btn btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', fontSize: '13px' }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back
        </button>

        <h1
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Log Activity
        </h1>

        <Link
          href="/history"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <History style={{ width: '14px', height: '14px' }} />
          History
        </Link>
      </div>

      {!resultLog ? (
        <div className="card animate-scale-in" style={{ padding: '24px', background: 'var(--bg-card)' }}>
          <ActivityLogForm
            isOpen={true}
            onClose={() => router.back()}
            onSubmit={handleFormSubmit}
            isModal={false}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <ActivityResultCard
              activity={resultLog.activity}
              equivalency={resultLog.equivalency}
              alternative={resultLog.alternative || undefined}
              onClose={handleCloseResult}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCloseResult}
              className="btn btn-primary"
            >
              ➕ Log Another Activity
            </button>
            <Link
              href="/dashboard"
              className="btn btn-secondary"
            >
              🏠 Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
