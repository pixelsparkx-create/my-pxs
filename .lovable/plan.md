# Goldie polish: free-plan resilience and clean-up

Gemini is confirmed working in production (the 404 was my typo in the test URL, not your site). The remaining problems come from Google's free-tier limits and a few rough edges in how the chat handles a failed or slow reply. This plan closes those holes without redesigning anything.

## 1. Handle free-plan rate limits gracefully

- When Google replies "too many requests", wait and retry automatically a couple of times behind the scenes instead of failing on the first bump.
- If it still can't answer, show a clear, honest message ("Goldie is at his hourly limit right now — try again in a minute, or message us on WhatsApp") instead of the generic snag text.
- Keep the reply short and quick where possible so each conversation uses less of the free quota.

## 2. No more stuck states

- If Goldie's reply never starts within a sensible window, the chat stops waiting, shows a retry option, and the input unlocks. It can never stay stuck on "Typing…".
- Add a "Try again" button to the error notice that resends the last message, so you don't have to retype it.
- Guard against a single Send producing two requests.

## 3. Clean-up

- Remove the leftover Lovable AI file that is no longer used anywhere, so there is one single AI path (Google Gemini, server-side key only).
- Confirm no AI key can reach the browser.
- Keep the Netlify setup as-is (no SPA catch-all, so `/api/goldie` keeps working).

## 4. Verification

- Type check and full build.
- Local send/receive test including a rapid consecutive-message test.
- Live test against the deployed site (correct URL this time) to confirm a real streamed answer.

## Technical notes

- `src/routes/api/goldie.ts`: classify Google 429/RESOURCE_EXHAUSTED distinctly in `onError`, keep bounded `maxRetries`, return a specific user message; keep the existing request-id logging.
- `src/components/site/Goldie.tsx`: first-chunk watchdog that calls `stop()` and surfaces a retry action; retry re-sends the last user message; submit guard on `busy`.
- Delete `src/lib/ai-gateway.server.ts` (unreferenced).
- No schema, admin, pricing, portfolio, or contact changes.
