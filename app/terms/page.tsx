"use client";

import Link from "next/link";

export default function TermsOfServicePage() {
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

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/60 mb-8">Last updated: February 2026</p>

        <div className="space-y-8 text-white/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SmartQR ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">2. Description of Service</h2>
            <p>
              SmartQR provides a platform for creating personal QR code profiles that link to your 
              contact information and social media accounts. The Service allows you to control which 
              information is publicly visible through your QR code.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be at least 13 years old to use this Service</li>
              <li>One person may not maintain more than one account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Impersonate another person or entity</li>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Harass, abuse, or harm another person</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Distribute spam, malware, or malicious content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">5. Your Content</h2>
            <p className="mb-3">
              You retain ownership of all content you submit to the Service. By posting content, you grant 
              us a limited license to display that content as necessary to provide the Service.
            </p>
            <p>
              You are solely responsible for the content you post and the information you choose to make public.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">6. Privacy & Data Protection</h2>
            <div className="bg-neutral-900 border border-green-500/30 rounded-xl p-4">
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="font-semibold text-green-400">Your Data is Protected</span>
              </div>
              <p className="text-sm">
                Your use of the Service is also governed by our{" "}
                <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your personal information. 
                We employ industry-standard security measures including encryption, secure authentication, 
                and row-level database security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">7. Service Availability</h2>
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted access. 
              We may modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms. 
              You may also delete your account at any time. Upon termination, your data will be removed 
              in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">9. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We are not liable for any 
              indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes 
              constitutes acceptance of the new Terms. We will notify users of significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-cyan-400 mb-3">11. Contact</h2>
            <p>
              For questions about these Terms, please contact us through the application.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/50 text-sm">
          <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
            Privacy Policy
          </Link>
          {" · "}
          <span>© {new Date().getFullYear()} SmartQR. All rights reserved.</span>
        </div>
      </div>
    </main>
  );
}
