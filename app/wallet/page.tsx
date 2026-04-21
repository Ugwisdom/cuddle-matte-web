"use client";

// app/wallet/page.tsx  (Next.js 13+ App Router)
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? "";
import apiClient from "@/lib/apiClient";

/* ---------- types ---------- */
interface Transaction {
  id: string;
  label: string;
  amount: number;
  date: string;
}

/* ---------- static data (replace with real API call) ---------- */
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", label: "Top-up via card", amount: 5000,  date: "Apr 10, 2025" },
  { id: "t2", label: "Subscription",    amount: -999,  date: "Apr 3, 2025"  },
  { id: "t3", label: "Refund",          amount: 550,   date: "Mar 28, 2025" },
];

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000];

/* ================================================================
   WalletPage
================================================================ */
function WalletPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  /* auth from localStorage */
  const [token, setToken] = useState<string | null>(null);
  const [user,  setUser]  = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setToken(localStorage.getItem("authToken"));
    try {
      const raw = localStorage.getItem("authUser");
      setUser(raw ? JSON.parse(raw) : null);
    } catch { setUser(null); }
  }, []);

  /* wallet state */
  const [loading,  setLoading]  = useState(false);
  const [balance,  setBalance]  = useState<number | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [amount,   setAmount]   = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /* toast state */
  const [showToast,      setShowToast]      = useState(false);
  const [topupReference, setTopupReference] = useState<string | null>(null);

  /* ---------- fetch balance ---------- */
  useEffect(() => {
    if (!token) { setBalance(null); return; }
    (async () => {
      setLoading(true);
      try {
        const resp = await apiClient.getWalletBalance(token);
        if (resp && resp.ok && resp.data?.balance !== undefined) {
          setBalance(Number(resp.data.balance));
          setError(null);
        } else {
          setBalance(null);
          setError(resp?.error ? String(resp.error) : "Wallet balance unavailable");
        }
      } catch (err: unknown) {
        setBalance(null);
        setError(err instanceof Error ? err.message : "Could not fetch wallet");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  /* ---------- fetch transactions ---------- */
  useEffect(() => {
    if (!token) { setTransactions([]); return; }
    (async () => {
      try {
        const resp = await apiClient.getTransactions(token, 10);
        if (resp && resp.ok && Array.isArray(resp.data)) {
          setTransactions(resp.data as Transaction[]);
        } else {
          setTransactions(MOCK_TRANSACTIONS);
        }
      } catch (err: unknown) {
        console.warn("Failed to fetch transactions, using mock:", err);
        setTransactions(MOCK_TRANSACTIONS);
      }
    })();
  }, [token]);

  /* ---------- handle redirect back from payment gateway ---------- */
  useEffect(() => {
    if (!searchParams.get("topupSuccess")) return;
    const ref = searchParams.get("reference");
    setShowToast(true);
    setTopupReference(ref);
    const t = setTimeout(() => {
      setShowToast(false);
      setTopupReference(null);
      router.replace("/screens/wallet");
    }, 2800);
    return () => clearTimeout(t);
  }, [searchParams, router]);

  /* ---------- top-up ---------- */
  const handleTopUp = useCallback(async () => {
    if (!token || !user?.email) {
      alert("Please sign in to top up your wallet.");
      return;
    }
    const n = Number(amount);
    if (!n || n <= 0) {
      setError("Please enter a valid top-up amount in Naira.");
      return;
    }
    setError(null);
    try {
      setLoading(true);
      const resp = await apiClient.initializePayment(token, n * 100, user.email as string, { purpose: "wallet_topup" });
      
      if (!resp || !resp.ok) {
        throw new Error(resp?.error ? String(resp.error) : "Failed to initialise top-up");
      }

      const authUrl = resp.data?.authorization_url;
      const ref = resp.data?.reference;
      if (!authUrl) throw new Error("No payment URL returned from gateway");

      router.push(
        `/wallet?topupSuccess=true&reference=${String(ref)}`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not start top-up");
    } finally {
      setLoading(false);
    }
  }, [token, user, amount, router]);

  /* ================================================================
     Render
  ================================================================ */
  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600&display=swap');
      `}</style>

      <div style={styles.root}>
        <div style={styles.inner}>

          {/* ── Top bar ── */}
          <header style={styles.topBar}>
            <h1 style={styles.heading}>Wallet</h1>
            <span style={styles.statusDot}>Connected</span>
          </header>

          {/* ── Success toast ── */}
          {showToast && (
            <div style={styles.toast}>
              <strong style={{ fontWeight: 500 }}>Top-up successful</strong>
              {topupReference && (
                <div style={styles.toastRef}>Ref: {topupReference}</div>
              )}
            </div>
          )}

          {/* ── Balance card ── */}
          <section style={styles.balanceCard}>
            {/* decorative circles */}
            <div style={styles.circle1} />
            <div style={styles.circle2} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={styles.balanceLabel}>Available balance</p>
              <p style={styles.balanceAmount}>
                <span style={styles.currencySymbol}>₦</span>
                {loading && balance === null
                  ? <span style={styles.skeleton} />
                  : (balance !== null ? balance.toLocaleString() : "—")
                }
              </p>
              <div style={styles.cardActions}>
                <button
                  style={{ ...styles.cardBtn, ...styles.cardBtnPrimary }}
                  onClick={() => document.getElementById("amount-input")?.focus()}
                >
                  Top up
                </button>
                <button 
                  onClick={() => router.push("/withdrawal")}
                  style={{ ...styles.cardBtn, ...styles.cardBtnSecondary }}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </section>

          {/* ── Top-up panel (moved to dedicated page) ── */}
          <div style={styles.topupPanelSimple}>
            <div style={styles.topupCTA}>
              <p style={styles.panelLabel}>Ready to increase your balance?</p>
              <button
                onClick={() => router.push("/topup")}
                style={styles.topupCTABtn}
              >
                💳 Top Up Wallet
              </button>
            </div>
          </div>

          {/* ── Recent activity ── */}
          <section style={styles.activityCard}>
            <div style={styles.activityHeader}>
              <span style={styles.panelLabel}>Recent activity</span>
              <button style={styles.statementLink}>Full statement →</button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {transactions.map((tx, i) => {
                const isIn   = tx.amount >= 0;
                const isLast = i === transactions.length - 1;
                return (
                  <li
                    key={tx.id}
                    style={{
                      ...styles.txItem,
                      borderBottom: isLast ? "none" : "0.5px solid rgba(128,128,128,0.15)",
                    }}
                  >
                    {/* icon */}
                    <div
                      style={{
                        ...styles.txIcon,
                        background: isIn ? "rgba(42,187,126,0.12)" : "rgba(220,53,69,0.1)",
                      }}
                    >
                      {isIn ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3v10M3 8l5-5 5 5" stroke="#2abb7e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 13V3M3 8l5 5 5-5" stroke="#dc3545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>

                    {/* label + date */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.txLabel}>{tx.label}</p>
                      <p style={styles.txDate}>{tx.date}</p>
                    </div>

                    {/* amount */}
                    <p
                      style={{
                        ...styles.txAmount,
                        color: isIn ? "#2abb7e" : "#dc3545",
                      }}
                    >
                      {isIn ? "+" : "-"}₦{Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

        </div>
      </div>
    </>
  );
}

/* ================================================================
   Styles  (inline — no extra CSS file needed)
================================================================ */
const FONT_SERIF = "'DM Serif Display', Georgia, serif";
const FONT_SANS  = "'Syne', system-ui, sans-serif";
const FONT_MONO  = "'DM Mono', 'Courier New', monospace";

const styles: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: FONT_SANS,
    minHeight:  "100vh",
    background: "#f5f4f0",
    padding:    "2rem 1.5rem",
    color:      "#111",
  },
  inner: {
    maxWidth: 520,
    margin:   "0 auto",
  },

  /* top bar */
  topBar: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   "2rem",
  },
  heading: {
    fontFamily:    FONT_SERIF,
    fontSize:      26,
    fontWeight:    400,
    letterSpacing: "-0.5px",
    color:         "#111",
    margin:        0,
  },
  statusDot: {
    display:       "flex",
    alignItems:    "center",
    gap:           6,
    fontSize:      12,
    color:         "#888",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },

  /* toast */
  toast: {
    marginBottom: "1.25rem",
    padding:      "12px 16px",
    borderRadius: 8,
    background:   "rgba(42,187,126,0.1)",
    border:       "0.5px solid rgba(42,187,126,0.3)",
    color:        "#0d6e47",
    fontSize:     13,
  },
  toastRef: {
    fontFamily: FONT_MONO,
    fontSize:   11,
    opacity:    0.75,
    marginTop:  2,
  },

  /* balance card */
  balanceCard: {
    borderRadius:    20,
    padding:         "2rem",
    background:      "#0f0c1d",
    position:        "relative",
    overflow:        "hidden",
    marginBottom:    "1.25rem",
  },
  circle1: {
    position:     "absolute",
    top:          -60,
    right:        -60,
    width:        200,
    height:       200,
    borderRadius: "50%",
    background:   "rgba(255,255,255,0.04)",
    pointerEvents:"none",
  },
  circle2: {
    position:     "absolute",
    bottom:       -80,
    left:         30,
    width:        240,
    height:       240,
    borderRadius: "50%",
    background:   "rgba(180,100,220,0.08)",
    pointerEvents:"none",
  },
  balanceLabel: {
    fontSize:      11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color:         "rgba(255,255,255,0.45)",
    marginBottom:  8,
    margin:        0,
  },
  balanceAmount: {
    fontFamily:    FONT_SERIF,
    fontSize:      44,
    fontWeight:    400,
    color:         "#fff",
    letterSpacing: "-1px",
    lineHeight:    1,
    marginTop:     8,
    margin:        0,
  },
  currencySymbol: {
    fontSize:      22,
    verticalAlign: "super",
    marginRight:   2,
    opacity:       0.6,
  },
  skeleton: {
    display:      "inline-block",
    width:        140,
    height:       40,
    background:   "rgba(255,255,255,0.07)",
    borderRadius: 6,
    verticalAlign:"middle",
  },
  cardActions: {
    display:   "flex",
    gap:       10,
    marginTop: "1.75rem",
  },
  cardBtn: {
    padding:       "9px 20px",
    fontFamily:    FONT_SANS,
    fontSize:      13,
    fontWeight:    500,
    borderRadius:  9,
    cursor:        "pointer",
    border:        "none",
    letterSpacing: "0.02em",
  },
  cardBtnPrimary: {
    background: "rgba(255,255,255,0.92)",
    color:      "#0f0c1d",
  },
  cardBtnSecondary: {
    background: "rgba(255,255,255,0.1)",
    color:      "rgba(255,255,255,0.8)",
    border:     "0.5px solid rgba(255,255,255,0.12)",
  },

  /* top-up panel */
  topupPanel: {
    background:    "#fff",
    border:        "0.5px solid rgba(0,0,0,0.1)",
    borderRadius:  12,
    padding:       "1.25rem",
    marginBottom:  "1.25rem",
  },
  panelLabel: {
    fontSize:      11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color:         "#888",
    marginBottom:  10,
    margin:        0,
  },
  topupRow: {
    display:    "flex",
    gap:        8,
    alignItems: "center",
    marginTop:  10,
  },
  nairaWrap: {
    flex:        1,
    display:     "flex",
    alignItems:  "center",
    border:      "0.5px solid rgba(0,0,0,0.12)",
    borderRadius:8,
    overflow:    "hidden",
    background:  "#f9f9f9",
  },
  nairaSym: {
    padding:    "0 10px",
    fontFamily: FONT_MONO,
    fontSize:   15,
    color:      "#888",
    background: "transparent",
    userSelect: "none",
    lineHeight: "1",
  },
  nairaInput: {
    flex:       1,
    border:     "none",
    background: "transparent",
    padding:    "10px 10px 10px 0",
    fontFamily: FONT_MONO,
    fontSize:   15,
    color:      "#111",
    outline:    "none",
  },
  topupBtn: {
    padding:       "10px 18px",
    fontFamily:    FONT_SANS,
    fontSize:      13,
    fontWeight:    500,
    background:    "#0f0c1d",
    color:         "#fff",
    border:        "none",
    borderRadius:  8,
    cursor:        "pointer",
    whiteSpace:    "nowrap",
    letterSpacing: "0.02em",
  },

  topupPanelSimple: {
    background:   "#fff",
    border:       "0.5px solid rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding:      "1.5rem",
    textAlign:    "center",
  },

  topupCTA: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    gap:            "1rem",
  },

  topupCTABtn: {
    padding:        "12px 24px",
    background:     "linear-gradient(135deg, #f9089c 0%, #fb0567 100%)",
    color:          "#fff",
    fontSize:       14,
    fontWeight:     600,
    border:         "none",
    borderRadius:   8,
    cursor:         "pointer",
    transition:     "all 0.2s",
    fontFamily:     FONT_SANS,
  } as React.CSSProperties,

  chips: {
    display:   "flex",
    gap:       6,
    marginTop: 10,
    flexWrap:  "wrap",
  },
  chip: {
    padding:       "5px 11px",
    borderRadius:  99,
    border:        "0.5px solid rgba(0,0,0,0.12)",
    background:    "#f5f5f5",
    fontFamily:    FONT_MONO,
    fontSize:      12,
    color:         "#555",
    cursor:        "pointer",
  },
  errorMsg: {
    marginTop: 8,
    fontSize:  12,
    color:     "#dc3545",
    margin:    0,
  },

  /* activity */
  activityCard: {
    background:   "#fff",
    border:       "0.5px solid rgba(0,0,0,0.1)",
    borderRadius: 12,
    overflow:     "hidden",
  },
  activityHeader: {
    padding:        "1rem 1.25rem 0.75rem",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    borderBottom:   "0.5px solid rgba(0,0,0,0.08)",
  },
  statementLink: {
    fontSize:   12,
    color:      "#888",
    cursor:     "pointer",
    background: "none",
    border:     "none",
    fontFamily: FONT_SANS,
  },
  txItem: {
    display:    "flex",
    alignItems: "center",
    padding:    "14px 1.25rem",
    gap:        12,
  },
  txIcon: {
    width:        36,
    height:       36,
    borderRadius: 10,
    display:      "flex",
    alignItems:   "center",
    justifyContent:"center",
    flexShrink:   0,
  },
  txLabel: {
    fontSize:   14,
    fontWeight: 500,
    color:      "#111",
    margin:     0,
  },
  txDate: {
    fontSize:   11,
    color:      "#999",
    marginTop:  2,
    fontFamily: FONT_MONO,
    margin:     0,
  },
  txAmount: {
    fontFamily: FONT_MONO,
    fontSize:   14,
    fontWeight: 500,
    textAlign:  "right",
    margin:     0,
  },
};export default function WalletPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletPageContent />
    </Suspense>
  );
}
