'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Leaf,
  LayoutDashboard,
  Plus,
  Clock,
  Sparkles,
  Zap,
  Target,
  Award,
  User,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Log Activity', icon: Plus, href: '/log' },
  { label: 'History', icon: Clock, href: '/history' },
  { label: 'Insights', icon: Sparkles, href: '/insights' },
  { label: 'Actions', icon: Zap, href: '/actions' },
  { label: 'Goals', icon: Target, href: '/goals' },
  { label: 'Achievements', icon: Award, href: '/achievements' },
  { label: 'Profile', icon: User, href: '/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('imprint_current_user');
      window.localStorage.removeItem('imprint_user_profile');
    }
    router.push('/login');
  };

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30"
      style={{
        width: '260px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-light)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6"
        style={{
          height: '72px',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: 'var(--accent-green)' }}
        >
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span
          className="text-xl font-bold"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
          }}
        >
          Imprint
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
              style={{
                transition: 'all var(--transition-fast)',
                background: isActive ? 'var(--accent-green-bg)' : 'transparent',
                color: isActive
                  ? 'var(--accent-green-dark)'
                  : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon
                className="w-5 h-5 flex-shrink-0"
                style={{
                  color: isActive
                    ? 'var(--accent-green)'
                    : 'var(--text-tertiary)',
                }}
              />
              {item.label}
              {item.label === 'Log Activity' && (
                <span
                  className="ml-auto flex items-center justify-center w-5 h-5 rounded-md text-xs font-bold"
                  style={{
                    background: 'var(--accent-green)',
                    color: 'white',
                    fontSize: '10px',
                  }}
                >
                  +
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid var(--border-light)' }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full"
          style={{
            color: 'var(--text-tertiary)',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-coral-bg)';
            e.currentTarget.style.color = 'var(--accent-coral)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
