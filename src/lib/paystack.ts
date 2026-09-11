const PAYSTACK_BASE = "https://api.paystack.co";

export function isPaystackConfigured(): boolean {
  return (
    !!process.env.PAYSTACK_SECRET_KEY &&
    process.env.PAYMENT_MODE !== "mock"
  );
}

export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export interface InitResult {
  authorizationUrl: string;
  reference: string;
  mode: "mock" | "live";
}

export async function paystackInitiate(params: {
  origin: string;
  reference: string;
  amountNaira: number;
  email: string;
  metadata: Record<string, unknown>;
}): Promise<InitResult> {
  const { origin, reference, amountNaira, email, metadata } = params;

  if (!isPaystackConfigured()) {
    return {
      authorizationUrl: `/checkout/mock?reference=${encodeURIComponent(reference)}`,
      reference,
      mode: "mock",
    };
  }

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: toKobo(amountNaira),
      reference,
      callback_url: `${origin}/payment/callback?reference=${encodeURIComponent(reference)}`,
      metadata,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.status) {
    throw new Error(data?.message ?? "Could not start secure payment.");
  }

  return {
    authorizationUrl: data.data.authorization_url,
    reference,
    mode: "live",
  };
}

export async function paystackVerify(reference: string): Promise<{
  verified: boolean;
  amountKobo?: number;
}> {
  if (!isPaystackConfigured()) {
    return { verified: true, amountKobo: 0 };
  }

  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  const data = await response.json().catch(() => null);
  if (
    response.ok &&
    data?.status &&
    data?.data?.status === "success"
  ) {
    return { verified: true, amountKobo: Number(data.data.amount) };
  }
  return { verified: false };
}

export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  if (!isPaystackConfigured() || !signature) return false;
  const crypto = await import("node:crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}