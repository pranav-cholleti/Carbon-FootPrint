'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  PlusCircle,
  Sparkles,
  Zap,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Log', icon: PlusCircle, href: '/dashboard?log=true' },
  { label: 'Insights', icon: Sparkles, href: '/insights' },
  { label: 'Actions', icon: Zap, href: '/actions' },
  { label: 'Profile', icon: User, href: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        height: '60px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(232, 228, 223, 0.6)',
      }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          // For "Log" tab, never mark as active via pathname
          const isActive =
            item.href === '/dashboard?log=true'
              ? false
              : item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
              style={{
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-8 rounded-xl"
                style={{
                  background: isActive
                    ? 'var(--accent-green-bg)'
                    : 'transparent',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: isActive
                      ? 'var(--accent-green)'
                      : 'var(--text-tertiary)',
                    strokeWidth: isActive ? 2.5 : 2,
                    transition: 'color var(--transition-fast)',
                  }}
                />
              </div>
              <span
                className="text-[10px] font-semibold leading-tight"
                style={{
                  color: isActive
                    ? 'var(--accent-green)'
                    : 'var(--text-tertiary)',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
