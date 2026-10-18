import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createRemoteJWKSet, jwtVerify, importPKCS8, SignJWT } from "npm:jose@5.9.6";

const PROJECT = Deno.env.get("FIREBASE_PROJECT_ID") || "";
const TEST_EMAIL = (Deno.env.get("VAYEN_TEST_EMAIL") || "").trim().toLowerCase();
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SERVICE_ACCOUNT = Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const ORIGINS = new Set([
  "https://lifeagame06-cyber.github.io",
  // Add https://myvayen.in only after purchasing and connecting the domain.
]);
const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function reply(status: number, body: Record<string, unknown>, origin: string | null) {
  const headers = new Headers(HEADERS);
  if (origin && ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

async function firestoreAccessToken() {
  const sa = JSON.parse(SERVICE_ACCOUNT);
  const key = await importPKCS8(sa.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  }).setProtectedHeader({ alg: "RS256" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now).setExpirationTime(now + 3500).sign(key);
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!r.ok) throw new Error("Firestore token unavailable");
  return (await r.json()).access_token as string;
}

function stringValue(value: unknown): string {
  if (value && typeof value === "object" && "stringValue" in value) {
    return String((value as { stringValue: unknown }).stringValue);
  }
  return "";
}

async function hasVerifiedOrder(uid: string, productId: string) {
  const accessToken = await firestoreAccessToken();
  const base = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(PROJECT)}/databases/(default)/documents/users/${encodeURIComponent(uid)}/orders`;
  let pageToken = "";
  for (let page = 0; page < 20; page++) {
    const url = new URL(base);
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!r.ok) throw new Error("Order verification unavailable");
    const data = await r.json();
    for (const doc of data.documents || []) {
      const f = doc.fields || {};
      if (stringValue(f.userId) === uid &&
          stringValue(f.productId) === productId &&
          stringValue(f.paymentStatus) === "paid" &&
          stringValue(f.verificationStatus) === "verified") return true;
    }
    pageToken = data.nextPageToken || "";
    if (!pageToken) return false;
  }
  throw new Error("Order verification limit reached");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] || c));
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") {
    if (!origin || !ORIGINS.has(origin)) return reply(403, { error: "Forbidden" }, origin);
    return new Response(null, { status: 204, headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Max-Age": "3600",
      "Vary": "Origin",
    }});
  }
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" }, origin);
  if (origin && !ORIGINS.has(origin)) return reply(403, { error: "Forbidden" }, origin);
  if (!PROJECT || !SERVICE_ACCOUNT || !RESEND_KEY || !TEST_EMAIL) {
    return reply(503, { error: "Email service unavailable" }, origin);
  }
  try {
    const token = (req.headers.get("Authorization") || "").match(/^Bearer (.+)$/)?.[1];
    if (!token) return reply(401, { error: "Login required" }, origin);
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT}`,
      audience: PROJECT,
      algorithms: ["RS256"],
    });
    const uid = payload.sub;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const verified = payload.email_verified === true;
    if (!uid || !email || !verified) return reply(403, { error: "Account email verification required" }, origin);
    // Test mode: only the Resend account's authorized test recipient.
    // Do not remove this restriction until domain verification and anti-abuse rate limiting are ready.
    if (email !== TEST_EMAIL) return reply(403, { error: "Email delivery is not available for this account yet" }, origin);
    const body = await req.json().catch(() => ({}));
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    if (!/^[a-z0-9][a-z0-9-]{0,100}$/.test(productId)) {
      return reply(400, { error: "Invalid product" }, origin);
    }
    if (!(await hasVerifiedOrder(uid, productId))) {
      return reply(403, { error: "Purchase not verified" }, origin);
    }
    const safeProduct = escapeHtml(productId.replace(/-/g, " "));
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "VAYEN <onboarding@resend.dev>",
        to: [TEST_EMAIL],
        subject: "Your VAYEN purchase access",
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#222"><h1>VAYEN</h1><h2>Your purchase is ready</h2><p>Your purchase for <strong>${safeProduct}</strong> has been confirmed.</p><p>Sign in to VAYEN and open <strong>My Library</strong> to access your purchase securely.</p><p><a href="https://lifeagame06-cyber.github.io/veyan/library.html">Open My Library</a></p><p style="font-size:12px;color:#777">For your security, ebook files are only accessible after signing in.</p></div>`,
      }),
    });
    if (!r.ok) {
      console.error("Email provider status:", r.status);
      return reply(502, { error: "Email could not be sent" }, origin);
    }
    return reply(200, { success: true }, origin);
  } catch (e) {
    console.error("VAYEN email error:", e instanceof Error ? e.message : "Unknown error");
    return reply(503, { error: "Email service unavailable" }, origin);
  }
});
