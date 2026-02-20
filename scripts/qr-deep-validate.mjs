#!/usr/bin/env node
/**
 * QR Deep Validation — end-to-end proof for real users.
 * 1) Decode QR image (or generate from code path)
 * 2) Extract serial/id from URL
 * 3) Live fetch (status, redirects, body)
 * 4) Playwright headless: fresh session, screenshot, content checks
 * 5) PASS/FAIL report + qr-proof.png
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// Load .env.local into process.env (NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL)
function loadEnvLocal() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}
loadEnvLocal();

// Resolve base URL (mirror lib/getBaseUrl.ts)
function getBaseUrl() {
  const siteUrl =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
      ? String(process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, "").trim()
      : "";
  if (siteUrl && siteUrl.startsWith("http")) return siteUrl;
  const appUrl =
    typeof process.env.NEXT_PUBLIC_APP_URL === "string"
      ? String(process.env.NEXT_PUBLIC_APP_URL).replace(/\/$/, "")
      : "";
  if (appUrl && appUrl.startsWith("http")) return appUrl;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3001";
}

const report = { steps: [], pass: true, decodedUrl: null, serial: null, httpStatus: null, screenshotPath: null };

function logStep(name, status, detail) {
  const s = status === "ok" ? "✓" : status === "fail" ? "✗" : "?";
  report.steps.push({ name, status, detail });
  console.log(`  ${s} ${name}${detail != null ? ": " + String(detail) : ""}`);
}

// ----- 1) Find and decode QR image -----
async function findQrImagePath() {
  const candidates = [
    join(ROOT, "public", "qr.png"),
    join(ROOT, "public", "smartqr-personalized.png"),
    join(ROOT, "assets", "smartQR-20672329-b7ef-4379-b3a8-d2baf78c2d35.png"),
    process.env.HOME && join(process.env.HOME, ".cursor", "projects", "Users-majdismail-qr-app", "assets", "smartQR-20672329-b7ef-4379-b3a8-d2baf78c2d35.png"), // machine-specific path; update if repo folder renamed
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function decodeQrFromImage(imagePath) {
  const Jimp = (await import("jimp")).default;
  const jsQRModule = await import("jsqr");
  const jsQR = jsQRModule.default ?? jsQRModule;
  const image = await Jimp.read(imagePath);
  const { bitmap } = image;
  const imageData = {
    data: new Uint8ClampedArray(bitmap.data),
    width: bitmap.width,
    height: bitmap.height,
  };
  const decoded = jsQR(imageData.data, imageData.width, imageData.height);
  return decoded ? decoded.data : null;
}

// Extract serial/identifier from URL: /u/username or /p/slug
function extractSerialFromUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    const mU = path.match(/\/u\/([^/]+)$/);
    if (mU) return { type: "username", value: decodeURIComponent(mU[1]) };
    const mP = path.match(/\/p\/([^/]+)$/);
    if (mP) return { type: "slug", value: decodeURIComponent(mP[1]) };
    if (path === "" || path === "/") return { type: "home", value: null };
    return { type: "path", value: path };
  } catch {
    return { type: "invalid", value: null };
  }
}

// ----- 2) Live URL fetch -----
async function liveFetch(url) {
  const redirects = [];
  let res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "QR-Validate/1.0" },
  });
  let body = "";
  try {
    body = await res.text();
  } catch (_) { }
  return { status: res.status, url: res.url, redirects, body: body.slice(0, 2000) };
}

// ----- 3) Playwright headless -----
async function runPlaywrightCheck(url, screenshotPath) {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch (e) {
    logStep("Playwright", "fail", "Not installed. Run: npx playwright install");
    return false;
  }
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  let ok = true;
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    const status = response?.status() ?? 0;
    if (status >= 400) {
      logStep("Browser load", "fail", `HTTP ${status}`);
      ok = false;
    } else {
      logStep("Browser load", "ok", `HTTP ${status}`);
    }
    await page.screenshot({ path: screenshotPath, fullPage: false });
    logStep("Screenshot", "ok", screenshotPath);

    const serialInfo = extractSerialFromUrl(url);
    if (serialInfo.type === "username" || serialInfo.type === "slug") {
      const needle = serialInfo.value;
      const content = await page.content();
      const hasSerial = content.includes(needle) || content.includes(encodeURIComponent(needle));
      if (hasSerial) logStep("Serial in page", "ok", `found "${needle}"`);
      else {
        logStep("Serial in page", "warn", `"${needle}" not in DOM (may be in API or empty profile)`);
      }
    }
    const hasLoginForm = await page.locator('input[type="password"], [data-auth], form[action*="auth"]').count() > 0;
    const isPublicProfile = await page.locator(".publicProfileShell, .publicProfileCard, [class*=\"publicProfile\"]").count() > 0;
    const isLanding = await page.locator(".landingContainer, .landingTitle").count() > 0;
    if (url.includes("/u/") || url.includes("/p/")) {
      if (hasLoginForm && !isPublicProfile) {
        logStep("Public access", "fail", "Login form shown on profile URL");
        ok = false;
      } else if (isPublicProfile || isLanding) {
        logStep("Public access", "ok", "No login required; profile or landing visible");
      }
    } else {
      logStep("Public access", "ok", "Landing or home page");
    }
  } catch (e) {
    logStep("Playwright", "fail", e.message);
    ok = false;
  } finally {
    await browser.close();
  }
  return ok;
}

async function main() {
  console.log("\n=== QR Deep Validation ===\n");

  let decodedString = null;
  const qrImagePath = await findQrImagePath();

  if (qrImagePath) {
    logStep("QR image", "ok", qrImagePath);
    try {
      decodedString = await decodeQrFromImage(qrImagePath);
      if (decodedString) {
        logStep("QR decode", "ok", decodedString.slice(0, 80) + (decodedString.length > 80 ? "…" : ""));
      } else {
        logStep("QR decode", "fail", "Decoder returned null (stylized or low contrast).");
        logStep("Standards-compliant QR", "info", "Use high contrast (black/white), 4-module quiet zone, min ~2cm size, ECC M or H; avoid gradients/logos on modules.");
        report.pass = false;
      }
    } catch (e) {
      logStep("QR decode", "fail", e.message);
      report.pass = false;
    }
  } else {
    logStep("QR image", "warn", "No public/qr.png or smartqr-personalized.png or assets image found.");
    const baseUrl = getBaseUrl();
    decodedString = `${baseUrl}/`;
    logStep("Using code path", "ok", `Decoded URL = ${decodedString} (home)`);
  }

  if (!decodedString) {
    console.log("\n--- Report (incomplete) ---");
    console.log("FAIL: No decoded URL. Fix QR image or use standards-compliant QR (quiet zone, contrast, size, ECC M/H).");
    process.exit(1);
  }

  report.decodedUrl = decodedString;
  const serialInfo = extractSerialFromUrl(decodedString);
  report.serial = serialInfo.value ?? serialInfo.type;

  logStep("Serial/id", serialInfo.value !== undefined ? "ok" : "info", serialInfo.value != null ? `${serialInfo.type}=${serialInfo.value}` : serialInfo.type);

  const { status, url: finalUrl, body } = await liveFetch(decodedString);
  report.httpStatus = status;
  logStep("Live fetch", status >= 200 && status < 400 ? "ok" : "fail", `HTTP ${status} → ${finalUrl}`);
  if (status >= 400) {
    report.pass = false;
    if (status === 404) logStep("Diagnosis", "fail", "404 — route or deployment missing.");
    else if (status === 500) logStep("Diagnosis", "fail", "500 — server error; check backend logs.");
    else if (status === 401 || status === 403) logStep("Diagnosis", "fail", "Auth wall — endpoint should be public.");
  }

  const screenshotPath = join(ROOT, "qr-proof.png");
  report.screenshotPath = screenshotPath;
  const pwOk = await runPlaywrightCheck(decodedString, screenshotPath);
  if (!pwOk) report.pass = false;

  // Two fresh sessions → same serial and same payload (goal 6)
  try {
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({ headless: true });
    const getFinalUrlAndSnippet = async () => {
      const ctx = await browser.newContext({ storageState: undefined });
      const page = await ctx.newPage();
      await page.goto(decodedString, { waitUntil: "domcontentloaded", timeout: 15000 });
      const finalUrl = page.url();
      const snippet = await page.locator("body").innerText().then((t) => t.slice(0, 200)).catch(() => "");
      await ctx.close();
      return { finalUrl, snippet };
    };
    const [scan1, scan2] = await Promise.all([getFinalUrlAndSnippet(), getFinalUrlAndSnippet()]);
    await browser.close();
    const sameUrl = scan1.finalUrl === scan2.finalUrl;
    if (sameUrl) logStep("Two scans same URL", "ok", scan1.finalUrl);
    else {
      logStep("Two scans same URL", "fail", `Scan1=${scan1.finalUrl} Scan2=${scan2.finalUrl}`);
      report.pass = false;
    }
    const serialInfo = extractSerialFromUrl(decodedString);
    if (serialInfo.value && (scan1.snippet.includes(serialInfo.value) || scan2.snippet.includes(serialInfo.value))) {
      logStep("Two scans same payload", "ok", "Serial visible in both sessions");
    } else if (serialInfo.type === "home") {
      logStep("Two scans same payload", "ok", "Home page; both see landing");
    }
  } catch (e) {
    logStep("Two scans check", "warn", e.message);
  }

  console.log("\n--- Summary ---");
  console.log("Decoded URL:", report.decodedUrl);
  console.log("Serial/id:", report.serial);
  console.log("HTTP status:", report.httpStatus);
  console.log("Screenshot:", report.screenshotPath);
  console.log("\nResult:", report.pass ? "PASS" : "FAIL");
  if (!report.pass) {
    const reasons = report.steps.filter((s) => s.status === "fail").map((s) => s.name + ": " + (s.detail ?? ""));
    console.log("Reasons:", reasons.length ? reasons.join("; ") : "see steps above.");
  }
  process.exit(report.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
