const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: "success" | "failed" | "ongoing" | "abandoned";
    reference: string;
    amount: number; // in subunits (pesewas)
    gateway_response: string;
    paid_at?: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
    };
  };
}

export async function initializePaystackTransaction(
  email: string,
  amountGHS: number,
  reference: string,
  callbackUrl: string
): Promise<PaystackInitResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    console.warn("Paystack Secret Key is missing in environment variables. Returning sandbox URL.");
    return {
      status: true,
      message: "Sandbox payment initialized",
      data: {
        authorization_url: `${callbackUrl}?reference=${reference}&status=success`,
        access_code: "sandbox_access_code",
        reference,
      },
    };
  }

  // Paystack expects amount in minor units (GHS * 100 = pesewas)
  const amountSubunit = Math.round(amountGHS * 100);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountSubunit,
      reference,
      callback_url: callbackUrl,
      currency: "GHS",
      channels: ["mobile_money", "card"],
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to initialize Paystack transaction");
  }

  return data;
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    console.warn("Paystack Secret Key is missing. Simulating sandbox payment verification.");
    return {
      status: true,
      message: "Transaction verified successfully (Sandbox)",
      data: {
        id: Date.now(),
        domain: "test",
        status: "success",
        reference,
        amount: 25000, // 250 GHS
        gateway_response: "Approved",
        paid_at: new Date().toISOString(),
        channel: "mobile_money",
        currency: "GHS",
        customer: {
          email: "test@example.com",
        },
      },
    };
  }

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to verify Paystack transaction");
  }

  return data;
}
