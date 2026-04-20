import { NextResponse, NextRequest } from "next/server";

interface InitializePaymentBody {
  email: string;
  amount: number; // in kobo (1 kobo = 0.01 NGN)
  metadata?: Record<string, unknown>;
  reference?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InitializePaymentBody;
    const { email, amount, metadata, reference } = body;

    // Validate inputs
    if (!email || !amount || amount <= 0) {
      return NextResponse.json(
        { ok: false, error: { message: "Missing required fields: email, amount" } },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.warn("PAYSTACK_SECRET_KEY not configured");
      // Dev fallback: return mock response
      return NextResponse.json({
        ok: true,
        data: {
          authorization_url: `https://checkout.paystack.com/mock?email=${email}&amount=${amount}`,
          access_code: "mock_access_" + Math.random().toString(36).substr(2, 9),
          reference: reference || "mock_ref_" + Date.now(),
        },
      });
    }

    // Call Paystack API
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
        reference,
      }),
    });

    const paystackData = (await paystackRes.json()) as Record<string, unknown>;

    if (!paystackRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: paystackData.message || "Paystack initialization failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: paystackData.data,
    });
  } catch (error: unknown) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: error instanceof Error ? error.message : "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
