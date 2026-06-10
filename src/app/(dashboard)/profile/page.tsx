'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  MapPin,
  Users,
  RefreshCw,
  Download,
  Trash2,
  LogOut,
  Bell,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  getCurrentUser,
  getProfile,
  updateUser,
  saveProfile,
  logout,
  clearAllData,
} from '@/lib/store';

// ---------------------------------------------------------------------------
// Region Options
// ---------------------------------------------------------------------------

const REGIONS = [
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'IN-TG', label: '🇮🇳 India — Telangana' },
  { value: 'IN-KA', label: '🇮🇳 India — Karnataka' },
  { value: 'IN-MH', label: '🇮🇳 India — Maharashtra' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'US-CA', label: '🇺🇸 US — California' },
  { value: 'US-NY', label: '🇺🇸 US — New York' },
  { value: 'UK', label: '🇬🇧 United Kingdom' },
  { value: 'EU', label: '🇪🇺 European Union' },
  { value: 'NO', label: '🇳🇴 Norway' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'CA', label: '🇨🇦 Canada' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [region, setRegion] = useState('IN');
  const [householdSize, setHouseholdSize] = useState(1);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Notification toggles (visual only)
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifAchievements, setNotifAchievements] = useState(true);
  const [notifReminders, setNotifReminders] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const profile = getProfile();

    if (user) {
      setDisplayName(user.display_name);
      setEmail(user.email);
    }

    if (profile) {
      setRegion(profile.region_code);
      setHouseholdSize(profile.household_size);
    }

    setLoaded(true);
  }, []);

  const handleSave = () => {
    const user = getCurrentUser();
    if (user) {
      updateUser({ id: user.id, display_name: displayName });
    }

    const profile = getProfile();
    if (profile) {
      saveProfile({
        ...profile,
        region_code: region,
        household_size: householdSize,
      });
    }

    setEditing(false);
    showToast('Profile updated! ✅');
  };

  const handleExport = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('imprint_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `imprint-data-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported! 📦');
  };

  const handleDelete = () => {
    clearAllData();
    router.push('/');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  if (!loaded) {
    return (
      <div style={{ padding: '20px 16px' }}>
        <div className="skeleton" style={{ height: '100px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>
          <User size={22} style={{ display: 'inline', verticalAlign: 'text-bottom', color: 'var(--accent-green)' }} />{' '}
          Profile
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Avatar + Name Card */}
      <div
        className="card animate-fade-in"
        style={{
          padding: '24px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--accent-green), var(--accent-green-light))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>{displayName}</div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Mail size={12} />
            {email}
          </div>
        </div>
        {!editing && (
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setEditing(true)}
            style={{ cursor: 'pointer' }}
          >
            Edit
          </button>
        )}
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="card animate-slide-down" style={{ padding: '20px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>
            Edit Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="display-name" className="input-label">Display Name</label>
              <input
                id="display-name"
                className="input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="input-label">
                <Mail size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Email (read-only)
              </label>
              <input
                id="profile-email"
                className="input"
                type="email"
                value={email}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label htmlFor="profile-region" className="input-label">
                <MapPin size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Region
              </label>
              <select
                id="profile-region"
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
            <div>
              <label htmlFor="household-size" className="input-label">
                <Users size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Household Size
              </label>
              <input
                id="household-size"
                className="input"
                type="number"
                min={1}
                max={10}
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                style={{ flex: 1, cursor: 'pointer' }}
              >
                Save Changes
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recalculate Baseline */}
      <div
        className="card animate-fade-in delay-100"
        style={{
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => router.push('/onboarding')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <RefreshCw size={18} style={{ color: 'var(--accent-green)' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Recalculate Baseline</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Retake the lifestyle quiz to update your estimate
            </div>
          </div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
      </div>

      {/* Notification Preferences */}
      <div className="card animate-fade-in delay-200" style={{ padding: '20px', marginBottom: '16px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Bell size={16} style={{ color: 'var(--accent-green)' }} />
          Notifications
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <ToggleRow
            label="Weekly Digest"
            sublabel="AI summary of your week every Monday"
            value={notifWeekly}
            onChange={setNotifWeekly}
          />
          <ToggleRow
            label="Achievement Alerts"
            sublabel="Get notified when you earn a badge"
            value={notifAchievements}
            onChange={setNotifAchievements}
          />
          <ToggleRow
            label="Daily Reminders"
            sublabel="Remind me to log activities"
            value={notifReminders}
            onChange={setNotifReminders}
          />
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="card animate-fade-in delay-300" style={{ padding: '20px', marginBottom: '16px' }}>
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Shield size={16} style={{ color: 'var(--accent-green)' }} />
          Data & Privacy
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Export Data */}
          <button
            className="btn btn-secondary"
            onClick={handleExport}
            style={{
              width: '100%',
              cursor: 'pointer',
              justifyContent: 'flex-start',
            }}
          >
            <Download size={16} />
            Export My Data
          </button>

          {/* Delete Account */}
          <button
            className="btn"
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width: '100%',
              cursor: 'pointer',
              justifyContent: 'flex-start',
              background: 'var(--accent-coral-bg)',
              color: 'var(--accent-coral)',
              border: '1px solid var(--accent-coral)',
            }}
          >
            <Trash2 size={16} />
            Delete Account & Data
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        className="btn btn-ghost"
        onClick={handleLogout}
        style={{
          width: '100%',
          cursor: 'pointer',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
          marginBottom: '24px',
        }}
      >
        <LogOut size={16} />
        Log Out
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
              Delete Everything?
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              This will permanently delete all your data including activity logs,
              goals, achievements, and profile. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleDelete}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  background: 'var(--accent-coral)',
                  color: 'white',
                }}
              >
                <Trash2 size={14} />
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* Version footer */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-tertiary)',
          padding: '16px 0',
        }}
      >
        Imprint v0.1.0 · Made with 🌱
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '24px' }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle Switch Sub-component
// ---------------------------------------------------------------------------

function ToggleRow({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{sublabel}</div>
      </div>
      <button
        type="button"
        aria-pressed={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: 'var(--radius-full)',
          background: value ? 'var(--accent-green)' : 'var(--border-medium)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background var(--transition-fast)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: value ? '22px' : '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            transition: 'left var(--transition-fast)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}
        />
      </button>
    </div>
  );
}
