"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

export default function SignUpPage() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (fullName.trim().length < 2) return "Name must be at least 2 characters.";
    if (!email.trim()) return "Please enter your email address.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address.";
    if (!password) return "Please enter a password.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password)) return "Password must include at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must include at least one number.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!agreed) return "You must agree to the Terms of Service and Privacy Policy.";
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      const resp = await apiClient.postRegister({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (!resp.ok) {
        const errData = resp.error as unknown as Record<string, unknown>;
        if (errData["emailAlreadyExists"] || resp.status === 409) {
          return setError("An account with this email already exists. Try signing in.");
        }
        return setError(
          String(errData["message"] ?? "Registration failed. Please try again.")
        );
      }

      const _data = resp.data as unknown as Record<string, unknown> | undefined;
      const requiresVerification = _data?.["emailVerificationRequired"];

      if (requiresVerification) {
        sessionStorage.setItem("pendingEmailVerification", email.trim().toLowerCase());
        return router.replace("/auth/twofactor");
      }

      const token = _data?.["token"] as string | undefined;
      const user = _data?.["user"] as Record<string, unknown> | undefined;
      await setAuth(token ?? null, user ?? null);
      router.replace("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/home" });
  };

  /* Password strength indicator */
  const getPasswordStrength = (): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: "", color: "transparent" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "#e8527a" };
    if (score <= 3) return { level: 2, label: "Fair", color: "#f0a050" };
    return { level: 3, label: "Strong", color: "#5ec97a" };
  };

  const strength = getPasswordStrength();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-root {
          min-height: 100svh;
          background: #0d0509;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Background blobs */
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
          overflow-y: auto;
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

        /* Perks list */
        .perks-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 2rem;
        }
        .perk-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .perk-icon {
          width: 22px; height: 22px;
          border-radius: 6px;
          background: rgba(232,82,122,0.15);
          border: 1px solid rgba(232,82,122,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .perk-icon svg { color: #e8527a; }
        .perk-text {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
        }
        .perk-text strong {
          color: rgba(255,255,255,0.7);
          font-weight: 500;
          display: block;
          margin-bottom: 1px;
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

        /* Form card */
        .form-card {
          width: 100%;
          max-width: 440px;
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
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .error-banner svg { flex-shrink: 0; margin-top: 1px; }

        /* Field */
        .field { margin-bottom: 1.125rem; }
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 1.125rem;
        }
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
          min-width: 0;
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
          flex-shrink: 0;
        }
        .toggle-btn:hover { color: #f093aa; }

        /* Password strength */
        .strength-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          margin-bottom: 4px;
        }
        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }
        .strength-bar {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.1);
          transition: background 0.3s;
        }
        .strength-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          font-weight: 500;
          transition: color 0.3s;
        }

        /* Checkbox */
        .checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 1.5rem;
        }
        .checkbox-wrap {
          position: relative;
          flex-shrink: 0;
          width: 18px; height: 18px;
          margin-top: 1px;
        }
        .checkbox-wrap input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          width: 100%; height: 100%;
          cursor: pointer;
          margin: 0;
          z-index: 1;
        }
        .checkbox-visual {
          width: 18px; height: 18px;
          border-radius: 5px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, border-color 0.2s;
          pointer-events: none;
        }
        .checkbox-wrap input:checked ~ .checkbox-visual {
          background: linear-gradient(135deg, #e8527a, #b5214e);
          border-color: transparent;
        }
        .checkbox-text {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          line-height: 1.5;
        }
        .checkbox-text a {
          color: #e8527a;
          text-decoration: none;
          transition: color 0.15s;
        }
        .checkbox-text a:hover { color: #f093aa; }

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

        /* Sign-in link */
        .signin-link {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
        }
        .signin-link a {
          color: #e8527a;
          text-decoration: none;
          margin-left: 4px;
          transition: color 0.15s;
        }
        .signin-link a:hover { color: #f093aa; }

        /* Trust strip */
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

        @media (max-width: 768px) {
          .left-panel { display: none; }
          .right-panel { padding: 1.5rem 1rem; align-items: flex-start; padding-top: 3rem; }
          .form-card { border-radius: 20px; padding: 2rem 1.5rem; }
        }
      `}</style>

      <main className="signup-root">
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
              <p className="eyebrow">New member</p>
              <h1>Join the<br /><em>warmest</em><br />corner.</h1>
              <p>Become part of a community that genuinely cares.</p>
            </div>

            <ul className="perks-list">
              <li className="perk-item">
                <div className="perk-icon">
                  <HeartIcon />
                </div>
                <div className="perk-text">
                  <strong>Genuine connections</strong>
                  A safe space to meet people who get it.
                </div>
              </li>
              <li className="perk-item">
                <div className="perk-icon">
                  <ShieldIcon />
                </div>
                <div className="perk-text">
                  <strong>Private by design</strong>
                  Your data is yours. Always encrypted, never sold.
                </div>
              </li>
              <li className="perk-item">
                <div className="perk-icon">
                  <SparkleIcon />
                </div>
                <div className="perk-text">
                  <strong>Curated experiences</strong>
                  Events, threads, and moments crafted for you.
                </div>
              </li>
            </ul>
          </div>

          <div>
            <div className="testimonial" style={{ marginBottom: "1.5rem" }}>
              <p>Signing up was the best decision I made this year. I found my people here.</p>
              <div className="testimonial-author">
                <div className="author-avatar">JL</div>
                <div className="author-info">
                  <div className="name">Jamie L.</div>
                  <div className="role">Member since 2023</div>
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
              <h2 className="title">Create your account</h2>
              <p className="subtitle">It only takes a moment.</p>
            </div>

            <form onSubmit={handleSignUp} noValidate>
              {error && (
                <div className="error-banner">
                  <AlertIcon />
                  {error}
                </div>
              )}

              {/* Full name */}
              <div className="field">
                <label className="field-label">Full name</label>
                <div className="input-wrap">
                  <UserIcon />
                  <input
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="field">
                <label className="field-label">Email address</label>
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

              {/* Password */}
              <div className="field">
                <label className="field-label">Password</label>
                <div className="input-wrap">
                  <LockIcon />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
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
                {/* Strength indicator */}
                {password && (
                  <div className="strength-row">
                    <div className="strength-bars">
                      {[1, 2, 3].map((lvl) => (
                        <div
                          key={lvl}
                          className="strength-bar"
                          style={{
                            background: strength.level >= lvl ? strength.color : undefined,
                          }}
                        />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="field">
                <label className="field-label">Confirm password</label>
                <div
                  className="input-wrap"
                  style={
                    confirmPassword && confirmPassword !== password
                      ? { borderColor: "rgba(232,82,122,0.6)" }
                      : confirmPassword && confirmPassword === password
                      ? { borderColor: "rgba(94,201,122,0.5)" }
                      : {}
                  }
                >
                  <LockIcon />
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowConfirmPw((v) => !v)}
                  >
                    {showConfirmPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="checkbox-row">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <div className="checkbox-visual">
                    {agreed && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </label>
                <p className="checkbox-text">
                  I agree to the{" "}
                  <Link href="/support/terms">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/support/privacy">Privacy Policy</Link>
                </p>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating account…" : "Create account →"}
              </button>

              <div className="divider">
                <div className="divider-line" />
                <span>or continue with</span>
                <div className="divider-line" />
              </div>

              <button
                type="button"
                className="btn-google"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <div className="google-chip">G</div>
                Sign up with Google
              </button>

              <p className="signin-link">
                Already have an account?
                <Link href="/auth/login">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Icons ──────────────────────────────────────────────── */

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
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

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: "#f093aa" }}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M8 13.5S2 9.5 2 5.5A3.5 3.5 0 018 3.5 3.5 3.5 0 0114 5.5c0 4-6 8-6 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L3 4.5v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6v-4L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4.2 4.2l2.1 2.1M9.7 9.7l2.1 2.1M4.2 11.8l2.1-2.1M9.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}