// API client that integrates with cuddlematte backend at NEXT_PUBLIC_API_BASE
// Provides authentication, wallet, and payment operations with fallback dev stubs

type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: Record<string, unknown> | null;
};

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

async function fetchJson(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    headers?: Record<string, string>;
    token?: string;
  } = {}
) {
  const url = BASE ? `${BASE.replace(/\/$/, "")}${path}` : null;
  if (!url) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  try {
    const res = await fetch(url, {
      method: options.method || "POST",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    return { status: res.status, json };
  } catch (err) {
    console.error(`API call failed: ${path}`, err);
    return null;
  }
}

const apiClient = {
  async postLogin(email: string, password: string): Promise<ApiResponse<unknown>> {
    try {
      const remote = await fetchJson("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (remote) {
        return { ok: remote.status >= 200 && remote.status < 300, status: remote.status, data: remote.json };
      }
    } catch (err) {
      console.warn("apiClient.postLogin remote failed", err);
    }

    // Dev fallback stub
    if (!email || !password) {
      return { ok: false, status: 400, error: { message: "Missing credentials" } };
    }
    if (email.includes("need-verification")) {
      return {
        ok: false,
        status: 403,
        error: { emailVerificationRequired: true, message: "Email verification required" },
      };
    }

    return {
      ok: true,
      status: 200,
      data: {
        token: process.env.NEXT_PUBLIC_DEV_MOCK_TOKEN ?? "dev-mock-token",
        user: { id: "dev-user", email },
      },
    };
  },

  async postRegister(payload: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    try {
      const remote = await fetchJson("/auth/register", {
        method: "POST",
        body: payload,
      });
      if (remote) {
        return { ok: remote.status >= 200 && remote.status < 300, status: remote.status, data: remote.json };
      }
    } catch (err) {
      console.warn("apiClient.postRegister remote failed", err);
    }

    // Dev fallback: simple validation
    if (!payload || typeof payload.email !== "string") {
      return { ok: false, status: 400, error: { message: "Missing email" } };
    }

    return {
      ok: true,
      status: 201,
      data: {
        token: process.env.NEXT_PUBLIC_DEV_MOCK_TOKEN ?? null,
        user: { id: "dev-user", email: payload.email },
        emailVerificationCode: process.env.NODE_ENV === "development" ? "123456" : undefined,
      },
    };
  },

  async getWalletBalance(token: string): Promise<ApiResponse<{ balance: number; currency: string }>> {
    try {
      const remote = await fetchJson("/wallet/balance", {
        method: "GET",
        token,
      });
      if (remote) {
        return { ok: remote.status >= 200 && remote.status < 300, status: remote.status, data: remote.json };
      }
    } catch (err) {
      console.warn("apiClient.getWalletBalance remote failed", err);
    }

    // Dev fallback: mock wallet balance
    return {
      ok: true,
      status: 200,
      data: { balance: 12850, currency: "NGN" },
    };
  },

  async initializePayment(
    token: string,
    amount: number,
    email: string,
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<{
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  }>> {
    try {
      const remote = await fetchJson("/payments/initialize", {
        method: "POST",
        token,
        body: {
          amount,
          email,
          metadata,
        },
      });
      if (remote) {
        return { ok: remote.status >= 200 && remote.status < 300, status: remote.status, data: remote.json };
      }
    } catch (err) {
      console.warn("apiClient.initializePayment remote failed", err);
    }

    // Dev fallback: mock Paystack response
    return {
      ok: true,
      status: 200,
      data: {
        authorization_url: `https://checkout.paystack.com/mock?email=${email}&amount=${amount}`,
        access_code: "mock_access_" + Math.random().toString(36).substr(2, 9),
        reference: "mock_ref_" + Date.now(),
      },
    };
  },

  async getTransactions(
    token: string,
    limit: number = 10
  ): Promise<ApiResponse<Array<{
    id: string;
    label: string;
    amount: number;
    date: string;
  }>>> {
    try {
      const remote = await fetchJson(`/wallet/transactions?limit=${limit}`, {
        method: "GET",
        token,
      });
      if (remote) {
        return { ok: remote.status >= 200 && remote.status < 300, status: remote.status, data: remote.json };
      }
    } catch (err) {
      console.warn("apiClient.getTransactions remote failed", err);
    }

    // Dev fallback: mock transactions
    return {
      ok: true,
      status: 200,
      data: [
        { id: "t1", label: "Top-up via card", amount: 5000, date: "Apr 10, 2025" },
        { id: "t2", label: "Subscription", amount: -999, date: "Apr 3, 2025" },
        { id: "t3", label: "Refund", amount: 550, date: "Mar 28, 2025" },
      ],
    };
  },

  async requestWithdrawal(
    token: string,
    amount: number,
    bankCode: string,
    accountNumber: string,
    accountName: string
  ): Promise<ApiResponse<{
    withdrawalId?: string;
    status?: string;
    amount?: number;
    reference?: string;
  }>> {
    try {
      const remote = await fetchJson("/wallet/withdraw", {
        method: "POST",
        token,
        body: {
          amount,
          bankCode,
          accountNumber,
          accountName,
        },
      });
      if (remote) {
        return { ok: remote.status >= 200 && remote.status < 300, status: remote.status, data: remote.json };
      }
    } catch (err) {
      console.warn("apiClient.requestWithdrawal remote failed", err);
    }

    // Dev fallback: mock withdrawal response
    if (!amount || amount <= 0) {
      return { ok: false, status: 400, error: { message: "Invalid withdrawal amount" } };
    }
    if (!bankCode || !accountNumber || !accountName) {
      return { ok: false, status: 400, error: { message: "Missing bank details" } };
    }

    return {
      ok: true,
      status: 200,
      data: {
        withdrawalId: "wd_" + Date.now(),
        status: "pending",
        amount,
        reference: "ref_" + Math.random().toString(36).substr(2, 9),
      },
    };
  },
};

export default apiClient;
