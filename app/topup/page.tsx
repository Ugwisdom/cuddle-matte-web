// app/topup/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/lib/apiClient";

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

export default function TopUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);

  // Load auth from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedToken = localStorage.getItem("authToken");
    setToken(savedToken);
    try {
      const raw = localStorage.getItem("authUser");
      const userData = raw ? JSON.parse(raw) : null;
      setUser(userData);
      if (userData?.email) {
        setEmail(userData.email);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // Check for payment callback
  useEffect(() => {
    const status = searchParams.get("status");
    const ref = searchParams.get("reference");

    if (status === "success" && ref) {
      setPaymentStatus("success");
      setReference(ref);
      // Redirect to wallet after 3 seconds
      const timer = setTimeout(() => {
        router.push("/wallet");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
    }
  }, [token, router]);

  const handleQuickAmount = useCallback((value: number) => {
    setAmount(String(value));
    setError(null);
  }, []);

  const handleInitiatePayment = useCallback(async () => {
    setError(null);

    if (!token) {
      setError("Authentication required");
      return;
    }

    const n = Number(amount);
    if (!n || n <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (n < 100) {
      setError("Minimum top-up amount is ₦100");
      return;
    }
    if (n > 5000000) {
      setError("Maximum top-up amount is ₦5,000,000");
      return;
    }

    const paymentEmail = email || (user as Record<string, unknown>)?.email;
    if (!paymentEmail) {
      setError("Email address is required");
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus("processing");

      const resp = await apiClient.initializePayment(
        token,
        n * 100, // Convert to kobo
        String(paymentEmail),
        { purpose: "wallet_topup", amount: n }
      );

      if (!resp || !resp.ok) {
        throw new Error(
          resp?.error && typeof resp.error === "object" && "message" in resp.error
            ? String((resp.error as Record<string, unknown>).message)
            : "Failed to initialize payment"
        );
      }

      const authUrl = resp.data?.authorization_url;
      if (!authUrl) {
        throw new Error("Payment gateway URL not available");
      }

      // Redirect to Paystack checkout
      window.location.href = authUrl;
    } catch (err: unknown) {
      setPaymentStatus("error");
      setError(err instanceof Error ? err.message : "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  }, [token, amount, email, user]);

  if (paymentStatus === "success") {
    return (
      <div style={styles.root}>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.checkmark}>✓</div>
            <h1 style={styles.successTitle}>Payment Successful!</h1>
            <p style={styles.successMsg}>
              Your wallet has been credited with ₦{Number(amount || 0).toLocaleString()}
            </p>
            {reference && (
              <p style={styles.refText}>
                Reference: <strong>{reference}</strong>
              </p>
            )}
            <p style={styles.redirectMsg}>Redirecting to wallet...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 style={styles.title}>Top Up Wallet</h1>
        </div>

        {/* Payment Form */}
        <div style={styles.form}>
          {/* Amount Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Amount to Top Up</label>
            <div style={styles.amountWrapper}>
              <span style={styles.currency}>₦</span>
              <input
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0"
                style={styles.amountInput}
                disabled={loading}
              />
            </div>
            <p style={styles.hint}>Min: ₦100 | Max: ₦5,000,000</p>
          </div>

          {/* Quick Amount Buttons */}
          <div style={styles.formGroup}>
            <p style={styles.label}>Quick amounts</p>
            <div style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickAmount(value)}
                  style={{
                    ...styles.quickBtn,
                    background: amount === String(value) ? "#667eea" : "transparent",
                    color: amount === String(value) ? "#fff" : "#667eea",
                  }}
                  disabled={loading}
                >
                  ₦{(value / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && <p style={styles.errorMsg}>{error}</p>}

          {/* Summary */}
          {amount && !error && (
            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span>Amount:</span>
                <span>₦{Number(amount).toLocaleString()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Processing Fee:</span>
                <span style={{ color: "#666" }}>Varies</span>
              </div>
              <div style={{ ...styles.summaryRow, borderTop: "1px solid #eee", paddingTop: "12px", fontWeight: "600" }}>
                <span>Total:</span>
                <span>₦{Number(amount).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleInitiatePayment}
            disabled={loading || !amount}
            style={{
              ...styles.submitBtn,
              opacity: loading || !amount ? 0.5 : 1,
              cursor: loading || !amount ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span>
                <span style={styles.spinner}>⏳</span> Processing...
              </span>
            ) : (
              `Pay ₦${Number(amount || 0).toLocaleString()}`
            )}
          </button>

          {/* Payment Method Info */}
          <div style={styles.paymentInfo}>
            <p style={styles.infoTitle}>💳 Payment Method</p>
            <p style={styles.infoText}>
              Powered by <strong>Paystack</strong> - Pay securely with your card
            </p>
          </div>

          {/* Security Info */}
          <div style={styles.securityInfo}>
            <p style={styles.securityIcon}>🔒</p>
            <p style={styles.securityText}>Your payment is secure and encrypted</p>
          </div>
        </div>

        {/* FAQ */}
        <div style={styles.faqSection}>
          <h3 style={styles.faqTitle}>Frequently Asked Questions</h3>

          <div style={styles.faqItem}>
            <p style={styles.faqQuestion}>How long does it take?</p>
            <p style={styles.faqAnswer}>Top-ups are instant. Your wallet balance updates immediately after payment.</p>
          </div>

          <div style={styles.faqItem}>
            <p style={styles.faqQuestion}>What payment methods are accepted?</p>
            <p style={styles.faqAnswer}>Visa, Mastercard, and other cards via Paystack.</p>
          </div>

          <div style={styles.faqItem}>
            <p style={styles.faqQuestion}>Is my payment secure?</p>
            <p style={styles.faqAnswer}>Yes. All transactions are encrypted and processed securely by Paystack.</p>
          </div>

          <div style={styles.faqItem}>
            <p style={styles.faqQuestion}>Can I get a refund?</p>
            <p style={styles.faqAnswer}>No, top-ups are non-refundable. But you can use your balance anytime.</p>
          </div>
        </div>
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
    paddingBottom: "40px",
  },

  container: {
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
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
    textAlign: "center",
    padding: "40px 0",
  },

  checkmark: {
    fontSize: "60px",
    marginBottom: "16px",
  },

  successTitle: {
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 12px 0",
    color: "#1a1a1a",
  },

  successMsg: {
    fontSize: "16px",
    color: "#666",
    margin: "12px 0",
  },

  refText: {
    fontSize: "13px",
    color: "#999",
    margin: "12px 0",
    fontFamily: "'DM Mono', monospace",
  },

  redirectMsg: {
    fontSize: "13px",
    color: "#aaa",
    fontStyle: "italic",
    marginTop: "20px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
  },

  amountWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  currency: {
    position: "absolute",
    left: "16px",
    fontSize: "24px",
    fontWeight: "700",
    color: "#f9089c",
  },

  amountInput: {
    width: "100%",
    padding: "16px 16px 16px 48px",
    fontSize: "24px",
    fontWeight: "600",
    border: "2px solid #eee",
    borderRadius: "12px",
    fontFamily: FONT_SANS,
    transition: "all 0.2s",
    boxSizing: "border-box",
  } as React.CSSProperties,

  hint: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },

  quickAmounts: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },

  quickBtn: {
    padding: "10px 0",
    border: "2px solid #f9089c",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: FONT_SANS,
  } as React.CSSProperties,

  input: {
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontFamily: FONT_SANS,
    transition: "all 0.2s",
    boxSizing: "border-box",
  } as React.CSSProperties,

  errorMsg: {
    fontSize: "14px",
    color: "#dc3545",
    background: "rgba(220, 53, 69, 0.1)",
    padding: "12px",
    borderRadius: "8px",
    margin: "-12px 0 0 0",
  },

  summary: {
    background: "#f8f9ff",
    border: "1px solid #e0e6ff",
    borderRadius: "8px",
    padding: "16px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    margin: "8px 0",
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

  spinner: {
    marginRight: "8px",
  },

  paymentInfo: {
    background: "#f0f4ff",
    border: "1px solid #d0dcff",
    borderRadius: "8px",
    padding: "12px",
  },

  infoTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#f9089c",
    margin: "0 0 4px 0",
  },

  infoText: {
    fontSize: "12px",
    color: "#666",
    margin: 0,
  },

  securityInfo: {
    textAlign: "center",
  },

  securityIcon: {
    fontSize: "24px",
    margin: "8px 0 4px 0",
  },

  securityText: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },

  faqSection: {
    marginTop: "40px",
    paddingTop: "24px",
    borderTop: "1px solid #eee",
  },

  faqTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 16px 0",
    color: "#1a1a1a",
  },

  faqItem: {
    marginBottom: "16px",
  },

  faqQuestion: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 4px 0",
  },

  faqAnswer: {
    fontSize: "12px",
    color: "#666",
    margin: 0,
    lineHeight: "1.5",
  },
};
