'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from './changepassword.module.css';

const PasswordRequirement = ({ met, label }: { met: boolean; label: string }) => (
  <div className={styles.requirementItem}>
    <span className={styles.requirementIcon}>
      {met ? '✓' : '○'}
    </span>
    <span className={`${styles.requirementText} ${met ? styles.requirementTextMet : ''}`}>
      {label}
    </span>
  </div>
);

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const [resetEmail, setResetEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check if coming from forgot password flow
    if (typeof window !== 'undefined') {
      const email = sessionStorage.getItem('resetEmail');
      if (email) {
        setResetEmail(email);
        // Clear for security
        sessionStorage.removeItem('resetEmail');
      }
    }
  }, []);

  const checkPasswordStrength = (password: string) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    checkPasswordStrength(text);
  };

  const getPasswordStrength = () => {
    const count = Object.values(passwordCriteria).filter(Boolean).length;
    if (count <= 2) return { label: 'Weak', color: '#F44336', width: '33%' };
    if (count <= 4) return { label: 'Medium', color: '#FF9800', width: '66%' };
    return { label: 'Strong', color: '#4CAF50', width: '100%' };
  };

  const isFormValid = () =>
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword &&
    Object.values(passwordCriteria).every(Boolean);

  const handleChangePassword = async () => {
    setError(null);
    
    if (!isFormValid()) {
      setError('Please fill all fields correctly');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    // Check if this is a forgot password reset flow (no token but has resetEmail)
    if (!token && !resetEmail) {
      setError('You must be signed in to change your password');
      return;
    }

    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      
      const requestBody: Record<string, string> = {
        currentPassword,
        newPassword,
        password: newPassword, // Some backends use 'password' field
      };

      // If this is a forgot password flow, include the email
      if (resetEmail && !token) {
        (requestBody as Record<string, string>).email = resetEmail;
      }

      const response = await fetch(`${apiBase}/auth/password`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : 'Content-Type: application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || data?.error?.message || data?.error || 'Failed to change password');
        return;
      }

      setSuccess('Your password has been changed successfully!');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordCriteria({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });

      setTimeout(() => {
        if (resetEmail && !token) {
          // If reset flow, redirect to login
          router.push('/auth/login');
        } else {
          // If password change in account, go back
          router.back();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

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
        <h1 className={styles.headerTitle}>Change Password</h1>
        <div className={styles.placeholder} />
      </div>

      <div className={styles.scrollView}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}>🔒</div>
          <h2 className={styles.heroTitle}>Update Your Password</h2>
          <p className={styles.heroSubtitle}>
            Choose a strong password to keep your account secure
          </p>
        </div>

        {/* Tips Card */}
        <div className={styles.tipsCard}>
          <div className={styles.tipsHeader}>
            <span>ℹ️</span>
            <span className={styles.tipsTitle}>Password Security Tips</span>
          </div>
          <div className={styles.tipsList}>
            {[
              'Use a unique password for each account',
              'Mix letters, numbers, and symbols',
              'Avoid personal information',
            ].map((tip) => (
              <div key={tip} className={styles.tipItem}>
                <span>✓</span>
                <span className={styles.tipText}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {error && <div className={styles.alert} style={{ borderColor: '#ef4444' }}>{error}</div>}
        {success && <div className={styles.alert} style={{ borderColor: '#22c55e' }}>{success}</div>}

        {/* Form Section */}
        <div className={styles.formSection}>
          {/* Current Password */}
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Current Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔐</span>
              <input
                className={styles.input}
                placeholder="Enter current password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
              />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              title={showCurrentPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            </div>
            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => router.push('/auth/forgot')}
            >
              Forgot password?
            </button>
          </div>

          {/* New Password */}
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>New Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔑</span>
              <input
                className={styles.input}
                placeholder="Enter new password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                disabled={loading}
              />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowNewPassword(!showNewPassword)}
              title={showNewPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showNewPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            </div>
            {newPassword.length > 0 && (
              <div className={styles.strengthContainer}>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span style={{ color: passwordStrength.color }} className={styles.strengthText}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.inputContainer}>
            <label className={styles.inputLabel}>Confirm New Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>🔑</span>
              <input
                className={styles.input}
                placeholder="Re-enter new password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <div className={styles.errorContainer}>
                <span>⚠️</span>
                <span className={styles.errorText}>Passwords do not match</span>
              </div>
            )}
            {confirmPassword.length > 0 && confirmPassword === newPassword && (
              <div className={styles.successContainer}>
                <span>✓</span>
                <span className={styles.successText}>Passwords match</span>
              </div>
            )}
          </div>

          {/* Requirements Card */}
          <div className={styles.requirementsCard}>
            <h3 className={styles.requirementsTitle}>Password Requirements</h3>
            <div className={styles.requirementsList}>
              <PasswordRequirement met={passwordCriteria.length} label="At least 8 characters" />
              <PasswordRequirement met={passwordCriteria.uppercase} label="One uppercase letter" />
              <PasswordRequirement met={passwordCriteria.lowercase} label="One lowercase letter" />
              <PasswordRequirement met={passwordCriteria.number} label="One number" />
              <PasswordRequirement met={passwordCriteria.special} label="One special character" />
            </div>
          </div>
        </div>

        <div className={styles.bottomPadding} />
      </div>

      {/* Fixed Bottom Button */}
      <div className={styles.bottomContainer}>
        <button
          className={`${styles.changeButton} ${
            !isFormValid() || loading ? styles.changeButtonDisabled : ''
          }`}
          onClick={handleChangePassword}
          disabled={!isFormValid() || loading}
        >
          <span>🛡️</span>
          <span>{loading ? 'Saving…' : 'Change Password'}</span>
        </button>
      </div>
    </div>
  );
}
