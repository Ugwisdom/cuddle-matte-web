'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './settings.module.css';

// ─── Icons (inline SVGs to avoid icon library dependency) ─────────────────────
const ArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const LogOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const sectionIcons: Record<string, React.ReactNode> = {
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  sunny: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  person: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  notifications: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  lock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  help: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={String(value) as "true" | "false"}
      title={`Toggle ${value ? 'off' : 'on'}`}
      onClick={() => onChange(!value)}
      className={`${styles.toggle} ${value ? styles.toggleOn : ''}`}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

// ─── Select Button ─────────────────────────────────────────────────────────────
function SelectButton({ value }: { value: string }) {
  return (
    <button className={styles.selectButton}>
      <span>{value}</span>
      <ChevronDown />
    </button>
  );
}

// ─── Setting Row ───────────────────────────────────────────────────────────────
function SettingRow({
  label,
  description,
  control,
  linkText,
  onClick,
}: {
  label: string;
  description?: string;
  control?: React.ReactNode;
  linkText?: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`${styles.row} ${onClick ? styles.rowClickable : ''}`}
      onClick={onClick}
    >
      <div className={styles.rowInfo}>
        <span className={styles.rowLabel}>{label}</span>
        {description && <span className={styles.rowDescription}>{description}</span>}
      </div>
      <div className={styles.rowControl}>
        {control}
        {linkText && <span className={styles.linkText}>{linkText}</span>}
        {onClick && !control && !linkText && <ChevronRight />}
        {onClick && (linkText) && <ChevronRight />}
      </div>
    </Tag>
  );
}

// ─── Setting Section ───────────────────────────────────────────────────────────
function SettingSection({
  iconKey,
  title,
  children,
}: {
  iconKey: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{sectionIcons[iconKey]}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPreferences, setUserPreferences] = useState<any>(null);

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    messages: true,
    comments: true,
  });

  const [privacy] = useState('Public');
  const [language] = useState('English');

  // Load user preferences on mount and when component updates
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        if (!token) {
          setLoading(false);
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        const response = await fetch(`${apiBase}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserPreferences(data.user);
          
          // Set preferences from user data if available
          if (data.user?.preferences?.notifications) {
            setNotifications(data.user.preferences.notifications);
          }
        }
      } catch (err) {
        console.error('Failed to load user preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserPreferences();
  }, []);

  // Refresh user preferences after any setting changes
  const refreshUserPreferences = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) return;

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      const response = await fetch(`${apiBase}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPreferences(data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user preferences:', err);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (token) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        try {
          await fetch(`${apiBase}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (err) {
          console.warn('Logout request failed:', err);
        }
      }

      // Clear auth token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
      
      router.push('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`${styles.root} ${isDark ? styles.dark : styles.light}`}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={() => router.back()}
          title="Go back"
        >
          <ArrowLeft />
        </button>
        <h1 className={styles.headerTitle}>Settings</h1>
        <div className={styles.placeholder} />
      </header>

      <main className={styles.main}>
        <div className={styles.wrapper}>

          {/* Appearance */}
          <SettingSection iconKey={isDark ? 'moon' : 'sunny'} title="Appearance">
            <SettingRow
              label="Dark mode"
              description="Toggle between light and dark theme"
              control={<ToggleSwitch value={isDark} onChange={setIsDark} />}
            />
          </SettingSection>

          {/* Account */}
          <SettingSection iconKey="person" title="Account">
            <SettingRow
              label="Edit profile"
              description="Update your profile information"
              linkText="Edit"
              onClick={() => router.push('/auth/updateprofile.tsx')}
            />
            <SettingRow
              label="Change password"
              description="Update your account password"
              linkText="Change"
              onClick={() => router.push('/auth/changepassword')}
            />
          </SettingSection>

          {/* Notifications */}
          <SettingSection iconKey="notifications" title="Notifications">
            <SettingRow
              label="Push notifications"
              description="Receive notifications on your device"
              control={
                <ToggleSwitch
                  value={notifications.push}
                  onChange={v => setNotifications(p => ({ ...p, push: v }))}
                />
              }
            />
            <SettingRow
              label="Email notifications"
              description="Receive updates via email"
              control={
                <ToggleSwitch
                  value={notifications.email}
                  onChange={v => setNotifications(p => ({ ...p, email: v }))}
                />
              }
            />
            <SettingRow
              label="Message notifications"
              description="Get notified of new messages"
              control={
                <ToggleSwitch
                  value={notifications.messages}
                  onChange={v => setNotifications(p => ({ ...p, messages: v }))}
                />
              }
            />
            <SettingRow
              label="Comment notifications"
              description="Get notified when someone comments"
              control={
                <ToggleSwitch
                  value={notifications.comments}
                  onChange={v => setNotifications(p => ({ ...p, comments: v }))}
                />
              }
            />
          </SettingSection>

          {/* Privacy & Security */}
          <SettingSection iconKey="lock" title="Privacy & security">
            <SettingRow
              label="Account privacy"
              description="Control who can see your content"
              control={<SelectButton value={privacy} />}
            />
            <SettingRow
              label="Two-factor authentication"
              description="Add an extra layer of security"
              linkText="Setup"
              onClick={() => router.push('/auth/twofactor')}
            />
            <SettingRow
              label="Blocked users"
              description="Manage your blocked accounts"
              linkText="Manage"
              onClick={() => router.push('/getapp')}
            />
          </SettingSection>

          {/* General */}
          <SettingSection iconKey="globe" title="General">
            <SettingRow
              label="Language"
              description="Choose your preferred language"
              control={<SelectButton value={language} />}
            />
            <SettingRow
              label="Time zone"
              description="Set your local time zone"
              linkText="Auto"
              onClick={() => alert('Auto-detect time zone')}
            />
          </SettingSection>

          {/* Help & Support */}
          <SettingSection iconKey="help" title="Help & support">
            <SettingRow label="Help center" onClick={() => router.push('/support/help')} />
            <SettingRow label="Report a problem" onClick={() => router.push('/support/report')} />
            <SettingRow label="Terms of service" onClick={() => router.push('/support/terms')} />
            <SettingRow label="Privacy policy" onClick={() => router.push('/support/privacypolicy')} />
          </SettingSection>

          {/* Logout */}
          <button className={styles.logoutButton} onClick={handleLogout} disabled={isLoggingOut}>
            <LogOut />
            <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
          </button>

        </div>
      </main>
    </div>
  );
}