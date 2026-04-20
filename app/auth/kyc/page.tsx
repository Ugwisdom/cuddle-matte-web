'use client';

import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import styles from './kyc.module.css';

const defaultColors = {
  background: { primary: '#ffffff' },
  text: { primary: '#000000', tertiary: '#666666' },
  border: { default: '#e0e0e0', card: '#e0e0e0' },
  pink: { primary: '#ec4899' },
};

export default function KycOnboarding() {
  const router = useRouter();
  const colors = defaultColors;

  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [idNumber, setIdNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (uri: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a FileReader to convert file to base64 for preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const pickFromDevice = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    inputRef.current?.click();
  };

  const showAlert = (title: string, message: string, isError: boolean = true) => {
    if (isError) {
      setError(`${title}: ${message}`);
    } else {
      setSuccess(`${title}: ${message}`);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 4000);
  };

  const submit = async () => {
    setError(null);
    setSuccess(null);

    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (!token) {
      return showAlert('Not authenticated', 'Please sign in first');
    }
    if (!front) {
      return showAlert('Front ID Missing', 'Please upload the front of your ID');
    }
    if (!back) {
      return showAlert('Back ID Missing', 'Please upload the back of your ID');
    }
    if (!idNumber?.trim()) {
      return showAlert('ID Number Missing', 'Please enter your ID number or reference');
    }

    setLoading(true);
    try {
      const maxRetries = 2;
      let attempt = 0;

      // Convert data URIs to Blobs for FormData
      const frontBlob = await fetch(front).then((res) => res.blob());
      const backBlob = await fetch(back).then((res) => res.blob());

      const formData = new FormData();
      formData.append('idNumber', idNumber);
      formData.append('licenseFront', frontBlob, 'front.jpg');
      formData.append('licenseBack', backBlob, 'back.jpg');

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

      while (true) {
        attempt += 1;
        try {
          const response = await fetch(
            `${apiBase}/users/me/kyc`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (response.status >= 500 && response.status < 600 && attempt <= maxRetries) {
            await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)));
            continue;
          }

          if (response.ok) {
            showAlert(
              'Success',
              "KYC submitted. We'll update your profile once it's processed.",
              false
            );

            setTimeout(() => {
              router.replace('/profile');
            }, 2000);
            return;
          }

          const data = await response.json();
          const msg =
            data?.message ||
            data?.error ||
            JSON.stringify(data);
          showAlert('Upload failed', String(msg));
          return;
        } catch (e: any) {
          if (attempt <= maxRetries) {
            await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt - 1)));
            continue;
          }
          showAlert('Error', e?.message || 'Could not upload verification documents');
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const themeStyles = {
    backgroundColor: colors.background.primary,
    color: colors.text.primary,
  };

  return (
    <div style={themeStyles} className={styles.root}>
      <div className={styles.container}>
        <h1 className={styles.title} style={{ color: colors.text.primary }}>
          Identity verification
        </h1>

        {error && <div className={styles.alert} style={{ borderColor: '#ef4444', backgroundColor: `${colors.background.primary}dd` }}>{error}</div>}
        {success && <div className={styles.alert} style={{ borderColor: '#22c55e', backgroundColor: `${colors.background.primary}dd` }}>{success}</div>}

        <label className={styles.label} style={{ color: colors.text.tertiary }}>
          ID number
        </label>
        <input
          type="text"
          placeholder="e.g. NIN / Driver's licence number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className={styles.input}
          style={{
            color: colors.text.primary,
            borderColor: colors.border.default,
            backgroundColor: colors.background.primary,
          }}
        />

        <div className={styles.row}>
          <div
            className={styles.previewBox}
            style={{ borderColor: colors.border.card }}
          >
            {front ? (
              <img src={front} alt="Front of ID" className={styles.previewImage} />
            ) : (
              <span style={{ color: colors.text.tertiary }}>Front of ID</span>
            )}
          </div>
          <div
            className={styles.previewBox}
            style={{ borderColor: colors.border.card }}
          >
            {back ? (
              <img src={back} alt="Back of ID" className={styles.previewImage} />
            ) : (
              <span style={{ color: colors.text.tertiary }}>Back of ID</span>
            )}
          </div>
        </div>

        <input
          ref={frontInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setFront)}
          style={{ display: 'none' }}
        />
        <input
          ref={backInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setBack)}
          style={{ display: 'none' }}
        />

        <div className={styles.buttonRow}>
          <button
            className={styles.btn}
            style={{ backgroundColor: colors.pink.primary }}
            onClick={() => pickFromDevice(frontInputRef)}
            disabled={loading}
          >
            Pick front
          </button>
          <button
            className={styles.btn}
            style={{ backgroundColor: colors.pink.primary }}
            onClick={() => pickFromDevice(backInputRef)}
            disabled={loading}
          >
            Pick back
          </button>
        </div>

        <div className={styles.buttonRow}>
          <button
            className={styles.btnOutline}
            style={{ borderColor: colors.border.default, color: colors.text.primary }}
            onClick={() => pickFromDevice(frontInputRef)}
            disabled={loading}
          >
            Upload front
          </button>
          <button
            className={styles.btnOutline}
            style={{ borderColor: colors.border.default, color: colors.text.primary }}
            onClick={() => pickFromDevice(backInputRef)}
            disabled={loading}
          >
            Upload back
          </button>
        </div>

        <button
          className={styles.submit}
          style={{ backgroundColor: colors.pink.primary }}
          onClick={submit}
          disabled={loading}
        >
          {loading ? (
            <div className={styles.spinner} style={{ borderColor: colors.background.primary }}></div>
          ) : (
            'Submit documents'
          )}
        </button>

        <p className={styles.hint} style={{ color: colors.text.tertiary }}>
          We only store the images for verification. Do not share sensitive info.
        </p>
      </div>
    </div>
  );
}
