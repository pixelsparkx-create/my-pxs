/** Browser-safe payment types, formatting and share helpers. */

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "expired",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_TYPES = [
  { value: "full", label: "Full Payment" },
  { value: "deposit", label: "Deposit" },
  { value: "milestone", label: "Milestone Payment" },
  { value: "custom", label: "Custom Payment" },
] as const;

export const CURRENCIES = ["NGN", "USD", "GHS", "KES", "ZAR", "GBP", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export type PublicPaymentRequest = {
  request_code: string;
  client_name: string | null;
  project_name: string | null;
  project_type: string | null;
  payment_type: string;
  amount: number;
  currency: string;
  description: string | null;
  status: PaymentStatus;
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
};

export type PaymentRequest = PublicPaymentRequest & {
  id: string;
  client_email: string | null;
  client_phone: string | null;
  internal_note: string | null;
  flutterwave_transaction_id: string | null;
  flutterwave_reference: string | null;
  flutterwave_payment_link: string | null;
  created_by: string | null;
  updated_at: string;
};

export type PaymentEvent = {
  id: string;
  payment_request_id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  detail: string | null;
  actor: string | null;
  created_at: string;
};

const SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€", GHS: "GH₵", KES: "KSh", ZAR: "R" };

export function currencySymbol(currency: string) {
  return SYMBOLS[currency] ?? `${currency} `;
}

export function formatMoney(amount: number | string, currency = "NGN") {
  const value = Number(amount ?? 0);
  return `${currencySymbol(currency)}${value.toLocaleString("en-NG", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function paymentTypeLabel(value: string) {
  return PAYMENT_TYPES.find((t) => t.value === value)?.label ?? "Payment";
}

/** A request is payable only while pending and unexpired. */
export function isPayable(request: Pick<PublicPaymentRequest, "status" | "expires_at">) {
  if (request.status !== "pending") return false;
  if (request.expires_at && new Date(request.expires_at).getTime() < Date.now()) return false;
  return true;
}

export function paymentUrl(requestCode: string, origin?: string) {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/pay/${requestCode}`;
}

export function paymentWhatsAppLink(request: {
  request_code: string;
  client_name: string | null;
  client_phone?: string | null;
  project_name: string | null;
  amount: number;
  currency: string;
}) {
  const message = `Hello ${request.client_name ?? "there"} 👋

Here is your secure PixelSpark payment link.

Project: ${request.project_name ?? "Your project"}
Amount: ${formatMoney(request.amount, request.currency)}
Reference: ${request.request_code}

Pay securely here:
${paymentUrl(request.request_code)}

The amount is locked to the agreed price — payment is processed securely by Flutterwave.

— Mohammed, PixelSpark`;
  const phone = (request.client_phone ?? "").replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function paymentEmailLink(request: {
  request_code: string;
  client_name: string | null;
  client_email?: string | null;
  project_name: string | null;
  amount: number;
  currency: string;
}) {
  const subject = encodeURIComponent(
    `PixelSpark payment request — ${request.project_name ?? request.request_code}`,
  );
  const body = encodeURIComponent(`Hello ${request.client_name ?? "there"},

Thank you for choosing PixelSpark. Here are the details of your payment request.

Project: ${request.project_name ?? "Your project"}
Amount: ${formatMoney(request.amount, request.currency)}
Payment reference: ${request.request_code}

Secure payment link:
${paymentUrl(request.request_code)}

How to pay:
1. Open the secure link above.
2. Review the project and amount (the amount is fixed to the price we agreed).
3. Click "Pay Now" and complete payment with card, bank transfer or USSD via Flutterwave.

You will receive an on-screen confirmation once the payment is verified.

Kind regards,
Mohammed
PixelSpark`);
  const to = request.client_email ?? "";
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
