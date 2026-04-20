// app/withdrawal/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

interface BankOption {
  code: string;
  name: string;
}

// Mock Nigerian banks
const NIGERIAN_BANKS: BankOption[] = [
  { code: "001", name: "Guaranty Trust Bank (GTB)" },
  { code: "003", name: "First Bank of Nigeria" },
  { code: "007", name: "Zenith Bank" },
  { code: "011", name: "First City Monument Bank (FCMB)" },
  { code: "012", name: "United Bank for Africa (UBA)" },
  { code: "015", name: "Wema Bank" },
  { code: "029", name: "Fidelity Bank" },
  { code: "033", name: "Access Bank" },
  { code: "035", name: "WEMA Bank" },
  { code: "050", name: "Ecobank Transnational Inc" },
];

export default function WithdrawalPage() {
  const router = useRouter();

  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);

  // Load auth from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    setToken(localStorage.getItem("authToken"));
    try {
      const raw = localStorage.getItem("authUser");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Authentication required");
      return;
    }

    // Validation
    const n = Number(amount);
    if (!n || n <= 0) {
      setError("Please enter a valid withdrawal amount");
      return;
    }
    if (n < 1000) {
      setError("Minimum withdrawal amount is ₦1,000");
      return;
    }
    if (!bankCode) {
      setError("Please select a bank");
      return;
    }
    if (!accountNumber || accountNumber.length < 10) {
      setError("Please enter a valid account number (10 digits)");
      return;
    }
    if (!accountName || accountName.trim().length < 3) {
      setError("Please enter account holder name");
      return;
    }

    try {
      setLoading(true);
      const resp = await apiClient.requestWithdrawal(
        token,
        n * 100, // Convert to kobo
        bankCode,
        accountNumber,
        accountName
      );

      if (!resp || !resp.ok) {
        throw new Error(
          resp?.error && typeof resp.error === "object" && "message" in resp.error
            ? String((resp.error as Record<string, unknown>).message)
            : "Withdrawal request failed"
        );
      }

      setSuccess(true);
      setWithdrawalId(resp.data?.withdrawalId as string | null ?? null);
      setAmount("");
      setBankCode("");
      setAccountNumber("");
      setAccountName("");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/wallet");
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not process withdrawal");
    } finally {
      setLoading(false);
    }
  }, [token, amount, bankCode, accountNumber, accountName, router]);

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button
            onClick={() => router.back()}
            style={styles.backBtn}
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 style={styles.title}>Withdraw Funds</h1>
        </div>

        {/* Success Message */}
        {success && (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Withdrawal Request Submitted</h2>
            <p style={styles.successMsg}>
              Your withdrawal of ₦{Number(amount || 0).toLocaleString()} has been requested.
            </p>
            {withdrawalId && (
              <p style={styles.successRef}>
                Reference ID: <strong>{withdrawalId}</strong>
              </p>
            )}
            <p style={styles.successNote}>
              You'll be redirected to your wallet shortly...
            </p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Amount */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Withdrawal Amount (₦)</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputPrefix}>₦</span>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  style={styles.input}
                  disabled={loading}
                />
              </div>
              <p style={styles.hint}>Minimum: ₦1,000</p>
            </div>

            {/* Bank Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Bank</label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                style={styles.select}
                disabled={loading}
              >
                <option value="">Choose a bank...</option>
                {NIGERIAN_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Enter 10-digit account number"
                style={styles.input}
                disabled={loading}
                maxLength={10}
              />
            </div>

            {/* Account Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Account Holder Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Full name as shown on bank account"
                style={styles.input}
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && <p style={styles.errorMsg}>{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
              disabled={loading}
            >
              {loading ? "Processing..." : "Request Withdrawal"}
            </button>

            {/* Info Box */}
            <div style={styles.infoBox}>
              <p style={styles.infoTitle}>ⓘ Withdrawal Information</p>
              <ul style={styles.infoList}>
                <li>Withdrawals are processed within 24 hours</li>
                <li>A processing fee of ₦50 applies per withdrawal</li>
                <li>Ensure your account details are correct</li>
                <li>You'll receive a confirmation email</li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   Styles
================================================================ */
const FONT_SANS = "'Syne', system-ui, sans-serif";

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: FONT_SANS,
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f9089c 0%, #fb0567 100%)",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "16px",
    padding: "30px 24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
  },

  backBtn: {
    background: "none",
    border: "none",
    fontSize: "16px",
    color: "#f9089c",
    cursor: "pointer",
    padding: "4px 8px",
    fontWeight: "500",
  },

  title: {
    fontSize: "24px",
    fontWeight: "700",
    margin: 0,
    color: "#1a1a1a",
  },

  successCard: {
    background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    borderRadius: "12px",
    padding: "30px 24px",
    textAlign: "center",
  },

  successIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  successTitle: {
    fontSize: "20px",
    fontWeight: "700",
    margin: "0 0 12px 0",
    color: "#1a1a1a",
  },

  successMsg: {
    fontSize: "14px",
    color: "#333",
    margin: "8px 0",
  },

  successRef: {
    fontSize: "13px",
    color: "#555",
    margin: "12px 0 16px 0",
  },

  successNote: {
    fontSize: "12px",
    color: "#777",
    fontStyle: "italic",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputPrefix: {
    position: "absolute",
    left: "12px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#f9089c",
  },

  input: {
    width: "100%",
    padding: "12px 12px 12px 32px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: FONT_SANS,
    transition: "all 0.2s",
    boxSizing: "border-box",
  } as React.CSSProperties,

  select: {
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: FONT_SANS,
    background: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
  } as React.CSSProperties,

  hint: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },

  errorMsg: {
    fontSize: "14px",
    color: "#dc3545",
    background: "rgba(220, 53, 69, 0.1)",
    padding: "12px",
    borderRadius: "8px",
    margin: "-16px 0 0 0",
  },

  submitBtn: {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #f9089c 0%, #fb0567 100%)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: FONT_SANS,
  } as React.CSSProperties,

  infoBox: {
    background: "#f8f9ff",
    border: "1px solid #e0e6ff",
    borderRadius: "8px",
    padding: "16px",
  },

  infoTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#667eea",
    margin: "0 0 12px 0",
  },

  infoList: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    paddingLeft: "20px",
    lineHeight: "1.6",
  },
};
