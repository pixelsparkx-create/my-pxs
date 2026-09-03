/** Server-only Flutterwave helpers. Never import this from client code. */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const API_BASE = "https://api.flutterwave.com/v3";

export function flutterwaveSecret() {
  const key = process.env["FLUTTERWAVE_SECRET_KEY"];
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not configured");
  return key;
}

export async function flutterwaveFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${flutterwaveSecret()}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  return (await response.json().catch(() => ({}))) as any;
}

export type ServerPaymentRequest = {
  id: string;
  request_code: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  project_name: string | null;
  amount: number;
  currency: string;
  status: string;
  expires_at: string | null;
};

export async function getPublicRequest(code: string): Promise<ServerPaymentRequest | null> {
  const { data } = await supabaseAdmin
    .from("payment_requests")
    .select("id,request_code,client_name,client_email,client_phone,project_name,amount,currency,status,expires_at")
    .ilike("request_code", code)
    .maybeSingle();
  return (data as ServerPaymentRequest | null) ?? null;
}

export async function logEvent(
  paymentRequestId: string,
  eventType: string,
  detail: string,
  fromStatus?: string | null,
  toStatus?: string | null,
  actor = "system",
) {
  await supabaseAdmin.from("payment_events").insert({
    payment_request_id: paymentRequestId,
    event_type: eventType,
    detail,
    from_status: fromStatus ?? null,
    to_status: toStatus ?? null,
    actor,
  });
}

export async function markCheckoutStarted(id: string, txRef: string, link: string) {
  await supabaseAdmin
    .from("payment_requests")
    .update({ flutterwave_reference: txRef, flutterwave_payment_link: link })
    .eq("id", id);
  await logEvent(id, "checkout_started", `Secure checkout opened (${txRef}).`);
}

/**
 * Verifies a transaction with Flutterwave and only marks the request paid when
 * the returned status, amount and currency match the stored request exactly.
 */
export async function verifyByReference(code: string, txRef: string) {
  const request = await getPublicRequest(code);
  if (!request) return { ok: false as const, status: "unknown", error: "Payment request not found." };
  if (request.status === "paid") return { ok: true as const, status: "paid" };

  const result = await flutterwaveFetch(`/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`);
  const tx = result?.data;
  if (!tx) {
    return { ok: false as const, status: request.status, error: "We could not confirm this payment yet." };
  }

  const amountOk = Number(tx.amount) >= Number(request.amount) - 0.01;
  const currencyOk = String(tx.currency).toUpperCase() === String(request.currency).toUpperCase();
  const successful = String(tx.status).toLowerCase() === "successful";

  if (successful && amountOk && currencyOk) {
    await supabaseAdmin
      .from("payment_requests")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        flutterwave_transaction_id: String(tx.id),
        flutterwave_reference: txRef,
      })
      .eq("id", request.id);
    await logEvent(request.id, "payment_verified", `Verified ${tx.currency} ${tx.amount} via Flutterwave.`, request.status, "paid");
    return { ok: true as const, status: "paid" };
  }

  if (!successful) {
    await logEvent(request.id, "payment_failed", `Flutterwave reported status "${tx.status}".`, request.status, request.status);
    return { ok: false as const, status: request.status, error: "The payment was not completed." };
  }

  await logEvent(
    request.id,
    "amount_mismatch",
    `Expected ${request.currency} ${request.amount}, received ${tx.currency} ${tx.amount}.`,
    request.status,
    request.status,
  );
  return { ok: false as const, status: request.status, error: "The paid amount did not match this request." };
}
