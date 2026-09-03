import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Payment server functions. All Flutterwave secret-key traffic happens here —
 * the browser never sees the secret, and the amount is always re-read from the
 * database so a client can never change what is charged.
 */

const codeSchema = z.object({
  code: z.string().min(4).max(40),
  origin: z.string().url().optional(),
});

export const startPaymentCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => codeSchema.parse(data))
  .handler(async ({ data }) => {
    const { getPublicRequest, markCheckoutStarted, flutterwaveFetch } = await import("./flutterwave.server");

    const request = await getPublicRequest(data.code);
    if (!request) return { ok: false as const, error: "This payment request could not be found." };
    if (request.status !== "pending") {
      return { ok: false as const, error: `This payment request is ${request.status}.` };
    }
    if (request.expires_at && new Date(request.expires_at).getTime() < Date.now()) {
      return { ok: false as const, error: "This payment request has expired." };
    }

    const origin = data.origin ?? "";
    const txRef = `${request.request_code}-${Date.now()}`;

    const payload = {
      tx_ref: txRef,
      amount: Number(request.amount),
      currency: request.currency,
      redirect_url: `${origin}/pay/${request.request_code}?tx_ref=${encodeURIComponent(txRef)}`,
      payment_options: "card,banktransfer,ussd,account",
      customer: {
        email: request.client_email || "client@pixelspark.dev",
        name: request.client_name || "PixelSpark Client",
        phonenumber: request.client_phone || undefined,
      },
      customizations: {
        title: "PixelSpark",
        description: `${request.project_name ?? "Project"} — ${request.request_code}`,
      },
      meta: { request_code: request.request_code },
    };

    const result = await flutterwaveFetch("/payments", { method: "POST", body: JSON.stringify(payload) });
    const link = result?.data?.link as string | undefined;
    if (!link) {
      return {
        ok: false as const,
        error: result?.message ? String(result.message) : "Could not start the secure checkout. Please try again.",
      };
    }

    await markCheckoutStarted(request.id, txRef, link);
    return { ok: true as const, link };
  });

export const verifyPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ code: z.string().min(4).max(40), txRef: z.string().min(4).max(120) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { verifyByReference } = await import("./flutterwave.server");
    return verifyByReference(data.code, data.txRef);
  });
