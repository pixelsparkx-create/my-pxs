import { createFileRoute } from "@tanstack/react-router";

/** Flutterwave server-to-server webhook. Verified with the secret hash header. */
export const Route = createFileRoute("/api/public/flutterwave-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["FLUTTERWAVE_WEBHOOK_HASH"];
        const signature = request.headers.get("verif-hash");
        if (!expected || !signature || signature !== expected) {
          return new Response("Invalid signature", { status: 401 });
        }

        const body = (await request.json().catch(() => null)) as any;
        const txRef = body?.data?.tx_ref ?? body?.txRef;
        const status = String(body?.data?.status ?? body?.status ?? "").toLowerCase();
        if (typeof txRef !== "string" || status !== "successful") return new Response("ok");

        const code = txRef.split("-").slice(0, 2).join("-");
        const { verifyByReference } = await import("@/lib/payments/flutterwave.server");
        await verifyByReference(code, txRef).catch(() => null);
        return new Response("ok");
      },
    },
  },
});
