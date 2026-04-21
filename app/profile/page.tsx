"use client";

interface User {
  photos?: string[];
  images?: string[];
  name?: string;
  age?: number;
  dateOfBirth?: string;
  emailVerified?: boolean;
  kyc?: {
    status?: string;
  };
  location?: string;
  city?: string;
  height?: string;
  bio?: string;
  interests?: string[];
  onboarding?: {
    completed?: boolean;
  };
  preferences?: {
    ageRange?: {
      min: number;
      max: number;
    };
    maxDistance?: number;
    styles?: string[];
  };
  verification?: {
    email?: boolean;
    phone?: boolean;
    id?: boolean;
  };
}

interface ProfilePageProps {
  user: User;
  isDark?: boolean;
  onBack: () => void;
  onSettings: () => void;
  onLogout: () => void;
  onDislike: () => void;
  onFavorite: () => void;
  onLike: () => void;
  onVerifyEmail: () => void;
  onKyc: () => void;
  onOnboarding: () => void;
}

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
// (TypeScript interfaces removed for plain JSX; add them back if using TSX)

// ─── Fallback data ────────────────────────────────────────────────────────────
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calculateAge = (dob: string | Date | null | undefined): number | null => {
  if (!dob) return null;
  try {
    const birth = new Date(dob);
    const diff = Date.now() - birth.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  } catch {
    return null;
  }
};

