"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition mb-8"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/60 mb-8">Last updated: February 2026</p>

        <div className="space-y-8 text-white/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">1. Introduction</h2>
            <p>
              SmartQR ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              QR code profile service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect information that you voluntarily provide:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address used for authentication</li>
              <li><strong>Profile Information:</strong> Username, display name, bio, and avatar photo</li>
              <li><strong>Contact Links:</strong> Social media handles, phone numbers, email, website URLs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">3. How We Protect Your Data</h2>
            <div className="bg-neutral-900 border border-cyan-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  className="text-green-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="font-semibold text-green-400">Enterprise-Grade Security</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>All data encrypted in transit (TLS/SSL) and at rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Secure authentication via Supabase (industry-standard OAuth)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Row-Level Security (RLS) ensures you can only access your own data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>No passwords stored - we use secure token-based authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Hosted on Vercel with SOC 2 compliance</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">4. Your Privacy Controls</h2>
            <p className="mb-3">
              You have <strong>full control</strong> over what information is visible on your public profile:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Each contact field has a "Show on profile" toggle</li>
              <li>Only fields you explicitly enable will be publicly visible</li>
              <li>Your email used for login is <strong>never</strong> shared publicly</li>
              <li>You can update or delete your information at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">5. Data Sharing</h2>
            <p className="mb-3">We do <strong>NOT</strong>:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sell your personal information to third parties</li>
              <li>Share your data with advertisers</li>
              <li>Use your information for marketing without consent</li>
              <li>Access your private (non-public) profile data for any purpose other than providing the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">6. Data Retention</h2>
            <p>
              We retain your data only as long as your account is active. You may request deletion 
              of your account and all associated data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, please contact us through 
              the application or via the email associated with your account.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/50 text-sm">
          <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
            Terms of Service
          </Link>
          {" · "}
          <span>© {new Date().getFullYear()} SmartQR. All rights reserved.</span>
        </div>
      </div>
    </main>
  );
}
