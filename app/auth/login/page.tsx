"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

export default function SignInPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password)
      return setError("Please enter your email and password.");
    if (!/\S+@\S+\.\S+/.test(email))
      return setError("Please enter a valid email address.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    try {
      setLoading(true);
      const resp = await apiClient.postLogin(email.trim().toLowerCase(), password);

      if (!resp.ok) {
        if (
          resp.status === 403 ||
          Boolean((resp.error as unknown as Record<string, unknown>)["emailVerificationRequired"])
        ) {
          sessionStorage.setItem("pendingEmailVerification", email.trim());
          return router.replace("/auth/twofactor");
        }
        return setError(
          String((resp.error as unknown as Record<string, unknown>)["message"] ?? "Sign in failed.")
        );
      }

      const _data = resp.data as unknown as Record<string, unknown> | undefined;
      const token = _data ? (_data["token"] as string | undefined) : undefined;
      const user = _data ? (_data["user"] as Record<string, unknown> | undefined) : undefined;
      await setAuth(token ?? null, user ?? null);
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signIn("google", { 
        callbackUrl: "/home",
        redirect: true,
      });
      if (result?.error) {
        setError("Google sign-in failed. Please try again.");
      }
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .signin-root {
          min-height: 100svh;
          background: #0d0509;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Abstract background blobs */
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .bg-blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #4a0c24 0%, transparent 70%);
          top: -100px; left: -100px;
          animation: drift1 18s ease-in-out infinite;
        }
        .bg-blob-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #1e0533 0%, transparent 70%);
          bottom: -60px; right: 200px;
          animation: drift2 22s ease-in-out infinite;
        }
        .bg-blob-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, #6b1a3a 0%, transparent 70%);
          top: 40%; right: -50px;
          animation: drift3 15s ease-in-out infinite;
        }

        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-30px, -20px); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -40px); }
        }

        /* Grain overlay */
        .grain {
          position: fixed; inset: 0; z-index: 1;
          pointer-events: none;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* Layout */
        .left-panel {
          position: relative; z-index: 2;
          width: 420px;
          flex-shrink: 0;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid rgba(255,255,255,0.06);
        }

        .right-panel {
          position: relative; z-index: 2;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
        }

        /* Logo */
        .logo-mark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .logo-diamond {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #e8527a, #b5214e);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          display: flex; align-items: center; justify-content: center;
        }
        .logo-diamond span {
          font-size: 10px; font-weight: 500;
          color: #fff; letter-spacing: 0.05em;
          /* offset for clip-path visual centering */
          margin-top: 1px;
        }
        .logo-name {
          font-family: 'DM Serif Display', serif;
          font-size: 16px;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.01em;
        }

        /* Left panel headline */
        .left-headline {
          margin-top: 3rem;
        }
        .left-headline .eyebrow {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #e8527a;
          margin-bottom: 1.25rem;
        }
        .left-headline h1 {
          font-family: 'DM Serif Display', serif;
          font-size: 48px;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 1rem;
        }
        .left-headline h1 em {
          color: #e8527a;
          font-style: italic;
        }
        .left-headline p {
          font-size: 14px;
          color: rgba(255,255,255,0.38);
          line-height: 1.7;
          max-width: 260px;
        }

        /* Testimonial card */
        .testimonial {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.25rem 1.5rem;
          position: relative;
        }
        .testimonial::before {
          content: '"';
          font-family: 'DM Serif Display', serif;
          font-size: 60px;
          color: #e8527a;
          opacity: 0.35;
          position: absolute;
          top: -8px; left: 18px;
          line-height: 1;
        }
        .testimonial p {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.65;
          margin-bottom: 1rem;
          padding-top: 0.5rem;
        }
        .testimonial-author {
          display: flex; align-items: center; gap: 10px;
        }
        .author-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #6b1a3a, #e8527a);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 500; color: #fff;
          flex-shrink: 0;
        }
        .author-info .name {
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.75);
        }
        .author-info .role {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
        }

        /* Right panel / Form card */
        .form-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.5rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .form-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .form-header {
          margin-bottom: 2rem;
        }
        .form-header .title {
          font-family: 'DM Serif Display', serif;
          font-size: 28px;
          color: #fff;
          margin-bottom: 6px;
        }
        .form-header .subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
        }

        /* Error */
        .error-banner {
          background: rgba(232,82,122,0.12);
          border: 1px solid rgba(232,82,122,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 1.25rem;
          font-size: 13px;
          color: #f093aa;
        }

        /* Field */
        .field { margin-bottom: 1.125rem; }
        .field-label {
          display: block;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #e8527a;
          margin-bottom: 7px;
        }
        .input-wrap {
          display: flex;
          align-items: center;
          height: 46px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 0 14px;
          gap: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .input-wrap:focus-within {
          border-color: rgba(232,82,122,0.6);
          background: rgba(232,82,122,0.05);
        }
        .input-wrap svg { flex-shrink: 0; color: rgba(255,255,255,0.25); }
        .input-wrap input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
        }
        .input-wrap input::placeholder { color: rgba(255,255,255,0.22); }
        .toggle-btn {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #e8527a;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.15s;
        }
        .toggle-btn:hover { color: #f093aa; }

        /* Links row */
        .links-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -4px;
          margin-bottom: 1.5rem;
        }
        .links-row a {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.15s;
        }
        .links-row a:hover { color: rgba(255,255,255,0.6); }
        .links-row a.accent { color: #e8527a; }
        .links-row a.accent:hover { color: #f093aa; }

        /* Primary button */
        .btn-primary {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #e8527a, #b5214e);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute; inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }
        .btn-primary:hover::after { background: rgba(255,255,255,0.08); }
        .btn-primary:active { transform: scale(0.99); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        /* Divider */
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 1.25rem 0;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider span {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.05em;
        }

        /* Google button */
        .btn-google {
          width: 100%;
          height: 46px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          font-weight: 400;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .btn-google:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.9);
        }
        .btn-google:disabled { opacity: 0.5; cursor: not-allowed; }
        .google-chip {
          width: 20px; height: 20px; border-radius: 50%;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          color: #4285F4; flex-shrink: 0;
        }

        /* Scrolling badge strip on bottom of left panel */
        .trust-strip {
          display: flex; gap: 8px; overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .trust-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .trust-badge .dot { width: 5px; height: 5px; border-radius: 50%; background: #e8527a; }
        .trust-badge span {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.04em;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .left-panel { display: none; }
          .right-panel { padding: 1.5rem 1rem; }
          .form-card { border-radius: 20px; padding: 2rem 1.5rem; }
        }
      `}</style>

      <main className="signin-root">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
        <div className="grain" />

        {/* Left panel */}
        <aside className="left-panel">
          <div>
            <Link href="/" className="logo-mark">
              <div className="logo-diamond"><span>cm</span></div>
              <span className="logo-name">CuddleMatte</span>
            </Link>

            <div className="left-headline">
              <p className="eyebrow">Member portal</p>
              <h1>Your space,<br /><em>your</em><br />people.</h1>
              <p>A warm community built for connection, creativity, and comfort.</p>
            </div>
          </div>

          <div>
            <div className="testimonial" style={{ marginBottom: "1.5rem" }}>
              <p>Coming back here always feels like coming home. The community is everything.</p>
              <div className="testimonial-author">
                <div className="author-avatar">MK</div>
                <div className="author-info">
                  <div className="name">Margot K.</div>
                  <div className="role">Member since 2022</div>
                </div>
              </div>
            </div>

            <div className="trust-strip">
              {["Verified secure", "10k+ members", "Always private", "Loved daily"].map((t) => (
                <div key={t} className="trust-badge">
                  <div className="dot" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right panel */}
        <div className="right-panel">
          <div className={`form-card${mounted ? " visible" : ""}`}>
            <div className="form-header">
              <h2 className="title">Welcome back</h2>
              <p className="subtitle">Sign in to continue your journey.</p>
            </div>

            <form onSubmit={handleSignIn} noValidate>
              {error && <div className="error-banner">{error}</div>}

              <div className="field">
                <label className="field-label">Email</label>
                <div className="input-wrap">
                  <MailIcon />
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <div className="input-wrap">
                  <LockIcon />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="links-row">
                <Link href="/auth/forgot" className="accent">Forgot password?</Link>
                <span>
                  No account?
                  <Link href="/auth/signup" className="accent">Create one</Link>
                </span>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Signing in…" : "Sign in →"}
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span>or continue with</span>
                <div className="divider-line" />
              </div>

              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <div className="google-chip">G</div>
                Continue with Google
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

function MailIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 6L8 10.5L15 6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="7" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}