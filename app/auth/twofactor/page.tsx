'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import styles from './twofactor.module.css';

const CODE_LENGTH = 6;

export default function TwoFactor() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [focused, setFocused] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if there's a pending email verification in sessionStorage
    const pending = typeof window !== 'undefined' ? sessionStorage.getItem('pendingEmailVerification') : null;
    if (pending) {
      setEmail(pending);
      sessionStorage.removeItem('pendingEmailVerification');
    }
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const handleCodeChange = (val: string, idx: number) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, "").slice(0, CODE_LENGTH).split("");
      const next = [...code];
      digits.forEach((d, i) => {
        if (idx + i < CODE_LENGTH) next[idx + i] = d;
      });
      setCode(next);
      const jumpTo = Math.min(idx + digits.length, CODE_LENGTH - 1);
      inputRefs.current[jumpTo]?.focus();
      return;
    }
    const digit = val.replace(/\D/g, "");
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < CODE_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const fullCode = code.join("");

  // Auto-submit when the user finishes entering the code (convenience)
  React.useEffect(() => {
    if (fullCode.length === CODE_LENGTH) {
      // small timeout so UI updates (focus/filled state) render first
      const t = setTimeout(() => {
        handleVerify().catch(() => {});
      }, 120);
      return () => clearTimeout(t);
    }
  }, [fullCode]);

  const handleVerify = async () => {
    setError(null);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    if (fullCode.length < CODE_LENGTH) {
      setError(`Please enter all ${CODE_LENGTH} digits`);
      return;
    }

    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      
      const response = await fetch(`${apiBase}/auth/email/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error?.message || data?.message || 'Verification failed');
        return;
      }

      const { token, user } = data;
      
      // Store auth token
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token || '');
        if (user) localStorage.setItem('authUser', JSON.stringify(user));
      }

      setSuccess('Email verified successfully!');
      
      // Redirect based on onboarding status
      setTimeout(() => {
        if (data?.onboardingRequired) {
          router.replace('/onboarding/ageverification');
        } else if (data?.kycRequired) {
          router.replace('/auth/kyc');
        } else {
          router.replace('/home');
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    if (resendIn > 0) return;

    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      
      const response = await fetch(`${apiBase}/auth/email/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || 'Failed to send code');
        return;
      }

      setSuccess(data?.message || 'Code sent to your email');
      setResendIn(60);
      
      // Clear success message after a few seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToGmail = () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      const useGmail = window.confirm(
        'For best deliverability, use a Gmail address. Send to your current address anyway?'
      );
      if (!useGmail) return;
    }
    handleResend();
  };

  return (
    <div className={styles.root}>
      <div className={styles.glow} />
      
      <div className={styles.scroll}>
        {/* Brand */}
        <div className={styles.brandWrap}>
          <div className={styles.brandMark}>
            <span className={styles.brandMarkText}>cm</span>
          </div>
        </div>

        {/* Heading */}
        <div className={styles.headingWrap}>
          <div className={styles.iconBig}>📩</div>
          <h1 className={styles.heading}>Verify your email</h1>
          <p className={styles.subheading}>
            Enter the {CODE_LENGTH}-digit code we sent to<br />
            <span className={styles.emailHighlight}>{email || 'your email'}</span>
          </p>
        </div>

        {/* Alerts */}
        {error && <div className={styles.alert} style={{ borderColor: '#ef4444' }}>{error}</div>}
        {success && <div className={styles.alert} style={{ borderColor: '#22c55e' }}>{success}</div>}

        {/* Email field */}
        <div className={styles.fieldWrap}>
          <label className={styles.fieldLabel}>EMAIL</label>
          <div className={`${styles.inputWrap} ${focused === -1 ? styles.inputFocused : ''}`}>
            <span className={styles.inputIcon}>✉</span>
            <input
              className={styles.input}
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(-1)}
              onBlur={() => setFocused(null)}
              disabled={loading}
            />
          </div>
        </div>

        {/* OTP boxes */}
        <div className={styles.otpRow}>
          {Array(CODE_LENGTH)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className={`${styles.otpBox} ${
                  focused === idx ? styles.otpBoxFocused : ''
                } ${code[idx] ? styles.otpBoxFilled : ''}`}
              >
                <input
                  ref={(r) => {
                    inputRefs.current[idx] = r;
                  }}
                  className={styles.otpInput}
                  value={code[idx]}
                  onChange={(e) => handleCodeChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyPress(e, idx)}
                  onFocus={() => setFocused(idx)}
                  onBlur={() => setFocused(null)}
                  type="text"
                  inputMode="numeric"
                  maxLength={CODE_LENGTH}
                  disabled={loading}
                />
              </div>
            ))}
        </div>

        {/* Verify button */}
        <button
          className={`${styles.primaryBtn} ${
            loading || fullCode.length < CODE_LENGTH ? styles.btnDisabled : ''
          }`}
          onClick={handleVerify}
          disabled={loading || fullCode.length < CODE_LENGTH}
        >
          {loading ? 'Verifying...' : 'Verify →'}
        </button>

        {/* Resend button */}
        <button
          className={`${styles.gmailBtn} ${loading ? styles.btnDisabled : ''}`}
          onClick={handleSendToGmail}
          disabled={loading}
        >
          <span className={styles.gmailIcon}>G</span>
          <span className={styles.gmailText}>Send code to Gmail</span>
        </button>

        {/* Resend hint */}
        <div className={styles.resendRow}>
          <span className={styles.resendHint}>Didn't receive a code? </span>
          <button
            className={`${styles.resendLink} ${
              resendIn > 0 || loading ? styles.resendDisabled : ''
            }`}
            onClick={handleResend}
            disabled={resendIn > 0 || loading}
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend'}
          </button>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerText}>Back to </span>
          <Link href="/auth/login" className={styles.footerLink}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

