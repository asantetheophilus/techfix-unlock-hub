import { NextResponse } from "next/server";

// Paystack integration has been removed. This endpoint is intentionally disabled.
export async function POST() {
  return NextResponse.json(
    { success: false, message: "Payment webhook is not active." },
    { status: 410 }
  );
}