const getProfileImages = (user: any): string[] => {
  try {
    const photos = Array.isArray(user?.photos)
      ? user.photos.filter(Boolean).map(String)
      : [];
    if (photos.length > 0) return photos;
    const images = Array.isArray(user?.images)
      ? user.images.filter(Boolean).map(String)
      : [];
    if (images.length > 0) return images;
    if (user?.photo) return [String(user.photo)];
    if (user?.avatar) return [String(user.avatar)];
  } catch {}
  return FALLBACK_IMAGES;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  /* ── Reset / Base ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  button { cursor: pointer; background: transparent; border: none; padding: 0; font: inherit; }

  /* ── Keyframes ── */
  @keyframes menuFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Page ── */
  .pp-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .pp-root--light { background: #ffffff; color: #111; }
  .pp-root--dark  { background: #0D0B1A; color: #fff; }

  .pp-scroll {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 7rem; /* room for fixed action bar */
  }

  /* ── Image carousel ── */
  .pp-carousel {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
  }
  .pp-carousel__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .pp-carousel__gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 55%);
    pointer-events: none;
  }

  /* Header row */
  .pp-header {
    position: absolute;
    top: 0; left: 0; right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3rem 1rem 0.75rem;
    z-index: 10;
  }
  .pp-icon-btn {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: rgba(0,0,0,0.30);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .pp-icon-btn:hover { background: rgba(0,0,0,0.50); }

  /* Image indicators */
  .pp-indicators {
    position: absolute;
    top: 4.5rem;
    left: 1rem; right: 1rem;
    display: flex;
    gap: 0.375rem;
    z-index: 10;
  }
  .pp-indicator {
    flex: 1;
    height: 3px;
    border-radius: 999px;
    background: rgba(255,255,255,0.40);
    transition: background 0.16s;
  }
  .pp-indicator--active { background: #ffffff; }

  /* Name / distance overlay */
  .pp-name-area {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0 1.25rem 1.25rem;
    z-index: 10;
  }
  .pp-name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .pp-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
    text-shadow: 0 6px 22px rgba(0,0,0,0.6);
  }
  .pp-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    transition: opacity 0.15s;
  }
  .pp-badge--emerald { background: rgba(16,185,129,0.15); }
  .pp-badge--amber   { background: rgba(245,158,11,0.15);  }
  .pp-badge:hover    { opacity: 0.7; }

  .pp-location {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: #fff;
  }

  /* Tap areas */
  .pp-tap-prev,
  .pp-tap-next {
    position: absolute;
    top: 0;
    height: 100%;
    z-index: 5;
    opacity: 0;
  }
  .pp-tap-prev { left: 0; width: 40%; }
  .pp-tap-next { right: 0; width: 60%; }

  /* ── Sections ── */
  .pp-section {
    padding: 1.25rem;
    border-bottom-width: 1px;
    border-bottom-style: solid;
  }
  .pp-section--light { border-bottom-color: #f3f4f6; }
  .pp-section--dark  { border-bottom-color: rgba(255,255,255,0.08); }

  .pp-section__title {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }
  .pp-section__title--light { color: #111827; }
  .pp-section__title--dark  { color: #ffffff; }

  .pp-muted--light { color: #6b7280; }
  .pp-muted--dark  { color: rgba(255,255,255,0.60); }

  /* About text */
  .pp-bio {
    font-size: 0.9375rem;
    line-height: 1.65;
  }

  /* Basic item */
  .pp-basic-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .pp-basic-item:last-child { margin-bottom: 0; }
  .pp-basic-icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.125rem;
    flex-shrink: 0;
  }
  .pp-basic-icon--light { background: #f3f4f6; }
  .pp-basic-icon--dark  { background: rgba(255,255,255,0.05); }
  .pp-basic-label--light { font-weight: 600; color: #111827; }
  .pp-basic-label--dark  { font-weight: 600; color: #ffffff; }

  /* Interests tags */
  .pp-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .pp-tag {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 500;
    border-width: 1px;
    border-style: solid;
  }
  .pp-tag--light { border-color: #e5e7eb; background: #f9fafb; color: #1f2937; }
  .pp-tag--dark  { border-color: rgba(255,255,255,0.10); background: rgba(255,255,255,0.05); color: #fff; }

  /* Verification row */
  .pp-vrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    width: 100%;
    text-align: left;
  }
  .pp-vrow--clickable { transition: opacity 0.15s; }
  .pp-vrow--clickable:hover { opacity: 0.7; }
  .pp-vrow__label--light { color: #6b7280; }
  .pp-vrow__label--dark  { color: rgba(255,255,255,0.60); }
  .pp-vrow__value {
    font-size: 0.875rem;
    font-weight: 600;
  }
  .pp-vrow__value--success  { color: #10b981; }
  .pp-vrow__value--error    { color: #ef4444; }
  .pp-vrow__value--warning  { color: #f59e0b; }
  .pp-vrow__value--neutral--light { color: #9ca3af; }
  .pp-vrow__value--neutral--dark  { color: rgba(255,255,255,0.50); }

  /* Pref row */
  .pp-prefrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
  }
  .pp-prefrow__label--light { color: #6b7280; }
  .pp-prefrow__label--dark  { color: rgba(255,255,255,0.60); }
  .pp-prefrow__value--light { font-weight: 600; color: #111827; }
  .pp-prefrow__value--dark  { font-weight: 600; color: #ffffff; }

  /* Safety row */
  .pp-safety {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.25rem 0;
  }
  .pp-safety__label { font-size: 0.875rem; color: #9ca3af; }

  /* ── Fixed action bar ── */
  .pp-action-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem 2rem;
    border-top-width: 1px;
    border-top-style: solid;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .pp-action-bar--light { background: #ffffff; border-top-color: #f3f4f6; }
  .pp-action-bar--dark  { background: #0D0B1A; border-top-color: rgba(255,255,255,0.08); }

  .pp-action-btn {
    border-radius: 50%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s;
  }
  .pp-action-btn:hover  { transform: scale(1.10); }
  .pp-action-btn:active { transform: scale(0.95); }
  .pp-action-btn--sm { width: 3.125rem; height: 3.125rem; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
  .pp-action-btn--lg { width: 3.75rem;  height: 3.75rem;  box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
  .pp-action-btn--amber  { box-shadow: 0 6px 18px rgba(255,165,0,0.20); }
  .pp-action-btn--red    { box-shadow: 0 6px 18px rgba(255,68,88,0.20);  }
  .pp-action-btn--blue   { box-shadow: 0 6px 18px rgba(0,191,255,0.20);  }
  .pp-action-btn--green  { box-shadow: 0 6px 18px rgba(76,175,80,0.20);  }
  .pp-action-btn--purple { box-shadow: 0 6px 18px rgba(160,32,240,0.20); }

  /* ── Header menu ── */
  .pp-menu-wrap { position: relative; }
  .pp-menu-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.40);
    z-index: 40;
  }
  .pp-menu-dropdown {
    position: absolute;
    right: 0;
    top: 3rem;
    z-index: 50;
    width: 14rem;
    border-radius: 1rem;
    border-width: 1px;
    border-style: solid;
    box-shadow: 0 20px 40px rgba(0,0,0,0.20);
    overflow: hidden;
    animation: menuFadeIn 0.18s ease;
  }
  .pp-menu-dropdown--light { background: #ffffff; border-color: rgba(0,0,0,0.08); }
  .pp-menu-dropdown--dark  { background: #1A1A2E; border-color: rgba(255,255,255,0.10); }

  .pp-menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    transition: background 0.15s;
    text-align: left;
  }
  .pp-menu-item:hover { background: rgba(0,0,0,0.05); }
  .pp-menu-item--logout:hover { background: rgba(239,68,68,0.06); }

  .pp-menu-icon {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.625rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .pp-menu-icon--settings--light { background: #ede9fe; }
  .pp-menu-icon--settings--dark  { background: rgba(124,58,237,0.15); }
  .pp-menu-icon--logout  { background: rgba(239,68,68,0.12); }

  .pp-menu-item__title--light { font-size: 0.875rem; font-weight: 700; color: #111827; }
  .pp-menu-item__title--dark  { font-size: 0.875rem; font-weight: 700; color: #ffffff; }
  .pp-menu-item__title--logout { font-size: 0.875rem; font-weight: 700; color: #ef4444; }
  .pp-menu-item__sub--light { font-size: 0.75rem; color: #9ca3af; }
  .pp-menu-item__sub--dark  { font-size: 0.75rem; color: rgba(255,255,255,0.50); }

  .pp-menu-divider {
    margin: 0 0.75rem;
    height: 1px;
  }
  .pp-menu-divider--light { background: rgba(0,0,0,0.07); }
  .pp-menu-divider--dark  { background: rgba(255,255,255,0.08); }

  .pp-menu-chevron--light { color: #d1d5db; }
  .pp-menu-chevron--dark  { color: rgba(255,255,255,0.40); }
`;

// ─── HeaderMenu ───────────────────────────────────────────────────────────────
const HeaderMenu = ({ isDark, onSettings, onLogout }: { isDark: boolean; onSettings: () => void; onLogout: () => void }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const theme = isDark ? "dark" : "light";

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="pp-menu-wrap" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="pp-icon-btn"
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="5"  r="1.2" fill="white" />
          <circle cx="12" cy="12" r="1.2" fill="white" />
          <circle cx="12" cy="19" r="1.2" fill="white" />
        </svg>
      </button>

      {open && (
        <>
          <div className="pp-menu-overlay" onClick={() => setOpen(false)} />
          <div className={`pp-menu-dropdown pp-menu-dropdown--${theme}`}>
            {/* Settings */}
            <button
              className="pp-menu-item"
              onClick={() => { setOpen(false); onSettings?.(); }}
            >
              <span className={`pp-menu-icon pp-menu-icon--settings--${theme}`}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </span>
              <div style={{ flex: 1 }}>
                <p className={`pp-menu-item__title--${theme}`}>Settings</p>
                <p className={`pp-menu-item__sub--${theme}`}>Account, privacy &amp; more</p>
              </div>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`pp-menu-chevron--${theme}`}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div className={`pp-menu-divider pp-menu-divider--${theme}`} />

            {/* Logout */}
            <button
              className="pp-menu-item pp-menu-item--logout"
              onClick={() => { setOpen(false); onLogout?.(); }}
            >
              <span className="pp-menu-icon pp-menu-icon--logout">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </span>
              <div style={{ flex: 1 }}>
                <p className="pp-menu-item__title--logout">Log Out</p>
                <p className={`pp-menu-item__sub--${theme}`}>Sign out of your account</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Section = ({ isDark, title, children }: { isDark: boolean; title: string; children: React.ReactNode }) => {
  const theme = isDark ? "dark" : "light";
  return (
    <div className={`pp-section pp-section--${theme}`}>
      <h2 className={`pp-section__title pp-section__title--${theme}`}>{title}</h2>
      {children}
    </div>
  );
};

const BasicItem = ({ isDark, icon, label }: { isDark: boolean; icon: string; label: string }) => {
  const theme = isDark ? "dark" : "light";
  return (
    <div className="pp-basic-item">
      <span className={`pp-basic-icon pp-basic-icon--${theme}`}>{icon}</span>
      <span className={`pp-basic-label--${theme}`}>{label}</span>
    </div>
  );
};

const VerificationRow = ({ isDark, label, value, status, onClick }: { isDark: boolean; label: string; value: string; status: string; onClick?: () => void }) => {
  const theme = isDark ? "dark" : "light";

  let valueClass = "pp-vrow__value ";
  if (status === "success") valueClass += "pp-vrow__value--success";
  else if (status === "error") valueClass += "pp-vrow__value--error";
  else if (status === "warning") valueClass += "pp-vrow__value--warning";
  else valueClass += `pp-vrow__value--neutral--${theme}`;

  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={`pp-vrow${onClick ? " pp-vrow--clickable" : ""}`}
      onClick={onClick}
    >
      <span className={`pp-vrow__label--${theme}`}>{label}</span>
      <span className={valueClass}>{value}</span>
    </Tag>
  );
};

const PrefRow = ({ isDark, label, value }: { isDark: boolean; label: string; value: string }) => {
  const theme = isDark ? "dark" : "light";
  return (
    <div className="pp-prefrow">
      <span className={`pp-prefrow__label--${theme}`}>{label}</span>
      <span className={`pp-prefrow__value--${theme}`}>{value}</span>
    </div>
  );
};

const colorToClass = (color: string) => {
  switch (color.toLowerCase()) {
    case "#ffa500": return "amber";
    case "#ff4458": return "red";
    case "#00bfff": return "blue";
    case "#4caf50": return "green";
    case "#a020f0": return "purple";
    default:        return "";
  }
};

const ActionBtn = ({ children, onClick, size, color }: { children: React.ReactNode; onClick?: () => void; size: string; color: string }) => {
  const sizeClass  = size === "lg" ? "pp-action-btn--lg" : "pp-action-btn--sm";
  const colorClass = colorToClass(color);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pp-action-btn ${sizeClass}${colorClass ? ` pp-action-btn--${colorClass}` : ""}`}
    >
      {children}
    </button>
  );
};

export default function ProfilePage({ user, isDark = false, onBack, onSettings, onLogout, onDislike, onFavorite, onLike, onVerifyEmail, onKyc, onOnboarding }: ProfilePageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const profileImages = getProfileImages(user);
  const theme = isDark ? "dark" : "light";

  const interests =
    user?.preferences?.styles && user.preferences.styles.length > 0
      ? user.preferences.styles
      : ["☕ Coffee", "✈️ Travel", "🎵 Music", "📚 Reading", "🏃‍♀️ Running", "🍕 Foodie", "🎨 Art", "🐕 Dogs"];

  const age = calculateAge(user?.dateOfBirth);

  return (
    <div className={`pp-root pp-root--${theme}`}>
      <style>{styles}</style>

      <div className="pp-scroll">
        {/* ── Image Carousel ── */}
        <div className="pp-carousel">
          <Image
            src={profileImages[currentImageIndex]}
            alt="Profile"
            fill
            unoptimized
            className="pp-carousel__img"
          />
          <div className="pp-carousel__gradient" />

          {/* Header */}
          <div className="pp-header">
            <button onClick={onBack} className="pp-icon-btn" aria-label="Go back">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
            <HeaderMenu isDark={isDark} onSettings={onSettings} onLogout={onLogout} />
          </div>

          {/* Indicators */}
          <div className="pp-indicators">
            {profileImages.map((_: string, i: number) => (
              <button
                key={i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={() => setCurrentImageIndex(i)}
                className={`pp-indicator${i === currentImageIndex ? " pp-indicator--active" : ""}`}
              />
            ))}
          </div>

          {/* Name + badges + location */}
          <div className="pp-name-area">
            <div className="pp-name-row">
              <h1 className="pp-name">
                {user?.name ? `${user.name}${age ? `, ${age}` : ""}` : "Sarah, 28"}
              </h1>

              {user ? (
                user.emailVerified ? (
                  <span className="pp-badge pp-badge--emerald">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981">
                      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </span>
                ) : (
                  <button onClick={onVerifyEmail} className="pp-badge pp-badge--emerald" title="Verify email">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981">
                      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </button>
                )
              ) : null}

              {user?.kyc?.status === "approved" ? (
                <span className="pp-badge pp-badge--emerald">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              ) : (
                <button onClick={onKyc} className="pp-badge pp-badge--amber" title="KYC pending">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </button>
              )}
            </div>

            <div className="pp-location">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>{user?.city || "2 miles away"}</span>
            </div>
          </div>

          {/* Tap areas */}
          <button
            type="button"
            aria-label="Previous image"
            className="pp-tap-prev"
            onClick={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
          />
          <button
            type="button"
            aria-label="Next image"
            className="pp-tap-next"
            onClick={() => setCurrentImageIndex((i) => Math.min(profileImages.length - 1, i + 1))}
          />
        </div>

        {/* ── About ── */}
        <Section isDark={isDark} title={`About ${user?.name || "Sarah"}`}>
          <p className={`pp-bio pp-muted--${theme}`}>
            {user?.bio ||
              "Adventure seeker and coffee enthusiast ☕ Love exploring new places and trying new restaurants. Looking for someone who can keep up with my spontaneous weekend trips!"}
          </p>
        </Section>

        {/* ── My Basics ── */}
        <Section isDark={isDark} title="My Basics">
          <BasicItem isDark={isDark} icon="📍" label={user?.city ? `Lives in ${user.city}` : "Lives in Los Angeles"} />
          <BasicItem isDark={isDark} icon="📏" label={user?.height || `5'6" (168 cm)`} />
        </Section>

        {/* ── Looking For ── */}
        <Section isDark={isDark} title="Looking For">
          <p className={`pp-bio pp-muted--${theme}`}>
            A long-term relationship with someone genuine, adventurous, and emotionally intelligent
          </p>
        </Section>

        {/* ── Interests ── */}
        <Section isDark={isDark} title="Interests">
          <div className="pp-tags">
            {interests.map((tag: string, i: number) => (
              <span key={i} className={`pp-tag pp-tag--${theme}`}>{tag}</span>
            ))}
          </div>
        </Section>

        {/* ── Verification ── */}
        <Section isDark={isDark} title="Verification">
          <VerificationRow
            isDark={isDark}
            label="Email verified"
            value={user?.emailVerified ? "Yes" : "No"}
            status={user?.emailVerified ? "success" : "error"}
            onClick={!user?.emailVerified ? onVerifyEmail : undefined}
          />
          <VerificationRow
            isDark={isDark}
            label="KYC status"
            value={user?.kyc?.status || "not_submitted"}
            status={
              user?.kyc?.status === "approved" ? "success"
              : user?.kyc?.status === "pending"  ? "warning"
              : "neutral"
            }
            onClick={onKyc}
          />
          <VerificationRow
            isDark={isDark}
            label="Onboarding"
            value={user?.onboarding?.completed ? "Completed" : "Incomplete"}
            status={user?.onboarding?.completed ? "success" : "neutral"}
            onClick={onOnboarding}
          />
        </Section>

        {/* ── Preferences ── */}
        <Section isDark={isDark} title="Preferences">
          <PrefRow
            isDark={isDark}
            label="Age range"
            value={
              user?.preferences?.ageRange
                ? `${user.preferences.ageRange.min} – ${user.preferences.ageRange.max}`
                : "18 – 100"
            }
          />
          <PrefRow
            isDark={isDark}
            label="Max distance"
            value={user?.preferences?.maxDistance ? `${user.preferences.maxDistance} km` : "50 km"}
          />
          {user?.preferences?.styles && user.preferences.styles.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              <p className={`pp-muted--${theme}`} style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>Styles</p>
              <div className="pp-tags">
                {user.preferences.styles.map((s: string, i: number) => (
                  <span key={i} className={`pp-tag pp-tag--${theme}`}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* ── Safety ── */}
        <div className="pp-safety">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span className="pp-safety__label">Safety &amp; Report</span>
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className={`pp-action-bar pp-action-bar--${theme}`}>
        <ActionBtn onClick={onBack}     size="sm" color="#FFA500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFA500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 14 4 9 9 4" />
            <path d="M20 20v-7a4 4 0 00-4-4H4" />
          </svg>
        </ActionBtn>
        <ActionBtn onClick={onDislike}  size="lg" color="#FF4458">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4458" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </ActionBtn>
        <ActionBtn onClick={onFavorite} size="sm" color="#00BFFF">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#00BFFF">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </ActionBtn>
        <ActionBtn onClick={onLike}     size="lg" color="#4CAF50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#4CAF50">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </ActionBtn>
        <ActionBtn onClick={() => {}} size="sm" color="#A020F0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#A020F0">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </ActionBtn>
      </div>
    </div>
  );
}