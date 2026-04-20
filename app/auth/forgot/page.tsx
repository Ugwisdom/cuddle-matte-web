'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from './forgot.module.css';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'code' | 'confirm'>('email');
  const [verificationCode, setVerificationCode] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

      const response = await fetch(`${apiBase}/auth/email/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || data?.error?.message || data?.error || 'Failed to send verification code');
        return;
      }

      setSuccess('Verification code sent to your email!');
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

      const response = await fetch(`${apiBase}/auth/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(),
          code: verificationCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || data?.error?.message || data?.error || 'Invalid verification code');
        return;
      }

      setSuccess('Email verified! Redirecting to change password...');
      setStep('confirm');

      // Store email in session for password reset page
      sessionStorage.setItem('resetEmail', email.toLowerCase().trim());

      // Redirect to password reset after 2 seconds
      setTimeout(() => {
        router.push('/auth/changepassword');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.back()}
          title="Go back"
        >
          ←
        </button>
        <h1 className={styles.headerTitle}>Forgot Password</h1>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.scrollView}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}>🔑</div>
          <h2 className={styles.heroTitle}>
            {step === 'email' ? 'Reset Your Password' : step === 'code' ? 'Enter Code' : 'Email Verified'}
          </h2>
          <p className={styles.heroSubtitle}>
            {step === 'email'
              ? 'Enter your email address and we\'ll send you a verification code'
              : step === 'code'
              ? 'Check your email for the verification code'
              : 'Your email has been verified. You can now change your password.'}
          </p>
        </div>

        {/* Info Card */}
        <div className={styles.infoCard}>
          <div className={styles.infoIcon}>ℹ️</div>
          <p className={styles.infoText}>
            {step === 'email'
              ? 'We\'ll send a verification code to your email address'
              : step === 'code'
              ? 'The code will be valid for 10 minutes'
              : 'Redirecting to password change page...'}
          </p>
        </div>

        {/* Alerts */}
        {error && <div className={styles.alert} style={{ borderColor: '#ef4444' }}>{error}</div>}
        {success && <div className={styles.alert} style={{ borderColor: '#22c55e' }}>{success}</div>}

        {/* Step 1: Email Entry */}
        {step === 'email' && (
          <div className={styles.formSection}>
            <form onSubmit={handleRequestCode}>
              <div className={styles.inputContainer}>
                <label className={styles.inputLabel}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>✉️</span>
                  <input
                    className={styles.input}
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`${styles.submitButton} ${
                  !email.trim() || loading ? styles.submitButtonDisabled : ''
                }`}
                disabled={!email.trim() || loading}
              >
                <span>📧</span>
                <span>{loading ? 'Sending…' : 'Send Code'}</span>
              </button>

              {/* Back to Login */}
              <button
                type="button"
                className={styles.backToLogin}
                onClick={() => router.push('/auth/login')}
              >
                Back to Sign In
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Code Verification */}
        {step === 'code' && (
          <div className={styles.formSection}>
            <form onSubmit={handleVerifyCode}>
              <div className={styles.inputContainer}>
                <label className={styles.inputLabel}>Verification Code</label>
                <p className={styles.helperText}>
                  Enter the 6-digit code sent to {email}
                </p>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>🔐</span>
                  <input
                    className={styles.input}
                    placeholder="Enter code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`${styles.submitButton} ${
                  !verificationCode.trim() || loading ? styles.submitButtonDisabled : ''
                }`}
                disabled={!verificationCode.trim() || loading}
              >
                <span>✓</span>
                <span>{loading ? 'Verifying…' : 'Verify Code'}</span>
              </button>

              {/* Change Email */}
              <button
                type="button"
                className={styles.backToLogin}
                onClick={() => setStep('email')}
              >
                Use Different Email
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <div className={styles.confirmSection}>
            <div className={styles.confirmContent}>
              <div className={styles.checkmarkIcon}>✓</div>
              <h3 className={styles.confirmTitle}>Email Verified!</h3>
              <p className={styles.confirmText}>
                Your email has been verified successfully. 
                You can now change your password.
              </p>
            </div>
          </div>
        )}

        <div className={styles.bottomPadding} />
      </div>
    </div>
  );
}
