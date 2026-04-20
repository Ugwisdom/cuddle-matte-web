import { NextResponse } from "next/server";

// Simple dev-only wallet endpoint.
// Returns a mock balance and basic metadata. If an Authorization header is
// present we echo back a simulated user-specific balance.
export async function GET(request: Request) {
  try {
    const auth = request.headers.get("authorization") || null;

    // If an Authorization header is present, return a personalized balance.
    if (auth) {
      // Very small deterministic mock based on header length so different tokens produce different balances.
      const b = 1000 + auth.length * 7;
      return NextResponse.json({ ok: true, balance: b, currency: "NGN" });
    }

    // Default mock balance for anonymous/dev requests
    return NextResponse.json({ ok: true, balance: 12850, currency: "NGN" });
  } catch {
    return NextResponse.json({ ok: false, message: "server error" }, { status: 500 });
  }
}
